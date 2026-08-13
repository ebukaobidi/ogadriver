<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\TransportJob;
use App\Models\Hirer;
use App\Models\Wallet;
use App\Models\Subscription;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class TelemetryService
{
    /**
     * Get comprehensive system telemetry data
     */
    public function getSystemTelemetry(): array
    {
        return [
            'timestamp' => now()->toIso8601String(),
            'drivers' => $this->getDriverMetrics(),
            'jobs' => $this->getJobMetrics(),
            'hirers' => $this->getHirerMetrics(),
            'financials' => $this->getFinancialMetrics(),
            'subscriptions' => $this->getSubscriptionMetrics(),
            'geospatial' => $this->getGeospatialMetrics(),
            'compliance' => $this->getComplianceMetrics(),
        ];
    }

    /**
     * Get driver-related metrics
     */
    protected function getDriverMetrics(): array
    {
        return [
            'total' => Driver::count(),
            'active' => Driver::where('status', 'active')->count(),
            'verified' => Driver::where('is_verified', true)->count(),
            'online' => Driver::where('is_online', true)->count(),
            'pro_subscribers' => Driver::whereHas('user', function ($query) {
                $query->whereHas('activeSubscription', function ($subQuery) {
                    $subQuery->where('type', 'driver_pro');
                });
            })->count(),
            'average_rating' => round(Driver::where('status', 'active')->avg('rating'), 2),
            'total_jobs_completed' => Driver::sum('total_jobs'),
            'certification_breakdown' => $this->getCertificationBreakdown(),
        ];
    }

    /**
     * Get job-related metrics
     */
    protected function getJobMetrics(): array
    {
        $now = now();
        $today = $now->startOfDay();
        $thisMonth = $now->startOfMonth();

        return [
            'total' => TransportJob::count(),
            'published' => TransportJob::where('status', 'published')->count(),
            'assigned' => TransportJob::where('status', 'assigned')->count(),
            'in_progress' => TransportJob::where('status', 'in_progress')->count(),
            'completed' => TransportJob::where('status', 'completed')->count(),
            'cancelled' => TransportJob::where('status', 'cancelled')->count(),
            'today' => [
                'created' => TransportJob::where('created_at', '>=', $today)->count(),
                'completed' => TransportJob::where('completed_at', '>=', $today)->count(),
            ],
            'this_month' => [
                'created' => TransportJob::where('created_at', '>=', $thisMonth)->count(),
                'completed' => TransportJob::where('completed_at', '>=', $thisMonth)->count(),
                'revenue' => TransportJob::where('completed_at', '>=', $thisMonth)->sum('amount'),
            ],
            'average_completion_time' => $this->getAverageCompletionTime(),
            'vehicle_type_breakdown' => $this->getVehicleTypeBreakdown(),
        ];
    }

    /**
     * Get hirer-related metrics
     */
    protected function getHirerMetrics(): array
    {
        return [
            'total' => Hirer::count(),
            'active' => Hirer::whereHas('user', function ($query) {
                $query->where('is_active', true);
            })->count(),
            'corporate' => Hirer::where('subscription_tier', 'corporate')->count(),
            'enterprise' => Hirer::where('subscription_tier', 'enterprise')->count(),
            'free' => Hirer::where('subscription_tier', 'free')->count(),
            'with_api_access' => Hirer::where('has_api_access', true)->count(),
            'average_concurrent_contracts' => round(Hirer::avg('max_concurrent_contracts'), 1),
        ];
    }

    /**
     * Get financial metrics
     */
    protected function getFinancialMetrics(): array
    {
        return [
            'total_wallet_balance' => Wallet::sum('balance'),
            'total_escrow_balance' => Wallet::sum('escrow_balance'),
            'total_available_balance' => Wallet::sum('available_balance'),
            'transaction_volume_today' => DB::table('transactions')
                ->where('created_at', '>=', now()->startOfDay())
                ->sum('amount'),
            'transaction_volume_month' => DB::table('transactions')
                ->where('created_at', '>=', now()->startOfMonth())
                ->sum('amount'),
            'platform_revenue_month' => DB::table('transactions')
                ->where('category', 'commission')
                ->where('created_at', '>=', now()->startOfMonth())
                ->sum('amount'),
        ];
    }

    /**
     * Get subscription metrics
     */
    protected function getSubscriptionMetrics(): array
    {
        return [
            'total_active' => Subscription::where('status', 'active')->count(),
            'driver_pro' => Subscription::where('type', 'driver_pro')->where('status', 'active')->count(),
            'corporate' => Subscription::where('type', 'corporate')->where('status', 'active')->count(),
            'enterprise' => Subscription::where('type', 'enterprise')->where('status', 'active')->count(),
            'expiring_soon' => Subscription::where('status', 'active')
                ->where('ends_at', '<=', now()->addDays(7))
                ->count(),
            'monthly_revenue' => Subscription::where('status', 'active')
                ->where('ends_at', '>', now())
                ->sum('amount'),
        ];
    }

    /**
     * Get geospatial metrics
     */
    protected function getGeospatialMetrics(): array
    {
        // Get driver distribution by region (simplified)
        $driversByRegion = Driver::where('is_online', true)
            ->selectRaw('
                CASE 
                    WHEN current_latitude >= 4 AND current_latitude <= 14 THEN "Nigeria"
                    ELSE "Other"
                END as region,
                COUNT(*) as count
            ')
            ->groupBy('region')
            ->pluck('count', 'region')
            ->toArray();

        return [
            'online_drivers' => Driver::where('is_online', true)->count(),
            'drivers_by_region' => $driversByRegion,
            'average_search_radius' => round(TransportJob::avg('search_radius_km'), 1),
            'total_distance_covered' => round(TransportJob::sum('distance_km'), 1),
        ];
    }

    /**
     * Get compliance metrics
     */
    protected function getComplianceMetrics(): array
    {
        return [
            'pending_documents' => DB::table('driver_documents')
                ->where('status', 'pending')
                ->count(),
            'approved_documents' => DB::table('driver_documents')
                ->where('status', 'approved')
                ->count(),
            'rejected_documents' => DB::table('driver_documents')
                ->where('status', 'rejected')
                ->count(),
            'expiring_soon_documents' => DB::table('driver_documents')
                ->where('status', 'approved')
                ->where('expiry_date', '<=', now()->addDays(30))
                ->count(),
            'expired_documents' => DB::table('driver_documents')
                ->where('expiry_date', '<', now())
                ->count(),
            'open_disputes' => DB::table('disputes')
                ->whereIn('status', ['open', 'under_review'])
                ->count(),
        ];
    }

    /**
     * Get certification breakdown
     */
    protected function getCertificationBreakdown(): array
    {
        $certifications = [];
        $drivers = Driver::whereNotNull('vehicle_certifications')->get();

        foreach ($drivers as $driver) {
            $driverCerts = $driver->vehicle_certifications ?? [];
            foreach ($driverCerts as $cert) {
                $certifications[$cert] = ($certifications[$cert] ?? 0) + 1;
            }
        }

        return $certifications;
    }

    /**
     * Get vehicle type breakdown
     */
    protected function getVehicleTypeBreakdown(): array
    {
        return TransportJob::selectRaw('vehicle_type, COUNT(*) as count')
            ->groupBy('vehicle_type')
            ->pluck('count', 'vehicle_type')
            ->toArray();
    }

    /**
     * Get average job completion time in hours
     */
    protected function getAverageCompletionTime(): float
    {
        $completedJobs = TransportJob::where('status', 'completed')
            ->whereNotNull('started_at')
            ->whereNotNull('completed_at')
            ->get();

        if ($completedJobs->isEmpty()) {
            return 0;
        }

        $totalHours = $completedJobs->sum(function ($job) {
            return $job->started_at->diffInHours($job->completed_at);
        });

        return round($totalHours / $completedJobs->count(), 2);
    }

    /**
     * Get real-time metrics (cached for performance)
     */
    public function getRealtimeMetrics(): array
    {
        return Cache::remember('telemetry:realtime', 60, function () {
            return [
                'online_drivers' => Driver::where('is_online', true)->count(),
                'active_jobs' => TransportJob::whereIn('status', ['assigned', 'in_progress'])->count(),
                'pending_applications' => DB::table('job_applications')->where('status', 'pending')->count(),
                'recent_transactions' => DB::table('transactions')
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(),
            ];
        });
    }

    /**
     * Get historical metrics for charts
     */
    public function getHistoricalMetrics(string $period = '7days'): array
    {
        $startDate = match($period) {
            '24hours' => now()->subHours(24),
            '7days' => now()->subDays(7),
            '30days' => now()->subDays(30),
            '90days' => now()->subDays(90),
            default => now()->subDays(7),
        };

        return [
            'jobs_created' => $this->getMetricOverTime('transport_jobs', 'created_at', $startDate),
            'jobs_completed' => $this->getMetricOverTime('transport_jobs', 'completed_at', $startDate),
            'revenue' => $this->getRevenueOverTime($startDate),
            'new_drivers' => $this->getMetricOverTime('drivers', 'created_at', $startDate),
        ];
    }

    /**
     * Get metric count over time
     */
    protected function getMetricOverTime(string $table, string $dateColumn, \Carbon\Carbon $startDate): array
    {
        return DB::table($table)
            ->selectRaw("DATE({$dateColumn}) as date, COUNT(*) as count")
            ->where($dateColumn, '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->toArray();
    }

    /**
     * Get revenue over time
     */
    protected function getRevenueOverTime(\Carbon\Carbon $startDate): array
    {
        return DB::table('transactions')
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->where('created_at', '>=', $startDate)
            ->where('category', '!=', 'refund')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('total', 'date')
            ->toArray();
    }
}
