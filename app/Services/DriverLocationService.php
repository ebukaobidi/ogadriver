<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use App\Models\Driver;
use App\Models\DriverLocation;
use App\Services\DriverVerificationService;

class DriverLocationService
{
    protected string $redisKey = 'drivers:locations';
    protected DriverVerificationService $verificationService;

    public function __construct(DriverVerificationService $verificationService)
    {
        $this->verificationService = $verificationService;
    }

    /**
     * Add or update driver location in Redis geospatial index
     */
    public function updateDriverLocation(int $driverId, float $latitude, float $longitude, string $status = 'online'): void
    {
        $key = "{$this->redisKey}:{$status}";
        
        Redis::geoadd($key, $longitude, $latitude, $driverId);
        
        // Store additional metadata
        Redis::hset("{$this->redisKey}:metadata:{$driverId}", [
            'latitude' => $latitude,
            'longitude' => $longitude,
            'status' => $status,
            'updated_at' => now()->toIso8601String(),
        ]);

        // Update driver in database
        $driver = Driver::find($driverId);
        if ($driver) {
            $driver->updateLocation($latitude, $longitude);
            $driver->update(['is_online' => $status === 'online']);
        }

        // Store location history in database
        DriverLocation::create([
            'driver_id' => $driverId,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'status' => $status,
            'recorded_at' => now(),
        ]);
    }

    /**
     * Find drivers within a specific radius of a location
     */
    public function findNearbyDrivers(float $latitude, float $longitude, int $radiusKm = 50, string $status = 'online'): array
    {
        $key = "{$this->redisKey}:{$status}";
        
        $drivers = [];
        
        try {
            // Use GEORADIUS to find drivers within radius
            $results = Redis::georadius($key, $longitude, $latitude, $radiusKm, 'km', [
                'WITHDIST',
                'WITHCOORD',
                'ASC',
            ]);
            
            foreach ($results as $result) {
                $driverId = $result[0];
                $distance = $result[1];
                $coords = $result[2];
                
                $driver = Driver::with('user')->find($driverId);
                
                // Only include drivers who are eligible for dispatch (verified + active subscription)
                if ($driver && $this->verificationService->isEligibleForDispatch($driver)) {
                    $drivers[] = [
                        'driver' => $driver,
                        'distance_km' => $distance,
                        'coordinates' => [
                            'latitude' => $coords[0],
                            'longitude' => $coords[1],
                        ]
                    ];
                }
            }
        } catch (\Exception $e) {
            // Fallback for local environments without Redis
            // Using DB Haversine formula
            $fallbackDrivers = Driver::with('user')
                ->where('status', 'active')
                ->where('is_online', $status === 'online')
                ->whereNotNull('current_latitude')
                ->whereNotNull('current_longitude')
                ->get();
                
            foreach ($fallbackDrivers as $driver) {
                // Only include drivers who are eligible for dispatch (verified + active subscription)
                if (!$this->verificationService->isEligibleForDispatch($driver)) {
                    continue;
                }
                
                $latTo = $driver->current_latitude;
                $lonTo = $driver->current_longitude;
                
                $theta = $longitude - $lonTo;
                $dist = sin(deg2rad($latitude)) * sin(deg2rad($latTo)) +  cos(deg2rad($latitude)) * cos(deg2rad($latTo)) * cos(deg2rad($theta));
                $dist = acos($dist);
                $dist = rad2deg($dist);
                $miles = $dist * 60 * 1.1515;
                $distanceKm = $miles * 1.609344;
                
                if ($distanceKm <= $radiusKm) {
                    $drivers[] = [
                        'driver' => $driver,
                        'distance_km' => $distanceKm,
                        'coordinates' => [
                            'latitude' => $latTo,
                            'longitude' => $lonTo,
                        ]
                    ];
                }
            }
            
            usort($drivers, function($a, $b) {
                return $a['distance_km'] <=> $b['distance_km'];
            });
        }

        // Sort by Pro status first, then by distance
        usort($drivers, function ($a, $b) {
            if ($a['driver']->isPro() && !$b['driver']->isPro()) {
                return -1;
            }
            if (!$a['driver']->isPro() && $b['driver']->isPro()) {
                return 1;
            }
            return $a['distance_km'] <=> $b['distance_km'];
        });

        return $drivers;
    }

