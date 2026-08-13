<?php

namespace App\Services;

use App\Models\TransportJob;
use App\Models\DriverLocation;
use Illuminate\Support\Facades\DB;

class GeofencingTelemetryService
{
    /**
     * Calculate distance between two coordinates in km using Haversine formula
     */
    protected function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
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
     * Check if point is within route corridor
     */
    protected function isWithinRouteCorridor(float $currentLat, float $currentLon, array $waypoints, float $maxDeviationKm): bool
    {
        if (empty($waypoints)) {
            return true; // No waypoints defined, allow any location
        }

        foreach ($waypoints as $waypoint) {
            $distance = $this->calculateDistance(
                $currentLat,
                $currentLon,
                $waypoint['latitude'],
                $waypoint['longitude']
            );

            if ($distance <= $maxDeviationKm) {
                return true; // Within deviation threshold of a waypoint
            }
        }

        return false;
    }

    /**
     * Check for route deviation
     */
    public function checkRouteDeviation(TransportJob $job, float $currentLat, float $currentLon): array
    {
        if (!$job->geofencing_active || $job->status !== 'in_progress') {
            return ['alert_triggered' => false];
        }

        $waypoints = $job->route_waypoints ?? [];
        $maxDeviation = $job->max_deviation_km ?? 5.0;

        $withinRoute = $this->isWithinRouteCorridor($currentLat, $currentLon, $waypoints, $maxDeviation);

        if (!$withinRoute && !$job->deviation_alert_triggered) {
            // Trigger deviation alert
            $job->update([
                'deviation_alert_triggered' => true,
                'deviation_alerted_at' => now(),
                'last_known_location' => json_encode([
                    'latitude' => $currentLat,
                    'longitude' => $currentLon,
                    'timestamp' => now()->toIso8601String(),
                ]),
            ]);

            $this->triggerDeviationAlert($job, $currentLat, $currentLon);

            return [
                'alert_triggered' => true,
                'alert_type' => 'route_deviation',
                'current_location' => ['latitude' => $currentLat, 'longitude' => $currentLon],
            ];
        }

        // Update last known location
        $job->update([
            'last_known_location' => json_encode([
                'latitude' => $currentLat,
                'longitude' => $currentLon,
                'timestamp' => now()->toIso8601String(),
            ]),
            'last_location_update' => now(),
        ]);

        return ['alert_triggered' => false];
    }

    /**
     * Check for GPS blackout (no location updates for 7+ minutes)
     */
    public function checkGPSBlackout(TransportJob $job): array
    {
        if (!$job->geofencing_active || $job->status !== 'in_progress') {
            return ['alert_triggered' => false];
        }

        if (!$job->last_location_update) {
            return ['alert_triggered' => false];
        }

        $minutesSinceUpdate = now()->diffInMinutes($job->last_location_update);
        $blackoutThreshold = 7; // 7 minutes

        if ($minutesSinceUpdate >= $blackoutThreshold && !$job->blackout_alert_triggered) {
            // Trigger blackout alert
            $job->update([
                'gps_blackout_minutes' => $minutesSinceUpdate,
                'blackout_alert_triggered' => true,
                'blackout_alerted_at' => now(),
            ]);

            $this->triggerBlackoutAlert($job, $minutesSinceUpdate);

            return [
                'alert_triggered' => true,
                'alert_type' => 'gps_blackout',
                'blackout_minutes' => $minutesSinceUpdate,
                'last_known_location' => json_decode($job->last_known_location, true),
            ];
        }

        // Update blackout counter if still blacked out
        if ($minutesSinceUpdate >= $blackoutThreshold) {
            $job->update(['gps_blackout_minutes' => $minutesSinceUpdate]);
        }

        return ['alert_triggered' => false];
    }

    /**
     * Process driver location update with geofencing checks
     */
    public function processLocationUpdate(TransportJob $job, float $currentLat, float $currentLon): array
    {
        $results = [
            'route_deviation' => $this->checkRouteDeviation($job, $currentLat, $currentLon),
            'gps_blackout' => $this->checkGPSBlackout($job),
        ];

        // Reset blackout alert if location update received
        if ($job->blackout_alert_triggered && $results['gps_blackout']['alert_triggered'] === false) {
            $job->update([
                'blackout_alert_triggered' => false,
                'gps_blackout_minutes' => 0,
            ]);
        }

        return $results;
    }

