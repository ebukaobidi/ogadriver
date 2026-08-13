<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Driver;
use App\Models\DriverAvailability;
use App\Models\DriverPricing;
use App\Models\Hirer;
use App\Services\DriverLocationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    protected DriverLocationService $locationService;

    public function __construct(DriverLocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    /**
     * Search drivers with advanced filtering
     */
    public function searchDrivers(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'radius_km' => 'nullable|integer|min:1|max:500',
            'vehicle_type' => 'nullable|in:heavy_duty,light_truck,van,bus,tanker',
            'min_rating' => 'nullable|numeric|min:0|max:5',
            'date' => 'nullable|date',
            'pricing_type' => 'nullable|in:hourly,daily,trip,distance',
            'max_rate' => 'nullable|numeric',
            'country_id' => 'nullable|integer',
            'state_id' => 'nullable|integer',
            'city_id' => 'nullable|integer',
            'employment_type' => 'nullable|string',
            'license_class' => 'nullable|string',
            'preferred_route_type' => 'nullable|string|in:long_haul,short_haul,both',
        ]);

        $query = Driver::with(['user', 'pricings', 'availabilities', 'state', 'city'])
            ->where('status', 'active')
            ->where('is_verified', true)
            ->where('is_online', true);

        // Vehicle type filter
        if ($request->has('vehicle_type')) {
            $query->whereHas('pricings', function ($q) use ($request) {
                $q->where('vehicle_type', $request->vehicle_type)->where('is_active', true);
            });
        }

        // Rating filter
        if ($request->has('min_rating')) {
            $query->where('rating', '>=', $request->min_rating);
        }

        // Pricing filter
        if ($request->has('pricing_type')) {
            $query->whereHas('pricings', function ($q) use ($request) {
                $q->where('pricing_type', $request->pricing_type)->where('is_active', true);
            });
        }

        // Geolocation Filters (Exact match OR Preferred Locations array)
        if ($request->has('state_id') || $request->has('city_id')) {
            $query->where(function ($q) use ($request) {
                if ($request->has('state_id')) {
                    $q->where('state_id', $request->state_id);
                }
                if ($request->has('city_id')) {
                    $q->where('city_id', $request->city_id)
                      ->orWhereJsonContains('preferred_locations', (int)$request->city_id)
                      ->orWhereJsonContains('preferred_locations', (string)$request->city_id);
                }
            });
        }

        // Employment Type
        if ($request->has('employment_type')) {
            $query->whereJsonContains('employment_types', $request->employment_type);
        }

        // License Class
        if ($request->has('license_class')) {
            $query->where('license_class', $request->license_class);
        }

        // Preferred Route Type
        if ($request->has('preferred_route_type')) {
            $query->where('preferred_route_type', $request->preferred_route_type);
        }

        // Max rate filter
        if ($request->has('max_rate')) {
            $query->whereHas('pricings', function ($q) use ($request) {
                $q->where('base_rate', '<=', $request->max_rate)->where('is_active', true);
            });
        }

        // Availability filter
        if ($request->has('date')) {
            $query->whereHas('availabilities', function ($q) use ($request) {
                $q->where('date', $request->date)->where('status', 'available');
            });
        }

        // Geospatial filter
        if ($request->has('latitude') && $request->has('longitude')) {
            $radiusKm = $request->input('radius_km', 50);
            $nearbyDrivers = $this->locationService->findDriversForJob(
                $request->latitude,
                $request->longitude,
                $radiusKm
            );
            $driverIds = array_map(fn($d) => $d['driver']->id, $nearbyDrivers);
            $query->whereIn('id', $driverIds);
        }

        $drivers = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $drivers,
        ]);
    }

    /**
     * Get driver profile with availability and pricing
     */
    public function getDriverProfile(string $id): JsonResponse
    {
        $driver = Driver::with([
            'user',
            'pricings' => function ($q) {
                $q->where('is_active', true);
            },
            'availabilities' => function ($q) {
                $q->upcoming()->orderBy('date');
            },
            'documents',
            'guarantors',
        ])
        ->where('id', $id)
        ->where('status', 'active')
        ->where('is_verified', true)
        ->firstOrFail();

        // Get current location
        $location = $this->locationService->getDriverLocation($driver->id);

        return response()->json([
            'success' => true,
            'data' => [
                'driver' => $driver,
                'current_location' => $location,
            ],
        ]);
    }

    /**
     * Create booking invitation
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hirer) {
            return response()->json([
                'success' => false,
                'message' => 'Only employers can create booking invitations',
            ], 403);
        }

        $request->validate([
            'driver_id' => 'required|exists:drivers,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'vehicle_type' => 'required|in:heavy_duty,light_truck,van,bus,tanker',
            'pickup_location' => 'required|string',
            'pickup_latitude' => 'required|numeric',
            'pickup_longitude' => 'required|numeric',
            'dropoff_location' => 'required|string',
            'dropoff_latitude' => 'required|numeric',
            'dropoff_longitude' => 'required|numeric',
            'pickup_time' => 'required|date',
            'estimated_completion_time' => 'nullable|date',
            'distance_km' => 'nullable|numeric',
            'agreed_rate' => 'required|numeric|min:0',
            'pricing_type' => 'required|in:hourly,daily,trip,distance',
            'estimated_duration_hours' => 'nullable|numeric',
            'special_requirements' => 'nullable|array',
        ]);

        $hirer = $request->user()->hirer;
        $driver = Driver::findOrFail($request->driver_id);

        // Check driver availability
        $pickupDate = \Carbon\Carbon::parse($request->pickup_time)->toDateString();
        $availability = DriverAvailability::where('driver_id', $driver->id)
            ->where('date', $pickupDate)
            ->where('status', 'available')
            ->first();

        if (!$availability) {
            return response()->json([
                'success' => false,
                'message' => 'Driver is not available on the requested date',
            ], 400);
        }

        // Create booking
        $booking = Booking::create([
            'hirer_id' => $hirer->id,
            'driver_id' => $driver->id,
            'title' => $request->title,
            'description' => $request->description,
            'vehicle_type' => $request->vehicle_type,
            'pickup_location' => $request->pickup_location,
            'pickup_latitude' => $request->pickup_latitude,
            'pickup_longitude' => $request->pickup_longitude,
            'dropoff_location' => $request->dropoff_location,
            'dropoff_latitude' => $request->dropoff_latitude,
            'dropoff_longitude' => $request->dropoff_longitude,
            'pickup_time' => $request->pickup_time,
            'estimated_completion_time' => $request->estimated_completion_time,
            'distance_km' => $request->distance_km,
            'agreed_rate' => $request->agreed_rate,
            'pricing_type' => $request->pricing_type,
            'estimated_duration_hours' => $request->estimated_duration_hours,
            'status' => 'pending',
            'special_requirements' => $request->special_requirements,
        ]);

        // Mark availability as booked
        $availability->update(['status' => 'booked']);

        return response()->json([
            'success' => true,
            'data' => $booking,
            'message' => 'Booking invitation sent successfully',
        ], 201);
    }

    /**
     * Accept booking
     */
    public function acceptBooking(string $id): JsonResponse
    {
        $booking = Booking::with('driver')->findOrFail($id);

        if ($booking->driver->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!$booking->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Booking is not in pending status',
            ], 400);
        }

        $booking->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $booking,
            'message' => 'Booking accepted successfully',
        ]);
    }

    /**
     * Decline booking
     */
    public function declineBooking(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string',
        ]);

        $booking = Booking::with('driver')->findOrFail($id);

        if ($booking->driver->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!$booking->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Booking is not in pending status',
            ], 400);
        }

        // Free up availability
        $pickupDate = $booking->pickup_time->toDateString();
        DriverAvailability::where('driver_id', $booking->driver_id)
            ->where('date', $pickupDate)
            ->update(['status' => 'available']);

        $booking->update([
            'status' => 'declined',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->reason ?? 'Driver declined',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking declined successfully',
        ]);
    }

    /**
     * Start booking
     */
    public function startBooking(string $id): JsonResponse
    {
        $booking = Booking::with('driver')->findOrFail($id);

        if ($booking->driver->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!$booking->isAccepted()) {
            return response()->json([
                'success' => false,
                'message' => 'Booking must be accepted before starting',
            ], 400);
        }

        $booking->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $booking,
            'message' => 'Booking started successfully',
        ]);
    }

    /**
     * Complete booking
     */
    public function completeBooking(string $id): JsonResponse
    {
        $booking = Booking::with('driver')->findOrFail($id);

        if ($booking->driver->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!$booking->isInProgress()) {
            return response()->json([
                'success' => false,
                'message' => 'Booking must be in progress to complete',
            ], 400);
        }

        $booking->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Update driver stats
        $booking->driver->increment('total_jobs');

        return response()->json([
            'success' => true,
            'data' => $booking,
            'message' => 'Booking completed successfully',
        ]);
    }

    /**
     * Cancel booking (hirer only)
     */
    public function cancelBooking(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $booking = Booking::with('hirer')->findOrFail($id);

        if ($booking->hirer->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($booking->isCompleted() || $booking->isCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel completed or cancelled booking',
            ], 400);
        }

        // Free up availability
        $pickupDate = $booking->pickup_time->toDateString();
        DriverAvailability::where('driver_id', $booking->driver_id)
            ->where('date', $pickupDate)
            ->update(['status' => 'available']);

        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully',
        ]);
    }

    /**
     * Get bookings for authenticated user
     */
    public function getMyBookings(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->driver) {
            $bookings = Booking::with(['hirer.user', 'driver'])
                ->forDriver($user->driver->id)
                ->orderBy('pickup_time', 'desc')
                ->paginate(20);
        } elseif ($user->hirer) {
            $bookings = Booking::with(['driver.user', 'hirer'])
                ->forHirer($user->hirer->id)
                ->orderBy('pickup_time', 'desc')
                ->paginate(20);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'User is not a driver or hirer',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Get single booking details
     */
    public function getBooking(string $id): JsonResponse
    {
        $user = auth()->user();
        $booking = Booking::with(['driver.user', 'hirer.user'])
            ->findOrFail($id);

        // Check authorization
        if ($user->driver && $booking->driver_id !== $user->driver->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($user->hirer && $booking->hirer_id !== $user->hirer->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $booking,
        ]);
    }

    /**
     * Generate security PIN for booking
     */
    public function generateSecurityPin(string $id): JsonResponse
    {
        $user = auth()->user();
        $booking = Booking::with('hirer')->findOrFail($id);

        // Only hirer can generate PIN
        if (!$user->hirer || $booking->hirer_id !== $user->hirer->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!$booking->isAccepted()) {
            return response()->json([
                'success' => false,
                'message' => 'Booking must be accepted to generate PIN',
            ], 400);
        }

        $pin = $booking->generateSecurityPin();

        return response()->json([
            'success' => true,
            'data' => [
                'pin' => $pin,
                'expires_at' => $booking->pin_generated_at->addMinutes(15)->toIso8601String(),
            ],
            'message' => 'Security PIN generated successfully',
        ]);
    }

    /**
     * Verify security PIN (driver action)
     */
    public function verifySecurityPin(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'pin' => 'required|string|size:4',
        ]);

        $user = auth()->user();
        $booking = Booking::with('driver')->findOrFail($id);

        // Only driver can verify PIN
        if (!$user->driver || $booking->driver_id !== $user->driver->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($booking->verifySecurityPin($request->pin)) {
            return response()->json([
                'success' => true,
                'message' => 'PIN verified successfully. Trip activated.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid or expired PIN',
        ], 400);
    }

    /**
     * Generate live tracking share link (panic button)
     */
    public function generateTrackingShareLink(string $id): JsonResponse
    {
        $user = auth()->user();
        $booking = Booking::with('hirer')->findOrFail($id);

        // Only hirer can generate share link
        if (!$user->hirer || $booking->hirer_id !== $user->hirer->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!$booking->isInProgress()) {
            return response()->json([
                'success' => false,
                'message' => 'Booking must be in progress to share location',
            ], 400);
        }

        // Generate secure tracking token
        $trackingToken = bin2hex(random_bytes(16));
        $expiresAt = now()->addHours(24);

        // Store in booking metadata
        $metadata = $booking->metadata ?? [];
        $metadata['tracking_shares'][] = [
            'token' => $trackingToken,
            'created_at' => now()->toIso8601String(),
            'expires_at' => $expiresAt->toIso8601String(),
            'created_by' => $user->id,
        ];

        $booking->update(['metadata' => $metadata]);

        $shareLink = url("/tracking/{$booking->id}/{$trackingToken}");

        return response()->json([
            'success' => true,
            'data' => [
                'share_link' => $shareLink,
                'expires_at' => $expiresAt->toIso8601String(),
            ],
            'message' => 'Tracking share link generated successfully',
        ]);
    }

    /**
     * Get live tracking data (public endpoint with token)
     */
    public function getLiveTracking(Request $request, string $id, string $token): JsonResponse
    {
        $booking = Booking::findOrFail($id);

        // Verify tracking token
        $metadata = $booking->metadata ?? [];
        $validShare = collect($metadata['tracking_shares'] ?? [])
            ->first(function ($share) use ($token) {
                return $share['token'] === $token &&
                       now()->lte(\Carbon\Carbon::parse($share['expires_at']));
            });

        if (!$validShare) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired tracking token',
            ], 403);
        }

        // Get current driver location
        $location = $this->locationService->getDriverLocation($booking->driver_id);

        return response()->json([
            'success' => true,
            'data' => [
                'booking_id' => $booking->id,
                'driver_name' => $booking->driver->user->name,
                'vehicle_type' => $booking->vehicle_type,
                'pickup_location' => $booking->pickup_location,
                'dropoff_location' => $booking->dropoff_location,
                'current_location' => $location,
                'status' => $booking->status,
                'last_updated' => $location['updated_at'] ?? now()->toIso8601String(),
            ],
        ]);
    }
}

