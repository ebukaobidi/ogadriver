<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Driver;
use App\Models\WeeklySprint;
use App\Models\SprintLeaderboard;

class WeeklySprintController extends Controller
{
    /**
     * Get Active Weekly Challenge & Leaderboard
     */
    public function getActiveSprint()
    {
        $sprint = WeeklySprint::where('status', 'active')->first();
        if (!$sprint) {
            // Create default sprint if none active
            $sprint = WeeklySprint::create([
                'title' => 'Lagos & Abuja 5-Star Driver Sprint',
                'start_date' => now()->startOfWeek(),
                'end_date' => now()->endOfWeek(),
                'total_prize_pool' => 50000.00,
                'min_trips_required' => 5,
                'min_rating_required' => 4.50,
                'status' => 'active',
                'prizes_breakdown' => '1st Place: ₦25,000 | 2nd Place: ₦15,000 | 3rd Place: ₦10,000',
            ]);
        }

        $leaderboard = SprintLeaderboard::with(['driver.user'])
            ->where('sprint_id', $sprint->id)
            ->orderBy('rank', 'asc')
            ->take(20)
            ->get();

        $user = auth()->user();
        $userRank = null;
        if ($user) {
            $driver = Driver::where('user_id', $user->id)->first();
            if ($driver) {
                $userRank = SprintLeaderboard::where('sprint_id', $sprint->id)
                    ->where('driver_id', $driver->id)
                    ->first();
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'sprint' => $sprint,
                'leaderboard' => $leaderboard,
                'my_rank' => $userRank,
            ],
        ]);
    }

    /**
     * Claim Sprint Cash Prize
     */
    public function claimPrize(Request $request)
    {
        $user = auth()->user();
        $driver = Driver::where('user_id', $user->id)->first();
        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver not found'], 404);
        }

        $entry = SprintLeaderboard::where('driver_id', $driver->id)
            ->where('prize_earned', '>', 0)
            ->where('prize_claimed', false)
            ->first();

        if (!$entry) {
            return response()->json(['success' => false, 'message' => 'No unclaimed sprint cash prize found'], 422);
        }

        $entry->update(['prize_claimed' => true]);

        // Credit wallet balance
        $wallet = \App\Models\Wallet::firstOrCreate(['user_id' => $user->id]);
        $wallet->increment('balance', $entry->prize_earned);
        $wallet->increment('available_balance', $entry->prize_earned);

        return response()->json([
            'success' => true,
            'message' => '₦' . number_format($entry->prize_earned, 2) . ' Sprint Cash Prize claimed to your wallet!',
        ]);
    }
}
