<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\TransportJob;
use Illuminate\Support\Facades\Cache;

class DriverPrioritizationService
{
    /**
     * Calculate priority score for a driver based on multiple factors
     */
    public function calculatePriorityScore(Driver $driver, ?TransportJob $job = null): float
    {
        $score = 0.0;

        // Base score for being verified
        if ($driver->is_verified) {
            $score += 20.0;
        }

        // Elite/Fleet subscription boost (highest priority)
        if ($driver->isElite()) {
            $score += 200.0; // Massive boost for top tier placement
        } elseif ($driver->isPro()) {
            $score += 50.0; // Standard Operative boost
        }

        // Rating score (0-5 stars converted to 0-30 points)
        $score += $driver->rating * 6.0;

        // Experience score (capped at 20 points for 10+ years)
        $experienceScore = min($driver->years_of_experience * 2.0, 20.0);
        $score += $experienceScore;

        // Job completion rate bonus
        if ($driver->total_jobs > 0) {
            $completionRate = $this->getDriverCompletionRate($driver);
            $score += $completionRate * 10.0;
        }

        // Online status boost
        if ($driver->is_online) {
            $score += 15.0;
        }

        // Job-specific matching
        if ($job) {
            $score += $this->calculateJobMatchScore($driver, $job);
        }

        // Recency bonus (drivers who recently completed jobs get priority)
        $recencyBonus = $this->getRecencyBonus($driver);
        $score += $recencyBonus;

        return round($score, 2);
    }

    /**
     * Get prioritized drivers for a job search
     */
    public function getPrioritizedDrivers(array $driverIds, ?TransportJob $job = null): array
    {
        $drivers = Driver::with('user')
            ->whereIn('id', $driverIds)
            ->where('status', 'active')
            ->where('is_verified', true)
            ->get();

        $prioritizedDrivers = [];

        foreach ($drivers as $driver) {
            $score = $this->calculatePriorityScore($driver, $job);
            $prioritizedDrivers[] = [
                'driver' => $driver,
                'priority_score' => $score,
                'is_pro' => $driver->isPro(),
            ];
        }

        // Sort by priority score (descending)
        usort($prioritizedDrivers, function ($a, $b) {
            if ($a['priority_score'] === $b['priority_score']) {
                return 0;
            }
            return ($a['priority_score'] > $b['priority_score']) ? -1 : 1;
        });

        return $prioritizedDrivers;
    }

    /**
     * Get early access drivers for a job (Pro drivers only)
     */
    public function getEarlyAccessDrivers(TransportJob $job): array
    {
        $proDrivers = Driver::with('user')
            ->whereHas('user', function ($query) {
                $query->whereHas('activeSubscription', function ($subQuery) {
                    $subQuery->where('type', 'driver_pro');
                });
            })
            ->where('status', 'active')
            ->where('is_verified', true)
            ->where('is_online', true)
            ->get();

        $earlyAccessDrivers = [];

        foreach ($proDrivers as $driver) {
            $score = $this->calculatePriorityScore($driver, $job);
            $earlyAccessDrivers[] = [
                'driver' => $driver,
                'priority_score' => $score,
            ];
        }

        // Sort by priority score
        usort($earlyAccessDrivers, function ($a, $b) {
            return $b['priority_score'] <=> $a['priority_score'];
        });

        return $earlyAccessDrivers;
    }

    /**
     * Calculate job-specific match score
     */
    protected function calculateJobMatchScore(Driver $driver, TransportJob $job): float
    {
        $matchScore = 0.0;

        // Proximity score
        $matchScore += $this->calculateProximityScore($driver, $job);

        // Vehicle type match
        $driverCertifications = $driver->vehicle_certifications ?? [];
        $requiredCertifications = $job->required_certifications ?? [];

        if (!empty($requiredCertifications)) {
            $matchingCerts = array_intersect($driverCertifications, $requiredCertifications);
            $matchScore += count($matchingCerts) * 5.0;
        }

        // Route type preference match
        if ($job->distance_km > 100) {
            // Long haul job
            if ($driver->preferred_route_type === 'long_haul' || $driver->preferred_route_type === 'both') {
                $matchScore += 10.0;
            }
        } else {
            // Short haul job
            if ($driver->preferred_route_type === 'short_haul' || $driver->preferred_route_type === 'both') {
                $matchScore += 10.0;
            }
        }

        return $matchScore;
    }

