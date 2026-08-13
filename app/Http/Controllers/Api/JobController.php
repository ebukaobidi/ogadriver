<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DriverLocationService;
use App\Services\SubscriptionService;
use App\Models\TransportJob;
use App\Models\JobApplication;
use App\Models\Wallet;
use App\Models\Hirer;
use App\Events\JobBroadcasted;
use App\Events\JobAssigned;
use App\Events\JobStarted;
use App\Events\JobCompleted;
use App\Events\JobCancelled;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class JobController extends Controller
{
    protected DriverLocationService $locationService;
    protected SubscriptionService $subscriptionService;

    public function __construct(DriverLocationService $locationService, SubscriptionService $subscriptionService)
    {
        $this->locationService = $locationService;
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Display a listing of jobs
     */
    public function index(Request $request): JsonResponse
    {
        $query = TransportJob::with(['hirer.user', 'driver.user']);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('hirer_id')) {
            $query->where('hirer_id', $request->hirer_id);
        }
        if ($request->has('vehicle_type')) {
            $query->where('vehicle_type', $request->vehicle_type);
        }

        $jobs = $query->orderBy('pickup_time', 'asc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $jobs,
        ]);
    }

    /**
     * Store a newly created job
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && (!$user->hirer || $user->hirer->id != $request->hirer_id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'hirer_id' => 'required|exists:hirers,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'vehicle_type' => 'required|in:heavy_duty,light_truck,van,bus,tanker',
            'required_certifications' => 'nullable|array',
            'pickup_location' => 'required|string',
            'pickup_latitude' => 'required|numeric|between:-90,90',
            'pickup_longitude' => 'required|numeric|between:-180,180',
            'dropoff_location' => 'required|string',
            'dropoff_latitude' => 'required|numeric|between:-90,90',
            'dropoff_longitude' => 'required|numeric|between:-180,180',
            'pickup_time' => 'required|date|after:now',
            'estimated_delivery_time' => 'nullable|date|after:pickup_time',
            'distance_km' => 'nullable|numeric|min:0',
            'amount' => 'required|numeric|min:1000',
            'search_radius_km' => 'nullable|integer|min:1|max:500',
            'is_surge_pricing' => 'nullable|boolean',
            'surge_multiplier' => 'nullable|numeric|min:1|max:5',
        ]);

        $hirer = Hirer::findOrFail($request->hirer_id);

        // Check if hirer can post job
        if (!$hirer->canPostJob()) {
            return response()->json([
                'success' => false,
                'message' => 'You have reached your maximum concurrent contracts limit. Upgrade your subscription to post more jobs.',
            ], 403);
        }

        $job = TransportJob::create([
            'hirer_id' => $request->hirer_id,
            'title' => $request->title,
            'description' => $request->description,
            'vehicle_type' => $request->vehicle_type,
            'required_certifications' => $request->required_certifications,
            'pickup_location' => $request->pickup_location,
            'pickup_latitude' => $request->pickup_latitude,
            'pickup_longitude' => $request->pickup_longitude,
            'dropoff_location' => $request->dropoff_location,
            'dropoff_latitude' => $request->dropoff_latitude,
            'dropoff_longitude' => $request->dropoff_longitude,
            'pickup_time' => $request->pickup_time,
            'estimated_delivery_time' => $request->estimated_delivery_time,
            'distance_km' => $request->distance_km,
            'amount' => $request->amount,
            'is_surge_pricing' => $request->input('is_surge_pricing', false),
            'surge_multiplier' => $request->input('surge_multiplier', 1.00),
            'search_radius_km' => $request->input('search_radius_km', 50),
            'status' => 'draft',
        ]);

        // Broadcast to nearby drivers if published
        if ($request->input('publish_now', false)) {
            $job->update(['status' => 'published', 'published_at' => now()]);

            // Find nearby drivers and broadcast
            $nearbyDrivers = $this->locationService->findDriversForJob(
                $job->pickup_latitude,
                $job->pickup_longitude,
                $job->search_radius_km
            );

            $driverIds = array_map(fn($d) => $d['driver']->id, $nearbyDrivers);

            if (!empty($driverIds)) {
                broadcast(new JobBroadcasted($job, $driverIds));
            }
        }

        return response()->json([
            'success' => true,
            'data' => $job->load('hirer.user'),
            'message' => 'Job created successfully. Publish to make it visible to drivers.',
        ], 201);
    }

    /**
     * Display the specified job
     */
    public function show(string $id): JsonResponse
    {
        $job = TransportJob::with(['hirer.user', 'driver.user', 'applications.driver.user'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $job,
        ]);
    }

    /**
     * Update the specified job
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $job = TransportJob::findOrFail($id);
        
        if (!$user->isSuperAdmin() && (!$user->hirer || $user->hirer->id != $job->hirer_id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Only allow updates if job is in draft status
        if ($job->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update job that is already published',
            ], 400);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'vehicle_type' => 'sometimes|in:heavy_duty,light_truck,van,bus,tanker',
            'pickup_location' => 'sometimes|string',
            'pickup_latitude' => 'sometimes|numeric|between:-90,90',
            'pickup_longitude' => 'sometimes|numeric|between:-180,180',
            'dropoff_location' => 'sometimes|string',
            'dropoff_latitude' => 'sometimes|numeric|between:-90,90',
            'dropoff_longitude' => 'sometimes|numeric|between:-180,180',
            'pickup_time' => 'sometimes|date|after:now',
            'amount' => 'sometimes|numeric|min:1000',
        ]);

        $job->update($request->only([
            'title',
            'description',
            'vehicle_type',
            'pickup_location',
            'pickup_latitude',
            'pickup_longitude',
            'dropoff_location',
            'dropoff_latitude',
            'dropoff_longitude',
            'pickup_time',
            'amount',
        ]));

        return response()->json([
            'success' => true,
            'data' => $job->load('hirer.user'),
            'message' => 'Job updated successfully',
        ]);
    }

    /**
     * Remove the specified job
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $job = TransportJob::findOrFail($id);
        
        if (!$user->isSuperAdmin() && (!$user->hirer || $user->hirer->id != $job->hirer_id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Only allow deletion if job is in draft status
        if ($job->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete job that is already published',
            ], 400);
        }

        $job->delete();

        return response()->json([
            'success' => true,
            'message' => 'Job deleted successfully',
        ]);
    }

    /**
     * Apply for a job
     */
    public function apply(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $request->driver_id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'driver_id' => 'required|exists:drivers,id',
            'proposed_amount' => 'nullable|numeric|min:0',
            'cover_letter' => 'nullable|string',
        ]);

        $job = TransportJob::findOrFail($id);
        $driver = \App\Models\Driver::findOrFail($request->driver_id);

        // Check if job is open for applications
        if (!in_array($job->status, ['published', 'assigned'])) {
            return response()->json([
                'success' => false,
                'message' => 'This job is not accepting applications',
            ], 400);
        }

        // Check if driver already applied
        $existingApplication = JobApplication::where('job_id', $job->id)
            ->where('driver_id', $driver->id)
            ->first();

        if ($existingApplication) {
            return response()->json([
                'success' => false,
                'message' => 'You have already applied for this job',
            ], 400);
        }

        // Check early access restriction
        if ($job->is_early_access && $job->early_access_expires_at > now() && !$driver->isPro()) {
            return response()->json([
                'success' => false,
                'message' => 'This job is currently in early access for Pro drivers only',
            ], 403);
        }

        $application = JobApplication::create([
            'job_id' => $job->id,
            'driver_id' => $driver->id,
            'status' => 'pending',
            'proposed_amount' => $request->proposed_amount,
            'cover_letter' => $request->cover_letter,
            'applied_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $application->load('driver.user'),
            'message' => 'Application submitted successfully',
        ], 201);
    }

    /**
     * Assign driver to job
     */
    public function assignDriver(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'driver_id' => 'required|exists:drivers,id',
        ]);

        $job = TransportJob::findOrFail($id);
        $driver = \App\Models\Driver::findOrFail($request->driver_id);

        // Check if job can be assigned
        if ($job->status !== 'published') {
            return response()->json([
                'success' => false,
                'message' => 'Job must be in published status to assign a driver',
            ], 400);
        }

        // Check if driver has applied
        $application = JobApplication::where('job_id', $job->id)
            ->where('driver_id', $driver->id)
            ->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Driver has not applied for this job',
            ], 400);
        }

        // Assign driver to job
        DB::transaction(function () use ($job, $driver, $application) {
            // Assign driver to job
            $job->assignDriver($driver->id);

            // Accept application
            $application->accept($job->hirer->user_id);

            // Reject other applications
            JobApplication::where('job_id', $job->id)
                ->where('driver_id', '!=', $driver->id)
                ->where('status', 'pending')
                ->update(['status' => 'rejected']);
        });

        // Broadcast job assignment
        broadcast(new JobAssigned($job));

        return response()->json([
            'success' => true,
            'data' => $job->load('driver.user'),
            'message' => 'Driver assigned successfully',
        ]);
    }

    /**
     * Start a job
     */
    public function startJob(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $job = TransportJob::findOrFail($id);
        
        if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $job->driver_id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($job->status !== 'assigned') {
            return response()->json([
                'success' => false,
                'message' => 'Job must be assigned to start',
            ], 400);
        }

        $job->start();

        // Broadcast job started
        broadcast(new JobStarted($job));

        return response()->json([
            'success' => true,
            'data' => $job,
            'message' => 'Job started successfully',
        ]);
    }

    /**
     * Complete a job
     */
    public function completeJob(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $job = TransportJob::findOrFail($id);
        
        if (!$user->isSuperAdmin() && (!$user->driver || $user->driver->id != $job->driver_id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($job->status !== 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => 'Job must be in progress to complete',
            ], 400);
        }

        // Get settlement timing based on driver subscription
        $settlementHours = $this->subscriptionService->getSettlementHours($job->driver->user_id);
        $commissionRate = $this->subscriptionService->getCommissionRate($job->driver->user_id);

        DB::transaction(function () use ($job, $settlementHours, $commissionRate) {
            // Complete the job
            $job->complete();

            // Update driver stats
            $job->driver->increment('total_jobs');
            $job->driver->increment('rating', 0.1); // Small rating boost

            // Store settlement timing in job metadata
            $job->update([
                'metadata' => array_merge($job->metadata ?? [], [
                    'settlement_hours' => $settlementHours,
                    'settlement_scheduled_at' => $settlementHours > 0
                        ? now()->addHours($settlementHours)->toIso8601String()
                        : now()->toIso8601String(),
                ]),
            ]);
        });

        return response()->json([
            'success' => true,
            'data' => $job->load('driver.user'),
            'message' => 'Job completed successfully',
        ]);
    }

    /**
     * Cancel a job
     */
    public function cancelJob(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $job = TransportJob::findOrFail($id);
        
        if (!$user->isSuperAdmin() && (!$user->hirer || $user->hirer->id != $job->hirer_id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if (!in_array($job->status, ['draft', 'published', 'assigned'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel job that is already in progress or completed',
            ], 400);
        }

        // If job was assigned, apply no-show penalty if applicable
        if ($job->status === 'assigned' && $job->driver_id && $job->assigned_at && now()->diffInHours($job->assigned_at) < 2) {
            $driverWallet = $job->driver->user->wallet;
            if ($driverWallet) {
                $penalty = $job->amount * 0.10; // 10% penalty
                if ($driverWallet->available_balance >= $penalty) {
                    $driverWallet->debit($penalty, 'debit', 'penalty', 'No-show penalty for job cancellation');
                }
            }
        }

        $job->cancel();

        // Broadcast job cancelled
        broadcast(new JobCancelled($job, $request->input('reason', 'Cancelled by hirer')));

        return response()->json([
            'success' => true,
            'message' => 'Job cancelled successfully',
        ]);
    }

    /**
     * Get job applications
     */
    public function getApplications(string $id): JsonResponse
    {
        $job = TransportJob::findOrFail($id);
        $applications = $job->applications()->with('driver.user')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }
}
