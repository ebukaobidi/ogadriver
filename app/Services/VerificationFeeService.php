<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class VerificationFeeService
{
    private const VERIFICATION_FEE_AMOUNT = 3000; // ₦3,000
    private const VERIFICATION_FEE_CURRENCY = 'NGN';

    /**
     * Get verification fee amount
     */
    public function getVerificationFeeAmount(): array
    {
        return [
            'amount' => self::VERIFICATION_FEE_AMOUNT,
            'currency' => self::VERIFICATION_FEE_CURRENCY,
            'description' => 'One-time driver verification fee',
        ];
    }

    /**
     * Check if driver has paid verification fee
     */
    public function hasPaidVerificationFee(int $driverId): bool
    {
        $driver = Driver::find($driverId);
        return $driver && $driver->verification_fee_paid;
    }

    /**
     * Process verification fee payment
     */
    public function processVerificationFee(int $driverId, string $paymentMethod, string $paymentReference): Transaction
    {
        $driver = Driver::findOrFail($driverId);

        if ($driver->verification_fee_paid) {
            throw new \InvalidArgumentException('Verification fee already paid');
        }

        return DB::transaction(function () use ($driver, $paymentMethod, $paymentReference) {
            // Create transaction record
            $transaction = Transaction::create([
                'wallet_id' => $driver->wallet->id,
                'type' => 'debit',
                'category' => 'verification_fee',
                'amount' => self::VERIFICATION_FEE_AMOUNT,
                'currency' => self::VERIFICATION_FEE_CURRENCY,
                'status' => 'completed',
                'description' => 'Driver verification fee',
                'payment_method' => $paymentMethod,
                'payment_reference' => $paymentReference,
            ]);

            // Update driver verification fee status
            $driver->update([
                'verification_fee_paid' => true,
                'verification_fee_paid_at' => now(),
            ]);

            return $transaction;
        });
    }

    /**
     * Start free trial after verification fee payment
     */
    public function startFreeTrial(int $driverId, int $trialDays = 17): Driver
    {
        $driver = Driver::findOrFail($driverId);

        if (!$driver->verification_fee_paid) {
            throw new \InvalidArgumentException('Verification fee must be paid before starting trial');
        }

        if ($driver->is_on_trial) {
            throw new \InvalidArgumentException('Trial already active');
        }

        $driver->update([
            'is_on_trial' => true,
            'trial_started_at' => now(),
            'trial_ends_at' => now()->addDays($trialDays),
        ]);

        return $driver;
    }

    /**
     * Check if driver trial is active
     */
    public function isTrialActive(int $driverId): bool
    {
        $driver = Driver::find($driverId);
        return $driver && $driver->is_on_trial && $driver->trial_ends_at && $driver->trial_ends_at->isFuture();
    }

    /**
     * Get trial days remaining
     */
    public function getTrialDaysRemaining(int $driverId): int
    {
        $driver = Driver::find($driverId);
        if (!$driver || !$driver->is_on_trial || !$driver->trial_ends_at) {
            return 0;
        }

        return max(0, now()->diffInDays($driver->trial_ends_at));
    }

    /**
     * Process expired trials (for scheduler)
     */
    public function processExpiredTrials(): int
    {
        $expiredCount = 0;

        $expiredTrials = Driver::where('is_on_trial', true)
            ->where('trial_ends_at', '<', now())
            ->get();

        foreach ($expiredTrials as $driver) {
            $driver->update([
                'is_on_trial' => false,
            ]);

            // If no active subscription, set driver offline
            if (!$driver->hasActiveSubscription()) {
                $driver->update(['is_online' => false]);
            }

            $expiredCount++;
        }

        return $expiredCount;
    }

    /**
     * Get verification status summary
     */
    public function getVerificationStatus(int $driverId): array
    {
        $driver = Driver::find($driverId);

        if (!$driver) {
            return ['status' => 'not_found'];
        }

        return [
            'fee_paid' => $driver->verification_fee_paid,
            'fee_paid_at' => $driver->verification_fee_paid_at?->toIso8601String(),
            'is_on_trial' => $driver->is_on_trial,
            'trial_started_at' => $driver->trial_started_at?->toIso8601String(),
            'trial_ends_at' => $driver->trial_ends_at?->toIso8601String(),
            'trial_days_remaining' => $this->getTrialDaysRemaining($driverId),
            'has_active_subscription' => $driver->hasActiveSubscription(),
            'is_verified' => $driver->is_verified,
            'can_operate' => $driver->is_verified && ($driver->hasActiveSubscription() || $this->isTrialActive($driverId)),
        ];
    }
}
