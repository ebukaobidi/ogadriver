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
    public function signNda(Request $request, $id)
    {
        $job = TransportJob::findOrFail($id);
        
        // Ensure the authenticated user is the assigned driver
        $user = $request->user();
        if ($job->driver_id !== $user->driver?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job->nda_signed_at = now();
        $job->save();

        return response()->json([
            'success' => true,
            'message' => 'NDA Signed successfully',
            'job' => $job
        ]);
    }

    protected DriverLocationService $locationService;
    protected SubscriptionService $subscriptionService;

    public function __construct(DriverLocationService $locationService, SubscriptionService $subscriptionService)
    {
        $this->locationService = $locationService;
        $this->subscriptionService = $subscriptionService;
    }

    public function getNearbyJobs(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius' => 'nullable|numeric' // in km, default 50
        ]);

        $lat = $request->lat;
        $lng = $request->lng;
        $radius = $request->input('radius', 50);

        try {
            // Attempt Redis Geo-Search (Blazing fast for 10k+ drivers polling)
            $jobIds = \Illuminate\Support\Facades\Redis::geosearch(
                'jobs:locations',
                new \Predis\Command\Argument\Geospatial\FromLonLat($lng, $lat),
                new \Predis\Command\Argument\Geospatial\ByRadius($radius, 'km'),
                ['ASC', 'WITHDIST']
            );

            if (!empty($jobIds)) {
                $ids = array_map(fn($item) => $item[0], $jobIds);
                // Get jobs by ID maintaining Redis distance order
                $jobs = TransportJob::published()
                    ->whereIn('id', $ids)
                    ->with('hirer.user')
                    ->get()
                    ->sortBy(fn($job) => array_search($job->id, $ids))
                    ->values();
                    
                // Inject the exact Redis-calculated distance
                foreach ($jobs as $index => $job) {
                    $job->distance = $jobIds[$index][1];
                }
            } else {
                $jobs = [];
            }
            
        } catch (\Exception $e) {
            // Graceful Fallback to MySQL Haversine if Redis is offline or not installed on cPanel
            \Illuminate\Support\Facades\Log::warning('Redis GeoSearch failed, falling back to MySQL Haversine. Error: ' . $e->getMessage());
            
            $haversine = "(6371 * acos(cos(radians($lat)) * cos(radians(pickup_latitude)) * cos(radians(pickup_longitude) - radians($lng)) + sin(radians($lat)) * sin(radians(pickup_latitude))))";
            
            $jobs = TransportJob::published()
                ->select('*')
                ->selectRaw("{$haversine} AS distance")
                ->whereNotNull('pickup_latitude')
                ->whereNotNull('pickup_longitude')
                ->having('distance', '<', $radius)
                ->orderBy('distance', 'asc')
                ->with('hirer.user')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $jobs
        ]);
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

        // Auto-create hirer profile if user is posting a job and doesn't have a hirer row yet
        if (!$user->hirer) {
            $user->hirer()->create([
                'company_name' => $user->name,
                'subscription_tier' => 'free',
                'max_concurrent_contracts' => 5,
                'verification_status' => 'unverified',
            ]);
            $user->load('hirer');
        }

        // Normalize portal job-posting modal fields → core job schema
        if (!$request->filled('hirer_id') && $user?->hirer) {
            $request->merge(['hirer_id' => $user->hirer->id]);
        }
        if (!$request->filled('pickup_location') && $request->filled('pickup_address')) {
            $request->merge(['pickup_location' => $request->input('pickup_address')]);
        }
        if (!$request->filled('dropoff_location') && $request->filled('dropoff_address')) {
            $request->merge(['dropoff_location' => $request->input('dropoff_address')]);
        }
        if (!$request->filled('vehicle_type') && $request->filled('vehicle_type_required')) {
            $request->merge(['vehicle_type' => $request->input('vehicle_type_required')]);
        }
        if (!$request->filled('amount') && $request->filled('proposed_salary')) {
            $request->merge(['amount' => $request->input('proposed_salary')]);
        }
        if (!$request->filled('pickup_time') && $request->filled('start_date')) {
            $request->merge(['pickup_time' => $request->input('start_date') . ' 08:00:00']);
        }
        if (!$request->filled('estimated_delivery_time') && $request->filled('end_date')) {
            $request->merge(['estimated_delivery_time' => $request->input('end_date') . ' 18:00:00']);
        }
        // Default Lagos coords when GPS not provided (Africa marketplace practicality)
        if (!$request->filled('pickup_latitude')) {
            $request->merge(['pickup_latitude' => 6.5244, 'pickup_longitude' => 3.3792]);
        }
        if (!$request->filled('dropoff_latitude')) {
            $request->merge(['dropoff_latitude' => 6.4654, 'dropoff_longitude' => 3.4064]);
        }
        if (!$request->has('publish_now')) {
            $request->merge(['publish_now' => true]);
        }

        if (!$user->isSuperAdmin() && (!$user->hirer || (int) $user->hirer->id !== (int) $request->hirer_id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'hirer_id' => 'required|exists:hirers,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'vehicle_type' => 'required|string|max:60',
            'vacancy_type' => 'nullable|string|max:50',
            'prefill_driver_id' => 'nullable|exists:drivers,id',
            'stops' => 'nullable|array',
            'required_certifications' => 'nullable|array',
            'pickup_location' => 'required|string',
            'pickup_latitude' => 'required|numeric|between:-90,90',
            'pickup_longitude' => 'required|numeric|between:-180,180',
            'dropoff_location' => 'required|string',
            'dropoff_latitude' => 'required|numeric|between:-90,90',
            'dropoff_longitude' => 'required|numeric|between:-180,180',
            'pickup_time' => 'required|date',
            'estimated_delivery_time' => 'nullable|date|after:pickup_time',
            'distance_km' => 'nullable|numeric|min:0',
            'amount' => 'required|numeric|min:0',
            'search_radius_km' => 'nullable|integer|min:1|max:500',
            'is_surge_pricing' => 'nullable|boolean',
            'surge_multiplier' => 'nullable|numeric|min:1|max:5',
            'driver_must_provide_vehicle' => 'nullable|boolean',
            'required_operatives' => 'nullable|integer|min:1|max:20',
            'payment_method' => 'nullable|string|max:32',
        ]);

        $hirer = Hirer::findOrFail($request->hirer_id);

        // Check if hirer can post job (Check if they can post the REQUIRED amount of jobs)
        $requiredCount = $request->input('required_operatives', 1);
        if (!$hirer->canPostJob($requiredCount)) {
            return response()->json([
                'success' => false,
                'message' => 'You have reached your maximum concurrent contracts limit. Upgrade your subscription to post more jobs or reduce the number of required operatives.',
            ], 403);
        }

        $jobData = [
            'hirer_id' => $request->hirer_id,
            'title' => $request->title,
            'description' => $request->description,
            'vehicle_type' => $request->vehicle_type,
            'vacancy_type' => $request->input('vacancy_type'),
            'prefill_driver_id' => $request->input('prefill_driver_id'),
            'stops' => $request->input('stops'),
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
            'driver_must_provide_vehicle' => $request->input('driver_must_provide_vehicle', false),
            'required_operatives' => $requiredCount,
            'payment_method' => $request->input('payment_method', 'direct_transfer'),
            'search_radius_km' => $request->input('search_radius_km', 50),
            'status' => $request->input('publish_now', false) ? 'published' : 'draft',
            'published_at' => $request->input('publish_now', false) ? now() : null,
        ];

        // Create Parent Job
        $job = TransportJob::create($jobData);

        // Cache location in Redis Geo
        try { \Illuminate\Support\Facades\Redis::geoadd('jobs:locations', $job->pickup_longitude, $job->pickup_latitude, $job->id); } catch (\Exception $e) {}
        $createdJobs = collect([$job]);

        // Create Child Jobs if bulk hiring
        if ($requiredCount > 1) {
            $childData = $jobData;
            $childData['parent_job_id'] = $job->id;
            
            for ($i = 1; $i < $requiredCount; $i++) {
                $createdJobs->push(TransportJob::create($childData));

            // Also add child job to Redis
            try { \Illuminate\Support\Facades\Redis::geoadd('jobs:locations', $childData['pickup_longitude'], $childData['pickup_latitude'], $createdJobs->last()->id); } catch (\Exception $e) {}
            }
        }

        // Broadcast to nearby drivers if published
        if ($request->input('publish_now', false)) {
            broadcast(new \App\Events\JobBroadcasted($job));

            // Find nearby drivers and broadcast
            $nearbyDrivers = $this->locationService->findDriversForJob(
                $job->pickup_latitude,
                $job->pickup_longitude,
                $job->search_radius_km
            );

            $driverIds = array_map(fn($d) => $d['driver']->id, $nearbyDrivers);

            if (!empty($driverIds)) {
                // Broadcast for the parent job which represents the contract pool
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

        // Broadcast job completed
        broadcast(new JobCompleted($job));

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
     * Invite a driver to a job
     */
    public function inviteDriver(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'driver_id' => 'required|exists:drivers,id',
        ]);

        $user = $request->user();
        $job = TransportJob::findOrFail($id);
        $driver = \App\Models\Driver::with('user')->findOrFail($request->driver_id);

        // Authorization
        if (!$user->isSuperAdmin() && (!$user->hirer || $user->hirer->id != $job->hirer_id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Check if job is published
        if ($job->status !== 'published') {
            return response()->json([
                'success' => false,
                'message' => 'Job must be published to invite drivers',
            ], 400);
        }

        // Check if driver already applied or invited
        $existingApplication = JobApplication::where('job_id', $job->id)
            ->where('driver_id', $driver->id)
            ->first();

        if ($existingApplication) {
            return response()->json([
                'success' => false,
                'message' => 'Driver already has an application or invitation for this job',
            ], 400);
        }

        // Create invitation (stored as a special job application)
        $application = JobApplication::create([
            'job_id' => $job->id,
            'driver_id' => $driver->id,
            'status' => 'pending',
            'metadata' => ['is_invitation' => true],
            'applied_at' => now(),
        ]);

        // Send real-time notification
        broadcast(new \App\Events\JobBroadcasted($job)); // Reuse for now or create JobInvited

        return response()->json([
            'success' => true,
            'data' => $application,
            'message' => 'Driver invited successfully',
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

    /**
     * Get a heatmap of active/published jobs to show drivers demand hotspots.
     */
    public function getJobHeatmap(Request $request): JsonResponse
    {
        // Get all published jobs
        $jobs = TransportJob::published()
            ->whereNotNull('pickup_latitude')
            ->whereNotNull('pickup_longitude')
            ->get(['id', 'pickup_latitude as lat', 'pickup_longitude as lng', 'amount', 'is_surge_pricing', 'surge_multiplier']);

        return response()->json([
            'success' => true,
            'data' => $jobs
        ]);
    }
    public function bulkStore(Request $request): JsonResponse
    {
        $request->validate([
            'jobs' => 'required|array',
            'jobs.*.pickup_location' => 'required|string',
            'jobs.*.dropoff_location' => 'required|string',
            'jobs.*.amount' => 'required|numeric',
        ]);

        $hirer = $request->user()->hirer;
        if (!$hirer) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $createdJobs = [];
        foreach ($request->jobs as $jobData) {
            $job = \App\Models\Job::create([
                'hirer_id' => $hirer->id,
                'title' => 'Bulk Dispatch: ' . $jobData['dropoff_location'],
                'pickup_location' => $jobData['pickup_location'],
                'dropoff_location' => $jobData['dropoff_location'],
                'amount' => $jobData['amount'],
                'status' => 'pending',
                'description' => 'Automatically dispatched via CSV Roster Upload.',
                'vehicle_type' => 'standard',
                'pickup_time' => now()->addHour(),
            ]);
            
                    // Lightning Dispatch Logic
        if ($request->is_lightning) {
            $job->amount = $job->amount * 2;
            $job->save();
            \Illuminate\Support\Facades\Log::info("LIGHTNING DISPATCH: Doubled payout for Job {$job->id}");
            // Send urgent push via Firebase to drivers within 5km...
        }
        // Push to Redis GeoHash
            if ($job->pickup_latitude && $job->pickup_longitude) {
                \Illuminate\Support\Facades\Redis::geoadd(
                    'jobs:locations',
                    $job->pickup_longitude,
                    $job->pickup_latitude,
                    $job->id
                );
            }

            broadcast(new \App\Events\JobBroadcasted($job));
            $createdJobs[] = $job;
        }

        return response()->json([
            'success' => true,
            'message' => count($createdJobs) . ' jobs dispatched successfully via Bulk Roster.',
            'jobs' => $createdJobs
        ]);
    }
    public function dispute(Request $request, \App\Models\Job $job): JsonResponse
    {
        $hirer = $request->user()->hirer;
        if (!$hirer || $job->hirer_id !== $hirer->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job->update([
            'status' => 'disputed'
        ]);

        // Freeze Escrow / Trigger Admin Alert
        \Illuminate\Support\Facades\Log::alert("JOB DISPUTED: Job ID {$job->id} frozen by Hirer {$hirer->id}");

        return response()->json([
            'success' => true,
            'message' => 'Job disputed. Escrow funds are now frozen pending Admin resolution.'
        ]);
    }
}

