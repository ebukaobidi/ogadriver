<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;
use App\Services\OPayService;

class PaymentService
{
    public function isConfigured(): bool
    {
        $provider = $this->provider();

        if ($provider === 'opay') {
            return filled(\App\Models\ApiSetting::getValue('opaySecretKey'));
        }

        return filled(\App\Models\ApiSetting::getValue('paystackSecretKey'));
    }

    protected function provider(): string
    {
        return strtolower((string) env('PAYMENT_PROVIDER', 'opay'));
    }

    public function parsePlanAmount(SubscriptionPlan $plan): float
    {
        $amountStr = preg_replace('/[^\d.]/', '', (string) $plan->price);

        return (float) ($amountStr ?: 0);
    }

    public function planDurationDays(SubscriptionPlan $plan): int
    {
        $period = strtolower((string) $plan->period);

        if ($period === 'yearly') {
            return 365;
        }

        if (str_contains($period, '15 day')) {
            return 15;
        }

        if ($period === 'contract') {
            return 365;
        }

        if (str_contains($period, 'pay-per')) {
            return 30;
        }

        return 30;
    }

    /**
     * Initialize a Paystack checkout for subscription or wallet top-up.
     */
    public function initialize(User $user, float $amount, string $purpose, array $metadata = [], ?int $planId = null): Payment
    {
        if ($amount <= 0) {
            throw new RuntimeException('Payment amount must be greater than zero.');
        }
        if (!$this->isConfigured()) {
            throw new RuntimeException('Payment gateway is not configured. Set provider keys in the environment.');
        }

        $provider = $this->provider();

        if ($provider === 'opay') {
            $opay = new OPayService();

            return $opay->initialize($user, $amount, $purpose, $metadata, $planId);
        }

        // Default: Paystack
        $reference = 'og_' . Str::lower(Str::random(22));
        $callbackUrl = rtrim(\App\Models\ApiSetting::getValue('paystackCallbackUrl', env('APP_URL') . '/api/payments/callback'), '/') . '?reference=' . $reference;
        $secretKey = \App\Models\ApiSetting::getValue('paystackSecretKey');

        if (!$secretKey) {
            throw new RuntimeException('Paystack secret key not configured. Please add it in API Settings.');
        }

        $payload = [
            'email' => $user->email,
            'amount' => (int) round($amount * 100), // kobo
            'currency' => 'NGN',
            'reference' => $reference,
            'callback_url' => $callbackUrl,
            'metadata' => array_merge($metadata, [
                'user_id' => $user->id,
                'purpose' => $purpose,
                'plan_id' => $planId,
            ]),
        ];

        $response = Http::withToken($secretKey)
            ->acceptJson()
            ->post('https://api.paystack.co/transaction/initialize', $payload);

        if (!$response->successful() || !($response->json('status') === true)) {
            throw new RuntimeException($response->json('message') ?? 'Unable to initialize payment with Paystack.');
        }

        $data = $response->json('data');

        return Payment::create([
            'user_id' => $user->id,
            'reference' => $reference,
            'provider' => 'paystack',
            'purpose' => $purpose,
            'amount' => $amount,
            'currency' => 'NGN',
            'status' => 'pending',
            'subscription_plan_id' => $planId,
            'authorization_url' => $data['authorization_url'] ?? null,
            'access_code' => $data['access_code'] ?? null,
            'provider_reference' => $data['reference'] ?? $reference,
            'metadata' => $payload['metadata'],
        ]);
    }

    /**
     * Verify a Paystack transaction and fulfill the payment purpose.
     */
    public function verifyAndFulfill(string $reference): Payment
    {
        $payment = Payment::where('reference', $reference)->firstOrFail();

        if ($payment->isSuccessful()) {
            return $payment;
        }

        if (!$this->isConfigured()) {
            throw new RuntimeException('Payment gateway is not configured.');
        }

        $provider = $this->provider();

        if ($provider === 'opay') {
            $opay = new OPayService();

            return $opay->verifyAndFulfill($reference);
        }

        // Default: Paystack
        $secretKey = \App\Models\ApiSetting::getValue('paystackSecretKey');

        if (!$secretKey) {
            throw new RuntimeException('Paystack secret key not configured. Please add it in API Settings.');
        }

        $response = Http::withToken($secretKey)
            ->acceptJson()
            ->get('https://api.paystack.co/transaction/verify/' . $reference);

        if (!$response->successful() || !($response->json('status') === true)) {
            $payment->update(['status' => 'failed']);
            throw new RuntimeException($response->json('message') ?? 'Payment verification failed.');
        }

        $data = $response->json('data');
        $status = $data['status'] ?? 'failed';
        $paidAmount = isset($data['amount']) ? ((float) $data['amount']) / 100 : 0;

        if ($status !== 'success') {
            $payment->update([
                'status' => $status === 'abandoned' ? 'abandoned' : 'failed',
                'provider_reference' => $data['reference'] ?? $payment->provider_reference,
            ]);

            throw new RuntimeException('Payment was not successful.');
        }

        if (abs($paidAmount - (float) $payment->amount) > 0.01) {
            $payment->update(['status' => 'failed']);
            throw new RuntimeException('Paid amount does not match expected amount.');
        }

        return DB::transaction(function () use ($payment, $data) {
            $payment->refresh();

            if ($payment->isSuccessful()) {
                return $payment;
            }

            $payment->update([
                'status' => 'success',
                'provider_reference' => $data['reference'] ?? $payment->provider_reference,
                'paid_at' => now(),
                'metadata' => array_merge($payment->metadata ?? [], [
                    'gateway_response' => $data['gateway_response'] ?? null,
                    'channel' => $data['channel'] ?? null,
                    'paid_at' => $data['paid_at'] ?? null,
                ]),
            ]);

            $user = User::with(['wallet', 'driver', 'hirer', 'role'])->findOrFail($payment->user_id);

            if ($payment->purpose === 'wallet_topup') {
                $this->creditWallet($user, $payment);
            } elseif ($payment->purpose === 'subscription') {
                $this->activateSubscriptionFromPayment($user, $payment);
            }

            return $payment->fresh(['plan']);
        });
    }

