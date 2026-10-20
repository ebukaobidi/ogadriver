<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'license_number',
        'license_class',
        'license_expiry',
        'years_of_experience',
        'rating',
        'total_jobs',
        'is_verified',
        'is_online',
        'status',
        'subscription_tier',
        'subscription_expires_at',
        'boost_tier',
        'boost_multiplier',
        'boosted_until',
        'preferred_route_type',
        'current_latitude',
        'current_longitude',
        'last_location_update',
        'vehicle_certifications',
        'state_id',
        'city_id',
        'preferred_locations',
        'employment_types',
        'skills',
        'endorsements',
        'languages',
        'guarantor_a_code',
        'guarantor_a_status',
        'guarantor_b_code',
        'guarantor_b_status',
        'nin',
        'bvn',
        'residence_address',
        'guarantor_a_name',
        'guarantor_a_phone',
        'guarantor_a_address',
        'guarantor_a_occupation',
        'guarantor_a_company',
        'guarantor_b_name',
        'guarantor_b_phone',
        'guarantor_b_address',
        'guarantor_b_occupation',
        'guarantor_b_company',
        'trial_started_at',
        'trial_ends_at',
        'is_on_trial',
        'is_listed',
        'listed_at',
        'delisted_at',
        'delisted_reason',
        'verification_fee_paid',
        'verification_fee_paid_at',
        'accommodation_needed',
        'has_vehicle',
        'service_mode',
        'accommodation_notes',
        'destination_mode_active',
        'destination_label',
        'destination_address',
        'destination_latitude',
        'destination_longitude',
        'destination_max_detour_km',
    
        'biometric_login',
        'available_for_interstate',
        'open_to_accommodation',
        'saved_places',
        'notification_preferences',
    ];

    protected $appends = ['is_pro', 'is_hybrid', 'formatted_id', 'operative_tier'];

    public function getOperativeTierAttribute(): string
    {
        $jobs = $this->completed_jobs_count ?? $this->total_jobs ?? 0;
        $rating = (float)($this->rating ?? 0);
        $simScore = (int)($this->simulator_score ?? 0);

        if ($jobs >= 50 && $rating >= 4.8 && $simScore >= 85) {
            return 'Platinum VIP';
        }
        if ($jobs >= 20 && $rating >= 4.6 && $simScore >= 70) {
            return 'Gold Executive';
        }
        if ($jobs >= 5 && $rating >= 4.2) {
            return 'Silver Certified';
        }
        return 'Bronze Operative';
    }

    protected function casts(): array
    {
        return [
            'license_expiry' => 'date',
            'rating' => 'decimal:2',
            'is_verified' => 'boolean',
            'is_online' => 'boolean',
            'last_location_update' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'boosted_until' => 'datetime',
            'trial_started_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'listed_at' => 'datetime',
            'delisted_at' => 'datetime',
            'vehicle_certifications' => 'array',
            'preferred_locations' => 'array',
            'employment_types' => 'array',
            'skills' => 'array',
            'endorsements' => 'array',
            'languages' => 'array',
            'verification_fee_paid' => 'boolean',
            'verification_fee_paid_at' => 'datetime',
            'accommodation_needed' => 'boolean',
            'has_vehicle' => 'boolean',
            'biometric_login' => 'boolean',
            'available_for_interstate' => 'boolean',
            'open_to_accommodation' => 'boolean',
            'saved_places' => 'array',
            'notification_preferences' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vehicle()
    {
        return $this->hasOne(DriverVehicle::class);
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function documents()
    {
        return $this->hasMany(DriverDocument::class);
    }

    public function locations()
    {
        return $this->hasMany(DriverLocation::class);
    }

    public function availabilities()
    {
        return $this->hasMany(DriverAvailability::class);
    }

    public function pricings()
    {
        return $this->hasMany(DriverPricing::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class, 'user_id', 'user_id');
    }

    public function jobs()
    {
        return $this->hasMany(TransportJob::class, 'driver_id');
    }

    public function jobApplications()
    {
        return $this->hasMany(JobApplication::class);
    }

    public function favorites()
    {
        return $this->hasMany(DriverFavorite::class);
    }

    public function guarantors()
    {
        return $this->hasMany(Guarantor::class);
    }

    public function telemetry()
    {
        return $this->hasMany(DrivingTelemetry::class);
    }

    public function getIsProAttribute(): bool
    {
        return $this->isPro();
    }

    public function getIsHybridAttribute(): bool
    {
        return in_array('hybrid', $this->vehicle_certifications ?? []);
    }

    public function isPro(): bool
    {
        $tier = $this->resolvedSubscriptionTier();

        return in_array($tier, [
            'Standard Operative',
            'Elite Operative',
            'Fleet Operative',
            'driver_pro',
            'oga_basic',
            'oga_premium',
        ], true);
    }

    public function isElite(): bool
    {
        $tier = $this->resolvedSubscriptionTier();

        return in_array($tier, [
            'Elite Operative',
            'Fleet Operative',
            'oga_premium',
        ], true);
    }

    public function hasActiveSubscription(): bool
    {
        if ($this->subscription_tier && $this->subscription_expires_at && $this->subscription_expires_at->isFuture()) {
            return true;
        }

        $subscription = $this->user?->activeSubscription;

        return $subscription && $subscription->isActive();
    }

    public function resolvedSubscriptionTier(): ?string
    {
        if ($this->subscription_tier && (!$this->subscription_expires_at || $this->subscription_expires_at->isFuture())) {
            return $this->subscription_tier;
        }

        $subscription = $this->user?->activeSubscription;

        if ($subscription && $subscription->isActive()) {
            return $subscription->type;
        }

        return $this->subscription_tier;
    }

    public function clearanceLevel(): string
    {
        if ($this->status === 'blacklisted') {
            return 'Revoked';
        }

        $tier = $this->resolvedSubscriptionTier();

        if (in_array($tier, ['Elite Operative', 'Fleet Operative', 'oga_premium'], true)) {
            return 'Elite';
        }

        if ($this->isPro() || in_array($tier, ['Standard Operative', 'Trial Operative', 'driver_pro', 'oga_basic'], true)) {
            return 'Premium';
        }

        if ($this->rating > 4.5 && ($this->total_jobs ?? 0) > 50) {
            return 'Elite';
        }

        return 'Basic';
    }

    public function getFormattedIdAttribute(): string
    {
        $stateAbbr = 'LA'; // Default to LA for fallback if not set

        if ($this->state && $this->state->code) {
            $stateAbbr = strtoupper($this->state->code);
        }

        $userId = $this->user_id ?? 1022;
        $hexId = str_pad(strtoupper(dechex($userId)), 4, '0', STR_PAD_LEFT);

        return sprintf('OGD-NG-%s-%s', $stateAbbr, $hexId);
    }

    public function updateLocation(float $latitude, float $longitude): void
    {
        $this->update([
            'current_latitude' => $latitude,
            'current_longitude' => $longitude,
            'last_location_update' => now(),
        ]);
    }

    public function scopeOnline($query)
    {
        return $query->where('is_online', true)->where('status', 'active');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeNearby($query, float $latitude, float $longitude, int $radiusKm = 50)
    {
        return $query->whereRaw(
            "ST_Distance_Sphere(POINT(current_longitude, current_latitude), POINT(?, ?)) <= ?",
            [$longitude, $latitude, $radiusKm * 1000]
        );
    }

    public function scopeByTier($query, string $tier)
    {
        return $query->where('subscription_tier', $tier);
    }

    public function scopeHybridTier($query)
    {
        return $query->where('subscription_tier', 'driver_hybrid');
    }

    public function scopeBasicTier($query)
    {
        return $query->where('subscription_tier', 'driver_basic');
    }

    public function scopeAccessibleToEmployer($query, string $employerAccessTier)
    {
        if ($employerAccessTier === 'hybrid') {
            return $query->where('subscription_tier', 'driver_hybrid');
        }

        // Normal access tier can see non-Hybrid drivers
        return $query->where('subscription_tier', '!=', 'driver_hybrid');
    }
}
