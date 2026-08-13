<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'status',
        'amount',
        'currency',
        'payment_method',
        'payment_reference',
        'starts_at',
        'ends_at',
        'auto_renew',
        'features',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'features' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->ends_at > now();
    }

    public function isExpired(): bool
    {
        return $this->ends_at < now();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')->where('ends_at', '>', now());
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeExpiringSoon($query, int $days = 7)
    {
        return $query->where('ends_at', '<=', now()->addDays($days))->where('ends_at', '>', now());
    }

    /**
     * Check if this is a driver subscription
     */
    public function isDriverSubscription(): bool
    {
        return in_array($this->type, [
            'oga_basic',
            'oga_premium',
            'driver_pro',
            'Trial Operative',
            'Standard Operative',
            'Elite Operative',
            'Fleet Operative',
        ], true);
    }

    /**
     * Check if this is an employer subscription
     */
    public function isEmployerSubscription(): bool
    {
        return in_array($this->type, [
            'basic_recruiter',
            'enterprise_elite',
            'corporate',
            'enterprise',
            'Standard Gate',
            'Elite Perimeter',
            'Sovereign Fleet',
        ], true);
    }

    /**
     * Get subscription tier details
     */
    public function getTierDetails(): array
    {
        return match($this->type) {
            'oga_basic', 'Trial Operative' => [
                'name' => $this->type === 'Trial Operative' ? 'Trial Operative' : 'Oga Basic',
                'price' => 0,
                'currency' => 'NGN',
                'features' => [
                    'Standard verification processing',
                    'Standard listing in directory grid',
                    '48-hour escrow payout clearance',
                    'Basic search visibility',
                ],
                'payout_clearance_hours' => 48,
            ],
            'oga_premium', 'Standard Operative', 'driver_pro' => [
                'name' => $this->type === 'Standard Operative' ? 'Standard Operative' : 'Oga Premium',
                'price' => 5000,
                'currency' => 'NGN',
                'features' => [
                    'Top-of-list search visibility',
                    'Early matching priority',
                    'Faster wallet settlement',
                    'Premium verification badge',
                    'Priority customer support',
                ],
                'payout_clearance_hours' => 24,
            ],
            'Elite Operative' => [
                'name' => 'Elite Operative',
                'price' => 15000,
                'currency' => 'NGN',
                'features' => [
                    'Top Tier Placement in Employer Searches',
                    'Instant Algorithm Matching',
                    'Same-day payout timeframe',
                    '24/7 VIP Dedicated support channel',
                ],
                'payout_clearance_hours' => 0,
            ],
            'Fleet Operative' => [
                'name' => 'Fleet Operative',
                'price' => 0,
                'currency' => 'NGN',
                'features' => [
                    'Assigned directly to Sovereign Fleet employers',
                    'Guaranteed minimum contract terms',
                    'Corporate Insurance coverage included',
                ],
                'payout_clearance_hours' => 0,
            ],
            'basic_recruiter', 'Standard Gate' => [
                'name' => $this->type === 'Standard Gate' ? 'Standard Gate' : 'Basic Recruiter Node',
                'price' => 5000,
                'currency' => 'NGN',
                'features' => [
                    'Access to Standard Operative Directory',
                    'Basic Identity Verification checks',
                    'Standard Matchmaking timeframe (48hrs)',
                ],
                'payout_clearance_hours' => null,
            ],
            'enterprise_elite', 'Elite Perimeter', 'enterprise', 'corporate', 'Sovereign Fleet' => [
                'name' => match ($this->type) {
                    'Elite Perimeter' => 'Elite Perimeter',
                    'Sovereign Fleet' => 'Sovereign Fleet',
                    default => 'Enterprise Elite',
                },
                'price' => 50000,
                'currency' => 'NGN',
                'features' => [
                    'Full compliance file unmasking',
                    'Simultaneous tracking panels for multiple drivers',
                    'Priority matching',
                    'Dedicated account manager',
                ],
                'payout_clearance_hours' => null,
            ],
            default => [
                'name' => $this->type ?: 'Unknown',
                'price' => 0,
                'currency' => 'NGN',
                'features' => [],
                'payout_clearance_hours' => null,
            ],
        };
    }

    /**
     * Get payout clearance time in hours for drivers
     */
    public function getPayoutClearanceHours(): int
    {
        $details = $this->getTierDetails();
        return $details['payout_clearance_hours'] ?? 48;
    }

    /**
     * Check if driver gets instant payout
     */
    public function hasInstantPayout(): bool
    {
        return $this->getPayoutClearanceHours() === 0;
    }

    /**
     * Check if employer has full compliance access
     */
    public function hasFullComplianceAccess(): bool
    {
        return $this->type === 'enterprise_elite';
    }

    /**
     * Check if employer has API access
     */
    public function hasApiAccess(): bool
    {
        return $this->type === 'enterprise_elite';
    }

    /**
     * Check if driver gets priority matching
     */
    public function hasPriorityMatching(): bool
    {
        return $this->type === 'oga_premium';
    }

    /**
     * Check if driver gets top listing visibility
     */
    public function hasTopListingVisibility(): bool
    {
        return $this->type === 'oga_premium';
    }
}
