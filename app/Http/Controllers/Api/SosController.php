<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Events\SosTriggered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class SosController extends Controller
{
    /**
     * Trigger Reverse SOS / Extortion Shield (driver) or Hirer emergency SOS.
     */
    public function triggerReverseSos(Request $request)
    {
        $user = $request->user();
        $location = $request->input('location', []);
        $lat = is_array($location) ? ($location['lat'] ?? $location['latitude'] ?? null) : null;
        $lng = is_array($location) ? ($location['lng'] ?? $location['longitude'] ?? null) : null;
        $source = $request->input('source', 'app');

        $driverId = $user?->driver?->id;
        $hirerId = $user?->hirer?->id;

        Log::critical('SOS TRIGGERED', [
            'user_id' => $user?->id,
            'driver_id' => $driverId,
            'hirer_id' => $hirerId,
            'lat' => $lat,
            'lng' => $lng,
            'source' => $source,
        ]);

        try {
            if (Schema::hasTable('driver_incidents') && $driverId) {
                $payload = [
                    'driver_id' => $driverId,
                    'reported_by' => $user->id,
                    'incident_type' => 'extortion_threat',
                    'description' => 'REVERSE_SOS / emergency trigger from ' . $source,
                    'incident_time' => now(),
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'severity' => 'critical',
                    'status' => 'pending',
                    'evidence_data' => json_encode([
                        'location' => $location,
                        'source' => $source,
                        'status' => 'silent_trigger',
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // booking_id is required in original schema — attach latest booking if any
                if (Schema::hasColumn('driver_incidents', 'booking_id')) {
                    $bookingId = DB::table('bookings')
                        ->where('driver_id', $driverId)
                        ->orderByDesc('id')
                        ->value('id');

                    if (!$bookingId && $hirerId) {
                        $bookingId = DB::table('bookings')
                            ->where('hirer_id', $hirerId)
                            ->orderByDesc('id')
                            ->value('id');
                    }

                    if ($bookingId) {
                        $payload['booking_id'] = $bookingId;
                        DB::table('driver_incidents')->insert($payload);
                    } else {
                        // Fall back to a generic security log table-less path
                        Log::critical('SOS without booking context', $payload);
                    }
                } else {
                    DB::table('driver_incidents')->insert($payload);
                }
            }
        } catch (\Throwable $e) {
            Log::error('Failed to persist SOS incident: ' . $e->getMessage());
        }

        try {
            $eventId = (int) ($driverId ?? $user?->id ?? 0);
            broadcast(new SosTriggered($eventId, [
                'lat' => $lat,
                'lng' => $lng,
                'hirer_id' => $hirerId,
                'source' => $source,
            ]));
        } catch (\Throwable $e) {
            // Realtime optional
        }

        return response()->json(['status' => 'ok', 'received' => true]);
    }
}
