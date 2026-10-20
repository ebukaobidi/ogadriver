<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Driver;
use App\Models\TransportJob;
use App\Models\Transaction;
use App\Models\Subscription;
use App\Models\DriverDocument;
use App\Services\CacheService;
use App\Services\DocumentNotificationService;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    protected CacheService $cacheService;
    protected DocumentNotificationService $notificationService;

    public function __construct(CacheService $cacheService, DocumentNotificationService $notificationService)
    {
        $this->cacheService = $cacheService;
        $this->notificationService = $notificationService;
    }

    public function overview(Request $request)
    {
        // Removed Cache Service to ensure real-time analytics
        
        // --- USER METRICS ---
        $totalUsers  = User::count();
        $activeUsers = User::where('is_active', true)->count();
        // Users who registered but haven't verified their phone yet
        $pendingUsers = User::whereNull('phone_verified_at')->count();

        // --- DRIVER METRICS ---
        $totalDrivers = Driver::count();
        $verifiedDrivers = Driver::where('is_verified', true)->count();
        $pendingDrivers = Driver::where('is_verified', false)->count();
        $blacklistedDrivers = Driver::where('status', 'blacklisted')->count();
            
        $driversLastMonth = Driver::where('created_at', '>=', Carbon::now()->subMonth())->count();
        $driversPreviousMonth = Driver::whereBetween('created_at', [Carbon::now()->subMonths(2)->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()])->count();
        $growthRate = $driversPreviousMonth > 0
            ? round((($driversLastMonth - $driversPreviousMonth) / $driversPreviousMonth) * 100, 1)
            : ($driversLastMonth > 0 ? 100 : 0);

        // --- MATCHMAKING & JOB METRICS ---
        $activeDeployments = TransportJob::whereIn('status', ['assigned', 'in_progress'])->count();
        $contractsAccepted = TransportJob::where('status', 'completed')->count() + $activeDeployments;
        $proposalsSent = \App\Models\JobApplication::count(); 
        $sosAlerts = TransportJob::where('status', 'cancelled')->count();
        
        $acceptanceRate = $proposalsSent > 0 ? round(($contractsAccepted / $proposalsSent) * 100, 1) : 0;

        // --- FINANCIAL METRICS ---
        // Sum of successful transactions (assuming type 'revenue' or 'payment' and status 'completed')
        $totalAccessFees = Transaction::where('status', 'completed')->sum('amount');
        
        // Count active subscription records in the system
        $basicOga = Subscription::where('type', 'driver_pro')->where('status', 'active')->count();
        $ogaPremium = Subscription::where('type', 'corporate')->where('status', 'active')->count();
        $enterpriseElite = Subscription::where('type', 'enterprise')->where('status', 'active')->count();
        
        // Since we removed escrow, platform revenue can be roughly calculated as sum of access fees 
        // + subscription revenue for the current month
        $platformRevenueMonth = Transaction::where('status', 'completed')
            ->where('category', 'subscription')
            ->where('created_at', '>=', Carbon::now()->startOfMonth())
            ->sum('amount');
            
        $subscriptionRevenue = Transaction::where('status', 'completed')
            ->where('category', 'subscription')
            ->sum('amount');

        // --- RECENT ACTIVITY ---
        // Gather recent jobs with eager loading
        $recentJobs = TransportJob::with(['driver.user', 'hirer.user'])
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($job) {
                return [
                    'id' => 'job_' . $job->id,
                    'type' => 'matchmaking',
                    'message' => 'New job created: ' . ($job->pickup_location ?? 'Contract ' . $job->id),
                    'time' => $job->created_at->diffForHumans(),
                    'status' => 'pending',
                    'created_at' => $job->created_at
                ];
            });

        // Gather recent drivers with eager loading
        $recentDrivers = Driver::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => 'dr_' . $driver->id,
                    'type' => 'driver',
                    'message' => 'New driver registered: ' . ($driver->user ? $driver->user->name : 'Unknown'),
                    'time' => $driver->created_at->diffForHumans(),
                    'status' => $driver->is_verified ? 'success' : 'pending',
                    'created_at' => $driver->created_at
                ];
            });

        // Gather recent transactions with eager loading
        $recentTransactions = Transaction::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get()
            ->map(function ($tx) {
                return [
                    'id' => 'tx_' . $tx->id,
                    'type' => 'payment',
                    'message' => 'Payment received: NGN ' . number_format($tx->amount),
                    'time' => $tx->created_at->diffForHumans(),
                    'status' => $tx->status === 'completed' ? 'success' : 'warning',
                    'created_at' => $tx->created_at
                ];
            });

        // Merge and sort
        $recentActivity = $recentJobs->concat($recentDrivers)->concat($recentTransactions)
            ->sortByDesc('created_at')
            ->take(8)
            ->values();

        // --- CHART DATA ---
        $revenueData = [];
        for ($i = 6; $i >= 0; $i--) {
            $period = Carbon::now()->subMonths($i);
            $periodStart = $period->copy()->startOfMonth();
            $periodEnd = $period->copy()->endOfMonth();

            $revenueData[] = [
                'month' => $period->format('M'),
                'access_fees' => Transaction::where('status', 'completed')
                    ->whereBetween('created_at', [$periodStart, $periodEnd])
                    ->sum('amount'),
                'subscriptions' => Subscription::where('status', 'active')
                    ->whereBetween('starts_at', [$periodStart, $periodEnd])
                    ->sum('amount'),
            ];
        }

        $deploymentData = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::now()->subDays($i);
            $dayStart = $day->copy()->startOfDay();
            $dayEnd = $day->copy()->endOfDay();

            $deploymentData[] = [
                'day' => $day->format('D'),
                'active' => TransportJob::whereIn('status', ['assigned', 'in_progress'])
                    ->whereBetween('created_at', [$dayStart, $dayEnd])
                    ->count(),
                'completed' => TransportJob::where('status', 'completed')
                    ->whereBetween('created_at', [$dayStart, $dayEnd])
                    ->count(),
            ];
        }

        return [
            'status' => 'success',
            'data' => [
                'telemetry' => [
                    'users' => [
                        'total'   => $totalUsers,
                        'active'  => $activeUsers,
                        'pending' => $pendingUsers,
                    ],
                    'drivers' => [
                        'total' => $totalDrivers,
                        'verified' => $verifiedDrivers,
                        'pending_verification' => $pendingDrivers,
                        'blacklisted' => $blacklistedDrivers,
                        'growth_rate' => $growthRate
                    ],
                    'matchmaking' => [
                        'proposals_sent' => $proposalsSent,
                        'contracts_accepted' => $contractsAccepted,
                        'active_deployments' => $activeDeployments,
                        'sos_alerts' => $sosAlerts,
                        'acceptance_rate' => $acceptanceRate
                    ],
                    'financials' => [
                        'total_access_fees' => $totalAccessFees,
                        'subscription_revenue' => $subscriptionRevenue,
                        'platform_revenue_month' => $platformRevenueMonth,
                        'revenue_growth' => $platformRevenueMonth > 0 ? round((($platformRevenueMonth - $totalAccessFees) / max($totalAccessFees, 1)) * 100, 1) : 0
                    ],
                    'system' => [
                        'uptime' => 99.9,
                        'active_telemetry_sessions' => $activeDeployments,
                    ]
                ],
                'recentActivity' => $recentActivity,
                'alerts' => array_values(array_filter([
                    $pendingDrivers > 0 ? [
                        'id' => 1,
                        'type' => 'warning',
                        'message' => $pendingDrivers . ' driver verifications pending manual review',
                        'time' => 'Just now'
                    ] : null,
                    $activeDeployments > 100 ? [
                        'id' => 2,
                        'type' => 'info',
                        'message' => $activeDeployments . ' active deployments are currently in-progress',
                        'time' => 'Just now'
                    ] : null
                ])),
                'notifications' => $this->notificationService->getAdminNotificationSummary(),
                'charts' => [
                    'revenueData' => $revenueData,
                    'deploymentData' => $deploymentData
                ]
            ]
        ];
    }

    /**
     * Regional Command Center for State Managers & Country Managers
     */
    public function regionalOverview(Request $request)
    {
        $user = $request->user();
        $stateId = $request->input('state_id', $user->state_id ?? 25); // Default to assigned state or Lagos (25)

        $state = \App\Models\State::find($stateId) ?: \App\Models\State::first();
        if (!$state) {
            return response()->json(['success' => false, 'message' => 'State not found'], 404);
        }

        // Driver Metrics in State
        $totalDrivers = Driver::where('state_id', $state->id)->count();
        $verifiedDrivers = Driver::where('state_id', $state->id)->where('is_verified', true)->count();
        $driversWithCar = Driver::where('state_id', $state->id)->where('is_verified', true)->where('has_vehicle', true)->count();
        $chauffeursForHire = Driver::where('state_id', $state->id)->where('is_verified', true)->count();
        $pendingDocumentsCount = DriverDocument::whereHas('driver', function($q) use ($state) {
            $q->where('state_id', $state->id);
        })->where('status', 'pending')->count();

        // Cities breakdown in State
        $cities = \App\Models\City::where('state_id', $state->id)->get()->map(function($city) {
            $rideCount = Driver::where('city_id', $city->id)->where('is_verified', true)->where('has_vehicle', true)->count();
            $hireCount = Driver::where('city_id', $city->id)->where('is_verified', true)->count();
            $loc = \App\Models\ActivatedLocation::where('state_id', $city->state_id)->where('city_id', $city->id)->first();

            return [
                'id' => $city->id,
                'name' => $city->name,
                'ride_driver_count' => $rideCount,
                'hire_driver_count' => $hireCount,
                'is_ride_active' => $loc ? (bool)$loc->is_ride_active : ($rideCount >= 10),
                'is_hire_active' => $loc ? (bool)$loc->is_hire_active : ($hireCount >= 10),
                'progress_ride_pct' => min(100, round(($rideCount / 10) * 100)),
                'progress_hire_pct' => min(100, round(($hireCount / 10) * 100)),
            ];
        });

        // Pending Document Approvals Queue in State
        $pendingDocuments = DriverDocument::with(['driver.user'])
            ->whereHas('driver', function($q) use ($state) {
                $q->where('state_id', $state->id);
            })
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'state' => [
                    'id' => $state->id,
                    'name' => $state->name,
                    'code' => $state->code ?? 'NG',
                ],
                'metrics' => [
                    'total_drivers' => $totalDrivers,
                    'verified_drivers' => $verifiedDrivers,
                    'drivers_with_car' => $driversWithCar,
                    'chauffeurs_for_hire' => $chauffeursForHire,
                    'pending_documents_count' => $pendingDocumentsCount,
                    'active_cities_count' => $cities->where('is_ride_active', true)->count(),
                ],
                'cities' => $cities,
                'pending_documents' => $pendingDocuments,
                'all_states' => \App\Models\State::all(['id', 'name', 'code']),
            ]
        ]);
    }

    /**
     * Smart search for admin dashboard
     */
    public function smartSearch(Request $request)
    {
        $query = $request->input('q', '');
        $type = $request->input('type', 'all');
        $limit = $request->input('limit', 10);

        if (empty($query)) {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'drivers' => [],
                    'users' => [],
                    'documents' => [],
                ]
            ]);
        }

        $results = [];

        // Search drivers
        if ($type === 'all' || $type === 'drivers') {
            $drivers = Driver::with('user')
                ->where(function ($q) use ($query) {
                    $q->where('license_number', 'like', "%{$query}%")
                        ->orWhereHas('user', function ($userQ) use ($query) {
                            $userQ->where('name', 'like', "%{$query}%")
                                ->orWhere('email', 'like', "%{$query}%")
                                ->orWhere('phone', 'like', "%{$query}%");
                        });
                })
                ->limit($limit)
                ->get()
                ->map(function ($driver) {
                    return [
                        'id' => $driver->id,
                        'type' => 'driver',
                        'name' => $driver->user->name ?? 'Unknown',
                        'email' => $driver->user->email ?? null,
                        'license_number' => $driver->license_number,
                        'is_verified' => $driver->is_verified,
                        'status' => $driver->status,
                        'url' => "/admin/drivers/{$driver->id}",
                    ];
                });
            $results['drivers'] = $drivers;
        }

        // Search users
        if ($type === 'all' || $type === 'users') {
            $users = User::where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->orWhere('phone', 'like', "%{$query}%")
                ->limit($limit)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'type' => 'user',
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role->name ?? 'user',
                        'url' => "/admin/users/{$user->id}",
                    ];
                });
            $results['users'] = $users;
        }

        // Search documents
        if ($type === 'all' || $type === 'documents') {
            $documents = DriverDocument::with('driver.user')
                ->where('document_number', 'like', "%{$query}%")
                ->orWhereHas('driver.user', function ($userQ) use ($query) {
                    $userQ->where('name', 'like', "%{$query}%");
                })
                ->limit($limit)
                ->get()
                ->map(function ($document) {
                    return [
                        'id' => $document->id,
                        'type' => 'document',
                        'document_type' => $document->document_type,
                        'document_number' => $document->document_number,
                        'status' => $document->status,
                        'driver_name' => $document->driver->user->name ?? 'Unknown',
                        'expiry_date' => $document->expiry_date?->format('Y-m-d'),
                        'url' => "/admin/documents/{$document->id}",
                    ];
                });
            $results['documents'] = $documents;
        }

        return response()->json([
            'status' => 'success',
            'data' => $results,
            'query' => $query,
            'total_results' => array_sum(array_map(fn($items) => count($items), $results)),
        ]);
    }

    public function advancedAnalytics(Request $request)
    {
        $range = $request->query('range', '30d');
        $startDate = match ($range) {
            '7d' => Carbon::now()->subDays(7),
            '90d' => Carbon::now()->subDays(90),
            '1y' => Carbon::now()->subYear(),
            default => Carbon::now()->subDays(30),
        };

        $totalMonthlyRevenue = Transaction::where('status', 'completed')
            ->whereBetween('created_at', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
            ->sum('amount');
        
        $priorMonthRevenue = Transaction::where('status', 'completed')
            ->whereBetween('created_at', [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()])
            ->sum('amount');
            
        $revenueGrowth = $priorMonthRevenue > 0 
            ? round((($totalMonthlyRevenue - $priorMonthRevenue) / $priorMonthRevenue) * 100, 1)
            : ($totalMonthlyRevenue > 0 ? 100 : 0);

        $activeSubscribers = Subscription::where('status', 'active')->count();
        $priorActiveSubscribers = Subscription::where('status', 'active')
            ->where('created_at', '<', Carbon::now()->startOfMonth())
            ->count();
            
        $subscribersGrowth = $priorActiveSubscribers > 0
            ? round((($activeSubscribers - $priorActiveSubscribers) / $priorActiveSubscribers) * 100, 1)
            : ($activeSubscribers > 0 ? 100 : 0);

        $activeDrivers = Driver::where('status', 'available')->count();
        $totalDrivers = max(Driver::count(), 1);
        $retentionRate = round(($activeDrivers / $totalDrivers) * 100, 1);

        $totalSubscriptions = max(Subscription::where('status', 'active')->count(), 1);
        $plans = [
            ['name' => 'Basic Operative', 'value' => round((Subscription::whereIn('type', ['driver_pro', 'oga_basic', 'Trial Operative'])->where('status', 'active')->count() / $totalSubscriptions) * 100, 1), 'color' => '#4ADE80'],
            ['name' => 'Corporate Access', 'value' => round((Subscription::whereIn('type', ['corporate', 'Standard Operative', 'oga_premium'])->where('status', 'active')->count() / $totalSubscriptions) * 100, 1), 'color' => '#3B82F6'],
            ['name' => 'Enterprise Elite', 'value' => round((Subscription::whereIn('type', ['enterprise', 'enterprise_elite', 'Elite Perimeter', 'Sovereign Fleet'])->where('status', 'active')->count() / $totalSubscriptions) * 100, 1), 'color' => '#A855F7'],
        ];

        // Group by state and count
        $locationStats = \App\Models\Driver::select('states.name as state', \Illuminate\Support\Facades\DB::raw('count(*) as total'))
            ->join('states', 'drivers.state_id', '=', 'states.id')
            ->whereNotNull('drivers.state_id')
            ->groupBy('states.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $locations = $locationStats->map(function ($loc) use ($totalDrivers) {
            return [
                'name' => $loc->state,
                'value' => round(($loc->total / $totalDrivers) * 100, 1),
                'drivers' => $loc->total
            ];
        })->toArray();

        if (empty($locations)) {
            $locations = [
                ['name' => 'No Data', 'value' => 0, 'drivers' => 0]
            ];
        }

        // Generate time series data
        $subscriptionRevenue = [];
        $driverAcquisition = [];
        $steps = $range === '7d' ? 7 : ($range === '90d' ? 12 : ($range === '1y' ? 12 : 30));

        for ($i = $steps - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i * ($range === '1y' ? 30 : ($range === '90d' ? 7 : 1)));
            $label = $range === '1y' || $range === '90d' ? $date->format('M Y') : $date->format('M d');
            
            $subRevenue = Transaction::where('status', 'completed')
                ->where('category', 'subscription')
                ->whereDate('created_at', $date->toDateString())
                ->sum('amount');

            // Count subscriptions by plan type activated on that day
            $basicCount = Subscription::whereIn('type', ['driver_pro', 'oga_basic', 'Trial Operative'])
                ->whereDate('created_at', $date->toDateString())
                ->sum('amount');

            $premiumCount = Subscription::whereIn('type', ['corporate', 'Standard Operative', 'oga_premium'])
                ->whereDate('created_at', $date->toDateString())
                ->sum('amount');

            $enterpriseCount = Subscription::whereIn('type', ['enterprise', 'enterprise_elite', 'Elite Perimeter', 'Sovereign Fleet'])
                ->whereDate('created_at', $date->toDateString())
                ->sum('amount');

            $newDrivers = Driver::whereDate('created_at', $date->toDateString())->count();
            $pendingDrivers = Driver::whereDate('created_at', $date->toDateString())->where('is_verified', false)->count();
            $rejectedDrivers = Driver::whereDate('created_at', $date->toDateString())->where('status', 'rejected')->count();

            $subscriptionRevenue[] = [
                'month' => $label,
                'basic' => (float)$basicCount,
                'premium' => (float)$premiumCount,
                'enterprise' => (float)$enterpriseCount,
            ];

            $driverAcquisition[] = [
                'month' => $label,
                'verified' => $newDrivers - $pendingDrivers - $rejectedDrivers,
                'pending' => $pendingDrivers,
                'rejected' => $rejectedDrivers
            ];
        }

        $basicRevenue = 0;
        $premiumRevenue = 0;
        try {
            $basicRevenue = Transaction::where('status', 'completed')
                ->where('category', 'subscription')
                ->whereHas('user.subscriptions', function ($q) {
                    $q->whereIn('type', ['driver_pro', 'oga_basic', 'Trial Operative']);
                })
                ->sum('amount');

            $premiumRevenue = Transaction::where('status', 'completed')
                ->where('category', 'subscription')
                ->whereHas('user.subscriptions', function ($q) {
                    $q->whereIn('type', ['corporate', 'Standard Operative', 'oga_premium', 'enterprise', 'enterprise_elite', 'Elite Perimeter', 'Sovereign Fleet']);
                })
                ->sum('amount');
        } catch (\Throwable $e) {
            \Log::warning('AdminDashboard subscription revenue query failed: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'subscription_revenue' => $subscriptionRevenue,
                'driver_acquisition' => $driverAcquisition,
                'subscription_distribution' => $plans,
                'location_distribution' => $locations,
                'metrics' => [
                    'monthly_revenue' => (float)$totalMonthlyRevenue,
                    'basic_revenue' => (float)$basicRevenue,
                    'premium_revenue' => (float)$premiumRevenue,
                    'revenue_growth' => (float)$revenueGrowth,
                    'active_subscribers' => (int)$activeSubscribers,
                    'subscribers_growth' => (float)$subscribersGrowth,
                    'driver_retention' => $retentionRate,
                    'mrr' => (float)$totalMonthlyRevenue
                ]
            ]
        ]);
    }

    public function systemHealth(Request $request)
    {
        // Mock data for system health until real monitoring is integrated
        // In a real production environment, this would query system metrics
        return response()->json([
            'success' => true,
            'data' => [
                'overall_status' => 'healthy',
                'status_message' => 'All systems are performing within optimal parameters.',
                'uptime' => 99.98,
                'cpu_usage' => rand(15, 45),
                'cpu_status' => 'healthy',
                'memory_usage' => rand(40, 65),
                'memory_status' => 'healthy',
                'disk_usage' => 28,
                'disk_status' => 'healthy',
                'network_latency' => rand(15, 35),
                'network_status' => 'healthy',
                'services' => [
                    ['name' => 'Web Server', 'status' => 'healthy', 'port' => 80],
                    ['name' => 'API Gateway', 'status' => 'healthy', 'port' => 443],
                    ['name' => 'Database Cluster', 'status' => 'healthy', 'port' => 3306],
                    ['name' => 'Redis Cache', 'status' => 'healthy', 'port' => 6379],
                    ['name' => 'Push Notification Service', 'status' => 'healthy'],
                    ['name' => 'AI Verification Engine', 'status' => 'healthy'],
                ],
                'database' => [
                    'status' => 'healthy',
                    'connections' => rand(10, 50),
                    'latency' => rand(2, 10),
                    'size' => '1.2 GB'
                ],
                'api' => [
                    'status' => 'healthy',
                    'response_time' => rand(100, 250),
                    'requests_per_min' => rand(500, 1200),
                    'error_rate' => 0.02
                ],
                'alerts' => [
                    [
                        'id' => 1,
                        'severity' => 'healthy',
                        'title' => 'System Backup Completed',
                        'message' => 'Daily automated database backup was successful.',
                        'timestamp' => now()->subHours(2)->toIso8601String()
                    ],
                    [
                        'id' => 2,
                        'severity' => 'warning',
                        'title' => 'High Traffic Detected',
                        'message' => 'Platform experiencing higher than normal concurrent users.',
                        'timestamp' => now()->subMinutes(15)->toIso8601String()
                    ]
                ]
            ]
        ]);
    }
}
