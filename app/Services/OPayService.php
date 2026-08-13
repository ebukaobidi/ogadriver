<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\User;
use RuntimeException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Services\PaymentService;

/**
 * Scaffold service for OPay provider.
 *
 * NOTE: This is a scaffold. Implement initialize/verify calls using OPay's API
 * (authentication, endpoints, and payloads) and update config/env with real keys.
 */
class OPayService
{
    public function isConfigured(): bool
    {
        return filled(config('services.opay.secret_key'));
    }

    /**
     * Initialize an OPay checkout for a user.
     * Return a Payment model similar to Paystack flow with `authorization_url` and `reference`.
     */
    public function initialize(User $user, float $amount, string $purpose, array $metadata = [], ?int $planId = null): Payment
    {
        if ($amount <= 0) {
            throw new RuntimeException('Payment amount must be greater than zero.');
        }

        if (!$this->isConfigured()) {
            throw new RuntimeException('OPay is not configured. Set OPAY_SECRET_KEY in the environment.');
        }

        // Generate a reference compatible with the application's conventions
        $reference = 'og_opay_' . Str::lower(Str::random(20));

        $callbackUrl = config('services.opay.callback_url');

        $payload = [
            'reference' => $reference,
            'amount' => (int) round($amount * 100),
            'currency' => 'NGN',
            'description' => ucfirst(str_replace('_', ' ', $purpose)),
            'callback_url' => $callbackUrl,
            'redirect_url' => $callbackUrl,
            'customer' => [
                'email' => $user->email,
                'name' => trim($user->name ?: $user->email),
            ],
            'metadata' => array_merge($metadata, [
                'user_id' => $user->id,
                'purpose' => $purpose,
                'plan_id' => $planId,
            ]),
        ];

        $apiUrl = rtrim(config('services.opay.api_url'), '/');
        $checkoutUrl = config('services.opay.checkout_url') ?: $apiUrl . '/v1/checkout';

        $response = Http::withToken(config('services.opay.secret_key'))
            ->acceptJson()
            ->post($checkoutUrl, $payload);

        if (!$response->successful()) {
            throw new RuntimeException($response->json('message') ?? 'Unable to initialize payment with OPay.');
        }

        $data = $response->json('data') ?? $response->json();
        $authorizationUrl = $data['authorization_url'] ?? $data['checkout_url'] ?? $data['redirect_url'] ?? $data['payment_url'] ?? $data['chargeUrl'] ?? null;

        if (!$authorizationUrl) {
            throw new RuntimeException('OPay initialization did not return a checkout URL.');
        }

        $checkoutUrl = $authorizationUrl;

        // Create a pending Payment record so the rest of the system can track it.
        return Payment::create([
            'user_id' => $user->id,
            'reference' => $reference,
            'provider' => 'opay',
            'purpose' => $purpose,
            'amount' => $amount,
            'currency' => 'NGN',
            'status' => 'pending',
            'subscription_plan_id' => $planId,
            'authorization_url' => $checkoutUrl,
            'access_code' => null,
            'provider_reference' => $reference,
            'metadata' => array_merge($metadata, [
                'user_id' => $user->id,
                'purpose' => $purpose,
                'plan_id' => $planId,
            ]),
        ]);
    }

    /**
     * Verify an OPay transaction and fulfill the payment purpose.
     * Should perform provider verification and then call PaymentService handlers.
     */
    public function verifyAndFulfill(string $reference): Payment
    {
        $payment = Payment::where('reference', $reference)->firstOrFail();

        if ($payment->isSuccessful()) {
            return $payment;
        }

        if (!$this->isConfigured()) {
            throw new RuntimeException('OPay is not configured.');
        }

        $apiUrl = rtrim(config('services.opay.api_url'), '/');
        $verifyUrl = config('services.opay.verify_url') ?: $apiUrl . '/v1/payments/' . $reference;

        $response = Http::withToken(config('services.opay.secret_key'))
            ->acceptJson()
            ->get($verifyUrl);

        if (!$response->successful()) {
            $payment->update(['status' => 'failed']);
            throw new RuntimeException($response->json('message') ?? 'OPay payment verification failed.');
        }

        $data = $response->json('data') ?? $response->json();
        $status = strtolower($data['status'] ?? $data['payment_status'] ?? 'failed');
        $paidAmount = isset($data['amount']) ? ((float) $data['amount']) / 100 : (float) $payment->amount;

        if (!in_array($status, ['success', 'successful', 'completed'], true)) {
            $payment->update([
                'status' => $status === 'abandoned' ? 'abandoned' : 'failed',
                'provider_reference' => $data['reference'] ?? $payment->provider_reference,
            ]);

            throw new RuntimeException('OPay payment was not successful.');
        }

        if (abs($paidAmount - (float) $payment->amount) > 0.01) {
            $payment->update(['status' => 'failed']);
            throw new RuntimeException('OPay paid amount does not match expected amount.');
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
                    'gateway_response' => $data,
                ]),
            ]);

            $user = User::with(['wallet', 'driver', 'hirer', 'role'])->findOrFail($payment->user_id);

            $paymentService = new PaymentService();
            if ($payment->purpose === 'wallet_topup') {
                $paymentService->creditWallet($user, $payment);
            } elseif ($payment->purpose === 'subscription') {
                $paymentService->activateSubscriptionFromPayment($user, $payment);
            }

            return $payment->fresh();
        });
    }
}
