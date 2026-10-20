<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DriverLocationService;
use App\Services\DriverPrioritizationService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    protected DriverLocationService $locationService;
    protected DriverPrioritizationService $prioritizationService;
    protected SubscriptionService $subscriptionService;

    public function __construct(
        DriverLocationService $locationService,
        DriverPrioritizationService $prioritizationService,
        SubscriptionService $subscriptionService
    ) {
        $this->locationService = $locationService;
        $this->prioritizationService = $prioritizationService;
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Search for drivers by location and criteria
     */
    public function searchDrivers(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius_km' => 'nullable|integer|min:1|max:500',
            'vehicle_certifications' => 'nullable|array',
            'min_rating' => 'nullable|numeric|min:0|max:5',
            'min_experience' => 'nullable|integer|min:0',
            'preferred_route_type' => 'nullable|in:long_haul,short_haul,both',
            'has_vehicle' => 'nullable|boolean',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $latitude = (float) $request->latitude;
        $longitude = (float) $request->longitude;
        $radiusKm = $request->input('radius_km', 50);
        $limit = $request->input('limit', 20);

        $filters = [
            'vehicle_certifications' => $request->input('vehicle_certifications', []),
            'min_rating' => $request->input('min_rating'),
            'min_experience' => $request->input('min_experience'),
            'preferred_route_type' => $request->input('preferred_route_type'),
            'has_vehicle' => filter_var($request->input('has_vehicle'), FILTER_VALIDATE_BOOLEAN),
        ];

        // Find nearby drivers with filters
        $drivers = $this->locationService->findDriversForJob(
            $latitude,
            $longitude,
            $radiusKm,
            $filters
        );

        // Apply algorithmic prioritization
        $prioritizedDrivers = $this->prioritizationService->getPrioritizedDrivers(
            array_map(fn($d) => $d['driver']->id, $drivers)
        );

        // Apply Pro driver boost
        $prioritizedDrivers = $this->prioritizationService->boostProDrivers($prioritizedDrivers);

        // Limit results
        $prioritizedDrivers = $this->prioritizationService->getTopDrivers($prioritizedDrivers, $limit);

        return response()->json([
            'success' => true,
            'data' => [
                'drivers' => $prioritizedDrivers,
                'total_found' => count($drivers),
                'returned' => count($prioritizedDrivers),
                'search_center' => [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'radius_km' => $radiusKm,
                ],
            ],
        ]);
    }

    /**
     * Search for jobs available to a driver
     */
    public function searchJobs(Request $request): JsonResponse
    {
        $request->validate([
            'driver_id' => 'required|exists:drivers,id',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'radius_km' => 'nullable|integer|min:1|max:500',
            'vehicle_type' => 'nullable|in:heavy_duty,light_truck,van,bus,tanker',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'early_access_only' => 'nullable|boolean',
        ]);

        $driver = \App\Models\Driver::with('user')->findOrFail($request->driver_id);
        $latitude = $request->input('latitude', $driver->current_latitude);
        $longitude = $request->input('longitude', $driver->current_longitude);
        $radiusKm = $request->input('radius_km', 100);

        // Check if driver has interstate access (Premium feature)
        $hasInterstateAccess = $this->subscriptionService->hasInterstateAccess($driver->user_id);
        $priorityMinutes = $this->subscriptionService->getInterstatePriorityMinutes($driver->user_id);

        $query = \App\Models\TransportJob::query();

        // Filter by status
        $query->published();

        // Interstate job access control
        $query->where(function ($q) use ($hasInterstateAccess, $priorityMinutes) {
            // Local jobs are always visible
            $q->where('job_type', 'local');
            
            // Interstate jobs only visible to Premium drivers
            if ($hasInterstateAccess) {
                $q->orWhere(function ($subQuery) use ($priorityMinutes) {
                    $subQuery->where('job_type', 'interstate');
                    
                    // Apply priority access window
                    if ($priorityMinutes > 0) {
                        $priorityWindowStart = now()->subMinutes($priorityMinutes);
                        $subQuery->where(function ($timeQuery) use ($priorityWindowStart) {
                            $timeQuery->where('published_at', '<=', $priorityWindowStart)
                                      ->orWhereNull('published_at');
                        });
                    }
                });
            }
        });

        // Early access filter for Premium drivers
        if ($request->input('early_access_only', false)) {
            if (!$hasInterstateAccess) {
                return response()->json([
                    'success' => false,
                    'message' => 'Early access is only available for Premium drivers',
                ], 403);
            }
            $query->earlyAccess();
        } else {
            // Non-Premium drivers can't see early access jobs
            if (!$hasInterstateAccess) {
                $query->where(function ($q) {
                    $q->where('is_early_access', false)
                      ->orWhere('early_access_expires_at', '<', now());
                });
            }
        }

        // Location filter
        if ($latitude && $longitude) {
            $query->nearby($latitude, $longitude, $radiusKm);
        }

        // Vehicle type filter
        if ($request->has('vehicle_type')) {
            $query->where('vehicle_type', $request->vehicle_type);
        }

        // Amount range filter
        if ($request->has('min_amount')) {
            $query->where('amount', '>=', $request->min_amount);
        }
        if ($request->has('max_amount')) {
            $query->where('amount', '<=', $request->max_amount);
        }

        // Certification match filter
        $driverCerts = $driver->vehicle_certifications ?? [];
        if (!empty($driverCerts)) {
            $query->where(function ($q) use ($driverCerts) {
                $q->whereNull('required_certifications')
                  ->orWhereJsonContains('required_certifications', $driverCerts);
            });
        }

        $jobs = $query->with('hirer.user')
            ->orderBy('pickup_time', 'asc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $jobs,
        ]);
    }

    /**
     * Get driver density heatmap
     */
    public function getDriverHeatmap(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius_km' => 'nullable|integer|min:1|max:200',
            'grid_size' => 'nullable|integer|min:5|max:20',
        ]);

        $heatmap = $this->locationService->getDriverHeatmap(
            (float) $request->latitude,
            (float) $request->longitude,
            $request->input('radius_km', 50),
            $request->input('grid_size', 10)
        );

        return response()->json([
            'success' => true,
            'data' => [
                'heatmap' => $heatmap,
                'center' => [
                    'latitude' => $request->latitude,
                    'longitude' => $request->longitude,
                ],
            ],
        ]);
    }

    /**
     * Get online driver count in area
     */
    public function getOnlineDriverCount(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius_km' => 'nullable|integer|min:1|max:500',
        ]);

        $latitude = (float) $request->latitude;
        $longitude = (float) $request->longitude;
        $radiusKm = $request->input('radius_km', 100);

        $cacheKey = "online_driver_count_{$latitude}_{$longitude}_{$radiusKm}";
        
        $count = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60, function () use ($latitude, $longitude, $radiusKm) {
            return $this->locationService->getOnlineDriverCount($latitude, $longitude, $radiusKm);
        });

        return response()->json([
            'success' => true,
            'data' => [
                'count' => $count,
                'search_area' => [
                    'latitude' => $request->latitude,
                    'longitude' => $request->longitude,
                    'radius_km' => $request->input('radius_km', 100),
                ],
            ],
        ]);
    }

    /**
     * Search for favorite drivers (for hirers)
     */
    public function searchFavoriteDrivers(Request $request): JsonResponse
    {
        $request->validate([
            'hirer_id' => 'required|exists:hirers,id',
        ]);

        $hirer = \App\Models\Hirer::findOrFail($request->hirer_id);

        $favoriteDrivers = $hirer->favoriteDrivers()
            ->with('driver.user')
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get current locations for favorite drivers
        $driversWithLocations = [];
        foreach ($favoriteDrivers as $favorite) {
            $location = $this->locationService->getDriverLocation($favorite->driver_id);
            $driversWithLocations[] = [
                'favorite' => $favorite,
                'driver' => $favorite->driver,
                'current_location' => $location,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $driversWithLocations,
        ]);
    }

    /**
     * Add driver to favorites
     */
    public function addFavorite(Request $request, string $driverId): JsonResponse
    {
        $user = $request->user();
        $hirer = $user->hirer;

        if (!$hirer) {
            return response()->json([
                'success' => false,
                'message' => 'Only hirers can add favorite drivers',
            ], 403);
        }

        $driver = \App\Models\Driver::findOrFail($driverId);

        // Check if already favorited
        $existingFavorite = \App\Models\DriverFavorite::where('hirer_id', $hirer->id)
            ->where('driver_id', $driverId)
            ->first();

        if ($existingFavorite) {
            return response()->json([
                'success' => false,
                'message' => 'Driver already in favorites',
            ], 400);
        }

        $favorite = \App\Models\DriverFavorite::create([
            'hirer_id' => $hirer->id,
            'driver_id' => $driverId,
            'notes' => $request->input('notes'),
            'is_pinned' => $request->input('is_pinned', false),
        ]);

        return response()->json([
            'success' => true,
            'data' => $favorite->load('driver.user'),
            'message' => 'Driver added to favorites',
        ], 201);
    }

    /**
     * Remove driver from favorites
     */
    public function removeFavorite(Request $request, string $driverId): JsonResponse
    {
        $user = $request->user();
        $hirer = $user->hirer;

        if (!$hirer) {
            return response()->json([
                'success' => false,
                'message' => 'Only hirers can manage favorite drivers',
            ], 403);
        }

        $favorite = \App\Models\DriverFavorite::where('hirer_id', $hirer->id)
            ->where('driver_id', $driverId)
            ->first();

        if (!$favorite) {
            return response()->json([
                'success' => false,
                'message' => 'Driver not in favorites',
            ], 404);
        }

        $favorite->delete();

        return response()->json([
            'success' => true,
            'message' => 'Driver removed from favorites',
        ]);
    }
}
