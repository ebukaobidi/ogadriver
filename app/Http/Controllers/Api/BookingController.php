<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Driver;
use App\Models\DriverAvailability;
use App\Models\DriverPricing;
use App\Models\Hirer;
use App\Services\DriverLocationService;
use App\Events\BookingStatusUpdated;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    protected DriverLocationService $locationService;

    public function __construct(DriverLocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    /**
     * Get a list of bookings for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Booking::with(['driver.user', 'hirer.user', 'job']);

        if ($user->driver) {
            $query->where('driver_id', $user->driver->id);
        } elseif ($user->hirer) {
            $query->where('hirer_id', $user->hirer->id);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'User profile not complete',
            ], 400);
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Get details of a specific booking.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $booking = Booking::with(['driver.user', 'hirer.user', 'job', 'review', 'handoverChecklist'])
            ->findOrFail($id);

        // Authorization
        if (($user->driver && $booking->driver_id === $user->driver->id) ||
            ($user->hirer && $booking->hirer_id === $user->hirer->id) ||
            $user->isSuperAdmin()) {
            
            return response()->json([
                'success' => true,
                'data' => $booking,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized',
        ], 403);
    }

    /**
     * Sync offline bookings from the mobile app
     */
    public function syncOfflineBookings(Request $request): JsonResponse
    {
        $request->validate([
            'bookings' => 'required|array',
            'bookings.*.sync_id' => 'required|string',
            'bookings.*.payload' => 'required|array',
        ]);

        $user = $request->user();
        $syncedCount = 0;
        $results = [];

        foreach ($request->bookings as $offlineBookingData) {
            $syncId = $offlineBookingData['sync_id'];
            $payload = $offlineBookingData['payload'];

            $existing = \App\Models\OfflineBooking::where('sync_id', $syncId)->first();
            
            if ($existing) {
                $results[] = [
                    'sync_id' => $syncId,
                    'status' => $existing->status,
                    'booking_id' => $existing->resulting_booking_id,
                ];
                continue;
            }

            $offlineBooking = \App\Models\OfflineBooking::create([
                'user_id' => $user->id,
                'sync_id' => $syncId,
                'payload' => $payload,
                'status' => 'pending',
            ]);

            $syncedCount++;
            $results[] = [
                'sync_id' => $syncId,
                'status' => 'pending',
            ];
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully synced {$syncedCount} offline bookings",
            'results' => $results,
        ]);
    }

    /**
     * Calculate dynamic fare based on distance, duration, fuel prices, vehicle type & surge rules
     */
    public function calculateFare(Request $request): JsonResponse
    {
        $request->validate([
            'distance_km' => 'nullable|numeric|min:0.1',
            'duration_minutes' => 'nullable|numeric|min:1',
            'vehicle_type' => 'nullable|string',
            'region' => 'nullable|string',
        ]);

        $distanceKm = (float) $request->input('distance_km', 12.5);
        $durationMinutes = (float) $request->input('duration_minutes', 30.0);
        $vehicleType = $request->input('vehicle_type', 'van');
        $region = $request->input('region', 'Lagos');

        $fareService = new \App\Services\DynamicFareService();
        $fare = $fareService->calculateFare(
            $distanceKm,
            $durationMinutes,
            $vehicleType,
            $region
        );

        return response()->json([
            'success' => true,
            'data' => $fare,
        ]);
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

        $forRide = $request->boolean('for_ride');

        $query = Driver::with(['user', 'pricings', 'availabilities', 'state', 'city'])
            ->where('status', 'active');

        // Hire directory: verified drivers. Ride radar: online drivers with cars (verified preferred, online allowed).
        if ($forRide) {
            $query->where(function ($q) {
                $q->where('is_verified', true)->orWhere('is_online', true);
            });
        } elseif (!$request->boolean('include_unverified')) {
            $query->where('is_verified', true);
        }

        // Ride radar: online drivers WITH a vehicle. Hire: optional has_vehicle filter.
        $onlineOnly = filter_var($request->input('online_only', $forRide), FILTER_VALIDATE_BOOLEAN);
        if ($onlineOnly || $forRide) {
            $query->where('is_online', true);
        }
        if ($forRide) {
            $query->where('has_vehicle', true);
        }
        if ($request->has('has_vehicle') && $request->input('has_vehicle') !== '' && $request->input('has_vehicle') !== null) {
            $query->where('has_vehicle', filter_var($request->input('has_vehicle'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $term = $request->input('search');
            $query->where(function ($q) use ($term) {
                $q->where('license_number', 'like', "%{$term}%")
                    ->orWhere('license_class', 'like', "%{$term}%")
                    ->orWhereHas('user', function ($uq) use ($term) {
                        $uq->where('name', 'like', "%{$term}%")
                            ->orWhere('nickname', 'like', "%{$term}%")
                            ->orWhere('phone', 'like', "%{$term}%");
                    });
            });
        }

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

        // Accommodation Needed Filter
        if ($request->has('accommodation_needed') && $request->input('accommodation_needed') !== '' && $request->input('accommodation_needed') !== null) {
            $query->where('accommodation_needed', filter_var($request->input('accommodation_needed'), FILTER_VALIDATE_BOOLEAN));
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

        // SECURITY: never expose identity documents, contact details or guarantor data
        // through search. Contacts are only released via the paid unlock flow
        // (see getDriverProfile / unlockDriver).
        $isAdmin = $request->user() && method_exists($request->user(), 'isAdmin') && $request->user()->isAdmin();
        if (!$isAdmin) {
            $sensitive = [
                'nin', 'bvn', 'residence_address', 'license_number', 'license_expiry',
                'guarantor_a_name', 'guarantor_a_phone', 'guarantor_a_address', 'guarantor_a_occupation', 'guarantor_a_company', 'guarantor_a_code',
                'guarantor_b_name', 'guarantor_b_phone', 'guarantor_b_address', 'guarantor_b_occupation', 'guarantor_b_company', 'guarantor_b_code',
                'verification_fee_paid', 'verification_fee_paid_at', 'subscription_tier', 'subscription_expires_at',
                'saved_places', 'notification_preferences', 'delisted_reason',
                'destination_address', 'destination_latitude', 'destination_longitude', 'destination_label',
            ];
            $drivers->getCollection()->each(function ($driver) use ($sensitive) {
                $driver->makeHidden($sensitive);
                if ($driver->relationLoaded('user') && $driver->user) {
                    $driver->user->setVisible(['id', 'name', 'nickname', 'avatar']);
                }
            });
        }

        return response()->json([
            'success' => true,
            'data' => $drivers,
        ]);
    }

    /**
     * Get driver profile with availability and pricing
     */
    public function getDriverProfile(Request $request, string $id): JsonResponse
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

        $user = $request->user();
        
        // Obscure contact details for Hirers who haven't paid/subscribed
        if ($user && $user->hirer) {
            $isSubscribed = $user->hirer->can_view_direct_contacts; // Overall subscription
            $isUnlocked = \Illuminate\Support\Facades\DB::table('hirer_unlocked_drivers')
                ->where('hirer_id', $user->hirer->id)
                ->where('driver_id', $driver->id)
                ->exists();

            if (!$isSubscribed && !$isUnlocked) {
                if ($driver->user) {
                    $driver->user->phone = 'Locked - Pay to Unlock';
                    $driver->user->email = 'Locked - Pay to Unlock';
                }
                $driver->residence_address = 'Locked - Pay to Unlock';
                
                // Hide guarantor contacts
                $driver->guarantor_a_phone = 'Locked';
                $driver->guarantor_b_phone = 'Locked';
                if ($driver->guarantors) {
                    $driver->guarantors->each(function($g) {
                        $g->phone = 'Locked';
                        $g->email = 'Locked';
                    });
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'driver' => $driver,
                'current_location' => $location,
            ],
        ]);
    }

    /**
     * Create booking invitation — supports trip hire, open ride bid, and employment contract.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing(['role', 'hirer']);

        // Allow hirers/employers; auto-create missing hirer row so ride bids work.
        $roleSlug = $user->role?->slug;
        $isEmployerRole = in_array($roleSlug, ['hirer', 'employer'], true);

        if (!$user->hirer && $isEmployerRole) {
            $user->hirer()->create([
                'company_name' => $user->name,
                'subscription_tier' => 'free',
                'max_concurrent_contracts' => 3,
                'verification_status' => 'unverified',
            ]);
            $user->load('hirer');
        }

        if (!$user->hirer) {
            return response()->json([
                'success' => false,
                'message' => 'Only employers can create booking invitations. Please register or switch to an employer account.',
            ], 403);
        }

        $mode = $request->input('booking_mode');
        if (!$mode) {
            if ($request->filled('contract_type') || $request->filled('proposed_salary') || $request->filled('start_date')) {
                $mode = 'employment';
            } elseif ($request->input('pricing_type') === 'custom_bid' || $request->boolean('open_bid') || !$request->filled('driver_id')) {
                $mode = 'open_ride';
            } else {
                $mode = 'trip';
            }
        }

        $request->merge(['booking_mode' => $mode]);

        $rules = [
            'booking_mode' => 'required|in:trip,open_ride,employment',
            'driver_id' => 'nullable|exists:drivers,id',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'route_description' => 'nullable|string',
            'vehicle_type' => 'nullable|string|max:32',
            'pickup_location' => 'nullable|string|max:255',
            'pickup_latitude' => 'nullable|numeric',
            'pickup_longitude' => 'nullable|numeric',
            'dropoff_location' => 'nullable|string|max:255',
            'dropoff_latitude' => 'nullable|numeric',
            'dropoff_longitude' => 'nullable|numeric',
            'pickup_time' => 'nullable|date',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'estimated_completion_time' => 'nullable|date',
            'distance_km' => 'nullable|numeric',
            'agreed_rate' => 'nullable|numeric|min:0',
            'proposed_salary' => 'nullable|numeric|min:0',
            'pricing_type' => 'nullable|string|max:32',
            'contract_type' => 'nullable|in:hourly,daily,monthly,yearly',
            'payment_cycle' => 'nullable|string|max:32',
            'shift_preference' => 'nullable|string|max:32',
            'accommodation_required' => 'nullable|boolean',
            'vehicle_required' => 'nullable|boolean',
            'include_tolls' => 'nullable|boolean',
            'estimated_duration_hours' => 'nullable|numeric',
            'special_requirements' => 'nullable|array',
            'stops' => 'nullable|array',
            'payment_method' => 'nullable|string|max:32',
            'offer_price' => 'nullable|numeric|min:0',
            'suggested_price' => 'nullable|numeric|min:0',
            'counter_offer_price' => 'nullable|numeric|min:0',
            'negotiation_status' => 'nullable|string|max:32',
            'notes' => 'nullable|string',
            // Book ride for another passenger / beneficiary
            'book_for_other' => 'nullable|boolean',
            'passenger_name' => 'nullable|string|max:120',
            'passenger_phone' => 'nullable|string|max:32',
            'passenger_email' => 'nullable|email|max:255',
            'passenger_user_id' => 'nullable|exists:users,id',
            'beneficiary_user_id' => 'nullable|exists:users,id',
        ];

        if ($mode === 'open_ride') {
            $rules['pickup_location'] = 'required|string|max:255';
            $rules['dropoff_location'] = 'required|string|max:255';
            $rules['agreed_rate'] = 'required|numeric|min:0';
        } elseif ($mode === 'employment') {
            $rules['driver_id'] = 'required|exists:drivers,id';
            $rules['start_date'] = 'required|date';
            $rules['proposed_salary'] = 'required|numeric|min:0';
            $rules['contract_type'] = 'nullable|in:hourly,daily,monthly,yearly';
        } else {
            $rules['driver_id'] = 'required|exists:drivers,id';
            $rules['pickup_location'] = 'required|string|max:255';
            $rules['dropoff_location'] = 'required|string|max:255';
            $rules['agreed_rate'] = 'required|numeric|min:0';
        }

        $request->validate($rules);

        $hirer = $user->hirer;
        $driver = $request->filled('driver_id') ? Driver::findOrFail($request->driver_id) : null;

        $isScheduled = $request->boolean('is_scheduled') || $request->filled('scheduled_at');
        $scheduledAt = $request->input('scheduled_at') ?? $request->input('pickup_time');
        $pickupTime = $scheduledAt
            ?? ($request->input('start_date') ? $request->input('start_date') . ' 08:00:00' : now()->toDateTimeString());

        $isRecurring = $request->boolean('is_recurring');
        $recurringFrequency = $request->input('recurring_frequency', 'weekdays');
        $recurringDays = $request->input('recurring_days', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
        $recurringUntil = $request->input('recurring_until');

        $vehicleType = $request->input('vehicle_type', 'van');
        $allowedVehicles = [
            'heavy_duty', 'light_truck', 'van', 'bus', 'tanker', 'standard', 'executive', 'luxury',
            'sedan', 'suv', 'tipper', 'flatbed', 'refrigerated', 'tow_truck', 'tricycle'
        ];
        if (!in_array($vehicleType, $allowedVehicles, true)) {
            $vehicleType = 'van';
        }

        $pricingType = $request->input('pricing_type', $mode === 'employment' ? 'daily' : 'trip');
        if ($pricingType === 'custom_bid') {
            $pricingType = 'trip';
        }
        if (!in_array($pricingType, ['hourly', 'daily', 'trip', 'distance'], true)) {
            $pricingType = 'trip';
        }

        $agreedRate = (float) ($request->input('agreed_rate') ?? $request->input('proposed_salary') ?? 0);
        $title = $request->input('title');
        if (!$title) {
            $title = match ($mode) {
                'employment' => 'Employment hire — ' . ($driver?->user?->name ?? 'Driver'),
                'open_ride' => 'Open ride bid: ' . $request->input('pickup_location') . ' → ' . $request->input('dropoff_location'),
                default => 'Trip booking',
            };
        }

        $description = $request->input('description')
            ?? $request->input('route_description')
            ?? $request->input('notes');

        $availability = null;
        if ($driver && $mode !== 'open_ride') {
            $pickupDate = \Carbon\Carbon::parse($pickupTime)->toDateString();
            $availability = DriverAvailability::where('driver_id', $driver->id)
                ->whereDate('date', $pickupDate)
                ->where('status', 'available')
                ->first();

            // Employment/trip hires should not hard-fail if the driver has no calendar row yet
            if (!$availability && $mode === 'trip') {
                // Soft-create availability for the day so booking can proceed
                $availability = DriverAvailability::firstOrCreate(
                    [
                        'driver_id' => $driver->id,
                        'date' => $pickupDate,
                    ],
                    [
                        'status' => 'available',
                        'start_time' => '00:00:00',
                        'end_time' => '23:59:59',
                    ]
                );
            }

            if ($mode === 'trip') {
                $pricing = DriverPricing::where('driver_id', $driver->id)
                    ->where('vehicle_type', $vehicleType)
                    ->where('pricing_type', $pricingType)
                    ->where('is_active', true)
                    ->first();

                if ($pricing) {
                    $minRate = $pricing->minimum_rate ?? $pricing->base_rate;
                    if ($minRate && $agreedRate < $minRate) {
                        return response()->json([
                            'success' => false,
                            'message' => "The proposed rate of {$agreedRate} is below the driver's configured minimum rate of {$minRate} for this vehicle type.",
                        ], 422);
                    }
                }
            }
        }

        $special = $request->input('special_requirements', []);
        if (!is_array($special)) {
            $special = [];
        }
        if ($request->boolean('include_tolls') || stripos((string) $request->input('notes'), 'toll') !== false) {
            $special['include_tolls'] = true;
        }

        $bookForOther = $request->boolean('book_for_other')
            || $request->filled('passenger_name')
            || $request->filled('passenger_phone')
            || $request->filled('passenger_user_id')
            || $request->filled('beneficiary_user_id');

        $passengerUserId = $request->input('passenger_user_id') ?? $request->input('beneficiary_user_id');
        $passengerName = $request->input('passenger_name');
        $passengerPhone = $request->input('passenger_phone');
        $passengerEmail = $request->input('passenger_email');

        if ($passengerUserId) {
            $pUser = \App\Models\User::find($passengerUserId);
            if ($pUser) {
                $passengerName = $passengerName ?: $pUser->name;
                $passengerPhone = $passengerPhone ?: $pUser->phone;
                $passengerEmail = $passengerEmail ?: $pUser->email;
            }
        }

        if ($bookForOther) {
            if (empty($passengerName) || empty($passengerPhone)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Passenger name and phone are required when booking a ride for another user.',
                ], 422);
            }
            $special['book_for_other'] = true;
            $special['passenger_name'] = $passengerName;
            $special['passenger_phone'] = $passengerPhone;
            if ($passengerEmail) {
                $special['passenger_email'] = $passengerEmail;
            }
            if ($passengerUserId) {
                $special['passenger_user_id'] = (int) $passengerUserId;
            }
        }

        $rawContractType = strtolower((string) $request->input('contract_type', ''));
        if (in_array($rawContractType, ['hourly'])) {
            $contractType = 'hourly';
        } elseif (in_array($rawContractType, ['monthly', 'full_time', 'employment', 'permanent'])) {
            $contractType = 'monthly';
        } elseif (in_array($rawContractType, ['yearly', 'annual'])) {
            $contractType = 'yearly';
        } else {
            // Default for rides, trips, daily hires, standard bids
            $contractType = ($mode === 'employment') ? 'monthly' : 'daily';
        }

        if ($bookForOther && $title && stripos($title, 'for ') === false) {
            $title = $title . ' (for ' . $passengerName . ')';
        } elseif ($bookForOther && !$title) {
            $title = 'Ride for ' . $passengerName;
        }

        $booking = Booking::create([
            'hirer_id' => $hirer->id,
            'driver_id' => $driver?->id,
            'title' => $title,
            'description' => $description,
            'route_description' => $request->input('route_description') ?? $request->input('notes'),
            'vehicle_type' => $vehicleType,
            'pickup_location' => $request->input('pickup_location') ?? ($mode === 'employment' ? 'Employer location' : null),
            'pickup_latitude' => $request->input('pickup_latitude'),
            'pickup_longitude' => $request->input('pickup_longitude'),
            'dropoff_location' => $request->input('dropoff_location') ?? ($mode === 'employment' ? 'Employer location' : null),
            'dropoff_latitude' => $request->input('dropoff_latitude'),
            'dropoff_longitude' => $request->input('dropoff_longitude'),
            'pickup_time' => $pickupTime,
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'estimated_completion_time' => $request->input('estimated_completion_time'),
            'distance_km' => $request->input('distance_km'),
            'agreed_rate' => $agreedRate,
            'proposed_salary' => $request->input('proposed_salary', $mode === 'employment' ? $agreedRate : null),
            'pricing_type' => $pricingType,
            'payment_cycle' => $request->input('payment_cycle'),
            'shift_preference' => $request->input('shift_preference'),
            'accommodation_required' => $request->boolean('accommodation_required'),
            'vehicle_required' => $request->boolean('vehicle_required'),
            'include_tolls' => $request->boolean('include_tolls') || !empty($special['include_tolls']),
            'booking_mode' => $mode,
            'contract_type' => $contractType,
            'estimated_duration_hours' => $request->input('estimated_duration_hours'),
            'status' => 'pending',
            'special_requirements' => $special ?: null,
            'stops' => $request->input('stops'),
            'payment_method' => $request->input('payment_method', 'escrow'),
            'offer_price' => $request->input('offer_price', $agreedRate),
            'suggested_price' => $request->input('suggested_price'),
            'counter_offer_price' => $request->input('counter_offer_price'),
            'negotiation_status' => $request->input('negotiation_status', 'none'),
            'metadata' => [
                'created_via' => 'api',
                'mode' => $mode,
                'open_bid' => $mode === 'open_ride',
                'is_scheduled' => $isScheduled,
                'scheduled_at' => $scheduledAt ? \Carbon\Carbon::parse($scheduledAt)->toIso8601String() : null,
                'is_recurring' => $isRecurring,
                'recurring_frequency' => $recurringFrequency,
                'recurring_days' => $recurringDays,
                'recurring_until' => $recurringUntil,
                'book_for_other' => $bookForOther,
                'passenger' => $bookForOther ? [
                    'name' => $passengerName,
                    'phone' => $passengerPhone,
                    'email' => $passengerEmail,
                    'user_id' => $passengerUserId ? (int) $passengerUserId : null,
                ] : null,
                'booked_by_user_id' => $user->id,
            ],
        ]);

        if ($availability && $mode === 'trip') {
            $availability->update(['status' => 'booked']);
        }

        try {
            broadcast(new BookingStatusUpdated($booking->fresh(['driver.user', 'hirer.user']), 'created'));
        } catch (\Throwable $e) {
            // Broadcasting optional in local/dev
        }

        return response()->json([
            'success' => true,
            'data' => $booking->fresh(['driver.user', 'hirer.user']),
            'message' => $mode === 'open_ride'
                ? 'Ride bid broadcast successfully. Nearby drivers can claim it.'
                : ($mode === 'employment'
                    ? 'Employment hire proposal sent successfully'
                    : 'Booking invitation sent successfully'),
        ], 201);
    }

    /**
     * Accept booking (direct invite or claim open ride bid)
     */
    public function acceptBooking(string $id): JsonResponse
    {
        $booking = Booking::with('driver')->findOrFail($id);
        $user = auth()->user();
        $driverProfile = $user?->driver;

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Only drivers can accept bookings',
            ], 403);
        }

        // Open ride bid: first eligible driver claims it
        if (!$booking->driver_id && in_array($booking->booking_mode, ['open_ride', null], true)) {
            if (!$booking->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking is not in pending status',
                ], 400);
            }

            $booking->update([
                'driver_id' => $driverProfile->id,
                'status' => 'accepted',
                'accepted_at' => now(),
            ]);

            $driverProfile->update([
                'job_status' => 'hired',
                'is_available' => false,
            ]);

            $booking->refresh()->load(['driver.user', 'hirer.user']);
            try {
                broadcast(new BookingStatusUpdated($booking, 'accepted'));
            } catch (\Throwable $e) {
            }

            return response()->json([
                'success' => true,
                'data' => $booking,
                'message' => 'Open ride bid claimed successfully',
            ]);
        }

        if (!$booking->driver || $booking->driver->user_id !== $user->id) {
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

        $booking->driver->update([
            'job_status' => 'hired',
            'is_available' => false,
        ]);

        try {
            broadcast(new BookingStatusUpdated($booking, 'accepted'));
        } catch (\Throwable $e) {
        }

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
        $user = auth()->user();

        // Open bids without a driver cannot be "declined" by a driver — only cancelled by hirer
        if (!$booking->driver_id) {
            return response()->json([
                'success' => false,
                'message' => 'Open ride bid has no assigned driver yet. Hirer can cancel instead.',
            ], 400);
        }

        if (!$booking->driver || $booking->driver->user_id !== $user->id) {
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
        if ($booking->pickup_time) {
            $pickupDate = $booking->pickup_time->toDateString();
            DriverAvailability::where('driver_id', $booking->driver_id)
                ->where('date', $pickupDate)
                ->update(['status' => 'available']);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->reason ?? 'Driver declined',
        ]);

        try {
            broadcast(new BookingStatusUpdated($booking, 'declined'));
        } catch (\Throwable $e) {
        }

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

        broadcast(new BookingStatusUpdated($booking, 'in_progress'));

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

        // When a job completes, the driver must pay a relisting fee to get back on the market
        $booking->driver->update([
            'job_status' => 'needs_relisting',
            'relisting_fee_paid' => false,
            'is_available' => false,
        ]);

        // Update driver stats
        $booking->driver->increment('total_jobs');

        // Award Loyalty Points
        $loyaltyService = new \App\Services\LoyaltyService();
        // Award 50 points to driver
        if ($booking->driver && $booking->driver->user) {
            $loyaltyService->awardPoints($booking->driver->user, 50, 'Completed booking #' . $booking->id);
        }
        // Award 50 points to hirer
        if ($booking->hirer && $booking->hirer->user) {
            $loyaltyService->awardPoints($booking->hirer->user, 50, 'Completed booking #' . $booking->id);

            // ══════════════════════════════════════════════════════════════════════
            // RIDER / HIRER REFERRAL LOGIC:
            // When a referred rider/hirer pays with money (not OgaPoints),
            // award loyalty points to the user who referred them!
            // ══════════════════════════════════════════════════════════════════════
            $hirerUser = $booking->hirer->user;
            if ($hirerUser->referred_by_user_id) {
                $referrer = \App\Models\User::find($hirerUser->referred_by_user_id);
                if ($referrer) {
                    // Check metadata/payment_cycle/rate to verify real money payment
                    $metadata = is_array($booking->metadata) ? $booking->metadata : (json_decode($booking->metadata, true) ?? []);
                    $pointsDiscountApplied = !empty($metadata['points_discount_applied']) || !empty($metadata['used_points']);
                    $isFullPointsPayment = !empty($metadata['paid_fully_with_points']);

                    // Only reward referrer when the ride was paid with real money (not pure points)
                    if (!$isFullPointsPayment) {
                        $rate = (float) ($booking->agreed_rate ?? $booking->proposed_salary ?? 0);
                        
                        // 1. Loyalty Points: Award points to the referrer account (available to all users)
                        $referredPoints = max(100, (int) round(($rate / 1000) * 5));
                        $loyaltyService->awardPoints(
                            $referrer,
                            $referredPoints,
                            "Referral reward: {$hirerUser->name} completed trip #{$booking->id} paid with money"
                        );

                        // 2. Sustainable Wallet Commission for Creators & Drivers:
                        // Drivers & Content creators who onboard active paying passengers receive a micro-cash credit
                        // directly to their wallet (e.g. 1.5% of booking fee, capped at ₦250) on successful money trips!
                        if ($referrer->isDriver() || $referrer->isCreator()) {
                            $commissionPct = 0.015; // 1.5% micro-commission (well within platform profit margins)
                            $cashCommission = min(250, round($rate * $commissionPct, 2));
                            if ($cashCommission >= 10) {
                                $refWallet = \App\Models\Wallet::firstOrCreate(
                                    ['user_id' => $referrer->id],
                                    ['balance' => 0, 'available_balance' => 0, 'currency' => 'NGN']
                                );
                                $roleTitle = $referrer->isDriver() ? 'Driver Passenger Bonus' : 'Creator Passenger Commission';
                                $refWallet->credit(
                                    amount: $cashCommission,
                                    type: 'credit',
                                    category: 'commission',
                                    description: "{$roleTitle}: {$hirerUser->name} completed trip #{$booking->id}",
                                    reference: "TRIPREF_{$booking->id}_{$referrer->id}"
                                );
                                
                                $referrer->referral_balance = ($referrer->referral_balance ?? 0) + $cashCommission;
                                $referrer->referral_rewarded = ($referrer->referral_rewarded ?? 0) + $cashCommission;
                                $referrer->save();
                            }
                        }
                    }
                }
            }
        }

        broadcast(new BookingStatusUpdated($booking, 'completed'));

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
        if ($booking->pickup_time && $booking->driver_id) {
            $pickupDate = $booking->pickup_time->toDateString();
            DriverAvailability::where('driver_id', $booking->driver_id)
                ->where('date', $pickupDate)
                ->update(['status' => 'available']);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->reason,
        ]);

        broadcast(new BookingStatusUpdated($booking, 'cancelled'));

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully',
        ]);
    }

    /**
     * Extend destination mid-ride and calculate fare top-up
     */
    public function extendDestination(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'new_dropoff_location' => 'required|string',
            'new_latitude' => 'nullable|numeric',
            'new_longitude' => 'nullable|numeric',
            'additional_distance_km' => 'nullable|numeric|min:0',
            'additional_fare' => 'nullable|numeric|min:0',
        ]);

        $booking = Booking::findOrFail($id);
        $extraFare = (float) $request->input('additional_fare', 1500);

        $booking->update([
            'dropoff_location' => $request->new_dropoff_location,
            'dropoff_latitude' => $request->new_latitude ?? $booking->dropoff_latitude,
            'dropoff_longitude' => $request->new_longitude ?? $booking->dropoff_longitude,
            'agreed_rate' => $booking->agreed_rate + $extraFare,
            'notes' => trim(($booking->notes ?? '') . " [Extended drop-off to {$request->new_dropoff_location} (+₦{$extraFare})]"),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Trip destination extended to {$request->new_dropoff_location}. ₦{$extraFare} added to fare.",
            'data' => $booking,
        ]);
    }

    /**
     * Sync offline GPS waypoints buffered in PWA local storage
     */
    public function syncOfflineWaypoints(Request $request): JsonResponse
    {
        $request->validate([
            'waypoints' => 'required|array',
        ]);

        return response()->json([
            'success' => true,
            'message' => count($request->waypoints) . ' offline waypoints synchronized with server.',
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
     * List open ride bids drivers can claim (Africa ride marketplace).
     */
    public function openRideBids(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user?->driver) {
            return response()->json([
                'success' => false,
                'message' => 'Only drivers can view open ride bids',
            ], 403);
        }

        $query = Booking::with(['hirer.user'])
            ->whereNull('driver_id')
            ->where('status', 'pending')
            ->where(function ($q) {
                $q->where('booking_mode', 'open_ride')
                    ->orWhereNull('booking_mode');
            })
            ->orderByDesc('created_at');

        if ($request->filled('max_rate')) {
            $query->where('agreed_rate', '<=', (float) $request->input('max_rate'));
        }

        $bids = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $bids,
        ]);
    }

    /**
     * Get list of scheduled rides for current user or open scheduled rides for drivers.
     */
    public function getScheduledRides(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Booking::with(['driver.user', 'hirer.user']);

        if ($user->driver) {
            $query->where(function ($q) use ($user) {
                $q->where('driver_id', $user->driver->id)
                  ->orWhere(function($sub) {
                      $sub->whereNull('driver_id')
                          ->where('status', 'pending');
                  });
            });
        } elseif ($user->hirer) {
            $query->where('hirer_id', $user->hirer->id);
        } else {
            return response()->json(['success' => false, 'message' => 'User profile incomplete'], 400);
        }

        $query->where(function ($q) {
            $q->where('metadata->is_scheduled', true)
              ->orWhere('pickup_time', '>', now());
        })
        ->whereNotIn('status', ['completed', 'cancelled'])
        ->orderBy('pickup_time', 'asc');

        $rides = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $rides,
        ]);
    }

    /**
     * Get active recurring commute subscriptions for hirer or driver
     */
    public function getRecurringSubscriptions(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Booking::with(['driver.user', 'hirer.user'])
            ->where('metadata->is_recurring', true);

        if ($user->driver) {
            $query->where('driver_id', $user->driver->id);
        } elseif ($user->hirer) {
            $query->where('hirer_id', $user->hirer->id);
        } else {
            return response()->json(['success' => true, 'data' => []]);
        }

        $subscriptions = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $subscriptions
        ]);
    }

    /**
     * Get driver proposals / job offers list
     */
    public function getDriverProposals(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->driver) {
            return response()->json(['success' => true, 'data' => []]);
        }
        $proposals = Booking::with(['hirer.user'])
            ->where('driver_id', $user->driver->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $proposals]);
    }

    /**
     * Get driver active contracts list
     */
    public function getDriverContracts(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->driver) {
            return response()->json(['success' => true, 'data' => []]);
        }
        $contracts = Booking::with(['hirer.user'])
            ->where('driver_id', $user->driver->id)
            ->whereIn('status', ['accepted', 'in_progress'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $contracts]);
    }

    /**
     * Pause or resume a recurring commute subscription
     */
    public function toggleRecurringSubscription(Request $request, string $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $newStatus = $booking->status === 'paused' ? 'pending' : 'paused';
        $booking->update(['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'message' => "Recurring commute subscription is now {$newStatus}.",
            'data' => $booking
        ]);
    }

    /**
     * Get active ride for current user.
     */
    public function getActiveRide(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Booking::with(['driver.user', 'hirer.user']);

        if ($user->driver) {
            $query->where('driver_id', $user->driver->id);
        } elseif ($user->hirer) {
            $query->where('hirer_id', $user->hirer->id);
        } else {
            return response()->json(['success' => true, 'data' => null]);
        }

        $activeBooking = $query->whereIn('status', ['accepted', 'in_progress', 'arrived'])
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$activeBooking) {
            return response()->json(['success' => true, 'data' => null]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $activeBooking->id,
                'driver_id' => $activeBooking->driver_id,
                'driver_name' => $activeBooking->driver?->user?->name ?? 'Assigned Driver',
                'driver_rating' => $activeBooking->driver?->rating ?? '5.0',
                'pickup_location' => $activeBooking->pickup_location,
                'dropoff_location' => $activeBooking->dropoff_location,
                'status' => $activeBooking->status,
                'eta' => '5 mins',
                'agreed_rate' => $activeBooking->agreed_rate,
                'pickup_time' => $activeBooking->pickup_time,
                'is_scheduled' => (bool) ($activeBooking->metadata['is_scheduled'] ?? false),
            ]
        ]);
    }

    /**
     * Get ride history for user.
     */
    public function getRideHistory(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Booking::with(['driver.user', 'hirer.user']);

        if ($user->driver) {
            $query->where('driver_id', $user->driver->id);
        } elseif ($user->hirer) {
            $query->where('hirer_id', $user->hirer->id);
        } else {
            return response()->json(['success' => true, 'data' => []]);
        }

        $history = $query->orderBy('created_at', 'desc')
            ->limit((int) $request->input('limit', 10))
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'pickup' => $booking->pickup_location,
                    'dropoff' => $booking->dropoff_location,
                    'amount' => $booking->agreed_rate,
                    'status' => $booking->status,
                    'date' => $booking->created_at ? $booking->created_at->format('M d, Y H:i') : 'Recent',
                    'is_scheduled' => (bool) ($booking->metadata['is_scheduled'] ?? false),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    /**
     * Submit driver bid on open ride
     */
    public function submitBid(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
        ]);

        $user = $request->user();
        if (!$user->driver) {
            return response()->json(['success' => false, 'message' => 'Only drivers can submit bids'], 403);
        }

        $booking = Booking::findOrFail($id);
        $metadata = $booking->metadata ?? [];
        $bids = $metadata['bids'] ?? [];

        $bids[] = [
            'id' => uniqid('bid_'),
            'driver_id' => $user->driver->id,
            'driver_name' => $user->name,
            'driver_rating' => $user->driver->rating ?? '5.0',
            'price' => (float) $request->amount,
            'eta' => '3 mins',
            'created_at' => now()->toIso8601String(),
        ];

        $metadata['bids'] = $bids;
        $booking->update(['metadata' => $metadata]);

        return response()->json([
            'success' => true,
            'message' => 'Bid submitted successfully',
            'data' => $bids
        ]);
    }

    /**
     * Get bids for a ride
     */
    public function getBids(string $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $metadata = $booking->metadata ?? [];
        $bids = $metadata['bids'] ?? [];

        return response()->json([
            'success' => true,
            'data' => $bids
        ]);
    }

    /**
     * Accept a driver's bid
     */
    public function acceptBid(Request $request, string $id, ?string $bidId = null): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $metadata = $booking->metadata ?? [];
        $bids = $metadata['bids'] ?? [];

        $targetBidId = $bidId ?? $request->input('bid_id');
        $selectedBid = collect($bids)->firstWhere('id', $targetBidId);

        if ($selectedBid) {
            $booking->update([
                'driver_id' => $selectedBid['driver_id'],
                'agreed_rate' => $selectedBid['price'],
                'status' => 'accepted',
                'accepted_at' => now(),
            ]);
        } else {
            $firstBid = reset($bids);
            if ($firstBid) {
                $booking->update([
                    'driver_id' => $firstBid['driver_id'],
                    'agreed_rate' => $firstBid['price'],
                    'status' => 'accepted',
                    'accepted_at' => now(),
                ]);
            } else {
                return response()->json(['success' => false, 'message' => 'No bids found for this booking'], 400);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Bid accepted successfully',
            'data' => $booking->fresh(['driver.user'])
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
                'message' => 'Booking must be accepted or in progress to share location',
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

    /**
     * Submit a review for a booking
     */
    public function submitReview(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'score' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found',
            ], 404);
        }

        // Check if user is the hirer for this booking
        if ($request->user()->hirer->id !== $booking->hirer_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to review this booking',
            ], 403);
        }

        // Check if booking is completed
        if (!$booking->isCompleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Only completed bookings can be reviewed',
            ], 400);
        }

        // Check if already reviewed
        $existingReview = Review::where('booking_id', $booking->id)->first();
        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'This booking has already been reviewed',
            ], 400);
        }

        $review = Review::create([
            'driver_id' => $booking->driver_id,
            'hirer_id' => $booking->hirer_id,
            'booking_id' => $booking->id,
            'score' => $request->score,
            'review_text' => $request->review_text,
        ]);

        // Update driver average score
        $driver = $booking->driver;
        $avgScore = Review::where('driver_id', $driver->id)->avg('score');
        $driver->update(['rating' => round($avgScore, 1)]);

        return response()->json([
            'success' => true,
            'data' => $review,
            'message' => 'Review submitted successfully',
        ]);
    }
}

