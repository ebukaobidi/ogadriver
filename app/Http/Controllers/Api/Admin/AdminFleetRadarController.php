<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Driver;
use App\Models\TransportJob;
use App\Models\EmergencySosAlert;

class AdminFleetRadarController extends Controller
{
    /**
     * Get live GPS coordinates, active trip routes, and SOS emergency beacons for fleet map
     */
    public function getLiveMapData()
    {
        $drivers = Driver::with('user')
            ->whereNotNull('current_latitude')
            ->whereNotNull('current_longitude')
            ->get()
            ->map(function ($d) {
                return [
                    'id' => $d->id,
                    'name' => $d->user ? $d->user->name : 'Operative #' . $d->id,
                    'lat' => (float)$d->current_latitude,
                    'lng' => (float)$d->current_longitude,
                    'status' => $d->is_engaged ? 'on_trip' : ($d->is_online ? 'online' : 'offline'),
                    'operative_tier' => $d->operative_tier,
                    'rating' => $d->rating,
                    'last_ping' => $d->last_location_update ? $d->last_location_update->diffForHumans() : 'Just now',
                ];
            });

        $activeTrips = TransportJob::with(['driver.user', 'hirer.user'])
            ->whereIn('status', ['assigned', 'in_progress'])
            ->get()
            ->map(function ($j) {
                return [
                    'id' => $j->id,
                    'pickup' => $j->pickup_location ?? 'Lagos Central',
                    'dropoff' => $j->dropoff_location ?? 'Victoria Island',
                    'driver_name' => $j->driver && $j->driver->user ? $j->driver->user->name : 'Assigned Operative',
                    'hirer_name' => $j->hirer && $j->hirer->user ? $j->hirer->user->name : 'Client',
                    'status' => $j->status,
                ];
            });

        $sosBeacons = EmergencySosAlert::with(['user', 'driver'])
            ->where('status', 'active')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'driver_name' => $s->user ? $s->user->name : 'Operative in Danger',
                    'lat' => (float)$s->latitude,
                    'lng' => (float)$s->longitude,
                    'address' => $s->address,
                    'time' => $s->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'drivers' => $drivers,
                'active_trips' => $activeTrips,
                'sos_beacons' => $sosBeacons,
            ],
        ]);
    }
}
