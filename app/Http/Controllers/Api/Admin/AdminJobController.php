<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransportJob;
use App\Models\Dispute;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminJobController extends Controller
{
    public function index(Request $request)
    {
        // 1. Calculate Metrics
        $activeJobsCount = TransportJob::whereIn('status', ['assigned', 'in_progress'])->count();
        $completedMatches = TransportJob::where('status', 'completed')->count();
        $pendingApproval = TransportJob::where('status', 'published')->count();
        $activeDisputes = Dispute::whereIn('status', ['open', 'escalated'])->count();

        $metrics = [
            'activeJobs' => $activeJobsCount,
            'completedMatches' => $completedMatches,
            'pendingApproval' => $pendingApproval,
            'activeDisputes' => $activeDisputes
        ];

        // 2. Fetch Recent Contracts
        $recentJobs = TransportJob::with(['hirer.user', 'driver.user'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($job) {
                $status = 'pending';
                if (in_array($job->status, ['assigned', 'in_progress'])) $status = 'active';
                if ($job->status === 'completed') $status = 'completed';
                if ($job->status === 'cancelled') $status = 'cancelled';

                return [
                    'id' => 'CON-' . str_pad($job->id, 4, '0', STR_PAD_LEFT),
                    'employer' => $job->hirer && $job->hirer->user ? $job->hirer->user->name : 'Unknown Employer',
                    'operative' => $job->driver && $job->driver->user ? $job->driver->user->name : 'Unassigned',
                    'amount' => $job->currency . number_format($job->amount, 2),
                    'status' => $status,
                    'telemetry' => $job->driver && $job->driver->is_online ? 'Online' : 'Offline',
                    'duration' => $job->distance_km ? $job->distance_km . ' km' : 'N/A'
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'metrics' => $metrics,
                'charts' => [
                    'jobTrend' => $this->buildJobTrendData()
                ],
                'recentContracts' => $recentJobs
            ]
        ]);
    }

    protected function buildJobTrendData(): array
    {
        $trendData = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::now()->subDays($i);
            $start = $day->copy()->startOfDay();
            $end = $day->copy()->endOfDay();

            $trendData[] = [
                'name' => $day->format('D'),
                'matches' => TransportJob::whereBetween('created_at', [$start, $end])
                    ->where('status', 'completed')
                    ->count(),
                'active_contracts' => TransportJob::whereBetween('created_at', [$start, $end])
                    ->whereIn('status', ['assigned', 'in_progress'])
                    ->count()
            ];
        }

        return $trendData;
    }

    public function activeJobs(Request $request)
    {
        $query = TransportJob::with(['hirer.user', 'driver.user'])
            ->whereIn('status', ['assigned', 'in_progress']);

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                // Search by Job ID
                $q->where('id', 'like', "%{$search}%")
                  // Or Search by Employer Name
                  ->orWhereHas('hirer.user', function($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  })
                  // Or Search by Operative Name
                  ->orWhereHas('driver.user', function($q3) use ($search) {
                      $q3->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Status Filter
        if ($request->has('status') && $request->status !== 'all') {
            $statusFilter = $request->status;
            if ($statusFilter === 'agreed') {
                $query->where('status', 'assigned'); // Assuming assigned = agreed
            } else if ($statusFilter === 'live') {
                $query->where('status', 'in_progress');
            } else if ($statusFilter === 'en_route') {
                $query->where('status', 'en_route'); // Fallback if you have this state
            }
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate(10);

        $paginated->through(function ($job) {
            return [
                'id' => 'CON-' . str_pad($job->id, 4, '0', STR_PAD_LEFT),
                'employer' => $job->hirer && $job->hirer->user ? $job->hirer->user->name : 'Unknown',
                'operative' => $job->driver && $job->driver->user ? $job->driver->user->name : 'Unassigned',
                'agreedRate' => $job->currency . number_format($job->amount, 2),
                'duration' => 'Active',
                'startDate' => $job->created_at->format('Y-m-d'),
                'endDate' => 'Pending',
                'status' => $job->status === 'in_progress' ? 'live' : 'en_route',
                'telemetryStatus' => $job->driver && $job->driver->is_online ? 'Active' : 'Offline',
                'lastPing' => $job->driver && $job->driver->is_online ? 'Just now' : 'N/A',
                'location' => 'Tracking active'
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'contracts' => $paginated
            ]
        ]);
    }

    public function completedJobs(Request $request)
    {
        $query = TransportJob::with(['hirer.user', 'driver.user'])
            ->where('status', 'completed');

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                // Search by Job ID
                $q->where('id', 'like', "%{$search}%")
                  // Or Search by Employer Name
                  ->orWhereHas('hirer.user', function($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  })
                  // Or Search by Operative Name
                  ->orWhereHas('driver.user', function($q3) use ($search) {
                      $q3->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $paginated = $query->orderBy('updated_at', 'desc')->paginate(10);

        $paginated->through(function ($job) {
            return [
                'id' => 'CON-' . str_pad($job->id, 4, '0', STR_PAD_LEFT),
                'employer' => $job->hirer && $job->hirer->user ? $job->hirer->user->name : 'Unknown',
                'operative' => $job->driver && $job->driver->user ? $job->driver->user->name : 'Unassigned',
                'amountPaid' => $job->currency . number_format($job->amount, 2),
                'duration' => 'Completed',
                'completionDate' => $job->updated_at->format('Y-m-d'),
                'employerRating' => $job->hirer_id ? (float) Review::where('hirer_id', $job->hirer_id)->avg('score') : 0,
                'operativeRating' => $job->driver_id ? (float) Review::where('driver_id', $job->driver_id)->avg('score') : 0,
                'status' => 'Completed'
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'matches' => $paginated
            ]
        ]);
    }

    public function jobDisputes(Request $request)
    {
        $query = Dispute::with(['job.hirer.user', 'job.driver.user', 'initiator']);

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                // Search by Dispute ID or Job ID
                $q->where('id', 'like', "%{$search}%")
                  ->orWhere('transport_job_id', 'like', "%{$search}%")
                  // Or Search by Employer Name
                  ->orWhereHas('job.hirer.user', function($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  })
                  // Or Search by Operative Name
                  ->orWhereHas('job.driver.user', function($q3) use ($search) {
                      $q3->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate(10);

        $paginated->through(function ($dispute) {
            return [
                'id' => 'DSP-' . str_pad($dispute->id, 4, '0', STR_PAD_LEFT),
                'contractId' => 'CON-' . str_pad($dispute->transport_job_id, 4, '0', STR_PAD_LEFT),
                'employer' => $dispute->job && $dispute->job->hirer && $dispute->job->hirer->user ? $dispute->job->hirer->user->name : 'Unknown',
                'operative' => $dispute->job && $dispute->job->driver && $dispute->job->driver->user ? $dispute->job->driver->user->name : 'Unknown',
                'type' => ucfirst(str_replace('_', ' ', $dispute->reason)),
                'severity' => $dispute->status === 'escalated' ? 'Critical' : 'Medium',
                'status' => ucfirst($dispute->status),
                'dateReported' => $dispute->created_at->format('Y-m-d H:i'),
                'description' => $dispute->description,
                'agreedRate' => $dispute->job ? $dispute->job->currency . number_format($dispute->job->amount, 2) : 'N/A'
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'disputes' => $paginated
            ]
        ]);
    }
}
