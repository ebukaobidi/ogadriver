<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DrivingTelemetry extends Model
{
    use HasFactory;

    protected $table = 'driving_telemetry';

    protected $fillable = [
        'booking_id',
        'driver_id',
        'recorded_at',
        'latitude',
        'longitude',
        'speed_kmh',
        'acceleration_x',
        'acceleration_y',
        'acceleration_z',
        'hard_braking',
        'aggressive_cornering',
        'speeding',
        'culture_score',
        'sensor_data',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'speed_kmh' => 'decimal:2',
        'acceleration_x' => 'decimal:4',
        'acceleration_y' => 'decimal:4',
        'acceleration_z' => 'decimal:4',
        'hard_braking' => 'boolean',
        'aggressive_cornering' => 'boolean',
        'speeding' => 'boolean',
        'culture_score' => 'decimal:2',
        'sensor_data' => 'array',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    /**
     * Calculate instant culture score based on sensor data
     */
    public static function calculateCultureScore(array $sensorData): float
    {
        $score = 100.0;
        
        // Penalize hard braking (severe negative acceleration)
        if (isset($sensorData['acceleration_x']) && $sensorData['acceleration_x'] < -0.5) {
            $score -= abs($sensorData['acceleration_x']) * 20;
        }
        
        // Penalize aggressive cornering (high lateral acceleration)
        if (isset($sensorData['acceleration_y']) && abs($sensorData['acceleration_y']) > 0.4) {
            $score -= abs($sensorData['acceleration_y']) * 15;
        }
        
        // Penalize speeding (speed > 80 km/h in urban areas)
        if (isset($sensorData['speed_kmh']) && $sensorData['speed_kmh'] > 80) {
            $score -= ($sensorData['speed_kmh'] - 80) * 0.5;
        }
        
        return max(0, min(100, $score));
    }

    /**
     * Detect unsafe driving events
     */
    public static function detectUnsafeEvents(array $sensorData): array
    {
        $events = [];
        
        // Hard braking detection
        if (isset($sensorData['acceleration_x']) && $sensorData['acceleration_x'] < -0.6) {
            $events[] = 'hard_braking';
        }
        
        // Aggressive cornering detection
        if (isset($sensorData['acceleration_y']) && abs($sensorData['acceleration_y']) > 0.5) {
            $events[] = 'aggressive_cornering';
        }
        
        // Speeding detection
        if (isset($sensorData['speed_kmh']) && $sensorData['speed_kmh'] > 100) {
            $events[] = 'speeding';
        }
        
        return $events;
    }

    /**
     * Get average culture score for a booking
     */
    public static function getAverageCultureScore(int $bookingId): float
    {
        return static::where('booking_id', $bookingId)
            ->whereNotNull('culture_score')
            ->avg('culture_score') ?? 100.0;
    }

    /**
     * Get unsafe event count for a booking
     */
    public static function getUnsafeEventCount(int $bookingId): array
    {
        return [
            'hard_braking' => static::where('booking_id', $bookingId)->where('hard_braking', true)->count(),
            'aggressive_cornering' => static::where('booking_id', $bookingId)->where('aggressive_cornering', true)->count(),
            'speeding' => static::where('booking_id', $bookingId)->where('speeding', true)->count(),
        ];
    }
}