    /**
     * Trigger route deviation alert
     */
    protected function triggerDeviationAlert(TransportJob $job, float $currentLat, float $currentLon): void
    {
        // Send alert to hirer/corporate dispatcher
        $alertData = [
            'job_id' => $job->id,
            'alert_type' => 'route_deviation',
            'driver_id' => $job->driver_id,
            'current_location' => ['latitude' => $currentLat, 'longitude' => $currentLon],
            'timestamp' => now()->toIso8601String(),
            'message' => 'Driver has deviated from designated route',
        ];

        // In production, send via webhook, SMS, or push.notification
        \Log::warning('Route deviation alert', $alertData);

        // Store alert in job locations for audit trail
        DriverLocation::create([
            'driver_id' => $job->driver_id,
            'job_id' => $job->id,
            'latitude' => $currentLat,
            'longitude' => $currentLon,
            'recorded_at' => now(),
            'metadata' => json_encode(['alert' => 'route_deviation']),
        ]);
    }

    /**
     * Trigger GPS blackout alert
     */
    protected function triggerBlackoutAlert(TransportJob $job, int $blackoutMinutes): void
    {
        $alertData = [
            'job_id' => $job->id,
            'alert_type' => 'gps_blackout',
            'driver_id' => $job->driver_id,
            'blackout_minutes' => $blackoutMinutes,
            'last_known_location' => json_decode($job->last_known_location, true),
            'timestamp' => now()->toIso8601String(),
            'message' => "Driver GPS signal lost for {$blackoutMinutes} minutes",
        ];

        \Log::warning('GPS blackout alert', $alertData);

        // Store alert in job locations for audit trail
        if ($job->last_known_location) {
            $location = json_decode($job->last_known_location, true);
            DriverLocation::create([
                'driver_id' => $job->driver_id,
                'job_id' => $job->id,
                'latitude' => $location['latitude'],
                'longitude' => $location['longitude'],
                'recorded_at' => now(),
                'metadata' => json_encode(['alert' => 'gps_blackout', 'blackout_minutes' => $blackoutMinutes]),
            ]);
        }
    }

    /**
     * Generate route waypoints between pickup and dropoff
     */
    public function generateRouteWaypoints(float $pickupLat, float $pickupLon, float $dropoffLat, float $dropoffLon, int $numWaypoints = 5): array
    {
        $waypoints = [];

        for ($i = 1; $i <= $numWaypoints; $i++) {
            $ratio = $i / ($numWaypoints + 1);
            $waypointLat = $pickupLat + ($dropoffLat - $pickupLat) * $ratio;
            $waypointLon = $pickupLon + ($dropoffLon - $pickupLon) * $ratio;

            $waypoints[] = [
                'latitude' => $waypointLat,
                'longitude' => $waypointLon,
                'sequence' => $i,
            ];
        }

        return $waypoints;
    }

    /**
     * Get job telemetry summary
     */
    public function getJobTelemetry(TransportJob $job): array
    {
        return [
            'job_id' => $job->id,
            'geofencing_active' => $job->geofencing_active,
            'deviation_alert_triggered' => $job->deviation_alert_triggered,
            'deviation_alerted_at' => $job->deviation_alerted_at,
            'blackout_alert_triggered' => $job->blackout_alert_triggered,
            'blackout_alerted_at' => $job->blackout_alerted_at,
            'gps_blackout_minutes' => $job->gps_blackout_minutes,
            'last_known_location' => json_decode($job->last_known_location, true),
            'last_location_update' => $job->last_location_update,
            'location_updates_count' => DriverLocation::where('job_id', $job->id)->count(),
        ];
    }

    /**
     * Check all active jobs for GPS blackouts (scheduled task)
     */
    public function checkAllActiveJobsForBlackouts(): array
    {
        $activeJobs = TransportJob::where('status', 'in_progress')
            ->where('geofencing_active', true)
            ->whereNotNull('last_location_update')
            ->get();

        $alertsTriggered = [];

        foreach ($activeJobs as $job) {
            $result = $this->checkGPSBlackout($job);
            if ($result['alert_triggered']) {
                $alertsTriggered[] = [
                    'job_id' => $job->id,
                    'driver_id' => $job->driver_id,
                    'blackout_minutes' => $result['blackout_minutes'],
                ];
            }
        }

        return [
            'jobs_checked' => $activeJobs->count(),
            'alerts_triggered' => count($alertsTriggered),
            'alerts' => $alertsTriggered,
        ];
    }
}