    /**
     * Calculate distance-based proximity score
     */
    protected function calculateProximityScore(Driver $driver, TransportJob $job): float
    {
        if (!$driver->latitude || !$driver->longitude || !$job->pickup_latitude || !$job->pickup_longitude) {
            return 0.0;
        }

        $lat1 = deg2rad($driver->latitude);
        $lon1 = deg2rad($driver->longitude);
        $lat2 = deg2rad($job->pickup_latitude);
        $lon2 = deg2rad($job->pickup_longitude);

        $dlat = $lat2 - $lat1;
        $dlon = $lon2 - $lon1;

        $a = sin($dlat / 2) * sin($dlat / 2) + cos($lat1) * cos($lat2) * sin($dlon / 2) * sin($dlon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distanceKm = 6371 * $c;

        if ($distanceKm <= 5) return 20.0;
        if ($distanceKm <= 10) return 15.0;
        if ($distanceKm <= 20) return 10.0;
        if ($distanceKm <= 50) return 5.0;

        return 0.0;
    }

    /**
     * Get driver completion rate
     */
    protected function getDriverCompletionRate(Driver $driver): float
    {
        $cacheKey = "driver_completion_rate:{$driver->id}";

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($driver) {
            $totalJobs = $driver->jobs()->count();
            if ($totalJobs === 0) {
                return 0.0;
            }

            $completedJobs = $driver->jobs()->where('status', 'completed')->count();
            return ($completedJobs / $totalJobs) * 100;
        });
    }

    /**
     * Get recency bonus for driver activity
     */
    protected function getRecencyBonus(Driver $driver): float
    {
        $lastCompletedJob = $driver->jobs()
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->first();

        if (!$lastCompletedJob || !$lastCompletedJob->completed_at) {
            return 0.0;
        }

        $daysSinceLastJob = now()->diffInDays($lastCompletedJob->completed_at);

        // Higher bonus for more recent activity
        if ($daysSinceLastJob <= 1) {
            return 10.0;
        } elseif ($daysSinceLastJob <= 7) {
            return 7.0;
        } elseif ($daysSinceLastJob <= 30) {
            return 5.0;
        } elseif ($daysSinceLastJob <= 90) {
            return 2.0;
        }

        return 0.0;
    }

    /**
     * Boost Pro drivers in search results
     */
    public function boostProDrivers(array $drivers): array
    {
        $eliteDrivers = [];
        $proDrivers = [];
        $regularDrivers = [];

        foreach ($drivers as $driverData) {
            if ($driverData['driver']->isElite()) {
                $eliteDrivers[] = $driverData;
            } elseif ($driverData['driver']->isPro()) {
                $proDrivers[] = $driverData;
            } else {
                $regularDrivers[] = $driverData;
            }
        }

        // Elite drivers get massive boost, Pro gets moderate boost
        foreach ($eliteDrivers as &$eliteDriver) {
            $eliteDriver['priority_score'] *= 2.0; // 100% boost
        }
        foreach ($proDrivers as &$proDriver) {
            $proDriver['priority_score'] *= 1.5; // 50% boost
        }

        // Merge with Elite first, then Pro, then regular
        return array_merge($eliteDrivers, $proDrivers, $regularDrivers);
    }

    /**
     * Apply surge pricing priority
     */
    public function applySurgePriority(array $drivers, float $surgeMultiplier): array
    {
        if ($surgeMultiplier <= 1.0) {
            return $drivers;
        }

        // Boost priority for surge jobs
        foreach ($drivers as &$driverData) {
            $driverData['priority_score'] *= $surgeMultiplier;
        }

        // Re-sort after surge boost
        usort($drivers, function ($a, $b) {
            return $b['priority_score'] <=> $a['priority_score'];
        });

        return $drivers;
    }

    /**
     * Get top N drivers by priority
     */
    public function getTopDrivers(array $drivers, int $limit = 10): array
    {
        return array_slice($drivers, 0, $limit);
    }

    /**
     * Cache prioritized results for performance
     */
    public function getCachedPrioritizedDrivers(string $cacheKey, callable $callback, int $ttl = 300): array
    {
        return Cache::remember($cacheKey, now()->addSeconds($ttl), $callback);
    }

    /**
     * Invalidate priority cache for a driver
     */
    public function invalidateDriverCache(int $driverId): void
    {
        Cache::forget("driver_completion_rate:{$driverId}");

        // Invalidate any search result caches that might include this driver
        $keys = Cache::get('driver_priority_cache_keys', []);
        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }
}
