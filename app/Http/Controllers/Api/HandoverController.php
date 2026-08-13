<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\HandoverChecklist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class HandoverController extends Controller
{
    /**
     * Store the pre-drive asset verification checklist.
     */
    public function submitChecklist(Request $request, $bookingId)
    {
        $user = Auth::user();
        $booking = Booking::findOrFail($bookingId);

        // Authorization: Only the assigned driver can submit checklist
        if ($booking->driver->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'tyres_condition_ok' => 'required|boolean',
            'fuel_level_recorded' => 'required|boolean',
            'warning_lights_check' => 'required|boolean',
            'brakes_functional' => 'required|boolean',
            'lights_functional' => 'required|boolean',
            'mirrors_adjusted' => 'required|boolean',
            'seatbelts_functional' => 'required|boolean',
            'windshield_wipers_ok' => 'required|boolean',
            'vehicle_documents_valid' => 'required|boolean',
            'fuel_level_percentage' => 'required|integer|min:0|max:100',
            'condition_notes' => 'nullable|string',
            'photo_evidence' => 'nullable|array'
        ]);

        $checklist = HandoverChecklist::updateOrCreate(
            ['booking_id' => $bookingId],
            [
                'driver_id' => $booking->driver_id,
                'hirer_id' => $booking->hirer_id,
                'tyres_condition_ok' => $request->tyres_condition_ok,
                'fuel_level_recorded' => $request->fuel_level_recorded,
                'warning_lights_check' => $request->warning_lights_check,
                'brakes_functional' => $request->brakes_functional,
                'lights_functional' => $request->lights_functional,
                'mirrors_adjusted' => $request->mirrors_adjusted,
                'seatbelts_functional' => $request->seatbelts_functional,
                'windshield_wipers_ok' => $request->windshield_wipers_ok,
                'vehicle_documents_valid' => $request->vehicle_documents_valid,
                'fuel_level_percentage' => $request->fuel_level_percentage,
                'condition_notes' => $request->condition_notes,
                'photo_evidence' => $request->photo_evidence,
                'completed_at' => now(),
                'status' => 'completed'
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Handover checklist submitted successfully. Awaiting employer verification.',
            'data' => $checklist
        ], 201);
    }
    
    /**
     * Employer signs off on the handover.
     */
    public function verifyChecklist(Request $request, $bookingId)
    {
        $user = Auth::user();
        $booking = Booking::findOrFail($bookingId);

        // Authorization: Only the hirer who created the booking can verify
        if ($booking->hirer->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $checklist = HandoverChecklist::where('booking_id', $bookingId)->firstOrFail();
        $checklist->update([
            'verified_at' => now(),
        ]);
            
        return response()->json([
            'success' => true,
            'message' => 'Asset handover verified. Contract is now active.',
            'data' => $checklist
        ]);
    }
}
