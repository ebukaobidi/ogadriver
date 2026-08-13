<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Driver;
use App\Models\TransportJob;
use App\Models\Transaction;
use App\Models\Subscription;
use App\Services\CacheService;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    protected CacheService $cacheService;

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    public function overview(Request $request)
    {
        // Check cache first
        return $this->cacheService->rememberTags(['admin', 'dashboard'], 'admin_dashboard_overview', function () {
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
            $proposalsSent = TransportJob::count(); // Just an approximation of total jobs
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
                        $pendingDrivers > 50 ? [
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
                    'charts' => [
                        'revenueData' => $revenueData,
                        'deploymentData' => $deploymentData
                    ]
                ]
            ];
        }, 300);
    }
}
