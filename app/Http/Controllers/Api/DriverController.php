<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DriverLocationService;
use App\Services\DriverVerificationService;
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
    protected DriverLocationService $locationService;
    protected DriverVerificationService $verificationService;

    public function __construct(DriverLocationService $locationService, DriverVerificationService $verificationService)
    {
        $this->locationService = $locationService;
        $this->verificationService = $verificationService;
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
        $driver = Driver::with(['user', 'documents', 'wallet', 'state', 'city'])
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
            'nickname' => 'sometimes|string|nullable|max:255',
            'license_number' => 'sometimes|string|unique:drivers,license_number,' . $id,
            'license_class' => 'sometimes|string',
            'license_expiry' => 'sometimes|date',
            'years_of_experience' => 'sometimes|integer|min:0',
            'preferred_route_type' => 'sometimes|in:long_haul,short_haul,both',
            'vehicle_certifications' => 'sometimes|array',
            'state_id' => 'sometimes|integer',
            'city_id' => 'sometimes|integer',
            'preferred_locations' => 'sometimes|array',
            'employment_types' => 'sometimes|array',
            'gender' => 'sometimes|string|in:male,female,other',
            'date_of_birth' => 'sometimes|date',
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
        ]));

        $userData = $request->only(['gender', 'date_of_birth', 'nickname', 'phone']);
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
        $driver->update(['is_online' => !$driver->is_online]);

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
        
        // Rate limit: 30 uploads per hour per driver (increased for testing)
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
            'expiry_date' => 'required|date|after:today',
        ]);

        $driver = Driver::findOrFail($id);

        // Upload file
        $filePath = $request->file('file')->store('driver-documents', 'public');

        $document = DriverDocument::create([
            'driver_id' => $driver->id,
            'document_type' => $request->document_type,
            'document_number' => $request->document_number,
            'file_path' => $filePath,
            'issue_date' => $request->issue_date,
            'expiry_date' => $request->expiry_date,
            'status' => 'pending',
        ]);

        // If uploading guarantor forms, set the driver's guarantor status to pending
        if ($request->document_type === 'guarantor_form_a') {
            $driver->update(['guarantor_a_status' => 'pending']);
        } elseif ($request->document_type === 'guarantor_form_b') {
            $driver->update(['guarantor_b_status' => 'pending']);
        }

        return response()->json([
            'success' => true,
            'data' => $document,
            'message' => 'Document uploaded successfully and pending verification',
        ], 201);
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
     * Save simulator training results
     */
    public function saveSimulatorResult(Request $request): JsonResponse
    {
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

        $this->verificationService->saveSimulatorResult($driver, $request->score, $request->difficulty);

        return response()->json([
            'success' => true,
            'message' => 'Simulator results saved successfully',
            'data' => [
                'score' => $driver->simulator_high_score,
                'difficulty' => $driver->simulator_difficulty,
                'completed' => $driver->simulator_completed,
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
                'certificate_id' => 'CERT-' . strtoupper(substr(md5($driver->id . $driver->simulator_completed_at), 0, 8)),
            ],
        ]);
    }
}
