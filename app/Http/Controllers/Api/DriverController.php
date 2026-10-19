<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DriverLocationService;
use App\Services\DriverVerificationService;
use App\Services\DocumentValidationService;
use App\Models\Driver;
use App\Models\DriverDocument;
use App\Models\Wallet;
use App\Events\DriverLocationUpdated;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\RateLimiter;

class DriverController extends Controller
{
    /**
     * Get paginated earnings history for the driver
     */
    public function getEarnings(Request $request, $driverId): JsonResponse
    {
        $driver = Driver::findOrFail($driverId);
        
        // Ensure the authenticated user owns this driver profile
        if ($request->user()->id !== $driver->user_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $wallet = Wallet::where('user_id', $driver->user_id)->first();
        if (!$wallet) {
            return response()->json([
                'success' => true,
                'data' => [
                    'total_earned' => 0,
                    'transactions' => [],
                ]
            ]);
        }

        // Get all credit transactions (earnings)
        $transactions = $wallet->transactions()
            ->where('type', 'credit')
            ->whereIn('category', ['job_payment', 'bonus', 'referral_bonus', 'tip'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        $totalEarned = $wallet->transactions()
            ->where('type', 'credit')
            ->whereIn('category', ['job_payment', 'bonus', 'referral_bonus', 'tip'])
            ->sum('amount');

        return response()->json([
            'success' => true,
            'data' => [
                'total_earned' => (float) $totalEarned,
                'wallet_balance' => (float) $wallet->available_balance,
                'transactions' => $transactions,
            ]
        ]);
    }

    /**
     * Return database-backed earnings totals for a driver's profile.
     */
    public function getEarningsSummary(Request $request, string $driverId): JsonResponse
    {
        $driver = Driver::findOrFail($driverId);

        if ($request->user()->id !== $driver->user_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $wallet = Wallet::where('user_id', $driver->user_id)->first();
        if (!$wallet) {
            return response()->json([
                'success' => true,
                'data' => [
                    'today_earnings' => 0,
                    'month_earnings' => 0,
                    'total_earnings' => 0,
                ],
            ]);
        }

        $earnings = $wallet->transactions()
            ->where('type', 'credit')
            ->where('status', 'completed')
            ->whereIn('category', ['job_payment', 'bonus', 'referral_bonus', 'tip']);

        $todayEarnings = (clone $earnings)->whereDate('created_at', today())->sum('amount');
        $weekEarnings = (clone $earnings)->whereBetween('created_at', [now()->startOfWeek(), now()])->sum('amount');
        $monthEarnings = (clone $earnings)
            ->whereBetween('created_at', [now()->startOfMonth(), now()])
            ->sum('amount');
        $totalEarned = (clone $earnings)->sum('amount');
        $ridesEarnings = (clone $earnings)->where('category', 'job_payment')->sum('amount');
        $hireEarnings = max(0, $totalEarned - $ridesEarnings);

        return response()->json([
            'success' => true,
            'data' => [
                'today_earnings' => (float) $todayEarnings,
                'this_week' => (float) $weekEarnings,
                'month_earnings' => (float) $monthEarnings,
                'total_earnings' => (float) $totalEarned,
                'rides_earnings' => (float) $ridesEarnings,
                'hire_earnings' => (float) $hireEarnings,
            ],
        ]);
    }

    protected DriverLocationService $locationService;
    protected DriverVerificationService $verificationService;
    protected DocumentValidationService $documentValidationService;

    public function __construct(DriverLocationService $locationService, DriverVerificationService $verificationService, DocumentValidationService $documentValidationService)
    {
        $this->locationService = $locationService;
        $this->verificationService = $verificationService;
        $this->documentValidationService = $documentValidationService;
    }

    /**
     * Display a listing of drivers
     */
    public function index(Request $request): JsonResponse
    {
        $query = Driver::with(['user', 'state', 'city']);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('is_verified')) {
            $query->where('is_verified', $request->boolean('is_verified'));
        }
        if ($request->has('is_online')) {
            $query->where('is_online', $request->boolean('is_online'));
        }

        $drivers = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $drivers,
        ]);
    }

    /**
     * Store a newly created driver
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'license_number' => 'required|string|unique:drivers,license_number',
            'license_class' => 'required|string',
            'license_expiry' => 'required|date',
            'years_of_experience' => 'nullable|integer|min:0',
            'preferred_route_type' => 'nullable|in:long_haul,short_haul,both',
            'vehicle_certifications' => 'nullable|array',
        ]);

        $driver = Driver::create([
            'user_id' => $request->user_id,
            'license_number' => $request->license_number,
            'license_class' => $request->license_class,
            'license_expiry' => $request->license_expiry,
            'years_of_experience' => $request->years_of_experience ?? 0,
            'preferred_route_type' => $request->preferred_route_type,
            'vehicle_certifications' => $request->vehicle_certifications,
        ]);

        // Create wallet for driver
        Wallet::create([
            'user_id' => $request->user_id,
            'balance' => 0.00,
            'escrow_balance' => 0.00,
            'available_balance' => 0.00,
            'currency' => 'NGN',
        ]);

        return response()->json([
            'success' => true,
            'data' => $driver->load('user'),
            'message' => 'Driver profile created successfully',
        ], 201);
    }

    /**
     * Display the specified driver
     */
    public function show(string $id): JsonResponse
    {
        $driver = Driver::with(['user', 'documents', 'wallet', 'state', 'city', 'vehicle'])
            ->withCount('bookings', 'reviews')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $driver,
        ]);
    }

    /**
     * Get driver verification status with progress
     */
    public function getVerificationStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        $status = $this->verificationService->getVerificationStatus($driver);
        $trialStatus = $this->verificationService->getTrialStatus($driver);
        $checklist = $this->verificationService->getVerificationChecklist($driver);
        $dispatchStatus = $this->verificationService->getDispatchStatus($driver);

        return response()->json([
            'success' => true,
            'data' => [
                'verification' => $status,
                'trial' => $trialStatus,
                'checklist' => $checklist,
                'dispatch' => $dispatchStatus,
            ],
        ]);
    }

    /**
     * Update the specified driver
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $driver = Driver::findOrFail($id);
        
        if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|nullable|max:255',
            'nickname' => 'sometimes|string|nullable|max:255',
            'license_number' => 'sometimes|string|unique:drivers,license_number,' . $id,
            'license_class' => 'sometimes|string',
            'license_expiry' => 'sometimes|date',
            'years_of_experience' => 'sometimes|integer|min:0',
            'preferred_route_type' => 'sometimes|in:long_haul,short_haul,both',
            'vehicle_certifications' => 'sometimes|array',
            'skills' => 'sometimes|array',
            'endorsements' => 'sometimes|array',
            'state_id' => 'sometimes|integer',
            'city_id' => 'sometimes|integer',
            'preferred_locations' => 'sometimes|array',
            'employment_types' => 'sometimes|array',
            'gender' => 'sometimes|string|in:male,female,other',
            'date_of_birth' => 'sometimes|date',
            'phone' => 'sometimes|string|nullable|max:30',
            'email' => 'sometimes|email|nullable|unique:users,email,' . $user->id,
            'nin' => 'sometimes|string|nullable',
            'bvn' => 'sometimes|string|nullable',
            'residence_address' => 'sometimes|string|nullable',
            'guarantor_a_name' => 'sometimes|string|nullable',
            'guarantor_a_phone' => 'sometimes|string|nullable',
            'guarantor_a_address' => 'sometimes|string|nullable',
            'guarantor_a_occupation' => 'sometimes|string|nullable',
            'guarantor_a_company' => 'sometimes|string|nullable',
            'guarantor_b_name' => 'sometimes|string|nullable',
            'guarantor_b_phone' => 'sometimes|string|nullable',
            'guarantor_b_address' => 'sometimes|string|nullable',
            'guarantor_b_occupation' => 'sometimes|string|nullable',
            'guarantor_b_company' => 'sometimes|string|nullable',
            'accommodation_needed' => 'sometimes|boolean',
            'accommodation_notes' => 'sometimes|string|nullable',
            'service_mode' => 'sometimes|in:driver_only,driver_with_vehicle,both',
            'has_vehicle' => 'sometimes|boolean',
            'biometric_login' => 'sometimes|boolean',
            'available_for_interstate' => 'sometimes|boolean',
            'saved_places' => 'sometimes|array',
            'saved_places.home' => 'nullable|array',
            'saved_places.home.address' => 'nullable|string|max:500',
            'saved_places.work' => 'nullable|array',
            'saved_places.work.address' => 'nullable|string|max:500',
            'notification_preferences' => 'sometimes|array',
            'notification_preferences.jobAlerts' => 'sometimes|boolean',
            'notification_preferences.email' => 'sometimes|boolean',
            'notification_preferences.security' => 'sometimes|boolean',
        ]);

        $driver->update($request->only([
            'license_number',
            'license_class',
            'license_expiry',
            'years_of_experience',
            'preferred_route_type',
            'vehicle_certifications',
            'state_id',
            'city_id',
            'preferred_locations',
            'employment_types',
            'nin',
            'bvn',
            'residence_address',
            'guarantor_a_name',
            'guarantor_a_phone',
            'guarantor_a_address',
            'guarantor_a_occupation',
            'guarantor_a_company',
            'guarantor_b_name',
            'guarantor_b_phone',
            'guarantor_b_address',
            'guarantor_b_occupation',
            'guarantor_b_company',
            'accommodation_needed',
            'accommodation_notes',
            'service_mode',
            'skills',
            'endorsements',
            'has_vehicle',
            'biometric_login',
            'available_for_interstate',
            'saved_places',
            'notification_preferences',
        ]));

        if ($request->has('service_mode')) {
            $driver->has_vehicle = in_array($request->service_mode, ['driver_with_vehicle', 'both']);
            $driver->save();
        }

        $userData = $request->only(['name', 'gender', 'date_of_birth', 'nickname', 'phone', 'email']);
        if (!empty($userData)) {
            $driver->user->update($userData);
        }

        return response()->json([
            'success' => true,
            'data' => $driver->load('user'),
            'message' => 'Driver profile updated successfully',
        ]);
    }

    /**
     * Remove the specified driver
     */
    public function destroy(string $id): JsonResponse
    {
        $user = auth()->user();
        $driver = Driver::findOrFail($id);
        
        if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        $driver->delete();

        return response()->json([
            'success' => true,
            'message' => 'Driver profile deleted successfully',
        ]);
    }

    /**
     * Update driver location
     */
    public function updateLocation(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'status' => 'nullable|in:online,on_trip,offline',
        ]);

        $driver = Driver::findOrFail($id);
        $status = $request->input('status', 'online');

        $this->locationService->updateDriverLocation(
            $driver->id,
            (float) $request->latitude,
            (float) $request->longitude,
            $status
        );

        // Ghost Protocol: Red Zone Breach Check
        if ($status === 'on_trip') {
            $redZones = \App\Models\RedZone::where('is_active', true)->get();
            foreach ($redZones as $zone) {
                // Haversine distance in km
                $distance = $this->haversineDistance($request->latitude, $request->longitude, $zone->latitude, $zone->longitude);
                if ($distance <= $zone->radius_km) {
                    // Trigger SOS!
                    \App\Models\EmergencySosAlert::create([
                        'job_id' => null, // Would map to active job if available
                        'user_id' => $user->id,
                        'reporter_type' => 'driver',
                        'type' => 'hijack', // Red Zone Breach
                        'latitude' => $request->latitude,
                        'longitude' => $request->longitude,
                        'status' => 'pending',
                        'details' => "GHOST PROTOCOL ALERT: Driver breached Red Zone '{$zone->name}'.",
                    ]);
                    break;
                }
            }
        }

        // Broadcast location update to hirers who favorited this driver
        broadcast(new DriverLocationUpdated(
            $driver,
            (float) $request->latitude,
            (float) $request->longitude,
            $status
        ));

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully',
            'data' => [
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Toggle driver online status
     */
    public function toggleOnline(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        $driver = Driver::findOrFail($id);
        $targetOnline = $request->has('is_online') ? $request->boolean('is_online') : !$driver->is_online;

        // When driver attempts to go ONLINE for Hailing:
        if ($targetOnline) {
            // 1. Anti-Moonlighting Check: If driver is under active contract or employed
            $activeBooking = \App\Models\Booking::where('driver_id', $driver->id)
                ->whereIn('status', ['accepted', 'funded', 'in_progress', 'active', 'started'])
                ->first();

            $isEmployedStatus = in_array(strtolower((string) ($driver->status ?? '')), ['employed', 'hired', 'on_contract']);

            $driverVehicle = $driver->vehicle;
            $isEmployerCar = $driverVehicle && $driverVehicle->ownership_type === 'employer';

            if ($activeBooking || $isEmployedStatus || $isEmployerCar) {
                return response()->json([
                    'success' => false,
                    'error_code' => 'EMPLOYMENT_HAILING_LOCKED',
                    'message' => 'Hailing is locked: Active employment contract detected. To protect employers and prevent unauthorized commercial use of private employer vehicles, hailing dispatch is strictly disabled during active employment.',
                    'details' => [
                        'active_contract' => (bool)$activeBooking,
                        'employer_vehicle' => (bool)$isEmployerCar,
                        'employment_status' => $driver->status,
                    ]
                ], 403);
            }

            // 2. Vehicle Verification Check: Must have a registered vehicle to receive on-demand hailing dispatch
            if (!$driver->has_vehicle && !$driverVehicle) {
                return response()->json([
                    'success' => false,
                    'error_code' => 'NO_VEHICLE_ATTACHED',
                    'message' => 'Vehicle required: You are currently registered as a Chauffeur Operative without a car. To receive on-demand ride hailing dispatches, please register a personally owned vehicle in your Profile.',
                ], 422);
            }
        }

        $driver->update(['is_online' => $targetOnline]);

        // Update Redis location service
        if ($driver->is_online && $driver->current_latitude && $driver->current_longitude) {
            $this->locationService->updateDriverLocation(
                $driver->id,
                $driver->current_latitude,
                $driver->current_longitude,
                'online'
            );
        } else {
            $this->locationService->removeDriverLocation($driver->id, 'online');
        }

        return response()->json([
            'success' => true,
            'message' => $driver->is_online ? 'Driver is now online' : 'Driver is now offline',
            'data' => ['is_online' => $driver->is_online],
        ]);
    }

    /**
     * Get Driver Destination Mode (My Direction / Commute Route Filter)
     */
    public function getDestinationMode(Request $request, string $id): JsonResponse
    {
        $driver = Driver::findOrFail($id);
        $user = $request->user();
        if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $driver->id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'destination_mode_active' => (bool)$driver->destination_mode_active,
                'destination_label' => $driver->destination_label,
                'destination_address' => $driver->destination_address,
                'destination_latitude' => $driver->destination_latitude ? (float)$driver->destination_latitude : null,
                'destination_longitude' => $driver->destination_longitude ? (float)$driver->destination_longitude : null,
                'destination_max_detour_km' => $driver->destination_max_detour_km ? (float)$driver->destination_max_detour_km : 5.0,
            ]
        ]);
    }

    /**
     * Update Driver Destination Mode (My Direction / Commute Route Filter)
     */
    public function updateDestinationMode(Request $request, string $id): JsonResponse
    {
        $driver = Driver::findOrFail($id);
        $user = $request->user();
        if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $driver->id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'destination_mode_active' => 'required|boolean',
            'destination_label' => 'nullable|string|max:255',
            'destination_address' => 'nullable|string|max:255',
            'destination_latitude' => 'nullable|numeric',
            'destination_longitude' => 'nullable|numeric',
            'destination_max_detour_km' => 'nullable|numeric|min:1|max:50',
        ]);

        $driver->update([
            'destination_mode_active' => $request->boolean('destination_mode_active'),
            'destination_label' => $request->input('destination_label', $driver->destination_label),
            'destination_address' => $request->input('destination_address', $driver->destination_address),
            'destination_latitude' => $request->input('destination_latitude', $driver->destination_latitude),
            'destination_longitude' => $request->input('destination_longitude', $driver->destination_longitude),
            'destination_max_detour_km' => $request->input('destination_max_detour_km', $driver->destination_max_detour_km ?? 5.0),
        ]);

        return response()->json([
            'success' => true,
            'message' => $driver->destination_mode_active 
                ? 'Destination mode activated. Showing rides matching your route to ' . ($driver->destination_label ?: 'your destination')
                : 'Destination mode turned off.',
            'data' => [
                'destination_mode_active' => (bool)$driver->destination_mode_active,
                'destination_label' => $driver->destination_label,
                'destination_address' => $driver->destination_address,
                'destination_latitude' => $driver->destination_latitude ? (float)$driver->destination_latitude : null,
                'destination_longitude' => $driver->destination_longitude ? (float)$driver->destination_longitude : null,
                'destination_max_detour_km' => $driver->destination_max_detour_km ? (float)$driver->destination_max_detour_km : 5.0,
            ]
        ]);
    }

    /**
     * Get driver documents
     */
    public function getDocuments(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        $driver = Driver::findOrFail($id);
        $documents = $driver->documents()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    /**
     * Upload driver document
     */
    public function uploadDocument(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        try {
            $user = $request->user();
            if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $id)) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }
            
            // Rate limit: 30 uploads per hour per driver
            $key = 'document_upload:' . $id;
            if (RateLimiter::tooManyAttempts($key, 30)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many upload attempts. Please try again later.',
                ], 429);
            }
            RateLimiter::hit($key, 3600); // 1 hour window

            $request->validate([
                'document_type' => 'required|in:drivers_license,medical_certificate,police_clearance,insurance,vehicle_registration,guarantor_form_a,guarantor_form_b,lasdri_card',
                'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // Max 5MB
                'document_number' => 'nullable|string',
                'issue_date' => 'nullable|date',
                'expiry_date' => 'required|date|after_or_equal:today',
            ]);

            $driver = Driver::findOrFail($id);
            $file = $request->file('file');
            $expiryDate = $request->expiry_date;
            $documentNumber = $request->document_number;
            $ocrMeta = null;

            // Server-side license checks: reject expired / non-license when Vision OCR is available
            if ($request->document_type === 'drivers_license') {
                try {
                    $ocrService = app(\App\Services\DocumentOCRService::class);
                    $imageContent = file_get_contents($file->getRealPath());
                    $ocrResult = $ocrService->analyzeContent($imageContent, 'drivers_license');

                    if (!empty($ocrResult['success']) && !empty($ocrResult['extracted_data'])) {
                        $extracted = $ocrResult['extracted_data'];
                        $rawText = strtoupper((string) ($ocrResult['raw_text'] ?? ''));

                        $looksLikeLicense = (bool) preg_match(
                            '/DRIVER.?S?\s*LICEN|FRSC|FEDERAL\s+ROAD\s+SAFETY|LICEN[CS]E\s*(NO|NUMBER)|CLASS\s*[A-Z0-9]/i',
                            $rawText
                        );

                        if (!$looksLikeLicense && strlen(trim($rawText)) > 20) {
                            return response()->json([
                                'success' => false,
                                'message' => 'Upload rejected: file does not appear to be a driver\'s license.',
                            ], 422);
                        }

                        if (!empty($extracted['expiry_date'])) {
                            try {
                                $ocrExpiry = \Carbon\Carbon::parse($extracted['expiry_date'])->endOfDay();
                                if ($ocrExpiry->isPast()) {
                                    return response()->json([
                                        'success' => false,
                                        'message' => 'Upload rejected: driver\'s license is expired ('.$ocrExpiry->toDateString().').',
                                    ], 422);
                                }
                                // Prefer OCR expiry over client-provided placeholder
                                $expiryDate = $ocrExpiry->toDateString();
                            } catch (\Throwable $e) {
                                // keep client expiry
                            }
                        }

                        if (!empty($extracted['document_number']) && empty($documentNumber)) {
                            $documentNumber = $extracted['document_number'];
                        }

                        $ocrMeta = array_merge($extracted, [
                            'raw_text' => $ocrResult['raw_text'] ?? null,
                            'processed_at' => now()->toIso8601String(),
                            'source' => 'upload_realtime',
                        ]);
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('License OCR pre-check skipped: '.$e->getMessage());
                }

                // Always enforce submitted expiry is not past (belt and suspenders)
                try {
                    if (\Carbon\Carbon::parse($expiryDate)->endOfDay()->isPast()) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Upload rejected: document expiry date is in the past.',
                        ], 422);
                    }
                } catch (\Throwable $e) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid expiry date.',
                    ], 422);
                }
            }

            $uploadDisk = config('filesystems.default', 'public');
            $filePath = $file->store('driver-documents', $uploadDisk);

            // Create document record
            $document = DriverDocument::create([
                'driver_id' => $driver->id,
                'document_type' => $request->document_type,
                'document_number' => $documentNumber,
                'file_path' => $filePath,
                'issue_date' => $request->issue_date,
                'expiry_date' => $expiryDate,
                'status' => 'pending',
                'ocr_data' => $ocrMeta,
            ]);

            // Add file URL for immediate access
            $document->file_url = Storage::disk($uploadDisk)->url($filePath);

            // If uploading guarantor forms, set the driver's guarantor status to pending
            if ($request->document_type === 'guarantor_form_a') {
                $driver->update(['guarantor_a_status' => 'pending']);
            } elseif ($request->document_type === 'guarantor_form_b') {
                $driver->update(['guarantor_b_status' => 'pending']);
            }

            // Dispatch OCR background job
            try {
                \App\Jobs\ProcessDocumentOCR::dispatch($document);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('OCR Dispatch failed: ' . $e->getMessage());
            }

            // Notify all admin/super_admin users
            try {
                $admins = \App\Models\User::whereHas('role', function($q) {
                    $q->whereIn('slug', ['admin', 'super_admin']);
                })->get();
                foreach ($admins as $admin) {
                    $admin->notify(new \App\Notifications\SystemAlertNotification(
                        'New Document Uploaded',
                        "Driver {$driver->user->name} uploaded a new {$request->document_type} for verification.",
                        'document',
                        "/admin/drivers/{$driver->id}"
                    ));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Admin notification failed: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'data'    => $document,
                'message' => 'Document uploaded successfully and pending verification',
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Document Upload Failed: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false, 
                'message' => 'A server error occurred while uploading the document. Please try again or contact support.'
            ], 500);
        }
    }

    /**
     * Get driver wallet
     */
    public function getWallet(Request $request): JsonResponse
    {
        $user = $request->user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $wallet->load('transactions'),
        ]);
    }

    /**
     * Deposit funds to wallet
     */
    public function deposit(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
            'payment_method' => 'required|string',
            'payment_reference' => 'required|string',
        ]);

        $user = $request->user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet not found',
            ], 404);
        }

        $transaction = $wallet->credit(
            (float) $request->amount,
            'credit',
            'deposit',
            'Wallet deposit via ' . $request->payment_method,
            $request->payment_reference
        );

        return response()->json([
            'success' => true,
            'data' => $transaction,
            'message' => 'Deposit successful',
        ]);
    }

    /**
     * Withdraw funds from wallet
     */
    public function withdraw(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
            'bank_account' => 'required|string',
        ]);

        $user = $request->user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet not found',
            ], 404);
        }

        // Check if Pro driver for instant withdrawal
        $isPro = $user->driver && $user->driver->isPro();

        try {
            $transaction = $wallet->debit(
                (float) $request->amount,
                'debit',
                'withdrawal',
                'Withdrawal to ' . $request->bank_account . ($isPro ? ' (Instant Pro)' : ' (Standard)'),
                uniqid('wd_')
            );

            return response()->json([
                'success' => true,
                'data' => $transaction,
                'message' => $isPro ? 'Instant withdrawal successful' : 'Withdrawal processed',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get wallet transactions
     */
    public function getTransactions(Request $request): JsonResponse
    {
        $user = $request->user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet not found',
            ], 404);
        }

        $transactions = $wallet->transactions()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    /**
     * Get Driver Reviews
     */
    public function getReviews(string $id): JsonResponse
    {
        $driver = Driver::findOrFail($id);
        $reviews = \App\Models\Review::with('hirer.user')
            ->where('driver_id', $driver->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    /**
     * Get simulator training modules
     */
    public function getSimulatorModules(Request $request): JsonResponse
    {
        $modules = [
            [
                'id' => 1,
                'title' => 'Customer Service & VIP Protocol',
                'duration' => '15 min',
                'completed' => false,
                'locked' => false,
                'description' => 'Professional etiquette, passenger communication, and conflict resolution.',
            ],
            [
                'id' => 2,
                'title' => 'Highway Code & Road Signs Masterclass',
                'duration' => '20 min',
                'completed' => false,
                'locked' => false,
                'description' => 'Mandatory, warning, regulatory, and informatory road signs comprehension.',
            ],
            [
                'id' => 3,
                'title' => 'Road Markings & Lane Discipline',
                'duration' => '15 min',
                'completed' => false,
                'locked' => false,
                'description' => 'Solid lines, broken lines, yellow boxes, and lane priority rules.',
            ],
            [
                'id' => 4,
                'title' => 'Emergency Response & Hazard Management',
                'duration' => '15 min',
                'completed' => false,
                'locked' => false,
                'description' => 'Defensive driving, wet weather handling, and emergency braking techniques.',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $modules,
        ]);
    }

    /**
     * Get simulator training questions
     */
    public function getSimulatorQuestions(Request $request): JsonResponse
    {
        $moduleId = (int) $request->get('module_id', 1);

        $allQuestions = [
            1 => [
                [
                    'id' => 101,
                    'question' => 'A passenger becomes impatient due to heavy traffic. What is the most professional response?',
                    'options' => [
                        'Remain calm, acknowledge their concern politely, and focus safely on navigation.',
                        'Argue back and explain that traffic is not your fault.',
                        'Cancel the trip immediately and ask the passenger to exit.',
                        'Turn up the radio volume to drown out their comments.'
                    ],
                    'correct' => 0
                ],
                [
                    'id' => 102,
                    'question' => 'Before starting a high-tier executive dispatch, what should you ensure regarding the vehicle cabin?',
                    'options' => [
                        'Clean seats, neutral fresh odor, working air conditioning, and zero clutter.',
                        'Personal belongings placed on the back seat.',
                        'Windows rolled down completely with AC turned off to save fuel.',
                        'No preparation required if the vehicle was cleaned yesterday.'
                    ],
                    'correct' => 0
                ],
            ],
            2 => [
                [
                    'id' => 201,
                    'sign' => [
                        'shape' => 'octagon',
                        'code' => 'FRSC R-01',
                        'category' => 'REGULATORY (MANDATORY)',
                        'bgColor' => '#dc2626',
                        'textColor' => '#ffffff',
                        'text' => 'STOP',
                    ],
                    'question' => 'What does this octagonal road sign mandate under the Nigerian Highway Code?',
                    'options' => [
                        'Bring the vehicle to a complete standstill behind the stop line, check all directions, and proceed only when clear.',
                        'Slow down to 20 km/h and proceed without stopping if no cross-traffic is approaching.',
                        'Honk loudly and maintain cruising speed to claim right of way.',
                        'Stop only if traffic police or FRSC officers are physically standing on the road.',
                    ],
                    'correct' => 0,
                    'explanation' => 'A STOP sign mandates a 100% complete halt of vehicle wheels at the demarcation line. Rolling through is a punishable traffic infraction.',
                ],
                [
                    'id' => 202,
                    'sign' => [
                        'shape' => 'inverted_triangle',
                        'code' => 'FRSC R-02',
                        'category' => 'REGULATORY (PRIORITY)',
                        'bgColor' => '#ffffff',
                        'borderColor' => '#dc2626',
                        'textColor' => '#dc2626',
                        'text' => "GIVE\nWAY",
                    ],
                    'question' => 'When approaching this inverted triangular road sign, what is required of the driver?',
                    'options' => [
                        'Accelerate quickly to cross the junction before oncoming vehicles arrive.',
                        'Give way and yield the right of way to all traffic moving on the intersecting major road.',
                        'Vehicles on the intersecting road must stop to allow you passage.',
                        'Indicates that the speed limit restriction has ended.',
                    ],
                    'correct' => 1,
                    'explanation' => 'An inverted triangle with red border mandates yielding priority to cross-traffic already traveling on the major carriageway.',
                ],
                [
                    'id' => 203,
                    'sign' => [
                        'shape' => 'circle',
                        'code' => 'FRSC P-01',
                        'category' => 'PROHIBITORY (NO ENTRY)',
                        'bgColor' => '#dc2626',
                        'borderColor' => '#ffffff',
                        'textColor' => '#ffffff',
                        'icon' => 'remove-outline',
                    ],
                    'question' => 'What does this red circular sign with a thick white horizontal bar prohibit?',
                    'options' => [
                        'No parking between 8:00 AM and 6:00 PM on weekdays.',
                        'Temporary road closure for official motorcade escort only.',
                        'No Entry — Vehicular entry is strictly forbidden from this direction (One-Way violation).',
                        'Expressway electronic toll collection booth ahead.',
                    ],
                    'correct' => 2,
                    'explanation' => 'No Entry forbids any vehicle from entering the roadway in that direction. Entering constitutes driving against traffic (One-Way).',
                ],
                [
                    'id' => 204,
                    'sign' => [
                        'shape' => 'circle',
                        'code' => 'FRSC R-10',
                        'category' => 'REGULATORY (SPEED LIMIT)',
                        'bgColor' => '#ffffff',
                        'borderColor' => '#dc2626',
                        'textColor' => '#0f172a',
                        'text' => '100',
                        'subText' => 'km/h',
                    ],
                    'question' => 'What does this circular sign with a red border and the number "100" dictate?',
                    'options' => [
                        'Maximum statutory legal speed limit of 100 km/h on Federal Expressways for private cars.',
                        'Minimum required speed on express lanes to prevent traffic congestion.',
                        'Distance remaining to the next interstate interchange is 100 km.',
                        'Speed limit strictly reserved for articulated commercial heavy trucks.',
                    ],
                    'correct' => 0,
                    'explanation' => '100 km/h is the statutory maximum speed limit for motor cars on dual carriage expressways under FRSC regulations.',
                ],
                [
                    'id' => 205,
                    'sign' => [
                        'shape' => 'circle',
                        'code' => 'FRSC R-11',
                        'category' => 'REGULATORY (URBAN SPEED)',
                        'bgColor' => '#ffffff',
                        'borderColor' => '#dc2626',
                        'textColor' => '#0f172a',
                        'text' => '50',
                        'subText' => 'km/h',
                    ],
                    'question' => 'Where is this 50 km/h speed limit sign typically enforced across Nigeria?',
                    'options' => [
                        'On inter-state toll corridors during clear daylight conditions.',
                        'Only inside international airport cargo terminals.',
                        'Exclusively on express flyovers and elevated bridges.',
                        'In built-up municipal areas, residential zones, and city centers to protect pedestrians.',
                    ],
                    'correct' => 3,
                    'explanation' => '50 km/h is the legal maximum speed in all built-up urban zones and city streets to prevent severe pedestrian collisions.',
                ],
                [
                    'id' => 206,
                    'sign' => [
                        'shape' => 'triangle',
                        'code' => 'FRSC W-08',
                        'category' => 'WARNING (ROUNDABOUT)',
                        'bgColor' => '#fef08a',
                        'borderColor' => '#dc2626',
                        'icon' => 'sync-outline',
                    ],
                    'question' => 'What is the priority rule when approaching a junction marked by this Roundabout sign?',
                    'options' => [
                        'Vehicles approaching fastest toward the entry lane take absolute right-of-way.',
                        'Give priority to vehicles approaching from your left already circulating inside the roundabout.',
                        'Vehicles on the outside entering the roundabout take automatic priority.',
                        'Maintain speed and honk continuously to force circular traffic to stop.',
                    ],
                    'correct' => 1,
                    'explanation' => 'Traffic approaching a roundabout in Nigeria must give way to traffic on their left already circulating inside the roundabout.',
                ],
                [
                    'id' => 207,
                    'sign' => [
                        'shape' => 'triangle',
                        'code' => 'FRSC W-15',
                        'category' => 'WARNING (PEDESTRIAN)',
                        'bgColor' => '#fef08a',
                        'borderColor' => '#dc2626',
                        'icon' => 'walk-outline',
                    ],
                    'question' => 'What is a chauffeur legally required to do when seeing this Pedestrian Crossing sign?',
                    'options' => [
                        'Slow down and come to a complete stop if any pedestrian is crossing or waiting to cross.',
                        'Honk the horn continuously to warn pedestrians not to step into the roadway.',
                        'Accelerate smoothly to clear the crossing before the pedestrian reaches the center.',
                        'Switch on emergency hazard flashers and drive through without stopping.',
                    ],
                    'correct' => 0,
                    'explanation' => 'Pedestrians on or about to step onto zebra crossings have statutory right of way. Drivers must stop completely.',
                ],
                [
                    'id' => 208,
                    'sign' => [
                        'shape' => 'circle',
                        'code' => 'FRSC P-04',
                        'category' => 'PROHIBITORY (OVERTAKING)',
                        'bgColor' => '#ffffff',
                        'borderColor' => '#dc2626',
                        'icon' => 'car-sport-outline',
                    ],
                    'question' => 'What maneuver is strictly forbidden when driving past this No Overtaking sign?',
                    'options' => [
                        'Using your turn indicator to signal lane position.',
                        'Driving at night with low-beam illumination.',
                        'Passing or overtaking any moving motor vehicle ahead of you until the restriction ends.',
                        'Coming to a stop to inspect tire pressure.',
                    ],
                    'correct' => 2,
                    'explanation' => 'No Overtaking is placed along blind hill crests, sharp curves, or narrow corridors where passing risks severe head-on collisions.',
                ],
            ],
            3 => [
                [
                    'id' => 301,
                    'question' => 'What is the meaning of double solid yellow lines painted along the center of the road?',
                    'options' => [
                        'Overtaking and crossing are strictly prohibited in both directions.',
                        'Overtaking is allowed only during daytime.',
                        'Parking is allowed for less than 5 minutes.',
                        'One lane is reserved exclusively for buses.'
                    ],
                    'correct' => 0
                ],
                [
                    'id' => 302,
                    'question' => 'When approaching a Yellow Box Junction grid, when may a driver enter the box?',
                    'options' => [
                        'Only when the exit road is clear and your vehicle can clear the junction completely.',
                        'Whenever the traffic light turns green, regardless of exit space.',
                        'To make a quick right turn even if blocked by oncoming traffic.',
                        'At any time if driving a commercial vehicle.'
                    ],
                    'correct' => 0
                ],
            ],
            4 => [
                [
                    'id' => 401,
                    'question' => 'When driving in heavy rainfall with reduced visibility, what driving practice is mandatory?',
                    'options' => [
                        'Increase following distance, turn on low-beam headlights, and reduce speed.',
                        'Turn on high beams and hazard lights while speeding to exit rain quickly.',
                        'Tailgate the vehicle ahead to follow its track closely.',
                        'Use cruise control to maintain a steady fast pace.'
                    ],
                    'correct' => 0
                ],
                [
                    'id' => 402,
                    'question' => 'What is the correct action if your brakes fail while driving downhill?',
                    'options' => [
                        'Pump the foot brake, downshift to lower gears, use handbrake gradually, and steer to a safe escape area.',
                        'Turn off the engine ignition immediately to stop the vehicle.',
                        'Jump out of the moving vehicle.',
                        'Shift directly into Reverse gear.'
                    ],
                    'correct' => 0
                ],
            ],
        ];

        $questions = $allQuestions[$moduleId] ?? $allQuestions[1];

        return response()->json([
            'success' => true,
            'data' => $questions,
        ]);
    }

    /**
     * Save simulator training results
     */
    public function saveSimulatorResult(Request $request): JsonResponse
    {
        $normalizedDifficulty = strtolower($request->input('difficulty', 'beginner'));
        $request->merge(['difficulty' => $normalizedDifficulty]);

        $request->validate([
            'score' => 'required|integer|min:0',
            'difficulty' => 'required|in:beginner,intermediate,advanced,expert',
        ]);

        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        $this->verificationService->saveSimulatorResult($driver, (int) $request->score, $normalizedDifficulty);
        $driver->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Simulator results saved successfully',
            'data' => [
                'score' => $driver->simulator_high_score,
                'difficulty' => $driver->simulator_difficulty,
                'completed' => (bool) $driver->simulator_completed,
            ],
        ]);
    }

    /**
     * Get simulator leaderboard
     */
    public function getSimulatorLeaderboard(Request $request): JsonResponse
    {
        $difficulty = $request->get('difficulty', 'all');
        
        $query = Driver::with('user')
            ->whereNotNull('simulator_high_score')
            ->where('simulator_high_score', '>', 0);

        if ($difficulty !== 'all') {
            $query->where('simulator_difficulty', $difficulty);
        }

        $leaderboard = $query->orderBy('simulator_high_score', 'desc')
            ->orderBy('simulator_completed_at', 'asc')
            ->limit(50)
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => $driver->id,
                    'name' => $driver->user->name ?? 'Anonymous',
                    'score' => $driver->simulator_high_score,
                    'difficulty' => $driver->simulator_difficulty,
                    'completed_at' => $driver->simulator_completed_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $leaderboard,
        ]);
    }

    /**
     * Get simulator certificate
     */
    public function getSimulatorCertificate(Request $request): JsonResponse
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        if (!$driver->simulator_completed) {
            return response()->json([
                'success' => false,
                'message' => 'Simulator training not completed',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'driver_name' => $driver->user->name,
                'score' => $driver->simulator_high_score,
                'difficulty' => $driver->simulator_difficulty,
                'completed_at' => $driver->simulator_completed_at,
                'certificate_url' => $driver->simulator_certificate_url,
            ],
        ]);
    }

    /**
     * Get missing documents for a driver
     */
    public function getMissingDocuments(Request $request, string $id): JsonResponse
{
    $user = $request->user();
    if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $id)) {
        return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
    }

    $driver = Driver::findOrFail($id);
    $missingDocuments = $this->documentValidationService->getMissingDocuments($driver);

    return response()->json([
        'success' => true,
        'data' => [
            'driver_id' => $driver->id,
            'missing_documents' => $missingDocuments,
            'total_missing' => count($missingDocuments),
            'required_missing' => count(array_filter($missingDocuments, fn($doc) => $doc['required'])),
        ],
    ]);
}

