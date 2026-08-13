<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverPricing extends Model
{
    protected $fillable = [
        'driver_id',
        'pricing_type',
        'base_rate',
        'minimum_rate',
        'vehicle_type',
        'rate_tiers',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'base_rate' => 'decimal:2',
        'minimum_rate' => 'decimal:2',
        'rate_tiers' => 'array',
        'is_active' => 'boolean',
    ];

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByVehicleType($query, $vehicleType)
    {
        return $query->where('vehicle_type', $vehicleType);
    }

    public function calculateCost($distance = null, $duration = null): float
    {
        $cost = $this->base_rate;

        switch ($this->pricing_type) {
            case 'distance':
                if ($distance && $this->rate_tiers) {
                    foreach ($this->rate_tiers as $tier) {
                        if ($distance > $tier['min_km'] && $distance <= $tier['max_km']) {
                            $cost = $tier['rate'];
                            break;
                        }
                    }
                }
                break;
            case 'hourly':
                if ($duration) {
                    $cost = $this->base_rate * $duration;
                }
                break;
            case 'daily':
                if ($duration) {
                    $days = ceil($duration / 24);
                    $cost = $this->base_rate * $days;
                }
                break;
        }

        return max($cost, $this->minimum_rate ?? $cost);
    }
}

