<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\User;
use App\Models\Driver;
use App\Models\Hirer;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SubscriptionDunningService
{
    /**
     * Dunning reminder days before expiry
     */
    private const REMINDER_DAYS = [7, 3, 1]; // Days before expiry to send reminders

    /**
     * Grace period days after expiry
     */
    private const GRACE_PERIOD_DAYS = 3;

    /**
     * Check and process expiring subscriptions
     */
    public function checkExpiringSubscriptions(): array
    {
        $results = [
            'reminders_sent' => 0,
            'grace_period_activated' => 0,
            'subscriptions_expired' => 0,
            'users_deactivated' => 0,
        ];

        $today = Carbon::now();
        $gracePeriodEnd = $today->copy()->addDays(self::GRACE_PERIOD_DAYS);

        // Get active subscriptions
        $activeSubscriptions = Subscription::where('status', 'active')
            ->where('ends_at', '>', $today)
            ->get();

        foreach ($activeSubscriptions as $subscription) {
            $expiryDate = Carbon::parse($subscription->ends_at);
            $daysUntilExpiry = $today->diffInDays($expiryDate, false);

            // Send reminder if within reminder days
            if (in_array($daysUntilExpiry, self::REMINDER_DAYS)) {
                $this->sendRenewalReminder($subscription, $daysUntilExpiry);
                $results['reminders_sent']++;
            }
        }

        // Process expired subscriptions in grace period
        $expiredInGrace = Subscription::where('status', 'active')
            ->where('ends_at', '<=', $today)
            ->where('ends_at', '>', $gracePeriodEnd)
            ->get();

        foreach ($expiredInGrace as $subscription) {
            $this->activateGracePeriod($subscription);
            $results['grace_period_activated']++;
        }

        // Process fully expired subscriptions
        $fullyExpired = Subscription::where('status', 'active')
            ->where('ends_at', '<=', $gracePeriodEnd)
            ->get();

        foreach ($fullyExpired as $subscription) {
            $this->expireSubscription($subscription);
            $results['subscriptions_expired']++;

            // Deactivate user if no active subscriptions
            if (!$this->hasActiveSubscription($subscription->user_id)) {
                $this->deactivateUser($subscription->user_id);
                $results['users_deactivated']++;
            }
        }

        return $results;
    }

    /**
     * Send renewal reminder to user
     */
    private function sendRenewalReminder(Subscription $subscription, int $daysUntilExpiry): void
    {
        $user = User::find($subscription->user_id);
        if (!$user) return;

        $tierDetails = $subscription->getTierDetails();
        $tierName = $tierDetails['name'] ?? 'Subscription';

        try {
            // Send email notification
            Mail::raw(
                "Your {$tierName} subscription expires in {$daysUntilExpiry} day(s). Please renew to continue enjoying premium features.",
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('Subscription Expiry Reminder - OgaDriver');
                }
            );

            // Log reminder
            Log::info('Subscription renewal reminder sent', [
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'days_until_expiry' => $daysUntilExpiry,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send renewal reminder', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Activate grace period for expired subscription
     */
    private function activateGracePeriod(Subscription $subscription): void
    {
        $subscription->status = 'grace_period';
        $subscription->save();

        $user = User::find($subscription->user_id);
        if (!$user) return;

        try {
            Mail::raw(
                "Your subscription has expired. You have a " . self::GRACE_PERIOD_DAYS . "-day grace period to renew before your account is deactivated.",
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('Subscription Expired - Grace Period Active - OgaDriver');
                }
            );

            Log::info('Grace period activated', [
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send grace period notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Expire subscription
     */
    private function expireSubscription(Subscription $subscription): void
    {
        $subscription->status = 'expired';
        $subscription->save();

        $user = User::find($subscription->user_id);
        if (!$user) return;

        try {
            Mail::raw(
                "Your subscription has expired and your grace period has ended. Please renew to reactivate your account.",
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('Subscription Fully Expired - OgaDriver');
                }
            );

            Log::info('Subscription expired', [
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send expiry notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Deactivate user
     */
    private function deactivateUser(int $userId): void
    {
        $user = User::find($userId);
        if (!$user) return;

        // Deactivate driver if applicable
        $driver = Driver::where('user_id', $userId)->first();
        if ($driver) {
            $driver->is_online = false;
            $driver->is_verified = false; // Remove verification status
            $driver->save();
        }

        // Deactivate hirer if applicable
        $hirer = Hirer::where('user_id', $userId)->first();
        if ($hirer) {
            $hirer->verification_status = 'pending';
            $hirer->save();
        }

        Log::info('User deactivated due to subscription expiry', [
            'user_id' => $userId,
        ]);
    }

    /**
     * Check if user has any active subscription
     */
    private function hasActiveSubscription(int $userId): bool
    {
        return Subscription::where('user_id', $userId)
            ->where('status', 'active')
            ->where('ends_at', '>', Carbon::now())
            ->exists();
    }

    /**
     * Get churn risk users (high risk of leaving)
     */
    public function getChurnRiskUsers(): array
    {
        $highRisk = [];
        $mediumRisk = [];
        $lowRisk = [];

        $subscriptions = Subscription::where('status', 'active')
            ->with('user')
            ->get();

        foreach ($subscriptions as $subscription) {
            $user = $subscription->user;
            if (!$user) continue;

            $expiryDate = Carbon::parse($subscription->ends_at);
            $daysUntilExpiry = Carbon::now()->diffInDays($expiryDate, false);

            // Calculate risk based on days until expiry and user activity
            $riskScore = $this->calculateChurnRisk($subscription, $daysUntilExpiry);

            if ($riskScore >= 70) {
                $highRisk[] = [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'subscription_id' => $subscription->id,
                    'days_until_expiry' => $daysUntilExpiry,
                    'risk_score' => $riskScore,
                ];
            } elseif ($riskScore >= 40) {
                $mediumRisk[] = [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'subscription_id' => $subscription->id,
                    'days_until_expiry' => $daysUntilExpiry,
                    'risk_score' => $riskScore,
                ];
            } else {
                $lowRisk[] = [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'subscription_id' => $subscription->id,
                    'days_until_expiry' => $daysUntilExpiry,
                    'risk_score' => $riskScore,
                ];
            }
        }

        return [
            'high_risk' => $highRisk,
            'medium_risk' => $mediumRisk,
            'low_risk' => $lowRisk,
        ];
    }

    /**
     * Calculate churn risk score (0-100)
     */
    private function calculateChurnRisk(Subscription $subscription, int $daysUntilExpiry): int
    {
        $riskScore = 0;

        // Expiry proximity (higher risk closer to expiry)
        if ($daysUntilExpiry <= 3) {
            $riskScore += 40;
        } elseif ($daysUntilExpiry <= 7) {
            $riskScore += 30;
        } elseif ($daysUntilExpiry <= 14) {
            $riskScore += 20;
        }

        // Subscription tier (higher tiers may have higher retention)
        $tierDetails = $subscription->getTierDetails();
        if (str_contains($subscription->type, 'basic') || str_contains($subscription->type, 'normal')) {
            $riskScore += 20; // Basic users more likely to churn
        }

        // Payment history (simplified - would need transaction history in production)
        // This is a placeholder for actual payment failure tracking

        return min($riskScore, 100);
    }

    /**
     * Send churn prevention offer
     */
    public function sendChurnPreventionOffer(int $userId, string $offerType = 'discount'): bool
    {
        $user = User::find($userId);
        if (!$user) return false;

        $subscription = Subscription::where('user_id', $userId)
            ->where('status', 'active')
            ->first();

        if (!$subscription) return false;

        $offerMessage = match($offerType) {
            'discount' => 'Special offer: Get 20% off your next subscription renewal!',
            'trial_extension' => 'Special offer: Get 7 additional days free on your subscription!',
            'upgrade' => 'Special offer: Upgrade to a higher tier at a discounted rate!',
            default => 'Special offer available for your subscription renewal!',
        };

        try {
            Mail::raw(
                $offerMessage . ' Click here to claim your offer now.',
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('Special Offer - Don\'t Miss Out - OgaDriver');
                }
            );

            Log::info('Churn prevention offer sent', [
                'user_id' => $userId,
                'offer_type' => $offerType,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send churn prevention offer', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Reactivate expired subscription
     */
    public function reactivateSubscription(int $subscriptionId): bool
    {
        $subscription = Subscription::find($subscriptionId);
        if (!$subscription) return false;

        $subscription->status = 'active';
        $subscription->ends_at = Carbon::now()->addMonth();
        $subscription->save();

        // Reactivate user
        $user = User::find($subscription->user_id);
        if ($user) {
            $driver = Driver::where('user_id', $user->id)->first();
            if ($driver) {
                $driver->is_verified = true;
                $driver->save();
            }

            $hirer = Hirer::where('user_id', $user->id)->first();
            if ($hirer) {
                $hirer->verification_status = 'verified';
                $hirer->save();
            }
        }

        Log::info('Subscription reactivated', [
            'subscription_id' => $subscriptionId,
            'user_id' => $subscription->user_id,
        ]);

        return true;
    }
}
