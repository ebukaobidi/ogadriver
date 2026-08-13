<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TransportJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'hirer_id',
        'driver_id',
        'title',
        'description',
        'vehicle_type',
        'required_certifications',
        'pickup_location',
        'pickup_latitude',
        'pickup_longitude',
        'dropoff_location',
        'dropoff_latitude',
        'dropoff_longitude',
        'pickup_time',
        'estimated_delivery_time',
        'distance_km',
        'amount',
        'currency',
        'is_surge_pricing',
        'surge_multiplier',
        'status',
        'is_early_access',
        'early_access_expires_at',
        'published_at',
        'assigned_at',
        'started_at',
        'completed_at',
        'search_radius_km',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'pickup_latitude' => 'decimal:8',
            'pickup_longitude' => 'decimal:8',
            'dropoff_latitude' => 'decimal:8',
            'dropoff_longitude' => 'decimal:8',
            'pickup_time' => 'datetime',
            'estimated_delivery_time' => 'datetime',
            'distance_km' => 'decimal:2',
            'amount' => 'decimal:2',
            'surge_multiplier' => 'decimal:2',
            'early_access_expires_at' => 'datetime',
            'published_at' => 'datetime',
            'assigned_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'required_certifications' => 'array',
            'metadata' => 'array',
        ];
    }

    public function hirer()
    {
        return $this->belongsTo(Hirer::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }

    public function disputes()
    {
        return $this->hasMany(Dispute::class);
    }

    public function locations()
    {
        return $this->hasMany(DriverLocation::class, 'job_id');
    }

    public function latestLocation()
    {
        return $this->hasOne(DriverLocation::class, 'job_id')->latestOfMany();
    }

    public function isEarlyAccessActive(): bool
    {
        return $this->is_early_access && $this->early_access_expires_at > now();
    }

    public function publish(): void
    {
        $this->update([
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    public function assignDriver(int $driverId): void
    {
        $this->update([
            'driver_id' => $driverId,
            'status' => 'assigned',
            'assigned_at' => now(),
        ]);
    }

    public function start(): void
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    public function complete(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
        ]);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['published', 'assigned', 'in_progress']);
    }

    public function scopeEarlyAccess($query)
    {
        return $query->where('is_early_access', true)->where('early_access_expires_at', '>', now());
    }

    public function scopeNearby($query, float $latitude, float $longitude, int $radiusKm = 50)
    {
        return $query->whereRaw(
            "ST_Distance_Sphere(POINT(pickup_longitude, pickup_latitude), POINT(?, ?)) <= ?",
            [$longitude, $latitude, $radiusKm * 1000]
        );
    }
}
