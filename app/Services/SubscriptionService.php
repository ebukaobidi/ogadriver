<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\User;
use App\Models\Hirer;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    /**
     * Subscription tier definitions
     * Zero commission model - revenue from subscriptions only
     */
    public function getSubscriptionTiers(): array
    {
        return [
            // Driver Tiers
            'driver_basic' => [
                'name' => 'Basic',
                'description' => 'Standard jobs access for verified drivers',
                'target_role' => 'driver',
                'monthly_price' => 5000,
                'yearly_price' => 50000,
                'currency' => 'NGN',
                'commission_rate' => 0, // Zero commission
                'settlement_hours' => 48,
                'features' => [
                    'marketplace_visibility' => true,
                    'standard_job_queue' => true,
                    'employer_matching' => true,
                    'on_demand_rides' => true,
                    'verification_badge' => true,
                    'priority_ranking' => false,
                    'premium_jobs' => false,
                    'corporate_assignments' => false,
                    'advance_bookings' => false,
                    'higher_visibility' => false,
                ],
            ],
            'driver_hybrid' => [
                'name' => 'Hybrid',
                'description' => 'Premium tier for top-performing drivers - requires qualification',
                'target_role' => 'driver',
                'monthly_price' => 15000,
                'yearly_price' => 150000,
                'currency' => 'NGN',
                'commission_rate' => 0, // Zero commission
                'settlement_hours' => 24,
                'requires_qualification' => true,
                'features' => [
                    'marketplace_visibility' => true,
                    'standard_job_queue' => true,
                    'employer_matching' => true,
                    'on_demand_rides' => true,
                    'verification_badge' => true,
                    'priority_ranking' => true,
                    'premium_jobs' => true,
                    'corporate_assignments' => true,
                    'advance_bookings' => true,
                    'higher_visibility' => true,
                    'priority_requests' => true,
                    'vip_support' => true,
                    'insurance_badge' => true,
                ],
            ],
            // Employer Tiers
            'employer_normal' => [
                'name' => 'Normal',
                'description' => 'Access to normal verified drivers',
                'target_role' => 'hirer',
                'monthly_price' => 10000,
                'yearly_price' => 100000,
                'currency' => 'NGN',
                'commission_rate' => 0,
                'features' => [
                    'access_tier' => 'normal',
                    'max_concurrent_contracts' => 3,
                    'contact_details_hidden' => true,
                    'compliance_files_hidden' => true,
                    'bulk_broadcast' => false,
                    'priority_matching' => false,
                ],
            ],
            'employer_super' => [
                'name' => 'Super',
                'description' => 'Higher volume with priority among normal drivers',
                'target_role' => 'hirer',
                'monthly_price' => 25000,
                'yearly_price' => 250000,
                'currency' => 'NGN',
                'commission_rate' => 0,
                'features' => [
                    'access_tier' => 'normal',
                    'max_concurrent_contracts' => 10,
                    'contact_details_hidden' => false,
                    'compliance_files_hidden' => true,
                    'bulk_broadcast' => true,
                    'priority_matching' => true,
                    'priority_support' => true,
                ],
            ],
            'employer_hybrid' => [
                'name' => 'Hybrid',
                'description' => 'Exclusive access to Hybrid/top-tier drivers only',
                'target_role' => 'hirer',
                'monthly_price' => 50000,
                'yearly_price' => 500000,
                'currency' => 'NGN',
                'commission_rate' => 0,
                'features' => [
                    'access_tier' => 'hybrid',
                    'max_concurrent_contracts' => -1, // Unlimited
                    'contact_details_hidden' => false,
                    'compliance_files_hidden' => false,
                    'bulk_broadcast' => true,
                    'priority_matching' => true,
                    'priority_support' => true,
                    'dedicated_account_manager' => true,
                    'api_access' => true,
                    'custom_reports' => true,
                ],
            ],
        ];
    }

    /**
     * Get tier details
     */
    public function getTierDetails(string $tier): ?array
    {
        $tiers = $this->getSubscriptionTiers();
        return $tiers[$tier] ?? null;
    }

    /**
     * Create subscription for user
     */
    public function createSubscription(int $userId, string $type, string $duration = 'monthly'): Subscription
    {
        $tier = $this->getTierDetails($type);
        
        if (!$tier) {
            throw new \InvalidArgumentException('Invalid subscription tier');
        }

        $price = $duration === 'yearly' ? $tier['yearly_price'] : $tier['monthly_price'];
        $durationMonths = $duration === 'yearly' ? 12 : 1;

        $subscription = Subscription::create([
            'user_id' => $userId,
            'type' => $type,
            'status' => 'active',
            'amount' => $price,
            'currency' => $tier['currency'],
            'payment_method' => 'manual',
            'payment_reference' => uniqid('sub_'),
            'starts_at' => now(),
            'ends_at' => now()->addMonths($durationMonths),
            'auto_renew' => false,
            'features' => $tier['features'],
        ]);

        // Apply tier-specific benefits
        $this->applyTierBenefits($userId, $type, $tier['features']);

        return $subscription;
    }

    /**
     * Apply subscription tier benefits
     */
    protected function applyTierBenefits(int $userId, string $type, array $features): void
    {
        $user = User::with(['driver', 'hirer'])->findOrFail($userId);

        if ($type === 'driver_pro' && $user->driver) {
            // Driver Pro benefits are handled via isPro() check in Driver model
            // No additional database updates needed
        }

        if (in_array($type, ['corporate', 'enterprise']) && $user->hirer) {
            $user->hirer->update([
                'subscription_tier' => $type,
                'max_concurrent_contracts' => $features['max_concurrent_contracts'] ?? 5,
                'can_view_direct_contacts' => $features['view_direct_contacts'] ?? false,
                'can_bulk_broadcast' => $features['bulk_broadcast'] ?? false,
                'has_api_access' => $features['api_access'] ?? false,
                'subscription_expires_at' => now()->addMonths($type === 'enterprise' ? 12 : 1),
            ]);

            // Generate API key if tier includes API access
            if ($features['api_access'] ?? false) {
                $user->hirer->generateApiKey();
            }
        }
    }

    /**
     * Upgrade subscription
     */
    public function upgradeSubscription(int $subscriptionId, string $newTier): Subscription
    {
        $subscription = Subscription::findOrFail($subscriptionId);
        $newTierDetails = $this->getTierDetails($newTier);

        if (!$newTierDetails) {
            throw new \InvalidArgumentException('Invalid subscription tier');
        }

        return DB::transaction(function () use ($subscription, $newTier, $newTierDetails) {
            // Calculate prorated refund/charge
            $remainingDays = now()->diffInDays($subscription->ends_at);
            $oldTierDetails = $this->getTierDetails($subscription->type);
            
            // Cancel old subscription
            $subscription->update(['status' => 'cancelled']);

            // Create new subscription with remaining time
            $newSubscription = Subscription::create([
                'user_id' => $subscription->user_id,
                'type' => $newTier,
                'status' => 'active',
                'amount' => $newTierDetails['monthly_price'],
                'currency' => $newTierDetails['currency'],
                'payment_method' => 'upgrade',
                'payment_reference' => uniqid('upgrade_'),
                'starts_at' => now(),
                'ends_at' => now()->addDays($remainingDays),
                'auto_renew' => $subscription->auto_renew,
                'features' => $newTierDetails['features'],
            ]);

            // Apply new tier benefits
            $this->applyTierBenefits($subscription->user_id, $newTier, $newTierDetails['features']);

            return $newSubscription;
        });
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription(int $subscriptionId): void
    {
        $subscription = Subscription::findOrFail($subscriptionId);
        
        $subscription->update([
            'status' => 'cancelled',
            'auto_renew' => false,
        ]);

        // Revoke tier benefits at end of period
        // This is handled by the scheduler when subscription expires
    }

    /**
     * Renew subscription
     */
    public function renewSubscription(int $subscriptionId): Subscription
    {
        $subscription = Subscription::findOrFail($subscriptionId);
        $tierDetails = $this->getTierDetails($subscription->type);

        if (!$tierDetails) {
            throw new \InvalidArgumentException('Invalid subscription tier');
        }

        return DB::transaction(function () use ($subscription, $tierDetails) {
            // Mark old as expired
            $subscription->update(['status' => 'expired']);

            // Create new subscription
            $newSubscription = Subscription::create([
                'user_id' => $subscription->user_id,
                'type' => $subscription->type,
                'status' => 'active',
                'amount' => $tierDetails['monthly_price'],
                'currency' => $tierDetails['currency'],
                'payment_method' => 'renewal',
                'payment_reference' => uniqid('renew_'),
                'starts_at' => now(),
                'ends_at' => now()->addMonth(),
                'auto_renew' => $subscription->auto_renew,
                'features' => $tierDetails['features'],
            ]);

            // Re-apply tier benefits
            $this->applyTierBenefits($subscription->user_id, $subscription->type, $tierDetails['features']);

            return $newSubscription;
        });
    }

    /**
     * Check if user has active subscription
     */
    public function hasActiveSubscription(int $userId): bool
    {
        return Subscription::where('user_id', $userId)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->exists();
    }

    /**
     * Get user's active subscription
     */
    public function getActiveSubscription(int $userId): ?Subscription
    {
        return Subscription::where('user_id', $userId)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->first();
    }

    /**
     * Check if user has access to feature
     */
    public function hasFeatureAccess(int $userId, string $feature): bool
    {
        $subscription = $this->getActiveSubscription($userId);
        
        if (!$subscription) {
            return false;
        }

        return ($subscription->features[$feature] ?? false) === true;
    }

    /**
     * Calculate platform commission based on subscription tier
     * Zero commission model - always returns 0
     */
    public function getCommissionRate(int $userId): float
    {
        return 0; // Zero commission for all tiers
    }

    /**
     * Get settlement timing in hours based on subscription tier
     */
    public function getSettlementHours(int $userId): int
    {
        $subscription = $this->getActiveSubscription($userId);
        
        if (!$subscription) {
            return 72; // 72 hours for non-subscribers
        }

        $tier = $this->getTierDetails($subscription->type);
        return $tier['settlement_hours'] ?? 72;
    }

    /**
     * Check if user has interstate job access
     */
    public function hasInterstateAccess(int $userId): bool
    {
        $subscription = $this->getActiveSubscription($userId);
        
        if (!$subscription) {
            return false;
        }

        return ($subscription->features['interstate_access'] ?? false) === true;
    }

    /**
     * Get interstate priority access minutes
     */
    public function getInterstatePriorityMinutes(int $userId): int
    {
        $subscription = $this->getActiveSubscription($userId);
        
        if (!$subscription) {
            return 0;
        }

        return $subscription->features['interstate_priority_minutes'] ?? 0;
    }

    /**
     * Get subscription usage statistics
     */
    public function getUsageStats(int $userId): array
    {
        $subscription = $this->getActiveSubscription($userId);
        
        if (!$subscription) {
            return [
                'has_subscription' => false,
                'tier' => 'free',
            ];
        }

        $stats = [
            'has_subscription' => true,
            'tier' => $subscription->type,
            'starts_at' => $subscription->starts_at,
            'ends_at' => $subscription->ends_at,
            'days_remaining' => now()->diffInDays($subscription->ends_at),
            'features' => $subscription->features,
        ];

        // Add tier-specific usage stats
        if ($subscription->type === 'corporate' || $subscription->type === 'enterprise') {
            $hirer = $subscription->user->hirer;
            if ($hirer) {
                $activeJobs = $hirer->jobs()->whereIn('status', ['published', 'assigned', 'in_progress'])->count();
                $maxContracts = $hirer->max_concurrent_contracts;
                
                $stats['usage'] = [
                    'active_contracts' => $activeJobs,
                    'max_contracts' => $maxContracts === -1 ? 'Unlimited' : $maxContracts,
                    'contracts_remaining' => $maxContracts === -1 ? 'Unlimited' : max(0, $maxContracts - $activeJobs),
                ];
            }
        }

        return $stats;
    }

    /**
     * Process expired subscriptions (for scheduler)
     */
    public function processExpiredSubscriptions(): int
    {
        $expiredCount = 0;

        $expiredSubscriptions = Subscription::where('status', 'active')
            ->where('ends_at', '<', now())
            ->get();

        foreach ($expiredSubscriptions as $subscription) {
            $subscription->update(['status' => 'expired']);

            // Revoke tier benefits
            $this->revokeTierBenefits($subscription->user_id, $subscription->type);
            
            $expiredCount++;
        }

        return $expiredCount;
    }

    /**
     * Revoke tier benefits when subscription expires
     */
    protected function revokeTierBenefits(int $userId, string $type): void
    {
        $user = User::with(['driver', 'hirer'])->findOrFail($userId);

        if (in_array($type, ['corporate', 'enterprise']) && $user->hirer) {
            $user->hirer->update([
                'subscription_tier' => 'free',
                'max_concurrent_contracts' => 5,
                'can_view_direct_contacts' => false,
                'can_bulk_broadcast' => false,
                'has_api_access' => false,
                'api_key' => null,
                'subscription_expires_at' => null,
            ]);
        }
    }

    /**
     * Get all subscription plans for display
     */
    public function getSubscriptionPlans(): array
    {
        $tiers = $this->getSubscriptionTiers();
        
        return array_map(function ($tier, $key) {
            return [
                'id' => $key,
                'name' => $tier['name'],
                'description' => $tier['description'],
                'monthly_price' => $tier['monthly_price'],
                'yearly_price' => $tier['yearly_price'],
                'currency' => $tier['currency'],
                'yearly_discount' => round((1 - ($tier['yearly_price'] / ($tier['monthly_price'] * 12))) * 100, 0),
                'features' => $tier['features'],
            ];
        }, $tiers, array_keys($tiers));
    }
}
