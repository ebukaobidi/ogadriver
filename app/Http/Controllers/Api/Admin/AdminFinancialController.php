<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransportJob;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;

class AdminFinancialController extends Controller
{
    public function index(Request $request)
    {
        $completed = Transaction::where('status', 'completed');
        $totalRevenue = (clone $completed)->where('type', 'debit')->whereIn('category', ['subscription', 'commission'])->sum('amount')
            ?: (clone $completed)->where('category', 'subscription')->sum('amount');

        $subscriptionRevenue = Transaction::where('status', 'completed')->where('category', 'subscription')->sum('amount') ?? 0;
        $commissionRevenue = Transaction::where('status', 'completed')->where('category', 'commission')->sum('amount') ?? 0;
        $platformFees = $subscriptionRevenue + $commissionRevenue;
        $driverPayouts = Transaction::where('status', 'completed')->where('category', 'job_payment')->where('type', 'credit')->sum('amount') ?? 0;
        $escrowBalance = 0;
        $pendingPayouts = Transaction::where('status', 'pending')->where('type', 'payout')->sum('amount') ?? 0;

        $overview = [
            'totalRevenue' => (float) $totalRevenue,
            'platformFees' => (float) $platformFees,
            'driverPayouts' => (float) $driverPayouts,
            'escrowBalance' => (float) $escrowBalance,
            'pendingPayouts' => (float) $pendingPayouts,
            'netProfit' => (float) ($totalRevenue - $driverPayouts),
        ];

        // Revenue by Tier (Subscriptions)
        $revenueByTier = [];
        $tiers = Transaction::where('category', 'subscription')->where('status', 'completed')
            ->selectRaw('description as tier, sum(amount) as amount')
            ->groupBy('description')
            ->get();

        $totalSubRevenue = $tiers->sum('amount');
        foreach ($tiers as $tier) {
            $revenueByTier[] = [
                'tier' => $tier->tier ?: 'Custom Access',
                'amount' => (float)$tier->amount,
                'percentage' => $totalSubRevenue > 0 ? round(($tier->amount / $totalSubRevenue) * 100, 1) : 0
            ];
        }

        // Monthly Revenue (Last 6 months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();

            $rev = Transaction::where('status', 'completed')
                ->where('category', 'subscription')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount') ?? 0;

            $payouts = Transaction::where('status', 'completed')
                ->where('category', 'job_payment')
                ->where('type', 'credit')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount') ?? 0;

            $monthlyRevenue[] = [
                'month' => $date->format('M'),
                'revenue' => (float)$rev,
                'expenses' => (float)$payouts,
                'profit' => (float)($rev - $payouts),
            ];
        }

        $transactions = Transaction::with('wallet.user')->orderBy('created_at', 'desc')->take(10)->get();

