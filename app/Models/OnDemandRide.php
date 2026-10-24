<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OnDemandRide extends Model
{
    use HasFactory;

    protected $fillable = [
        'rider_id',
        'driver_id',
        'status',
        'pickup_address',
        'pickup_latitude',
        'pickup_longitude',
        'requested_at',
        'driver_assigned_at',
        'driver_arrived_at',
        'started_at',
        'completed_at',
        'cancelled_at',
        'dropoff_address',
        'dropoff_latitude',
        'dropoff_longitude',
        'estimated_distance_km',
        'estimated_duration_minutes',
        'actual_distance_km',
        'actual_duration_minutes',
        'fare_amount',
        'currency',
        'is_surge_pricing',
        'surge_multiplier',
        'vehicle_type_preference',
        'ride_preferences',
        'driver_details_shown',
        'driver_details_shown_at',
        'cancelled_by',
        'cancellation_reason',
        'payment_method',
        'payment_status',
        'transaction_id',
        'rider_rating',
        'rider_review',
        'driver_rating',
        'driver_review',
        'emergency_triggered',
        'emergency_triggered_at',
        'emergency_reason',
        'stops',
        'offer_price',
        'counter_offer_price',
        'negotiation_status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'pickup_latitude' => 'decimal:8',
            'pickup_longitude' => 'decimal:8',
            'dropoff_latitude' => 'decimal:8',
            'dropoff_longitude' => 'decimal:8',
            'estimated_distance_km' => 'decimal:2',
            'estimated_duration_minutes' => 'decimal:2',
            'actual_distance_km' => 'decimal:2',
            'actual_duration_minutes' => 'decimal:2',
            'fare_amount' => 'decimal:2',
            'surge_multiplier' => 'decimal:2',
            'requested_at' => 'datetime',
            'driver_assigned_at' => 'datetime',
            'driver_arrived_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'driver_details_shown_at' => 'datetime',
            'emergency_triggered_at' => 'datetime',
            'ride_preferences' => 'array',
            'stops' => 'array',
            'offer_price' => 'decimal:2',
            'counter_offer_price' => 'decimal:2',
            'metadata' => 'array',
            'is_surge_pricing' => 'boolean',
            'driver_details_shown' => 'boolean',
            'emergency_triggered' => 'boolean',
        ];
    }

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['requested', 'driver_assigned', 'driver_enroute', 'started']);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeForDriver($query, int $driverId)
    {
        return $query->where('driver_id', $driverId);
    }

    public function scopeForRider($query, int $riderId)
    {
        return $query->where('rider_id', $riderId);
    }

    public function assignDriver(int $driverId): void
    {
        $this->update([
            'driver_id' => $driverId,
            'status' => 'driver_assigned',
            'driver_assigned_at' => now(),
        ]);
    }

    public function markDriverEnroute(): void
    {
        $this->update([
            'status' => 'driver_enroute',
        ]);
    }

    public function markDriverArrived(): void
    {
        $this->update([
            'status' => 'driver_assigned',
            'driver_arrived_at' => now(),
        ]);
    }

    public function start(): void
    {
        $this->update([
            'status' => 'started',
            'started_at' => now(),
        ]);
    }

    public function complete(array $actualMetrics = []): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'actual_distance_km' => $actualMetrics['distance_km'] ?? null,
            'actual_duration_minutes' => $actualMetrics['duration_minutes'] ?? null,
        ]);
    }

    public function cancel(string $cancelledBy, ?string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_by' => $cancelledBy,
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
        ]);
    }

    public function triggerEmergency(string $reason): void
    {
        $this->update([
            'emergency_triggered' => true,
            'emergency_triggered_at' => now(),
            'emergency_reason' => $reason,
        ]);
    }

    public function showDriverDetails(): void
    {
        $this->update([
            'driver_details_shown' => true,
            'driver_details_shown_at' => now(),
        ]);
    }

    public function isCancellable(): bool
    {
        return in_array($this->status, ['requested', 'driver_assigned']);
    }

    public function isRated(): bool
    {
        return $this->rider_rating !== null || $this->driver_rating !== null;
    }

    public function getDuration(): int
    {
        if ($this->started_at && $this->completed_at) {
            return $this->started_at->diffInMinutes($this->completed_at);
        }
        return 0;
    }

    public function getWaitTime(): int
    {
        if ($this->requested_at && $this->driver_assigned_at) {
            return $this->requested_at->diffInMinutes($this->driver_assigned_at);
        }
        return 0;
    }
}
