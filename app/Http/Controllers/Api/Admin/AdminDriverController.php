<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminDriverController extends Controller
{
    protected CacheService $cacheService;

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    public function index(Request $request)
    {
        // Build cache key based on filters
        $cacheKey = 'admin_drivers_' . md5(json_encode($request->only(['search', 'status', 'page'])));
        
        // Only cache initial page without filters
        $shouldCache = (!$request->has('search') || empty($request->search)) && 
                       (!$request->has('status') || $request->status === 'all') &&
                       $request->input('page', 1) === 1;

        if ($shouldCache) {
            return $this->cacheService->rememberTags(['admin', 'drivers'], $cacheKey, 60, function () use ($request) {
                return $this->getDriversQuery($request);
            });
        }

        return $this->getDriversQuery($request);
    }

    private function getDriversQuery(Request $request)
    {
        $query = Driver::with(['user.activeSubscription', 'guarantors']);

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $status = $request->status;
            if ($status === 'active') {
                $query->where('is_verified', true)->where('status', 'active');
            } else {
                $query->where('status', $status);
            }
        }

        $paginatedDrivers = $query->orderBy('created_at', 'desc')->paginate(10);

        $paginatedDrivers->through(function ($driver) {
            return $this->mapDriverListItem($driver);
        });

        return response()->json([
            'status' => 'success',
            'data' => $paginatedDrivers
        ]);
    }

    private function mapDriverListItem(Driver $driver): array
    {
        // Map guarantor status
        $guarantorStatus = 'Pending';
        if ($driver->guarantors && $driver->guarantors->count() > 0) {
            $verifiedCount = $driver->guarantors->where('is_verified', true)->count();
            if ($verifiedCount > 0) {
                $guarantorStatus = 'Verified';
            } else {
                $guarantorStatus = 'Pending SMS';
            }
        }

        $subscription = $driver->user?->activeSubscription;
        $tier = $driver->resolvedSubscriptionTier();
        $subscriptionActive = $driver->hasActiveSubscription();

        // Map overall status (driver status vs user status)
        $status = $driver->status ?? 'pending';
        if ($driver->user && !$driver->user->is_active) {
            $status = 'inactive';
        }

        return [
            'id' => $driver->id,
            'name' => $driver->user ? $driver->user->name : 'Unknown',
            'email' => $driver->user ? $driver->user->email : 'Unknown',
            'phone' => $driver->user ? $driver->user->phone : 'Unknown',
            'avatar' => $driver->user && $driver->user->avatar
                ? (str_starts_with($driver->user->avatar, 'http') ? $driver->user->avatar : asset('storage/' . $driver->user->avatar))
                : null,
            'status' => $status,
            'clearanceLevel' => $driver->clearanceLevel(),
            'is_pro' => $driver->isPro(),
            'subscription' => [
                'plan' => $tier ?: 'None',
                'status' => $subscriptionActive ? 'active' : 'inactive',
                'expires_at' => $driver->subscription_expires_at
                    ? $driver->subscription_expires_at->toIso8601String()
                    : ($subscription?->ends_at?->toIso8601String()),
            ],
            'subscription_tier' => $tier,
            'rating' => $driver->rating ?? 0,
            'location' => 'Nigeria',
            'completedContracts' => $driver->total_jobs ?? 0,
            'guarantorStatus' => $guarantorStatus,
        ];
    }

    public function show($id)
    {
        $driver = Driver::with([
            'user.activeSubscription',
            'user.subscriptions' => function ($query) {
                $query->orderBy('ends_at', 'desc');
            },
            'guarantors',
            'documents',
            'jobs' => function ($query) {
                $query->orderBy('created_at', 'desc')->take(5);
            },
            'jobs.hirer.user',
            'state',
            'city',
        ])->findOrFail($id);

        $driverData = $driver->toArray();
        $subscription = $driver->user?->activeSubscription;
        $tier = $driver->resolvedSubscriptionTier();

        $driverData['clearanceLevel'] = $driver->clearanceLevel();
        $driverData['is_pro'] = $driver->isPro();
        $driverData['subscription_tier'] = $tier;
        $driverData['subscription'] = [
            'plan' => $tier ?: 'None',
            'status' => $driver->hasActiveSubscription() ? 'active' : 'inactive',
            'expires_at' => $driver->subscription_expires_at
                ? $driver->subscription_expires_at->toIso8601String()
                : ($subscription?->ends_at?->toIso8601String()),
            'amount' => $subscription?->amount,
            'type' => $subscription?->type,
        ];

        $completedJobs = $driver->jobs()->where('status', 'completed')->count();
        $totalJobs = $driver->jobs()->whereIn('status', ['completed', 'cancelled', 'assigned', 'in_progress'])->count();
        $cancelledJobs = $driver->jobs()->where('status', 'cancelled')->count();

        $driverData['performanceMetrics'] = [
            'acceptanceRate' => $totalJobs > 0 ? round((($totalJobs - $cancelledJobs) / $totalJobs) * 100, 1) : 0,
            'cancellationRate' => $totalJobs > 0 ? round(($cancelledJobs / $totalJobs) * 100, 1) : 0,
            'onTimeArrival' => $completedJobs > 0 ? round(min(100, 85 + ($driver->rating ?? 0) * 2), 1) : 0,
            'completedJobs' => $completedJobs,
            'totalJobs' => $totalJobs,
        ];
        
        $driverData['recentContracts'] = $driver->jobs->map(function ($job) {
            return [
                'id' => 'CON-' . str_pad($job->id, 4, '0', STR_PAD_LEFT),
                'employer' => $job->hirer && $job->hirer->user ? $job->hirer->user->name : 'Unknown',
                'date' => $job->created_at->format('Y-m-d'),
                'type' => 'Standard Transfer',
                'duration' => 'Completed',
                'status' => ucfirst($job->status)
            ];
        });

        $driverData['preferredLocations'] = $driver->preferred_locations ?? [];
        $driverData['employmentTypes'] = $driver->employment_types ?? [];
        $driverData['location_label'] = trim(collect([
            $driver->city?->name,
            $driver->state?->name,
            'Nigeria',
        ])->filter()->implode(', '));

        return response()->json([
            'status' => 'success',
            'data' => $driverData
        ]);
    }

    public function update(Request $request, $id)
    {
        $driver = Driver::findOrFail($id);
        
        $driver->update($request->only([
            'license_number',
            'license_class',
            'license_expiry',
            'years_of_experience',
            'preferred_route_type',
            'guarantor_a_status',
            'guarantor_b_status',
            'subscription_tier',
            'subscription_expires_at',
        ]));

        if ($request->has('gender') || $request->has('date_of_birth')) {
            $driver->user->update($request->only(['gender', 'date_of_birth']));
        }

        $this->cacheService->forgetTags(['admin', 'drivers']);

        return response()->json([
            'status' => 'success',
            'message' => 'Driver updated successfully',
            'data' => $driver->fresh(['user.activeSubscription'])
        ]);
    }

    public function performance(Request $request)
    {
        $performanceData = [
            'topPerformers' => [
                ['id' => 1, 'name' => 'David Martinez', 'rating' => 4.9, 'completedJobs' => 345, 'earnings' => 2890000, 'onTimeRate' => 98.5, 'acceptanceRate' => 95.2],
                ['id' => 2, 'name' => 'Daniel Rodriguez', 'rating' => 4.7, 'completedJobs' => 289, 'earnings' => 2345000, 'onTimeRate' => 96.8, 'acceptanceRate' => 92.1],
                ['id' => 3, 'name' => 'Joseph Lee', 'rating' => 4.6, 'completedJobs' => 267, 'earnings' => 2134000, 'onTimeRate' => 95.2, 'acceptanceRate' => 89.7]
            ],
            'needsImprovement' => [
                ['id' => 4, 'name' => 'James White', 'rating' => 2.1, 'completedJobs' => 45, 'earnings' => 234000, 'onTimeRate' => 72.3, 'acceptanceRate' => 65.4, 'issues' => ['Late deliveries', 'Customer complaints']]
            ],
            'metrics' => [
                'averageRating' => 4.5,
                'averageCompletionTime' => '2.5 hours',
                'averageResponseTime' => '8 minutes',
                'totalJobsCompleted' => 1567,
                'totalEarnings' => 12500000,
                'customerSatisfaction' => 94.2
            ],
            'trends' => [
                'ratingChange' => 2.3,
                'completionChange' => 12.5,
                'earningsChange' => 18.2,
                'satisfactionChange' => 3.1
            ]
        ];

        return response()->json([
            'status' => 'success',
            'data' => $performanceData
        ]);
    }

    public function verifications(Request $request)
    {
        // Build cache key based on page
        $cacheKey = 'admin_verifications_' . md5(json_encode($request->only(['page'])));
        
        // Only cache initial page
        $shouldCache = $request->input('page', 1) === 1;

        if ($shouldCache) {
            return $this->cacheService->rememberTags(['admin', 'verifications'], $cacheKey, 60, function () use ($request) {
                return $this->getVerificationsData($request);
            });
        }

        return $this->getVerificationsData($request);
    }

    private function getVerificationsData(Request $request)
    {
        // Drivers are pending verification when is_verified = false and they have at least one document
        $query = Driver::with(['user', 'documents', 'guarantors'])
            ->where('is_verified', false)
            ->whereHas('documents'); // Only show drivers who have submitted at least one doc

        $paginatedVerifications = $query->orderBy('created_at', 'desc')->paginate(10);

        // Cache stats separately with shorter TTL
        $statsCacheKey = 'admin_verification_stats';
        $stats = $this->cacheService->rememberTags(['admin', 'stats'], $statsCacheKey, 30, function () {
            return [
                'in_queue'           => Driver::where('is_verified', false)->whereHas('documents')->count(),
                'cleared_this_month' => Driver::where('is_verified', true)->whereMonth('updated_at', Carbon::now()->month)->count(),
                'blacklisted'        => Driver::where('status', 'blacklisted')->count()
            ];
        });

        $paginatedVerifications->through(function ($driver) {
            // Build real documents list with actual storage URLs
            $docs = [];
            foreach ($driver->documents as $doc) {
                $fileUrl = $doc->file_path
                    ? (str_starts_with($doc->file_path, 'http')
                        ? $doc->file_path
                        : asset('storage/' . $doc->file_path))
                    : null;

                $docs[] = [
                    'id'          => $doc->id,
                    'type'        => $doc->document_type,
                    'label'       => ucwords(str_replace('_', ' ', $doc->document_type)),
                    'status'      => $doc->status, // pending | approved | rejected
                    'url'         => $fileUrl,
                    'uploaded_at' => $doc->created_at?->format('Y-m-d'),
                    'rejection_reason' => $doc->rejection_reason,
                ];
            }

            // Build guarantors from the drivers table KYC columns (not the guarantors relation)
            $guarantors = [];
            if ($driver->guarantor_a_name) {
                $guarantors[] = [
                    'label'       => 'Guarantor A',
                    'name'        => $driver->guarantor_a_name,
                    'phone'       => $driver->guarantor_a_phone,
                    'address'     => $driver->guarantor_a_address,
                    'occupation'  => $driver->guarantor_a_occupation,
                    'company'     => $driver->guarantor_a_company,
                    'status'      => $driver->guarantor_a_status ?? 'pending',
                ];
            }
            if ($driver->guarantor_b_name) {
                $guarantors[] = [
                    'label'       => 'Guarantor B',
                    'name'        => $driver->guarantor_b_name,
                    'phone'       => $driver->guarantor_b_phone,
                    'address'     => $driver->guarantor_b_address,
                    'occupation'  => $driver->guarantor_b_occupation,
                    'company'     => $driver->guarantor_b_company,
                    'status'      => $driver->guarantor_b_status ?? 'pending',
                ];
            }

            // Avatar URL
            $avatarUrl = null;
            if ($driver->user && $driver->user->avatar) {
                $avatarUrl = str_starts_with($driver->user->avatar, 'http')
                    ? $driver->user->avatar
                    : asset('storage/' . $driver->user->avatar);
            }

            return [
                'id'          => $driver->id,
                'name'        => $driver->user?->name ?? 'Unknown',
                'email'       => $driver->user?->email ?? 'N/A',
                'phone'       => $driver->user?->phone ?? 'N/A',
                'avatar'      => $avatarUrl,
                'nin'         => $driver->nin,
                'bvn'         => $driver->bvn,
                'residence_address' => $driver->residence_address,
                'license_number'    => $driver->license_number,
                'license_class'     => $driver->license_class,
                'years_of_experience' => $driver->years_of_experience,
                'location'    => 'Nigeria',
                'submitted'   => $driver->created_at->format('Y-m-d'),
                'documents'   => $docs,
                'guarantors'  => $guarantors,
                'notes'       => 'Awaiting admin review',
                'guarantor_a_status' => $driver->guarantor_a_status,
                'guarantor_b_status' => $driver->guarantor_b_status,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => [
                'pendingVerifications' => $paginatedVerifications,
                'stats'                => $stats
            ]
        ]);
    }

    public function approveVerification($id)
    {
        $driver = Driver::findOrFail($id);
        $driver->is_verified = true;
        $driver->status = 'active';
        $driver->save();

        $this->cacheService->forgetTags(['admin', 'verifications', 'stats', 'drivers']);

        return response()->json([
            'status' => 'success',
            'message' => 'Driver approved'
        ]);
    }

    public function rejectVerification($id)
    {
        $driver = Driver::findOrFail($id);
        $driver->status = 'rejected';
        $driver->save();

        $this->cacheService->forgetTags(['admin', 'verifications', 'stats', 'drivers']);

        return response()->json([
            'status' => 'success',
            'message' => 'Driver rejected'
        ]);
    }

    /**
     * Approve a single uploaded document
     */
    public function approveDocument(Request $request, $driverId, $documentId)
    {
        $driver   = Driver::findOrFail($driverId);
        $document = $driver->documents()->findOrFail($documentId);

        $adminId = auth()->id();
        $document->approve($adminId);

        // Auto-update guarantor status when guarantor form is approved
        if ($document->document_type === 'guarantor_form_a') {
            $driver->update(['guarantor_a_status' => 'verified']);
        } elseif ($document->document_type === 'guarantor_form_b') {
            $driver->update(['guarantor_b_status' => 'verified']);
        }

        $this->cacheService->forgetTags(['admin', 'verifications', 'stats']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Document approved',
        ]);
    }

    /**
     * Reject a single uploaded document
     */
    public function rejectDocument(Request $request, $driverId, $documentId)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $driver   = Driver::findOrFail($driverId);
        $document = $driver->documents()->findOrFail($documentId);

        $adminId = auth()->id();
        $document->reject($request->input('reason', 'Rejected by admin'), $adminId);

        // Revert guarantor status if the form is rejected
        if ($document->document_type === 'guarantor_form_a') {
            $driver->update(['guarantor_a_status' => 'failed']);
        } elseif ($document->document_type === 'guarantor_form_b') {
            $driver->update(['guarantor_b_status' => 'failed']);
        }

        $this->cacheService->forgetTags(['admin', 'verifications', 'stats']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Document rejected',
        ]);
    }
}
