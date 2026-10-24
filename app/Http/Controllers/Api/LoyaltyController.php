<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyPoint;
use App\Models\LoyaltyTransaction;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $loyalty = LoyaltyPoint::firstOrCreate(
            ['user_id' => $user->id],
            ['points' => 0]
        );

        $history = LoyaltyTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'points' => $loyalty->points,
                'history' => $history,
            ],
        ]);
    }

    public function redeem(Request $request)
    {
        $request->validate([
            'points' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $loyalty = LoyaltyPoint::where('user_id', $user->id)->first();

        if (!$loyalty || $loyalty->points < $request->points) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient loyalty points',
            ], 400);
        }

        $loyalty->points -= $request->points;
        $loyalty->save();

        LoyaltyTransaction::create([
            'user_id' => $user->id,
            'points' => $request->points,
            'type' => 'redeemed',
            'description' => 'Points redeemed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Points redeemed successfully',
            'data' => [
                'remaining_points' => $loyalty->points,
            ],
        ]);
    }
}
