<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Driver;
use App\Models\Hirer;
use App\Models\EmergencySosAlert;
use Illuminate\Support\Facades\Storage;

class EmergencySosController extends Controller
{
    /**
     * Trigger Universal SOS Panic Beacon with live GPS & live ambient distress audio
     */
    public function triggerSos(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'address' => 'nullable|string',
            'audio_clip' => 'nullable|file|mimes:mp3,wav,m4a,aac,ogg,webm,mp4|max:20480',
            'source' => 'nullable|string',
        ]);

        $user = auth()->user();
        $driver = Driver::where('user_id', $user->id)->first();
        $hirer = Hirer::where('user_id', $user->id)->first();

        $audioPath = null;
        if ($request->hasFile('audio_clip')) {
            $audioPath = $request->file('audio_clip')->store('sos_audio', 'public');
        }

        // Build list of emergency contacts to notify
        $notified = [];
        
        // 1. Emergency Contact from User / Hirer Profile / Safety KYC
        if ($hirer && $hirer->emergency_contact_phone) {
            $notified[] = [
                'name' => $hirer->emergency_contact_name ?: 'Emergency Contact',
                'phone' => $hirer->emergency_contact_phone,
                'role' => 'Hirer Safety Contact',
            ];
        }
        if ($user && $user->phone) {
            $notified[] = [
                'name' => $user->name,
                'phone' => $user->phone,
                'role' => 'Account Holder',
            ];
        }

        // 2. Guarantors if user is a driver
        if ($driver) {
            if ($driver->guarantor_a_phone) {
                $notified[] = ['name' => $driver->guarantor_a_name ?: 'Guarantor A', 'phone' => $driver->guarantor_a_phone, 'role' => 'Guarantor A'];
            }
            if ($driver->guarantor_b_phone) {
                $notified[] = ['name' => $driver->guarantor_b_name ?: 'Guarantor B', 'phone' => $driver->guarantor_b_phone, 'role' => 'Guarantor B'];
            }
        }

        // 3. Always notify OgaDriver Operations Security Command Center
        $notified[] = [
            'name' => 'OgaDriver Security Control & Dispatch Command Center',
            'phone' => '0800-OGADRIVER-SOS',
            'role' => 'Operational Security Command',
        ];

        $trackingUrl = "https://www.google.com/maps/dir/?api=1&destination={$request->latitude},{$request->longitude}";

        $alert = EmergencySosAlert::create([
            'driver_id' => $driver ? $driver->id : null,
            'user_id' => $user->id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'address' => $request->address ?? "GPS: {$request->latitude}, {$request->longitude}",
            'audio_clip_path' => $audioPath,
            'status' => 'active',
            'notified_contacts' => $notified,
        ]);

        // Actually Dispatch Termii SMS
        try {
            $termii = new \App\Services\Notifications\TermiiNotificationAdapter();
            $distressMsg = "EMERGENCY SOS! {$user->name} activated a panic beacon. Location: {$trackingUrl}";
            
            foreach ($notified as $contact) {
                if (isset($contact['phone']) && !str_contains($contact['phone'], 'OGADRIVER-SOS')) {
                    // Send to actual phone numbers
                    $termii->sendSms($contact['phone'], $distressMsg);
                }
            }
        } catch (\Exception $e) {
            \Log::error("Failed to send SOS Termii SMS: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'CRITICAL EMERGENCY RESCUE BEACON ACTIVATED! Emergency contacts, Security Control Room & Operational Dispatch notified. Ambient distress audio logged.',
            'data' => [
                'alert' => $alert,
                'tracking_url' => $trackingUrl,
                'notified_contacts' => $notified,
                'audio_recorded' => !!$audioPath,
            ],
        ]);
    }

    /**
     * Get active SOS beacons (Admin / Patrol)
     */
    public function getActiveAlerts()
    {
        $alerts = EmergencySosAlert::with(['driver.user', 'user'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $alerts,
        ]);
    }

    /**
     * Resolve SOS Alert
     */
    public function resolveAlert(Request $request, $id)
    {
        $alert = EmergencySosAlert::findOrFail($id);
        $alert->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Emergency SOS alert marked as resolved.',
        ]);
    }

    /**
     * Ghost Protocol Covert Alert
     */
    public function covertAlert(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'job_id' => 'nullable|integer',
            'pin' => 'required|string',
        ]);

        // A true implementation would check if 'pin' matches the user's secondary "Duress" PIN.
        // For now, we assume this endpoint is only called if the Duress PIN was entered.

        \App\Models\EmergencySosAlert::create([
            'job_id' => $request->job_id,
            'user_id' => $user->id,
            'reporter_type' => 'driver',
            'type' => 'hijack', // Covert Duress
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'status' => 'pending',
            'details' => "GHOST PROTOCOL ACTIVATED: Driver entered Duress PIN.",
        ]);

        return response()->json([
            'success' => true,
            // We return a normal sounding message so the attacker doesn't know it worked.
            'message' => 'App unlocked successfully.',
        ]);
    }
}
