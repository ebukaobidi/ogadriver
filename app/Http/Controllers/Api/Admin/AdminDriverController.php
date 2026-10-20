<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
                ? (str_starts_with($driver->user->avatar, 'http') ? $driver->user->avatar : Storage::disk('public')->url($driver->user->avatar))
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
        
        $totalEarnings = \App\Models\Transaction::whereHas('wallet', function($q) use ($driver) {
            $q->where('user_id', $driver->user_id);
        })->where('type', 'credit')->sum('amount');

        $driverData['totalEarnings'] = '₦' . number_format($totalEarnings, 0);

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
        $topPerformers = Driver::with('user')
            ->orderByDesc('rating')
            ->orderByDesc('total_jobs')
            ->limit(3)
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => $driver->id,
                    'name' => $driver->user->name ?? 'Unknown',
                    'rating' => (float)$driver->rating,
                    'completedJobs' => (int)$driver->total_jobs,
                    'earnings' => (float)Transaction::where('wallet_id', $driver->user->wallet->id ?? 0)->where('status', 'completed')->sum('amount'),
                    'onTimeRate' => round(min(100, 85 + ($driver->rating ?? 0) * 2), 1),
                    'acceptanceRate' => $driver->total_jobs > 0 ? round((($driver->total_jobs - $driver->cancelled_jobs ?? 0) / $driver->total_jobs) * 100, 1) : 0
                ];
            });

        $needsImprovement = Driver::with('user')
            ->where('rating', '<', 3.5)
            ->where('rating', '>', 0)
            ->orderBy('rating')
            ->limit(3)
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => $driver->id,
                    'name' => $driver->user->name ?? 'Unknown',
                    'rating' => (float)$driver->rating,
                    'completedJobs' => (int)$driver->total_jobs,
                    'earnings' => (float)Transaction::where('wallet_id', $driver->user->wallet->id ?? 0)->where('status', 'completed')->sum('amount'),
                    'onTimeRate' => round(min(100, 85 + ($driver->rating ?? 0) * 2), 1),
                    'acceptanceRate' => $driver->total_jobs > 0 ? round((($driver->total_jobs - $driver->cancelled_jobs ?? 0) / $driver->total_jobs) * 100, 1) : 0,
                    'issues' => ['Low rating']
                ];
            });

        $avgRating = round(Driver::where('rating', '>', 0)->avg('rating') ?? 0, 1);
        $totalJobs = (int)Driver::sum('total_jobs');
        $totalPayouts = (float)Transaction::where('category', 'job_payment')->where('type', 'credit')->where('status', 'completed')->sum('amount');

        $performanceData = [
            'topPerformers' => $topPerformers,
            'needsImprovement' => $needsImprovement,
            'metrics' => [
                'averageRating' => $avgRating,
                'averageCompletionTime' => '2h 15m', // Assuming placeholder, no DB field yet
                'averageResponseTime' => '10m', // Assuming placeholder, no DB field yet
                'totalJobsCompleted' => $totalJobs,
                'totalEarnings' => $totalPayouts,
                'customerSatisfaction' => $avgRating > 0 ? round(($avgRating / 5) * 100, 1) : 0.0
            ],
            'trends' => [
                'ratingChange' => 0.0,
                'completionChange' => 0.0,
                'earningsChange' => 0.0,
                'satisfactionChange' => 0.0
            ]
        ];

        return response()->json([
            'status' => 'success',
            'data' => $performanceData
        ]);
    }

    public function verifications(Request $request)
    {
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
            // 1. Build real documents list with actual storage URLs
            $docs = [];
            foreach ($driver->documents as $doc) {
                $fileUrl = $doc->file_path
                    ? (str_starts_with($doc->file_path, 'http')
                        ? $doc->file_path
                        : \Storage::disk('public')->url($doc->file_path))
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

            // 2. Ensure guarantor records exist for AI verification
            if ($driver->guarantors->count() === 0) {
                if ($driver->guarantor_a_name) {
                    \App\Models\Guarantor::create([
                        'driver_id' => $driver->id,
                        'full_name' => $driver->guarantor_a_name,
                        'phone_number' => $driver->guarantor_a_phone ?? 'N/A',
                        'email' => $driver->user?->email ?? 'N/A',
                        'employment_type' => 'business_owner', // default
                        'employment_details' => $driver->guarantor_a_address,
                        'id_number' => 'Legacy',
                        'is_verified' => $driver->guarantor_a_status === 'verified',
                    ]);
                }
                if ($driver->guarantor_b_name) {
                    \App\Models\Guarantor::create([
                        'driver_id' => $driver->id,
                        'full_name' => $driver->guarantor_b_name,
                        'phone_number' => $driver->guarantor_b_phone ?? 'N/A',
                        'email' => $driver->user?->email ?? 'N/A',
                        'employment_type' => 'business_owner', // default
                        'employment_details' => $driver->guarantor_b_address,
                        'id_number' => 'Legacy',
                        'is_verified' => $driver->guarantor_b_status === 'verified',
                    ]);
                }
                $driver->load('guarantors');
            }

            // 3. Build guarantors list for frontend
            $guarantors = $driver->guarantors->map(function($g, $index) {
                return [
                    'id'          => $g->id,
                    'label'       => 'Guarantor ' . (chr(65 + $index)),
                    'name'        => $g->full_name,
                    'phone'       => $g->phone_number,
                    'address'     => $g->employment_details,
                    'occupation'  => $g->employment_type,
                    'company'     => $g->employment_details,
                    'status'      => $g->is_verified ? 'verified' : 'pending',
                ];
            });

            // 4. Avatar URL
            $avatarUrl = null;
            if ($driver->user && $driver->user->avatar) {
                $avatarUrl = str_starts_with($driver->user->avatar, 'http')
                    ? $driver->user->avatar
                    : Storage::disk('public')->url($driver->user->avatar);
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
                'has_vehicle' => (bool) ($driver->has_vehicle ?? false),
                'driver_status' => ($driver->has_vehicle ?? false) ? 'with_car' : 'no_car',
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
        // Award referral reward if applicable
        if ($driver->user && $driver->user->referred_by_user_id) {
            $referrer = \App\Models\User::find($driver->user->referred_by_user_id);
            if ($referrer) {
                // Move pending reward to balance
                $pending = $referrer->referral_pending_balance ?? 0;
                if ($pending >= 1000) {
                    $referrer->referral_pending_balance = $pending - 1000;
                    $referrer->referral_balance = ($referrer->referral_balance ?? 0) + 1000;
                    $referrer->referral_rewarded = ($referrer->referral_rewarded ?? 0) + 1000;
                    $referrer->save();
                }
            }
        }

        try {
            if ($driver->user) {
                $driver->user->notify(new \App\Notifications\SystemAlertNotification(
                    "Account Verified",
                    "Your driver profile has been approved by our security admin. You are now active in the directory.",
                    "system"
                ));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Verification approval notification failed: ' . $e->getMessage());
        }

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

        try {
            if ($driver->user) {
                $driver->user->notify(new \App\Notifications\SystemAlertNotification(
                    "Verification Rejected",
                    "Your profile verification was rejected. Please review your compliance files.",
                    "system"
                ));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Verification rejection notification failed: ' . $e->getMessage());
        }

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

    /**
     * Send missing documents reminder to driver
     */
    public function remindMissingDocuments($id)
    {
        $driver = Driver::with(['user', 'documents'])->findOrFail($id);
        
        // Compute missing documents
        $submittedDocTypes = $driver->documents->pluck('document_type')->toArray();
        
        $hasVehicle = (bool) ($driver->has_vehicle ?? false);
        $expectedDocs = [
            ['name' => "FRSC Driver's License", 'type' => 'drivers_license', 'required' => true],
            ['name' => 'National Identity (NIN / Voter / Int\'l Passport)', 'type' => 'identity_card', 'required' => true],
        ];

        if (!$hasVehicle) {
            // Drivers without car require Guarantor Forms for vehicle placement
            $expectedDocs[] = ['name' => 'Guarantor Form A', 'type' => 'guarantor_form_a', 'required' => true];
            $expectedDocs[] = ['name' => 'Guarantor Form B', 'type' => 'guarantor_form_b', 'required' => true];
        } else {
            // Drivers with car operate their own vehicle
            $expectedDocs[] = ['name' => 'Vehicle Registration', 'type' => 'vehicle_registration', 'required' => true];
        }

        $expectedDocs[] = ['name' => 'Police Clearance', 'type' => 'police_clearance', 'required' => false];
        $expectedDocs[] = ['name' => 'LASDRI Card', 'type' => 'lasdri_card', 'required' => false];

        $missing = [];
        foreach ($expectedDocs as $doc) {
            if (!in_array($doc['type'], $submittedDocTypes)) {
                $missing[] = $doc;
            }
        }

        if (empty($missing)) {
            return response()->json([
                'status' => 'info',
                'message' => 'Driver has submitted all expected documents.'
            ]);
        }

        // Notify user via Email and Database Notification
        if ($driver->user) {
            $driver->user->notify(new \App\Notifications\MissingDocumentsReminder($driver, $missing));

            // Also dispatch SMS
            if ($driver->user->phone) {
                $smsService = new \App\Services\NotificationService();
                $missingNames = implode(', ', array_slice(array_column($missing, 'name'), 0, 2));
                $smsService->send($driver->user->phone, "OgaDriver Notice: You have incomplete verification documents ({$missingNames}). Please upload them on your portal to complete approval.", 'sms');
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Missing documents reminder dispatched successfully to operative.',
            'missing_documents' => $missing,
        ]);
    }

    /**
     * Get driver location history
     */
    public function locationHistory($id)
    {
        $driver = Driver::findOrFail($id);
        
        $locations = $driver->locations()
            ->orderBy('recorded_at', 'desc')
            ->limit(100)
            ->get()
            ->map(function($loc) {
                return [
                    'timestamp' => $loc->recorded_at->toIso8601String(),
                    'lat' => $loc->latitude,
                    'lng' => $loc->longitude,
                    'accuracy' => $loc->accuracy,
                    'activity' => $loc->status
                ];
            });
            
        return response()->json([
            'success' => true,
            'location_history' => $locations,
            'patterns' => [
                'home_location' => [
                    'lat' => (float)$driver->current_latitude, 
                    'lng' => (float)$driver->current_longitude
                ],
                'frequent_areas' => [
                    [
                        'lat' => (float)$driver->current_latitude, 
                        'lng' => (float)$driver->current_longitude, 
                        'frequency' => 'high'
                    ]
                ]
            ]
        ]);
    }
}
