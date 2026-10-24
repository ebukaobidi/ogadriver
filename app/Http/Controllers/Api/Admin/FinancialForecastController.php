<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Subscription;
use App\Models\Transaction;
use Carbon\Carbon;

class FinancialForecastController extends Controller
{
    /**
     * Get MRR, ARR, churn risk, and 30/60/90-day financial projections
     */
    public function getForecast()
    {
        $activeSubs = Subscription::where('status', 'active')->count();
        $basePrice = 5000.00; // ₦5,000 / month standard subscription
        $mrr = $activeSubs * $basePrice; 
        $arr = $mrr * 12;

        $expiringIn7Days = Subscription::where('status', 'active')
            ->whereBetween('ends_at', [now(), now()->addDays(7)])
            ->get();
            
        $churnRiskCount = $expiringIn7Days->count();
        $churnRate = $activeSubs > 0 ? round(($churnRiskCount / $activeSubs) * 100, 1) : 0;

        // 30 / 60 / 90 day projections (assume 15% monthly compounding growth)
        $projection30 = $mrr * 1.15;
        $projection60 = $mrr * 1.32;
        $projection90 = $mrr * 1.52;

        // 12-Month Chart Data
        $chartData = [];
        $currentMrr = $mrr;
        for ($i = 1; $i <= 12; $i++) {
            $monthLabel = now()->addMonths($i)->format('M Y');
            // Assuming 10% net growth per month (new sales - churn)
            $projectedMrr = $currentMrr * pow(1.10, $i);
            
            $chartData[] = [
                'month' => $monthLabel,
                'mrr' => round($projectedMrr, 2),
                'subscribers' => round($projectedMrr / $basePrice)
            ];
        }

        // Format high risk churners
        $highRiskDrivers = $expiringIn7Days->map(function ($sub) {
            return [
                'id' => $sub->user_id,
                'name' => $sub->user->name ?? 'Unknown Driver',
                'expires_at' => $sub->ends_at->diffForHumans(),
                'value' => 5000
            ];
        })->take(5);

        return response()->json([
            'status' => 'success',
            'data' => [
                'active_subscribers' => $activeSubs,
                'mrr' => $mrr,
                'arr' => $arr,
                'churn_risk_count' => $churnRiskCount,
                'churn_rate_pct' => $churnRate,
                'projections' => [
                    'day_30' => $projection30,
                    'day_60' => $projection60,
                    'day_90' => $projection90,
                ],
                'chart_data' => $chartData,
                'high_risk_drivers' => $highRiskDrivers
            ],
        ]);
    }
}
