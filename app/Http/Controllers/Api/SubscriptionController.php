<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\NotificationService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class SubscriptionController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService,
        protected PaymentService $paymentService
    ) {}

    /**
     * Get the user's current subscription status.
     */
    public function status(Request $request)
    {
        $user = Auth::user();
        $user->loadMissing(['role', 'driver', 'hirer', 'activeSubscription']);

        $subscription = Subscription::where('user_id', $user->id)
            ->orderBy('ends_at', 'desc')
            ->first();

        $status = 'expired';
        $expiresAt = null;

        if ($subscription && $subscription->ends_at > now()) {
            $status = 'active';
            $expiresAt = $subscription->ends_at->toIso8601String();
        }

        $activePlan = null;
        if ($user->isHirer() && $user->hirer) {
            $activePlan = $user->hirer->subscription_tier;
        } elseif ($user->isDriver() && $user->driver) {
            $activePlan = $user->driver->resolvedSubscriptionTier() ?? 'free';
        }

        return response()->json([
            'success' => true,
            'status' => $status,
            'expires_at' => $expiresAt,
            'subscription' => $subscription,
            'active_plan' => $activePlan,
            'wallet_balance' => (float) ($user->wallet?->available_balance ?? 0),
            'payment_gateway_configured' => $this->paymentService->isConfigured(),
        ]);
    }

    /**
     * Get available subscription plans for the user's role.
     */
    public function plans(Request $request)
    {
        $user = Auth::user();
        $user->loadMissing('role');
        $targetRole = $user->isHirer() ? 'employer' : 'operative';

        $plans = SubscriptionPlan::where('target_role', $targetRole)
            ->where('status', 'active')
            ->where('price', '!=', '₦0') // Exclude free plans from subscription list
            ->orderBy('id')
            ->get()
            ->map(function (SubscriptionPlan $plan) {
                $amount = $this->paymentService->parsePlanAmount($plan);

                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'price' => $plan->price,
                    'amount' => $amount,
                    'period' => $plan->period,
                    'limits' => $plan->limits,
                    'status' => $plan->status,
                    'isPopular' => (bool) $plan->isPopular,
                    'features' => $plan->features ?? [],
                    'target_role' => $plan->target_role,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $plans,
            'payment_gateway_configured' => $this->paymentService->isConfigured(),
        ]);
    }

    /**
     * Subscribe / renew:
     * - Free plans activate immediately
     * - Paid plans debit wallet when funded
     * - Otherwise initialize Paystack checkout
     */
    public function subscribe(Request $request)
    {
        $user = Auth::user();
        $user->loadMissing(['role', 'driver', 'hirer', 'wallet']);

        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'payment_method' => 'nullable|in:wallet,paystack,opay',
        ]);

        $plan = SubscriptionPlan::findOrFail($request->plan_id);
        $amount = $this->paymentService->parsePlanAmount($plan);
        $preferredMethod = $request->input('payment_method');

        // Prevent subscribing to free plans - trial is managed through verification system
        if ($amount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Free plans are not available for manual subscription. Trial periods are automatically activated after verification.',
            ], 422);
        }

        try {
            $wallet = $user->wallet;
            $canPayFromWallet = $wallet && $wallet->hasAvailableBalance($amount);
            $useWallet = $preferredMethod === 'wallet' || ($preferredMethod !== 'paystack' && $canPayFromWallet);

            // Wallet debit
            if ($useWallet && $canPayFromWallet) {
                $subscription = $this->paymentService->activateSubscription(
                    user: $user,
                    plan: $plan,
                    amount: $amount,
                    paymentMethod: 'wallet',
                    paymentReference: 'wallet_' . uniqid(),
                    creditWalletFirst: false
                );

                $this->notify($user, $plan->name);

                return response()->json([
                    'success' => true,
                    'message' => 'Subscription paid from wallet.',
                    'status' => 'active',
                    'payment_required' => false,
                    'active_plan' => $plan->name,
                    'expires_at' => $subscription->ends_at->toIso8601String(),
                    'subscription' => $subscription,
                    'wallet' => [
                        'balance' => $wallet->fresh()->balance,
                        'available_balance' => $wallet->fresh()->available_balance,
                    ],
                ]);
            }

            // Gateway checkout
            $payment = $this->paymentService->initialize(
                user: $user,
                amount: $amount,
                purpose: 'subscription',
                metadata: [
                    'plan_name' => $plan->name,
                    'driver_id' => $user->driver?->id,
                ],
                planId: $plan->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Redirect to payment gateway to complete subscription.',
                'payment_required' => true,
                'authorization_url' => $payment->authorization_url,
                'reference' => $payment->reference,
                'amount' => (float) $payment->amount,
                'plan' => $plan->name,
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Renew current/last plan (same as subscribe with resolved plan).
     */
    public function renew(Request $request)
    {
        $user = Auth::user();
        $user->loadMissing(['driver', 'hirer', 'role']);

        $tier = null;
        if ($user->isDriver() && $user->driver) {
            $tier = $user->driver->subscription_tier;
        } elseif ($user->isHirer() && $user->hirer) {
            $tier = $user->hirer->subscription_tier;
        }

        $targetRole = $user->isHirer() ? 'employer' : 'operative';

        $plan = null;
        if ($tier) {
            $plan = SubscriptionPlan::where('target_role', $targetRole)
                ->where('name', $tier)
                ->where('status', 'active')
                ->first();
        }

        if (!$plan) {
            $plan = SubscriptionPlan::where('target_role', $targetRole)
                ->where('status', 'active')
                ->where('isPopular', true)
                ->first()
                ?: SubscriptionPlan::where('target_role', $targetRole)->where('status', 'active')->first();
        }

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription plan available to renew.',
            ], 404);
        }

        $request->merge(['plan_id' => $plan->id]);

        return $this->subscribe($request);
    }

    protected function notify($user, string $planName): void
    {
        if (!$user->phone) {
            return;
        }

        $roleLabel = $user->isHirer() ? 'employer' : ($user->isDriver() ? 'driver' : 'user');
        $this->notificationService->notifySubscriptionSuccess($user->phone, $planName, $roleLabel);
    }
}
