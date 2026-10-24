<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LaunchZoneService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LaunchZoneController extends Controller
{
    protected LaunchZoneService $launchZoneService;

    public function __construct(LaunchZoneService $launchZoneService)
    {
        $this->launchZoneService = $launchZoneService;
    }

    /**
     * Get active activated cities/locations for Ride or Hire mode.
     */
    public function getActiveLocations(Request $request): JsonResponse
    {
        $mode = $request->query('mode', 'all'); // 'ride', 'hire', or 'all'
        $locations = $this->launchZoneService->getActiveLocations($mode);

        return response()->json([
            'success' => true,
            'mode' => $mode,
            'data' => $locations,
        ]);
    }

    /**
     * Get full location activation report for Admin Dashboard.
     */
    public function getAdminReport(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $report = $this->launchZoneService->getAdminLocationReport();

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Admin toggle location activation for Ride or Hire mode.
     */
    public function toggleActivation(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'state_id' => 'required|integer',
            'city_id' => 'nullable|integer',
            'service_type' => 'required|in:ride,hire',
            'status' => 'required|boolean',
        ]);

        $updated = $this->launchZoneService->toggleActivation(
            (int) $request->state_id,
            $request->city_id ? (int) $request->city_id : null,
            $request->service_type,
            $request->boolean('status')
        );

        return response()->json([
            'success' => true,
            'message' => 'Location activation status updated successfully.',
            'data' => $updated,
        ]);
    }

    /**
     * Get launch zone configuration.
     */
    public function getConfig(Request $request): JsonResponse
    {
        $locations = $this->launchZoneService->getActiveLocations('all');

        return response()->json([
            'success' => true,
            'data' => $locations,
        ]);
    }

    /**
     * Get allowed states.
     */
    public function getAllowedStates(Request $request): JsonResponse
    {
        $locations = $this->launchZoneService->getActiveLocations('all');
        $states = collect($locations)->pluck('state')->unique()->values();

        return response()->json([
            'success' => true,
            'data' => $states,
        ]);
    }

    /**
     * Get allowed cities for a given state.
     */
    public function getAllowedCities(Request $request): JsonResponse
    {
        $state = $request->query('state');
        $locations = $this->launchZoneService->getActiveLocations('all');
        $cities = collect($locations)
            ->when($state, fn($c) => $c->where('state', $state))
            ->pluck('city')
            ->unique()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $cities,
        ]);
    }

    /**
     * Check if a location is within an active launch zone.
     */
    public function checkLocation(Request $request): JsonResponse
    {
        $request->validate([
            'state' => 'required|string',
            'city' => 'nullable|string',
        ]);

        $locations = $this->launchZoneService->getActiveLocations('all');
        $allowed = collect($locations)
            ->where('state', $request->state)
            ->when($request->city, fn($c) => $c->where('city', $request->city))
            ->isNotEmpty();

        return response()->json([
            'success' => true,
            'allowed' => $allowed,
        ]);
    }

    /**
     * Update launch zone configuration (admin).
     */
    public function updateConfig(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'state_id' => 'required|integer',
            'city_id' => 'nullable|integer',
            'service_type' => 'required|in:ride,hire',
            'status' => 'required|boolean',
        ]);

        $updated = $this->launchZoneService->toggleActivation(
            (int) $request->state_id,
            $request->city_id ? (int) $request->city_id : null,
            $request->service_type,
            $request->boolean('status')
        );

        return response()->json([
            'success' => true,
            'message' => 'Launch zone config updated.',
            'data' => $updated,
        ]);
    }

    /**
     * Clear launch zone cache.
     */
    public function clearCache(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        \Illuminate\Support\Facades\Cache::forget('launch_zones');
        \Illuminate\Support\Facades\Cache::forget('launch_zone_active_locations');

        return response()->json([
            'success' => true,
            'message' => 'Launch zone cache cleared.',
        ]);
    }
}