/**
 * Get expiring documents for a driver
 */
public function getExpiringDocuments(Request $request, string $id): JsonResponse
{
    $user = $request->user();
    if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $id)) {
        return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
    }

    $days = $request->query('days', 30);
    $driver = Driver::findOrFail($id);
    $expiringDocuments = $this->documentValidationService->getExpiringDocuments($driver, $days);

    return response()->json([
        'success' => true,
        'data' => [
            'driver_id' => $driver->id,
            'days_threshold' => $days,
            'expiring_documents' => $expiringDocuments,
            'total_expiring' => count($expiringDocuments),
        ],
    ]);
}

/**
 * Validate a specific document
 */
    public function validateDocument(Request $request, string $id, string $documentId): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $document = DriverDocument::where('driver_id', $id)->findOrFail($documentId);
        $validation = $this->documentValidationService->validateForApproval($document);

        return response()->json([
            'success' => true,
            'data' => [
                'document_id' => $document->id,
                'document_type' => $document->document_type,
                'validation' => $validation,
            ],
        ]);
    }

    /**
     * Perform real-time OCR validation on a document file
     */
    public function realTimeValidateDocument(Request $request): JsonResponse
    {
        $request->validate([
            'document_type' => 'required|string',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $file = $request->file('file');
        $imageContent = file_get_contents($file->getPathname());
        
        $ocrService = app(\App\Services\DocumentOCRService::class);
        $result = $ocrService->analyzeContent($imageContent, $request->document_type);

        return response()->json($result);
    }

    /**
     * Update driver's vehicle profile (Driver + Vehicle feature)
     */
    public function updateVehicleProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver profile not found'], 404);
        }

        $request->validate([
            'service_mode' => 'nullable|in:driver_only,driver_with_vehicle,both',
            'ownership_type' => 'nullable|in:personal,employer,rental_hp',
            'vehicle_type' => 'sometimes|nullable|in:standard,executive,luxury,armored_vip',
            'is_armored' => 'nullable|boolean',
            'make' => 'nullable|string',
            'model' => 'nullable|string',
            'year' => 'nullable|string',
            'color' => 'nullable|string',
            'plate_number' => 'nullable|string',
            'expected_daily_rate' => 'numeric|nullable',
            'expected_monthly_rate' => 'numeric|nullable',
        ]);

        $serviceMode = $request->input('service_mode', 'driver_with_vehicle');
        $driver->update([
            'service_mode' => $serviceMode,
            'has_vehicle' => true,
        ]);

        if (true) {
            $vehicleData = $request->only([
                'make', 'model', 'year', 'color', 'plate_number',
                'expected_daily_rate', 'expected_monthly_rate'
            ]);
            $vehicleData['ownership_type'] = $request->input('ownership_type', 'personal');
            $isArmored = (bool) $request->input('is_armored', false);
            $vehicleData['is_armored'] = $isArmored;

            // Classify vehicle type for Nigerian Luxury & Executive Market
            $explicitType = $request->input('vehicle_type');
            $make = strtolower(trim((string) $request->input('make', '')));
            $model = strtolower(trim((string) $request->input('model', '')));
            $year = (int) $request->input('year', 0);

            if ($isArmored || $explicitType === 'armored_vip') {
                $vehicleData['vehicle_type'] = 'armored_vip';
                $vehicleData['is_armored'] = true;
            } elseif (!empty($explicitType) && in_array($explicitType, ['luxury', 'executive', 'standard'])) {
                $vehicleData['vehicle_type'] = $explicitType;
            } else {
                // Intelligent auto-classification for VIP & Executive fleets
                $luxuryBrands = [
                    'mercedes', 'benz', 'mercedes-benz', 'bmw', 'lexus', 'audi', 
                    'land rover', 'range rover', 'porsche', 'rolls-royce', 'rolls royce', 
                    'bentley', 'cadillac', 'lincoln', 'jaguar', 'maserati', 'aston martin', 
                    'lamborghini', 'ferrari', 'genesis'
                ];

                $luxuryModels = [
                    'land cruiser', 'landcruiser', 'prado', 'alphard', 'vellfire', 
                    'sequoia', 'escalade', 'navigator', 'denali', 'patrol', 'armada', 'maybach', 
                    'g-wagon', 'g wagon', 'g63', 'g550', 'gls', 's-class', 's class', 
                    'lx600', 'lx570', 'gx550', 'gx460', 'ls500', 'autobiography', 
                    'vogue', 'defender', '7-series', '7 series', 'x7', 'q8', 'cullinan', 'phantom', 'ghost', 'bentayga'
                ];

                $executiveModels = [
                    'camry', 'avalon', 'highlander', 'fortuner', 'venza', 'crown', 'rav4',
                    'accord', 'pilot', 'cr-v', 'crv',
                    'palisade', 'santa fe', 'sonata', 'tucson',
                    'telluride', 'sorento', 'k5', 'optima', 'sportage', 'carnival',
                    'es350', 'es300', 'rx350', 'rx450', 'nx350', 'nx300', 'is350',
                    'c-class', 'c class', 'c300', 'e-class', 'e class', 'e300', 'e350', 'gle', 'glc', 'metris', 'v-class',
                    '3-series', '3 series', '330i', '5-series', '5 series', '530i', '540i', 'x3', 'x5',
                    'a4', 'a6', 'q5', 'q7',
                    'explorer', 'expedition', 'edge', 'cx-9', 'cx-90'
                ];

                $isLuxuryBrand = false;
                foreach ($luxuryBrands as $lb) {
                    if (str_contains($make, $lb)) {
                        $isLuxuryBrand = true;
                        break;
                    }
                }

                $isLuxuryModel = false;
                foreach ($luxuryModels as $lm) {
                    if (str_contains($model, $lm)) {
                        $isLuxuryModel = true;
                        break;
                    }
                }

                $isExecutiveModel = false;
                foreach ($executiveModels as $em) {
                    if (str_contains($model, $em)) {
                        $isExecutiveModel = true;
                        break;
                    }
                }

                if ($isLuxuryModel || ($isLuxuryBrand && !in_array($model, ['c-class', 'c class', 'c300', '3-series', '3 series', '330i', 'a4']))) {
                    $vehicleData['vehicle_type'] = 'luxury';
                } elseif ($isExecutiveModel || $isLuxuryBrand || ($year >= 2018 && in_array($make, ['toyota', 'honda', 'nissan', 'hyundai', 'kia', 'ford', 'mazda', 'volkswagen']))) {
                    $vehicleData['vehicle_type'] = 'executive';
                } else {
                    $vehicleData['vehicle_type'] = 'standard';
                }
            }

            // Handle file uploads
            $files = ['proof_of_ownership_doc', 'vehicle_license_doc', 'roadworthiness_doc', 'commercial_insurance_doc', 'front_photo', 'side_photo', 'interior_photo'];
            foreach ($files as $fileKey) {
                if ($request->hasFile($fileKey)) {
                    $path = $request->file($fileKey)->store('vehicles/documents', 'public');
                    $vehicleData[$fileKey] = $path;
                }
            }

            \App\Models\DriverVehicle::updateOrCreate(
                ['driver_id' => $driver->id],
                $vehicleData
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Vehicle profile updated successfully.',
            'data' => $driver->load('vehicle'),
        ]);
    }

    /**
     * Pay the 5k relisting fee to become available for jobs again.
     */
    public function payRelistingFee(Request $request): JsonResponse
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver profile not found'], 404);
        }

        if ($driver->job_status === 'hired') {
            return response()->json(['success' => false, 'message' => 'You are currently hired. You cannot relist until your contract ends.'], 400);
        }

        if ($driver->job_status === 'available' && $driver->relisting_fee_paid) {
            return response()->json(['success' => false, 'message' => 'You are already available and have paid the relisting fee.'], 400);
        }

        // Simulate payment gateway (Paystack/Flutterwave) success via webhook/request
        // In reality, this would initiate a payment intent or verify a reference.
        $driver->update([
            'relisting_fee_paid' => true,
            'relisting_fee_paid_at' => now(),
            'job_status' => 'available',
            'is_available' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Relisting fee paid successfully. You are now visible to employers.',
            'data' => [
                'job_status' => $driver->job_status,
                'relisting_fee_paid' => $driver->relisting_fee_paid,
            ],
        ]);
    }
    public function triggerSOS(Request $request, Driver $driver): JsonResponse
    {
        // Require exact GPS coordinates
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        // 1. Broadcast SOS to Admin Dashboard via Pusher
        broadcast(new \App\Events\EmergencySOSBroadcasted(
            $driver->id, 
            $driver->user->name, 
            $request->latitude, 
            $request->longitude
        ));

        // 2. We would hook into Termii API here to SMS the driver's emergency contact
        // Example: Termii::sendSMS($driver->emergency_contact_phone, "EMERGENCY: ...")

        return response()->json([
            'success' => true,
            'message' => 'SOS broadcast deployed successfully.'
        ]);
    }

    /**
     * Get active driver profile boost status
     */
    public function getBoostStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver not found'], 404);
        }

        $isBoosted = $driver->boosted_until && $driver->boosted_until->isFuture();

        return response()->json([
            'success' => true,
            'data' => [
                'is_boosted' => (bool)$isBoosted,
                'boost_tier' => $isBoosted ? $driver->boost_tier : null,
                'boost_multiplier' => $isBoosted ? $driver->boost_multiplier : null,
                'boosted_until' => $isBoosted ? $driver->boosted_until->toIso8601String() : null,
                'days_left' => $isBoosted ? max(1, now()->diffInDays($driver->boosted_until)) : 0,
            ]
        ]);
    }

    /**
     * Activate a profile boost pack
     */
    public function activateBoost(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|in:daily,3days,weekly,monthly,quarterly'
        ]);

        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver not found'], 404);
        }

        $packs = [
            'daily' => ['price' => 700, 'days' => 1, 'multiplier' => '2X Radar Surge', 'name' => '1-Day Quick Flash'],
            '3days' => ['price' => 1800, 'days' => 3, 'multiplier' => '3X Priority Surge', 'name' => '3-Day Weekend Sprint'],
            'weekly' => ['price' => 3500, 'days' => 7, 'multiplier' => '5X Algorithm Boost', 'name' => '7-Day Priority Radar'],
            'monthly' => ['price' => 10500, 'days' => 30, 'multiplier' => '8X Exposure Surge', 'name' => '30-Day Executive Boost'],
            'quarterly' => ['price' => 22500, 'days' => 90, 'multiplier' => '12X Master Operative', 'name' => '90-Day Master Fleet Plan'],
        ];

        $pack = $packs[$request->plan_id];

        // Check wallet
        $wallet = \App\Models\Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['currency' => 'NGN', 'balance' => 0]
        );

        if ($wallet->balance < $pack['price']) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient wallet balance. You need ₦' . number_format($pack['price']) . ' but have ₦' . number_format($wallet->balance) . '.'
            ], 400);
        }

        // Debit wallet
        $wallet->decrement('balance', $pack['price']);

        \App\Models\Transaction::create([
            'wallet_id' => $wallet->id,
            'user_id' => $user->id,
            'amount' => $pack['price'],
            'type' => 'debit',
            'status' => 'completed',
            'category' => 'profile_boost',
            'description' => 'Profile Boost: ' . $pack['name'] . ' (' . $pack['multiplier'] . ')',
            'reference' => 'BST_' . strtoupper(uniqid()),
        ]);

        $boostUntil = ($driver->boosted_until && $driver->boosted_until->isFuture())
            ? $driver->boosted_until->addDays($pack['days'])
            : now()->addDays($pack['days']);

        $driver->update([
            'boost_tier' => $pack['name'],
            'boost_multiplier' => $pack['multiplier'],
            'boosted_until' => $boostUntil,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile boost activated successfully! You now have ' . $pack['multiplier'] . '.',
            'data' => [
                'is_boosted' => true,
                'boost_tier' => $driver->boost_tier,
                'boost_multiplier' => $driver->boost_multiplier,
                'boosted_until' => $driver->boosted_until->toIso8601String(),
                'wallet_balance' => (float)$wallet->balance,
            ]
        ]);
    }

    protected function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) * sin($dLon / 2);
        return $earthRadius * (2 * atan2(sqrt($a), sqrt(1 - $a)));
    }
}