    public function creditWallet(User $user, Payment $payment): void
    {
        $wallet = $this->ensureWallet($user);

        $wallet->credit(
            amount: (float) $payment->amount,
            type: 'credit',
            category: 'deposit',
            description: 'Wallet top-up via ' . ucfirst($payment->provider),
            reference: $payment->reference
        );
    }

    public function activateSubscriptionFromPayment(User $user, Payment $payment): Subscription
    {
        $plan = $payment->plan ?: SubscriptionPlan::findOrFail($payment->subscription_plan_id);

        return $this->activateSubscription(
            user: $user,
            plan: $plan,
            amount: (float) $payment->amount,
            paymentMethod: $payment->provider,
            paymentReference: $payment->reference,
            creditWalletFirst: true
        );
    }

    /**
     * Activate/extend subscription from a paid plan.
     * When $creditWalletFirst is true (gateway payment), funds are credited then debited for ledger clarity.
     */
    public function activateSubscription(
        User $user,
        SubscriptionPlan $plan,
        float $amount,
        string $paymentMethod,
        string $paymentReference,
        bool $creditWalletFirst = false
    ): Subscription {
        $user->loadMissing(['wallet', 'driver', 'hirer', 'role']);
        $wallet = $this->ensureWallet($user);

        return DB::transaction(function () use ($user, $wallet, $plan, $amount, $paymentMethod, $paymentReference, $creditWalletFirst) {
            if ($creditWalletFirst && $amount > 0) {
                // Avoid double-credit if verify already credited for a mixed flow
                $alreadyCredited = $wallet->transactions()
                    ->where('reference', $paymentReference)
                    ->where('category', 'deposit')
                    ->exists();

                if (!$alreadyCredited) {
                    $wallet->credit(
                        amount: $amount,
                        type: 'credit',
                        category: 'deposit',
                        description: 'Payment received for ' . $plan->name,
                        reference: $paymentReference
                    );
                }
            }

            $transaction = null;
            if ($amount > 0) {
                $transaction = $wallet->debit(
                    amount: $amount,
                    type: 'debit',
                    category: 'subscription',
                    description: $plan->name . ' Subscription Fee',
                    reference: 'sub_' . $paymentReference
                );
            }

            $daysToAdd = $this->planDurationDays($plan);
            $now = now();

            $subscription = Subscription::where('user_id', $user->id)
                ->orderBy('ends_at', 'desc')
                ->first();

            $newEndsAt = ($subscription && $subscription->ends_at > $now)
                ? Carbon::parse($subscription->ends_at)->addDays($daysToAdd)
                : $now->copy()->addDays($daysToAdd);

            if ($subscription) {
                $subscription->update([
                    'status' => 'active',
                    'ends_at' => $newEndsAt,
                    'amount' => $amount,
                    'type' => $plan->name,
                    'payment_method' => $paymentMethod,
                    'payment_reference' => $paymentReference,
                ]);
            } else {
                $subscription = Subscription::create([
                    'user_id' => $user->id,
                    'type' => $plan->name,
                    'status' => 'active',
                    'amount' => $amount,
                    'currency' => 'NGN',
                    'payment_method' => $paymentMethod,
                    'payment_reference' => $paymentReference,
                    'starts_at' => $now,
                    'ends_at' => $newEndsAt,
                ]);
            }

            if ($user->isHirer() && $user->hirer) {
                $user->hirer->update([
                    'subscription_tier' => $plan->name,
                    'subscription_expires_at' => $newEndsAt,
                ]);
            } elseif ($user->isDriver() && $user->driver) {
                $user->driver->update([
                    'subscription_tier' => $plan->name,
                    'subscription_expires_at' => $newEndsAt,
                ]);
            }

            return $subscription->fresh();
        });
    }

    protected function ensureWallet(User $user): Wallet
    {
        if ($user->wallet) {
            return $user->wallet;
        }

        return Wallet::create([
            'user_id' => $user->id,
            'balance' => 0,
            'available_balance' => 0,
            'escrow_balance' => 0,
            'currency' => 'NGN',
        ]);
    }
}