        $recentTransactions = $transactions->map(function ($trx) {
            $type = 'Platform Fee';
            if ($trx->category === 'subscription') $type = 'Subscription';
            if ($trx->category === 'deposit') $type = 'Wallet Top-up';
            if ($trx->category === 'job_payment') $type = 'Job Payment';

            return [
                'id' => 'TRX-' . str_pad($trx->id, 4, '0', STR_PAD_LEFT),
                'type' => $type,
                'description' => $trx->description ?? 'Financial Transaction',
                'amount' => (float)$trx->amount,
                'date' => $trx->created_at->format('Y-m-d'),
                'status' => $trx->status === 'pending' ? 'held' : $trx->status
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'overview' => $overview,
                'revenueByTier' => $revenueByTier,
                'monthlyRevenue' => $monthlyRevenue,
                'recentTransactions' => $recentTransactions
            ]
        ]);
    }

    public function transactions(Request $request)
    {
        $query = Transaction::query();

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('description', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        $paginated = $query->with('wallet.user')->orderBy('created_at', 'desc')->paginate(10);

        $paginated->through(function ($trx) {
            $type = 'revenue';
            if ($trx->category === 'escrow' || str_contains((string) $trx->type, 'escrow')) $type = 'escrow';
            if ($trx->category === 'subscription') $type = 'subscription';
            if ($trx->category === 'deposit') $type = 'deposit';

            return [
                'id' => $trx->id,
                'type' => $type,
                'description' => $trx->description ?? 'Transaction',
                'user' => $trx->wallet?->user?->name ?? 'Unknown User',
                'driver' => null,
                'amount' => $trx->amount,
                'fee' => $trx->category === 'subscription' ? (float) $trx->amount : 0,
                'payout' => $trx->category === 'job_payment' ? (float) $trx->amount : 0,
                'date' => $trx->created_at ? $trx->created_at->format('Y-m-d') : 'N/A',
                'time' => $trx->created_at ? $trx->created_at->format('H:i') : 'N/A',
                'status' => $trx->status,
                'reference' => $trx->reference ?: ('TRX-' . str_pad($trx->id, 4, '0', STR_PAD_LEFT))
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $paginated
        ]);
    }

    public function revenueAnalytics(Request $request)
    {
        $totalRevenue = Transaction::where('status', 'completed')->sum('amount') ?? 0;

        // Month by month breakdown for the last 6 months
        $monthlyBreakdown = [];
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();

            $rev = Transaction::where('status', 'completed')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount') ?? 0;

            $jobs = TransportJob::where('status', 'completed')
                ->whereBetween('updated_at', [$monthStart, $monthEnd])
                ->count();

            $prevRev = Transaction::where('status', 'completed')
                ->whereBetween('created_at', [$monthStart->copy()->subMonth(), $monthEnd->copy()->subMonth()])
                ->sum('amount') ?? 0;

            $growth = $prevRev > 0 ? (($rev - $prevRev) / $prevRev) * 100 : 0;

            $monthlyBreakdown[] = [
                'month' => $date->format('M'),
                'revenue' => (float)$rev,
                'jobs' => $jobs,
                'growth' => round($growth, 2)
            ];
        }

        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();
        $prevMonthStart = now()->subMonths(2)->startOfMonth();
        $prevMonthEnd = now()->subMonth()->endOfMonth();

        $lastMonthRevenue = Transaction::where('status', 'completed')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('amount');
        $prevMonthRevenue = Transaction::where('status', 'completed')
            ->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])
            ->sum('amount');
        $growth = $prevMonthRevenue > 0
            ? round((($lastMonthRevenue - $prevMonthRevenue) / $prevMonthRevenue) * 100, 2)
            : 0;
        $revenueByCategory = Transaction::where('status', 'completed')
            ->selectRaw('category, sum(amount) as amount')
            ->groupBy('category')
            ->get()
            ->map(function ($row) {
                return [
                    'category' => $row->category,
                    'amount' => (float)$row->amount,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'totalRevenue' => (float)$totalRevenue,
                    'previousRevenue' => (float)$prevMonthRevenue,
                    'growth' => $growth,
                    'averageMonthlyRevenue' => (float)($totalRevenue / max(1, now()->subYear()->diffInMonths(now()))),
                    'projectedRevenue' => (float)($lastMonthRevenue * 1.15)
                ],
                'monthlyBreakdown' => $monthlyBreakdown,
                'revenueByCategory' => $revenueByCategory,
                'topPerformers' => [],
                'revenueByRegion' => []
            ]
        ]);
    }

    public function subscriptionPayments(Request $request)
    {
        $query = Transaction::with('user')->where('category', 'subscription');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('id', 'like', "%{$search}%");
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate(10);

        $paginated->through(function ($trx) {
            return [
                'id' => 'TRX-' . str_pad($trx->id, 4, '0', STR_PAD_LEFT),
                'employer' => $trx->user ? $trx->user->name : 'Unknown Employer',
                'amount' => '₦' . number_format($trx->amount),
                'plan' => $trx->description ?? 'Subscription Plan',
                'date' => $trx->created_at ? $trx->created_at->format('Y-m-d H:i') : 'N/A',
                'method' => 'Payment Gateway', // Extend DB logic as needed
                'status' => ucfirst($trx->status),
                'reference' => 'PAY-' . str_pad($trx->id, 6, '0', STR_PAD_LEFT)
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $paginated
        ]);
    }

    public function subscriptionPlans(Request $request)
    {
        $role = $request->query('role', 'employer');
        $plans = SubscriptionPlan::where('target_role', $role)->get();
        return response()->json([
            'status' => 'success',
            'data' => $plans
        ]);
    }

    public function storeSubscriptionPlan(Request $request)
    {
        $validated = $request->validate([
            'target_role' => 'required|in:employer,operative',
            'name' => 'required|string',
            'price' => 'required|string',
            'period' => 'required|string',
            'limits' => 'nullable|string',
            'status' => 'required|string',
            'isPopular' => 'boolean',
            'features' => 'nullable|array'
        ]);

        $plan = SubscriptionPlan::create($validated);

        return response()->json([
            'status' => 'success',
            'data' => $plan,
            'message' => 'Plan created successfully'
        ]);
    }

    public function updateSubscriptionPlan(Request $request, $id)
    {
        $validated = $request->validate([
            'target_role' => 'sometimes|required|in:employer,operative',
            'name' => 'sometimes|required|string',
            'price' => 'sometimes|required|string',
            'period' => 'sometimes|required|string',
            'limits' => 'nullable|string',
            'status' => 'sometimes|required|string',
            'isPopular' => 'boolean',
            'features' => 'nullable|array'
        ]);

        $plan = SubscriptionPlan::findOrFail($id);
        $plan->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => $plan,
            'message' => 'Plan updated successfully'
        ]);
    }

    public function deleteSubscriptionPlan($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        $plan->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Plan deleted successfully'
        ]);
    }
}