    /**
     * Find drivers within a specific radius for a job
     */
    public function findDriversForJob(float $pickupLatitude, float $pickupLongitude, int $radiusKm = 50, array $filters = []): array
    {
        $drivers = $this->findNearbyDrivers($pickupLatitude, $pickupLongitude, $radiusKm);

        // Apply filters
        if (!empty($filters['vehicle_certifications'])) {
            $drivers = array_filter($drivers, function ($item) use ($filters) {
                $driverCerts = $item['driver']->vehicle_certifications ?? [];
                return !empty(array_intersect($filters['vehicle_certifications'], $driverCerts));
            });
        }

        if (!empty($filters['min_rating'])) {
            $drivers = array_filter($drivers, function ($item) use ($filters) {
                return $item['driver']->rating >= $filters['min_rating'];
            });
        }

        if (!empty($filters['min_experience'])) {
            $drivers = array_filter($drivers, function ($item) use ($filters) {
                return $item['driver']->years_of_experience >= $filters['min_experience'];
            });
        }

        if (!empty($filters['preferred_route_type'])) {
            $drivers = array_filter($drivers, function ($item) use ($filters) {
                return $item['driver']->preferred_route_type === $filters['preferred_route_type'] 
                    || $item['driver']->preferred_route_type === 'both';
            });
        }

        return array_values($drivers);
    }

    /**
     * Remove driver from geospatial index
     */
    public function removeDriverLocation(int $driverId, string $status = 'online'): void
    {
        $key = "{$this->redisKey}:{$status}";
        Redis::zrem($key, $driverId);
        Redis::del("{$this->redisKey}:metadata:{$driverId}");
    }

    /**
     * Get driver's current location from Redis
     */
    public function getDriverLocation(int $driverId): ?array
    {
        $metadata = Redis::hgetall("{$this->redisKey}:metadata:{$driverId}");
        
        if (empty($metadata)) {
            return null;
        }

        return [
            'latitude' => (float) $metadata['latitude'],
            'longitude' => (float) $metadata['longitude'],
            'status' => $metadata['status'],
            'updated_at' => $metadata['updated_at'],
        ];
    }

    /**
     * Get count of online drivers in a region
     */
    public function getOnlineDriverCount(float $latitude, float $longitude, int $radiusKm = 100): int
    {
        $key = "{$this->redisKey}:online";
        $results = Redis::georadius($key, $longitude, $latitude, $radiusKm, 'km');
        
        return count($results);
    }

    /**
     * Broadcast job to nearby drivers via geospatial query
     */
    public function broadcastJobToNearbyDrivers(float $latitude, float $longitude, int $radiusKm, int $jobId): array
    {
        $nearbyDrivers = $this->findNearbyDrivers($latitude, $longitude, $radiusKm);
        
        $driverIds = array_map(function ($item) {
            return $item['driver']->id;
        }, $nearbyDrivers);

        // Store job broadcast in Redis for WebSocket notification
        foreach ($driverIds as $driverId) {
            Redis::lpush("driver:{$driverId}:notifications", json_encode([
                'type' => 'new_job',
                'job_id' => $jobId,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'distance_km' => $this->calculateDistance($latitude, $longitude, $nearbyDrivers),
                'created_at' => now()->toIso8601String(),
            ]));
        }

        return $driverIds;
    }

    /**
     * Clean up old location data from Redis
     */
    public function cleanupOldLocations(int $hours = 24): void
    {
        $keys = Redis::keys("{$this->redisKey}:metadata:*");
        
        foreach ($keys as $key) {
            $metadata = Redis::hgetall($key);
            if (!empty($metadata['updated_at'])) {
                $updatedAt = \Carbon\Carbon::parse($metadata['updated_at']);
                if ($updatedAt->lt(now()->subHours($hours))) {
                    $driverId = str_replace("{$this->redisKey}:metadata:", '', $key);
                    $this->removeDriverLocation($driverId, $metadata['status']);
                }
            }
        }
    }

    /**
     * Get driver density heatmap data for a region
     */
    public function getDriverHeatmap(float $latitude, float $longitude, int $radiusKm = 50, int $gridSize = 10): array
    {
        $drivers = $this->findNearbyDrivers($latitude, $longitude, $radiusKm);
        
        $heatmap = [];
        $step = ($radiusKm * 2) / $gridSize;
        
        for ($i = 0; $i < $gridSize; $i++) {
            for ($j = 0; $j < $gridSize; $j++) {
                $gridLat = $latitude - $radiusKm + ($i * $step);
                $gridLon = $longitude - $radiusKm + ($j * $step);
                
                $count = 0;
                foreach ($drivers as $driver) {
                    $distance = $this->haversineDistance(
                        $gridLat, $gridLon,
                        $driver['coordinates']['latitude'],
                        $driver['coordinates']['longitude']
                    );
                    if ($distance <= $step) {
                        $count++;
                    }
                }
                
                $heatmap[] = [
                    'latitude' => $gridLat,
                    'longitude' => $gridLon,
                    'count' => $count,
                ];
            }
        }
        
        return $heatmap;
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    protected function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }

    /**
     * Calculate distance for driver array
     */
    protected function calculateDistance(float $lat, float $lon, array $drivers): array
    {
        return array_map(function ($driver) use ($lat, $lon) {
            return $this->haversineDistance($lat, $lon, $driver['coordinates']['latitude'], $driver['coordinates']['longitude']);
        }, $drivers);
    }
}
