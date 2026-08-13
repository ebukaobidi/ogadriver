<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SosController extends Controller
{
    /**
     * Trigger Reverse SOS / Extortion Shield silently.
     */
    public function triggerReverseSos(Request $request)
    {
        // For reverse SOS, the driver inputs a special "duress" PIN.
        // It looks like the app just unlocked, but it silently pings the backend.
        
        $driverId = $request->user()->id ?? null;
        $location = $request->input('location');
        
        // 1. Log the high-priority incident without tipping off the app UI
        Log::critical("REVERSE SOS TRIGGERED by Driver {$driverId} at {$location['lat']}, {$location['lng']}");
        
        // 2. Insert into incidents table
        \DB::table('driver_incidents')->insert([
            'driver_id' => $driverId,
            'incident_type' => 'REVERSE_SOS',
            'severity' => 'CRITICAL',
            'details' => json_encode(['location' => $location, 'status' => 'silent_trigger']),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // 3. (Optional) Broadcast event to specific corporate employer node or platform admin
        // event(new \App\Events\ReverseSosTriggered($driverId, $location));
        
        return response()->json(['status' => 'ok']); // Innocent response to not alert the attacker
    }
}
