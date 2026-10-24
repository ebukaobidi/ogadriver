<?php

namespace App\Services;

use App\Models\DriverVehicle;
use App\Models\User;
use App\Events\FleetGeofenceBreached;
use Illuminate\Support\Facades\Log;

class GeofenceEngine
{
    /**
     * Check if a driver's vehicle has breached its fleet geofence parameters
     *
     * @param int $driverId
     * @param float $latitude
     * @param float $longitude
     * @return bool
     */
    public function enforceFleetGeofence($driverId, $latitude, $longitude)
    {
        $vehicle = DriverVehicle::where('driver_id', $driverId)->whereNotNull('fleet_owner_id')->first();

        if (!$vehicle) {
            return true; // No fleet owner or geofence restrictions
        }

        // 1. Curfew Enforcement
        if ($vehicle->curfew_start && $vehicle->curfew_end) {
            $now = now()->format('H:i:s');
            if ($now >= $vehicle->curfew_start || $now <= $vehicle->curfew_end) {
                $this->triggerLockdown($vehicle, 'Curfew Violation');
                return false;
            }
        }

        // 2. Spatial Geofence Enforcement (Haversine Distance)
        if ($vehicle->geofence_center_lat && $vehicle->geofence_center_lng && $vehicle->geofence_radius_km) {
            $distance = $this->calculateDistanceKm(
                $vehicle->geofence_center_lat,
                $vehicle->geofence_center_lng,
                $latitude,
                $longitude
            );

            if ($distance > $vehicle->geofence_radius_km) {
                $this->triggerLockdown($vehicle, "Geofence Breach ($distance km from center)");
                return false;
            }
        }

        return true;
    }

    protected function triggerLockdown(DriverVehicle $vehicle, $reason)
    {
        Log::critical("FLEET SECURITY ALERT: Vehicle {$vehicle->license_plate} triggered lockdown: {$reason}");

        $owner = User::find($vehicle->fleet_owner_id);
        if ($owner) {
            // resolve(SmsService::class)->send($owner->phone, "🚨 OgaDriver Security: Your vehicle {$vehicle->license_plate} has breached its security geofence: {$reason}. The driver's app has been locked.");
        }

        // Suspend the vehicle to prevent further rides
        $vehicle->update(['is_active' => false]);

        // Hardware Kill Switch!
        if ($vehicle->gps_tracker_api_url) {
            $this->triggerHardwareKillSwitch($vehicle);
        }
    }

    protected function triggerHardwareKillSwitch(DriverVehicle $vehicle)
    {
        try {
            Log::alert("FIRING HARDWARE KILL SWITCH for Vehicle {$vehicle->license_plate}");
            \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . $vehicle->gps_tracker_api_key,
                'Content-Type' => 'application/json'
            ])->timeout(3)->post($vehicle->gps_tracker_api_url, [
                'command' => 'engine_stop',
                'vehicle_id' => $vehicle->license_plate,
                'reason' => 'OgaDriver Geofence Breach'
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to fire hardware kill switch: " . $e->getMessage());
        }
    }

    /**
     * Track Mileage and Predict Maintenance
     */
    public function accumulateMileage($driverId, $latitude, $longitude)
    {
        $vehicle = DriverVehicle::where('driver_id', $driverId)->whereNotNull('fleet_owner_id')->first();
        if (!$vehicle) return;

        // In a production app, we would cache the LAST known coordinate in Redis 
        // and calculate the distance from there to the NEW coordinate.
        // For demonstration, let's assume we calculated the delta is 0.5km per ping.
        $distanceDrivenKm = 0.5; // Placeholder for actual delta calculation

        $vehicle->increment('current_mileage_km', $distanceDrivenKm);

        if ($vehicle->current_mileage_km >= $vehicle->maintenance_interval_km && !$vehicle->maintenance_alert_sent) {
            $owner = User::find($vehicle->fleet_owner_id);
            if ($owner) {
                // resolve(SmsService::class)->send($owner->phone, "🔧 OgaDriver Maintenance: Your vehicle {$vehicle->license_plate} has driven {$vehicle->current_mileage_km}km. It is due for an oil change.");
            }
            $vehicle->update(['maintenance_alert_sent' => true]);
        }
    }

    protected function calculateDistanceKm($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadiusKm = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);
             
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadiusKm * $c;
    }
}
