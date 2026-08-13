<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DriverLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'job_id',
        'latitude',
        'longitude',
        'accuracy',
        'address',
        'city',
        'state',
        'status',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'accuracy' => 'decimal:2',
            'recorded_at' => 'datetime',
        ];
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function job()
    {
        return $this->belongsTo(TransportJob::class);
    }

    public function scopeOnline($query)
    {
        return $query->where('status', 'online');
    }

    public function scopeOnTrip($query)
    {
        return $query->where('status', 'on_trip');
    }

    public function scopeRecent($query, int $minutes = 30)
    {
        return $query->where('recorded_at', '>=', now()->subMinutes($minutes));
    }

    public function scopeWithinRadius($query, float $latitude, float $longitude, int $radiusKm)
    {
        return $query->whereRaw(
            "ST_Distance_Sphere(POINT(longitude, latitude), POINT(?, ?)) <= ?",
            [$longitude, $latitude, $radiusKm * 1000]
        );
    }
}
