<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use App\Services\DriverLocationService;
use App\Models\TransportJob;
use App\Models\Driver;
use App\Models\Hirer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class HeadlessApiController extends Controller implements HasMiddleware
{
    protected SubscriptionService $subscriptionService;
    protected DriverLocationService $locationService;

    public static function middleware(): array
    {
        return [
            new Middleware(function ($request, $next) {
                $user = $request->user();
                if (!$user) {
                    return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
                }
                $subscriptionService = app(SubscriptionService::class);
                $subscription = $subscriptionService->getActiveSubscription($user->id);

                if (!$subscription || $subscription->type !== 'enterprise_elite') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Headless API access requires Enterprise Elite subscription',
                    ], 403);
                }

                return $next($request);
            }),
        ];
    }

    public function __construct(
        SubscriptionService $subscriptionService,
        DriverLocationService $locationService
    ) {
        $this->subscriptionService = $subscriptionService;
        $this->locationService = $locationService;
    }

    /**
     * Create job programmatically
     */
    public function createJob(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'vehicle_type' => 'required|in:heavy_duty,light_truck,van,bus,tanker',
            'pickup_location' => 'required|string',
            'pickup_latitude' => 'required|numeric',
            'pickup_longitude' => 'required|numeric',
            'dropoff_location' => 'required|string',
            'dropoff_latitude' => 'required|numeric',
            'dropoff_longitude' => 'required|numeric',
            'pickup_time' => 'required|date',
            'estimated_delivery_time' => 'nullable|date',
            'distance_km' => 'nullable|numeric',
            'amount' => 'required|numeric|min:0',
            'job_type' => 'nullable|in:local,interstate',
            'required_certifications' => 'nullable|array',
            'search_radius_km' => 'nullable|integer|min:1|max:500',
            'external_reference' => 'nullable|string', // For ERP integration
        ]);

        $hirer = $request->user()->hirer;
        
        if (!$hirer) {
            return response()->json([
                'success' => false,
                'message' => 'Hirer profile not found',
            ], 404);
        }

        $job = TransportJob::create([
            'hirer_id' => $hirer->id,
            'title' => $request->title,
            'description' => $request->description,
            'vehicle_type' => $request->vehicle_type,
            'job_type' => $request->input('job_type', 'local'),
            'is_interstate' => $request->input('job_type') === 'interstate',
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
            'search_radius_km' => $request->input('search_radius_km', 50),
            'status' => 'published',
            'published_at' => now(),
            'metadata' => array_merge($request->only(['external_reference']), [
                'created_via' => 'headless_api',
                'api_version' => '1.0',
            ]),
        ]);

        return response()->json([
            'success' => true,
            'data' => $job,
            'message' => 'Job created successfully via headless API',
        ], 201);
    }

    /**
     * Bulk create jobs
     */
    public function bulkCreateJobs(Request $request): JsonResponse
    {
        $request->validate([
            'jobs' => 'required|array|max:50',
            'jobs.*.title' => 'required|string|max:255',
            'jobs.*.description' => 'required|string',
            'jobs.*.vehicle_type' => 'required|in:heavy_duty,light_truck,van,bus,tanker',
            'jobs.*.pickup_location' => 'required|string',
            'jobs.*.pickup_latitude' => 'required|numeric',
            'jobs.*.pickup_longitude' => 'required|numeric',
            'jobs.*.dropoff_location' => 'required|string',
            'jobs.*.dropoff_latitude' => 'required|numeric',
            'jobs.*.dropoff_longitude' => 'required|numeric',
            'jobs.*.pickup_time' => 'required|date',
            'jobs.*.amount' => 'required|numeric|min:0',
        ]);

        $hirer = $request->user()->hirer;
        $createdJobs = [];
        $failedJobs = [];

        DB::transaction(function () use ($request, $hirer, &$createdJobs, &$failedJobs) {
            foreach ($request->jobs as $index => $jobData) {
                try {
                    $job = TransportJob::create([
                        'hirer_id' => $hirer->id,
                        'title' => $jobData['title'],
                        'description' => $jobData['description'],
                        'vehicle_type' => $jobData['vehicle_type'],
                        'pickup_location' => $jobData['pickup_location'],
                        'pickup_latitude' => $jobData['pickup_latitude'],
                        'pickup_longitude' => $jobData['pickup_longitude'],
                        'dropoff_location' => $jobData['dropoff_location'],
                        'dropoff_latitude' => $jobData['dropoff_latitude'],
                        'dropoff_longitude' => $jobData['dropoff_longitude'],
                        'pickup_time' => $jobData['pickup_time'],
                        'estimated_delivery_time' => $jobData['estimated_delivery_time'] ?? null,
                        'distance_km' => $jobData['distance_km'] ?? null,
                        'amount' => $jobData['amount'],
                        'status' => 'published',
                        'published_at' => now(),
                        'metadata' => [
                            'created_via' => 'headless_api',
                            'bulk_index' => $index,
                            'external_reference' => $jobData['external_reference'] ?? null,
                        ],
                    ]);
                    $createdJobs[] = $job;
                } catch (\Exception $e) {
                    $failedJobs[] = [
                        'index' => $index,
                        'error' => $e->getMessage(),
                    ];
                }
            }
        });

        return response()->json([
            'success' => true,
            'data' => [
                'created' => count($createdJobs),
                'failed' => count($failedJobs),
                'jobs' => $createdJobs,
                'errors' => $failedJobs,
            ],
            'message' => "Bulk job creation completed: " . count($createdJobs) . " created, " . count($failedJobs) . " failed",
        ]);
    }

    /**
     * Get driver data for ERP integration
     */
    public function getDrivers(Request $request): JsonResponse
    {
        $request->validate([
            'vehicle_type' => 'nullable|in:heavy_duty,light_truck,van,bus,tanker',
            'certifications' => 'nullable|array',
            'min_rating' => 'nullable|numeric|min:0|max:5',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'radius_km' => 'nullable|integer|min:1|max:500',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $query = Driver::with('user')
            ->where('status', 'active')
            ->where('is_verified', true);

        // Vehicle type filter
        if ($request->has('vehicle_type')) {
            $query->where('vehicle_type', $request->vehicle_type);
        }

        // Rating filter
        if ($request->has('min_rating')) {
            $query->where('rating', '>=', $request->min_rating);
        }

        // Certification filter
        if ($request->has('certifications')) {
            foreach ($request->certifications as $cert) {
                $query->whereJsonContains('vehicle_certifications', $cert);
            }
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

        $drivers = $query->limit($request->input('limit', 50))->get();

        return response()->json([
            'success' => true,
            'data' => $drivers,
            'count' => $drivers->count(),
        ]);
    }

    /**
     * Get single driver with full details
     */
    public function getDriver(string $id): JsonResponse
    {
        $driver = Driver::with(['user', 'documents', 'wallet'])
            ->where('id', $id)
            ->where('status', 'active')
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
     * Get company jobs with ERP-friendly format
     */
    public function getJobs(Request $request): JsonResponse
    {
        $hirer = $request->user()->hirer;
        
        if (!$hirer) {
            return response()->json([
                'success' => false,
                'message' => 'Hirer profile not found',
            ], 404);
        }

        $request->validate([
            'status' => 'nullable|in:draft,published,assigned,in_progress,completed,cancelled,disputed',
            'job_type' => 'nullable|in:local,interstate',
            'external_reference' => 'nullable|string',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);

        $query = TransportJob::where('hirer_id', $hirer->id);

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Job type filter
        if ($request->has('job_type')) {
            $query->where('job_type', $request->job_type);
        }

        // External reference filter (for ERP sync)
        if ($request->has('external_reference')) {
            $query->where('metadata->external_reference', $request->external_reference);
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->where('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('created_at', '<=', $request->to_date);
        }

        $jobs = $query->with(['driver.user', 'applications'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $jobs,
        ]);
    }

    /**
     * Get job by external reference (ERP sync)
     */
    public function getJobByReference(string $reference): JsonResponse
    {
        $hirer = request()->user()->hirer;
        
        $job = TransportJob::where('hirer_id', $hirer->id)
            ->where('metadata->external_reference', $reference)
            ->with(['driver.user', 'applications'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $job,
        ]);
    }

    /**
     * Update job via API
     */
    public function updateJob(Request $request, string $id): JsonResponse
    {
        $hirer = $request->user()->hirer;
        
        $job = TransportJob::where('hirer_id', $hirer->id)
            ->where('id', $id)
            ->firstOrFail();

        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'pickup_time' => 'nullable|date',
            'amount' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:draft,published,cancelled',
        ]);

        $job->update($request->only(['title', 'description', 'pickup_time', 'amount', 'status']));

        return response()->json([
            'success' => true,
            'data' => $job,
            'message' => 'Job updated successfully',
        ]);
    }

    /**
     * Get real-time telemetry for dashboard
     */
    public function getTelemetry(): JsonResponse
    {
        $hirer = request()->user()->hirer;
        
        $telemetry = [
            'active_jobs' => TransportJob::where('hirer_id', $hirer->id)
                ->whereIn('status', ['assigned', 'in_progress'])
                ->count(),
            'pending_applications' => \App\Models\JobApplication::whereIn('job_id', 
                TransportJob::where('hirer_id', $hirer->id)->pluck('id')
            )->where('status', 'pending')->count(),
            'completed_jobs_month' => TransportJob::where('hirer_id', $hirer->id)
                ->where('status', 'completed')
                ->where('completed_at', '>=', now()->startOfMonth())
                ->count(),
            'total_spent_month' => TransportJob::where('hirer_id', $hirer->id)
                ->where('status', 'completed')
                ->where('completed_at', '>=', now()->startOfMonth())
                ->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $telemetry,
        ]);
    }

    /**
     * Webhook endpoint for ERP notifications
     */
    public function webhook(Request $request): JsonResponse
    {
        $request->validate([
            'event' => 'required|string',
            'data' => 'required|array',
        ]);

        // Process webhook events
        $event = $request->event;
        $data = $request->data;

        // Log webhook for audit
        \Log::info('Headless API webhook received', [
            'event' => $event,
            'data' => $data,
            'timestamp' => now(),
        ]);

        // Handle specific events
        switch ($event) {
            case 'job.completed':
                // Notify ERP system of job completion
                break;
            case 'driver.assigned':
                // Notify ERP system of driver assignment
                break;
            case 'payment.released':
                // Notify ERP system of payment release
                break;
        }

        return response()->json([
            'success' => true,
            'message' => 'Webhook processed successfully',
        ]);
    }
}

