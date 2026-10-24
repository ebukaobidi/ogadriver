<?php

namespace App\Http\Controllers;

use App\Models\VehicleInspection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InspectionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'placement_id' => 'nullable|exists:jobs,id',
            'checklist' => 'required|array',
            'photos.*' => 'image|max:5120' // Max 5MB per photo
        ]);

        $user = Auth::user();
        if (!$user || !$user->driver) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $photoPaths = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                // By default, assuming local storage for now
                $path = $photo->store('inspections', 'public');
                $photoPaths[] = $path;
            }
        }

        $inspection = VehicleInspection::create([
            'driver_id' => $user->driver->id,
            'placement_id' => $request->placement_id,
            'checklist' => $request->checklist,
            'photos' => $photoPaths,
            'notes' => $request->notes,
            'status' => 'submitted'
        ]);

        return response()->json([
            'message' => 'Inspection logged successfully.',
            'inspection' => $inspection
        ], 201);
    }
}
