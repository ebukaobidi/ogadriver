<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DriverAvailability;
use App\Models\Driver;
use Illuminate\Support\Facades\Auth;

class AvailabilityController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if ($user->role->slug !== 'driver') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $driver = $user->driver;
        if (!$driver) {
            return response()->json(['message' => 'Driver profile not found'], 404);
        }

        $availabilities = DriverAvailability::where('driver_id', $driver->id)
            ->where('date', '>=', now()->startOfMonth()->format('Y-m-d'))
            ->get();

        return response()->json([
            'success' => true,
            'data' => $availabilities
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->role->slug !== 'driver') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $driver = $user->driver;
        if (!$driver) {
            return response()->json(['message' => 'Driver profile not found'], 404);
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'status' => 'required|in:unavailable,available'
        ]);

        if ($validated['status'] === 'available') {
            DriverAvailability::where('driver_id', $driver->id)
                ->where('date', $validated['date'])
                ->delete();
        } else {
            DriverAvailability::updateOrCreate(
                ['driver_id' => $driver->id, 'date' => $validated['date']],
                ['status' => $validated['status']]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Availability updated successfully'
        ]);
    }

    public function getForEmployer(Request $request, $driverId)
    {
        $user = Auth::user();
        if ($user->role->slug !== 'hirer' && $user->role->slug !== 'super_admin' && $user->role->slug !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $driver = Driver::findOrFail($driverId);

        $availabilities = DriverAvailability::where('driver_id', $driver->id)
            ->where('date', '>=', now()->startOfMonth()->format('Y-m-d'))
            ->get();

        return response()->json([
            'success' => true,
            'data' => $availabilities
        ]);
    }
}
