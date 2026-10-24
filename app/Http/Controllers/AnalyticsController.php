<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\TransportJob;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Get Analytics Overview for the Hirer
     */
    public function getOverview(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->hirer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $hirerId = $user->hirer->id;

        // Metrics
        $totalSpend = TransportJob::where('hirer_id', $hirerId)->where('status', 'completed')->sum('amount');
        $activeJobsCount = TransportJob::where('hirer_id', $hirerId)->active()->count();
        $completedJobsCount = TransportJob::where('hirer_id', $hirerId)->where('status', 'completed')->count();
        $disputesCount = TransportJob::where('hirer_id', $hirerId)->where('status', 'disputed')->count();

        // Monthly Spend for Chart
        $monthlySpend = TransportJob::where('hirer_id', $hirerId)
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6))
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_spend' => $totalSpend,
                'active_jobs' => $activeJobsCount,
                'completed_jobs' => $completedJobsCount,
                'disputes' => $disputesCount,
                'monthly_spend' => $monthlySpend
            ]
        ]);
    }

    /**
     * Export Payroll/Expense CSV
     */
    public function exportPayroll(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->hirer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $jobs = TransportJob::where('hirer_id', $user->hirer->id)
            ->whereIn('status', ['in_progress', 'completed'])
            ->with('driver.user')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="expense_report_' . date('Y_m_d') . '.csv"',
        ];

        $callback = function() use ($jobs) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Job ID', 'Job Title', 'Driver Name', 'Status', 'Amount', 'Date']);

            foreach ($jobs as $job) {
                fputcsv($file, [
                    $job->id,
                    $job->title,
                    $job->driver ? $job->driver->user->name : 'N/A',
                    $job->status,
                    $job->amount,
                    $job->created_at->format('Y-m-d')
                ]);
            }
            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
