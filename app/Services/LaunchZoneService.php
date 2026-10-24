<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Models\State;
use App\Models\City;
use App\Models\Driver;
use App\Models\ActivatedLocation;

class LaunchZoneService
{
    /**
     * Calculate and sync driver density across all locations for Ride & Hire modes.
     */
    public function syncDriverDensity(): array
    {
        $states = State::all();
        $synced = [];

        foreach ($states as $state) {
            // Count for State
            $rideCount = Driver::where('state_id', $state->id)
                ->where('is_verified', true)
                ->where('has_vehicle', true)
                ->count();

            $hireCount = Driver::where('state_id', $state->id)
                ->where('is_verified', true)
                ->count();

            $stateLoc = ActivatedLocation::firstOrCreate(
                ['state_id' => $state->id, 'city_id' => null],
                ['name' => $state->name, 'min_threshold' => 10]
            );

            // Auto-activate if threshold met and no manual override
            if (!$stateLoc->manual_override) {
                $stateLoc->is_ride_active = ($rideCount >= $stateLoc->min_threshold);
                $stateLoc->is_hire_active = ($hireCount >= $stateLoc->min_threshold);
            }

            $stateLoc->ride_driver_count = $rideCount;
            $stateLoc->hire_driver_count = $hireCount;
            $stateLoc->save();

            $synced[] = $stateLoc;

            // Cities under this state
            $cities = City::where('state_id', $state->id)->get();
            foreach ($cities as $city) {
                $cityRideCount = Driver::where('city_id', $city->id)
                    ->where('is_verified', true)
                    ->where('has_vehicle', true)
                    ->count();

                $cityHireCount = Driver::where('city_id', $city->id)
                    ->where('is_verified', true)
                    ->count();

                $cityLoc = ActivatedLocation::firstOrCreate(
                    ['state_id' => $state->id, 'city_id' => $city->id],
                    ['name' => $city->name, 'min_threshold' => 10]
                );

                if (!$cityLoc->manual_override) {
                    $cityLoc->is_ride_active = ($cityRideCount >= $cityLoc->min_threshold);
                    $cityLoc->is_hire_active = ($cityHireCount >= $cityLoc->min_threshold);
                }

                $cityLoc->ride_driver_count = $cityRideCount;
                $cityLoc->hire_driver_count = $cityHireCount;
                $cityLoc->save();
            }
        }

        Cache::forget('active_locations_data');
        return $synced;
    }

    /**
     * Get active locations for dropdowns and search components.
     * Mode can be 'ride', 'hire', or 'all'.
     */
    public function getActiveLocations(string $mode = 'all'): array
    {
        return Cache::remember("active_locations_{$mode}", 600, function () use ($mode) {
            $query = ActivatedLocation::query();

            if ($mode === 'ride') {
                $query->where('is_ride_active', true);
            } elseif ($mode === 'hire') {
                $query->where('is_hire_active', true);
            } else {
                $query->where(function($q) {
                    $q->where('is_ride_active', true)->orWhere('is_hire_active', true);
                });
            }

            $locations = $query->get();

            // Fallback: If no locations active yet in DB, default to Lagos (ID 25 or first available state)
            if ($locations->isEmpty()) {
                $defaultState = State::first();
                if ($defaultState) {
                    return [
                        [
                            'state_id' => $defaultState->id,
                            'city_id' => null,
                            'name' => $defaultState->name,
                            'is_ride_active' => true,
                            'is_hire_active' => true,
                            'ride_driver_count' => 15,
                            'hire_driver_count' => 20,
                        ]
                    ];
                }
            }

            return $locations->toArray();
        });
    }

    /**
     * Admin method to manually toggle location activation for Ride or Hire.
     */
    public function toggleActivation(int $stateId, ?int $cityId, string $serviceType, bool $status): ActivatedLocation
    {
        $location = ActivatedLocation::firstOrCreate(
            ['state_id' => $stateId, 'city_id' => $cityId],
            ['name' => $cityId ? (City::find($cityId)?->name ?? 'City') : (State::find($stateId)?->name ?? 'State')]
        );

        if ($serviceType === 'ride') {
            $location->is_ride_active = $status;
        } elseif ($serviceType === 'hire') {
            $location->is_hire_active = $status;
        }

        $location->manual_override = true;
        $location->save();

        Cache::forget('active_locations_data');
        Cache::forget('active_locations_ride');
        Cache::forget('active_locations_hire');
        Cache::forget('active_locations_all');

        return $location;
    }

    /**
     * Get complete launch zone status report for Admin Panel.
     */
    public function getAdminLocationReport(): array
    {
        $this->syncDriverDensity();

        $locations = ActivatedLocation::with(['state', 'city'])->orderBy('ride_driver_count', 'desc')->get();

        return [
            'total_states_active_ride' => ActivatedLocation::whereNull('city_id')->where('is_ride_active', true)->count(),
            'total_states_active_hire' => ActivatedLocation::whereNull('city_id')->where('is_hire_active', true)->count(),
            'locations' => $locations,
        ];
    }
}
