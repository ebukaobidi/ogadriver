<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'hirer_id',
        'driver_id',
        'title',
        'description',
        'route_description',
        'vehicle_type',
        'pickup_location',
        'pickup_latitude',
        'pickup_longitude',
        'dropoff_location',
        'dropoff_latitude',
        'dropoff_longitude',
        'pickup_time',
        'start_date',
        'end_date',
        'estimated_completion_time',
        'distance_km',
        'agreed_rate',
        'proposed_salary',
        'pricing_type',
        'payment_cycle',
        'shift_preference',
        'accommodation_required',
        'vehicle_required',
        'include_tolls',
        'booking_mode',
        'contract_type',
        'shift_start_time',
        'shift_end_time',
        'corporate_parking_latitude',
        'corporate_parking_longitude',
        'shift_fence_active',
        'estimated_duration_hours',
        'status',
        'accepted_at',
        'funded_at',
        'started_at',
        'completed_at',
        'cancelled_at',
        'cancellation_reason',
        'security_pin',
        'pin_generated_at',
        'pin_verified_at',
        'biometric_scan_image',
        'biometric_scan_at',
        'biometric_verified',
        'biometric_verified_at',
        'biometric_rejection_reason',
        'telemetry_channel_token',
        'telemetry_channel_established_at',
        'telemetry_channel_terminated_at',
        'telemetry_channel_signature',
        'last_telemetry_received_at',
        'blackout_alert_sent',
        'blackout_alert_sent_at',
        'sms_failover_active',
        'sms_failover_activated_at',
        'blackout_duration_minutes',
        'special_requirements',
        'stops',
        'payment_method',
        'offer_price',
        'suggested_price',
        'counter_offer_price',
        'negotiation_status',
        'metadata',
    ];

    protected $casts = [
        'pickup_latitude' => 'decimal:8',
        'pickup_longitude' => 'decimal:8',
        'dropoff_latitude' => 'decimal:8',
        'dropoff_longitude' => 'decimal:8',
        'pickup_time' => 'datetime',
        'estimated_completion_time' => 'datetime',
        'distance_km' => 'decimal:2',
        'agreed_rate' => 'decimal:2',
        'estimated_duration_hours' => 'decimal:2',
        'accepted_at' => 'datetime',
        'funded_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'pin_generated_at' => 'datetime',
        'pin_verified_at' => 'datetime',
        'biometric_scan_at' => 'datetime',
        'biometric_verified' => 'boolean',
        'biometric_verified_at' => 'datetime',
        'telemetry_channel_established_at' => 'datetime',
        'telemetry_channel_terminated_at' => 'datetime',
        'last_telemetry_received_at' => 'datetime',
        'blackout_alert_sent' => 'boolean',
        'blackout_alert_sent_at' => 'datetime',
        'sms_failover_active' => 'boolean',
        'sms_failover_activated_at' => 'datetime',
        'shift_start_time' => 'datetime',
        'shift_end_time' => 'datetime',
        'shift_fence_active' => 'boolean',
        'special_requirements' => 'array',
        'stops' => 'array',
        'offer_price' => 'decimal:2',
        'suggested_price' => 'decimal:2',
        'counter_offer_price' => 'decimal:2',
        'metadata' => 'array',
        'accommodation_required' => 'boolean',
        'vehicle_required' => 'boolean',
        'include_tolls' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'proposed_salary' => 'decimal:2',
    ];

    public function hirer(): BelongsTo
    {
        return $this->belongsTo(Hirer::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function telemetry()
    {
        return $this->hasMany(DrivingTelemetry::class);
    }

    public function latestTelemetry()
    {
        return $this->hasOne(DrivingTelemetry::class)->latestOfMany();
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    public function isInProgress(): bool
    {
        return in_array($this->status, [
            'in_progress',
            'driver_en_route',
            'arrived',
            'active',
            'accepted',
        ], true);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForDriver($query, $driverId)
    {
        return $query->where('driver_id', $driverId);
    }

    public function scopeForHirer($query, $hirerId)
    {
        return $query->where('hirer_id', $hirerId);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('pickup_time', '>=', now());
    }

    /**
     * Generate dynamic 4-digit security PIN
     */
    public function generateSecurityPin(): string
    {
        $pin = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        
        $this->update([
            'security_pin' => \Illuminate\Support\Facades\Hash::make($pin),
            'pin_generated_at' => now(),
        ]);

        return $pin;
    }

    /**
     * Verify security PIN
     */
    public function verifySecurityPin(string $pin): bool
    {
        // PIN expires after 15 minutes
        if ($this->pin_generated_at && $this->pin_generated_at->lt(now()->subMinutes(15))) {
            return false;
        }

        if (\Illuminate\Support\Facades\Hash::check($pin, $this->security_pin)) {
            $this->update([
                'pin_verified_at' => now(),
            ]);
            return true;
        }

        return false;
    }

    /**
     * Check if PIN is valid and not expired
     */
    public function isPinValid(): bool
    {
        if (!$this->security_pin || !$this->pin_generated_at) {
            return false;
        }

        return $this->pin_generated_at->gt(now()->subMinutes(15));
    }

    /**
     * Check if booking is funded (escrow locked)
     */
    public function isFunded(): bool
    {
        return $this->status === 'funded';
    }

    /**
     * Record biometric scan for Anti-Swap Gate
     */
    public function recordBiometricScan(string $imagePath): void
    {
        $this->update([
            'biometric_scan_image' => $imagePath,
            'biometric_scan_at' => now(),
        ]);
    }

    /**
     * Verify biometric scan matches driver profile
     */
    public function verifyBiometricScan(bool $verified, ?string $rejectionReason = null): void
    {
        $this->update([
            'biometric_verified' => $verified,
            'biometric_verified_at' => now(),
            'biometric_rejection_reason' => $rejectionReason,
        ]);

        // If biometric verification fails, lock the booking and alert hirer
        if (!$verified) {
            $this->update(['status' => 'biometric_failed']);
            if ($this->hirer && $this->hirer->user) {
                app(\App\Services\Notifications\NotificationService::class)->notifyBiometricFailure(
                    $this->hirer->user->phone_number ?? '0000',
                    $this->driver->user->name ?? 'Unknown Driver'
                );
            }
        }
    }

    /**
     * Check if biometric verification is required
     */
    public function requiresBiometricVerification(): bool
    {
        return $this->isFunded() && !$this->biometric_verified;
    }

    /**
     * Establish temporary cryptographic handshake for live activity linking
     */
    public function establishTelemetryChannel(): string
    {
        $token = bin2hex(random_bytes(32));
        $signature = hash('sha256', $token . $this->id . $this->driver_id . $this->hirer_id . now()->timestamp);

        $this->update([
            'telemetry_channel_token' => $token,
            'telemetry_channel_signature' => $signature,
            'telemetry_channel_established_at' => now(),
            'telemetry_channel_terminated_at' => null,
        ]);

        return $token;
    }

    /**
     * Terminate telemetry channel (permanent destruction of link)
     */
    public function terminateTelemetryChannel(): void
    {
        $this->update([
            'telemetry_channel_terminated_at' => now(),
            'telemetry_channel_token' => null, // Destroy token permanently
        ]);
    }

    /**
     * Check if telemetry channel is active
     */
    public function isTelemetryChannelActive(): bool
    {
        return $this->telemetry_channel_token !== null && 
               $this->telemetry_channel_established_at !== null &&
               $this->telemetry_channel_terminated_at === null;
    }

    /**
     * Verify telemetry channel signature
     */
    public function verifyTelemetrySignature(string $providedSignature): bool
    {
        if (!$this->isTelemetryChannelActive()) {
            return false;
        }

        return hash_equals($this->telemetry_channel_signature, $providedSignature);
    }

    /**
     * Check if booking is a long-term contract (monthly/yearly)
     */
    public function isLongTermContract(): bool
    {
        return in_array($this->contract_type, ['monthly', 'yearly']);
    }

    /**
     * Check if shift fence is active for this booking
     */
    public function isShiftFenceActive(): bool
    {
        return $this->shift_fence_active && $this->isLongTermContract();
    }

    /**
     * Check if current time is within shift hours
     */
    public function isWithinShiftHours(): bool
    {
        if (!$this->isShiftFenceActive() || !$this->shift_start_time || !$this->shift_end_time) {
            return true; // No shift restrictions
        }

        $now = now()->format('H:i:s');
        return $now >= $this->shift_start_time && $now <= $this->shift_end_time;
    }

    /**
     * Check if driver is within corporate parking boundary
     */
    public function isWithinCorporateParking(float $latitude, float $longitude): bool
    {
        if (!$this->isShiftFenceActive() || !$this->corporate_parking_latitude || !$this->corporate_parking_longitude) {
            return true; // No parking boundary set
        }

        // Calculate distance using Haversine formula (within 100 meters)
        $distance = $this->calculateDistance(
            $latitude,
            $longitude,
            $this->corporate_parking_latitude,
            $this->corporate_parking_longitude
        );

        return $distance <= 0.1; // 100 meters
    }

    /**
     * Calculate distance between two coordinates in kilometers
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Check if telemetry should be recorded based on shift fence rules
     */
    public function shouldRecordTelemetry(): bool
    {
        if (!$this->isShiftFenceActive()) {
            return true; // No shift restrictions, always record
        }

        return $this->isWithinShiftHours();
    }

    /**
     * Update last telemetry received timestamp
     */
    public function updateLastTelemetryReceived(): void
    {
        $this->update(['last_telemetry_received_at' => now()]);
    }

    /**
     * Check if tracking blackout is detected (>7 minutes)
     */
    public function isBlackoutDetected(): bool
    {
        if (!$this->last_telemetry_received_at) {
            return false;
        }

        $minutesSinceLastTelemetry = now()->diffInMinutes($this->last_telemetry_received_at);
        return $minutesSinceLastTelemetry > 7;
    }

    /**
     * Get blackout duration in minutes
     */
    public function getBlackoutDuration(): int
    {
        if (!$this->last_telemetry_received_at) {
            return 0;
        }

        return now()->diffInMinutes($this->last_telemetry_received_at);
    }

    /**
     * Mark blackout alert as sent
     */
    public function markBlackoutAlertSent(): void
    {
        $this->update([
            'blackout_alert_sent' => true,
            'blackout_alert_sent_at' => now(),
            'blackout_duration_minutes' => $this->getBlackoutDuration(),
        ]);
    }

    /**
     * Activate SMS failover
     */
    public function activateSmsFailover(): void
    {
        $this->update([
            'sms_failover_active' => true,
            'sms_failover_activated_at' => now(),
        ]);
    }

    /**
     * Deactivate SMS failover (connection restored)
     */
    public function deactivateSmsFailover(): void
    {
        $this->update([
            'sms_failover_active' => false,
            'blackout_alert_sent' => false,
        ]);
    }
}

