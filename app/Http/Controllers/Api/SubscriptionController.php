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
            ->map(function (SubscriptionPlan $plan) use ($user) {
                $amount = $this->paymentService->parsePlanAmount($plan);
                $userCountry = $user->country ?? $user->driver?->country ?? $user->hirer?->country ?? '';

                $currency = $plan->currency ?? match(strtolower($userCountry)) {
                    'ghana', 'gh' => 'GHS',
                    'kenya', 'ke' => 'KES',
                    'south africa', 'za' => 'ZAR',
                    'united states', 'us' => 'USD',
                    default => 'NGN'
                };

                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'price' => $plan->price,
                    'amount' => $amount,
                    'currency' => $currency,
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
            if (!$wallet) {
                $wallet = \App\Models\Wallet::create([
                    'user_id' => $user->id,
                    'balance' => 0,
                    'available_balance' => 0,
                    'currency' => 'NGN',
                ]);
            }
            $canPayFromWallet = $wallet && $wallet->hasAvailableBalance($amount);
            $forceWallet = $preferredMethod === 'wallet';
            $useWallet = $forceWallet || ($preferredMethod !== 'paystack' && $preferredMethod !== 'opay' && $canPayFromWallet);

            // Explicit wallet pay with empty/low balance
            if ($forceWallet && !$canPayFromWallet) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient balance. Please credit your account.',
                    'insufficient_balance' => true,
                    'credit_wallet' => true,
                    'required_amount' => $amount,
                    'wallet' => [
                        'balance' => (float) $wallet->balance,
                        'available_balance' => (float) $wallet->available_balance,
                    ],
                ], 422);
            }

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

            // No gateway configured and cannot pay from wallet
            if (!$this->paymentService->isConfigured() && !$canPayFromWallet) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient balance. Please credit your account.',
                    'insufficient_balance' => true,
                    'credit_wallet' => true,
                    'required_amount' => $amount,
                    'wallet' => [
                        'balance' => (float) $wallet->balance,
                        'available_balance' => (float) $wallet->available_balance,
                    ],
                ], 422);
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
                // Hint UI when wallet is empty so user can top up instead
                'wallet_shortfall' => !$canPayFromWallet,
                'insufficient_balance' => !$canPayFromWallet,
                'credit_wallet' => !$canPayFromWallet,
                'wallet' => [
                    'balance' => (float) $wallet->balance,
                    'available_balance' => (float) $wallet->available_balance,
                ],
            ]);
        } catch (RuntimeException $e) {
            $msg = $e->getMessage();
            $isFunds = stripos($msg, 'insufficient') !== false || stripos($msg, 'balance') !== false;
            return response()->json([
                'success' => false,
                'message' => $isFunds ? 'Insufficient balance. Please credit your account.' : $msg,
                'insufficient_balance' => $isFunds,
                'credit_wallet' => $isFunds,
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

    /**
     * Charge recurring subscription using Paystack Authorization Code
     */
    public function chargeRecurringSubscription(Request $request)
    {
        $request->validate([
            'authorization_code' => 'required|string',
            'email' => 'required|email',
            'amount' => 'required|numeric|min:100',
            'plan_name' => 'nullable|string',
        ]);

        $paystackSecret = env('PAYSTACK_SECRET_KEY');
        if (!$paystackSecret) {
            return response()->json([
                'success' => false,
                'message' => 'Paystack secret key is not configured on the server.',
            ], 500);
        }

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => "Bearer {$paystackSecret}",
                'Content-Type' => 'application/json',
            ])->post('https://api.paystack.co/transaction/charge_authorization', [
                'authorization_code' => $request->authorization_code,
                'email' => $request->email,
                'amount' => intval($request->amount * 100),
                'metadata' => [
                    'plan_name' => $request->input('plan_name', 'Commute Subscription'),
                    'type' => 'recurring_direct_debit',
                ],
            ]);

            $resData = $response->json();

            if (isset($resData['status']) && $resData['status'] === true) {
                return response()->json([
                    'success' => true,
                    'message' => 'Recurring subscription debited successfully via Paystack.',
                    'transaction' => $resData['data'],
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $resData['message'] ?? 'Paystack recurring charge failed.',
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process recurring payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    protected function notify($user, string $planName): void
    {
        if (!$user->phone) {
            return;
        }

        $roleLabel = $user->isHirer() ? 'employer' : ($user->isDriver() ? 'driver' : 'user');
        $this->notificationService->notifySubscriptionSuccess($user->phone, $planName, $roleLabel);
    }

    /**
     * Toggle subscription shield protection.
     */
    public function toggleShield(Request $request)
    {
        $user = Auth::user();
        $subscription = Subscription::where('user_id', $user->id)
            ->where('ends_at', '>', now())
            ->orderBy('ends_at', 'desc')
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found.',
            ], 404);
        }

        $subscription->shield_enabled = !($subscription->shield_enabled ?? false);
        $subscription->save();

        return response()->json([
            'success' => true,
            'shield_enabled' => $subscription->shield_enabled,
            'message' => $subscription->shield_enabled ? 'Shield protection enabled.' : 'Shield protection disabled.',
        ]);
    }
}
