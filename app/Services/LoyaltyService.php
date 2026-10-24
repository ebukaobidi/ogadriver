<?php

namespace App\Services;

use App\Models\LoyaltyPoint;
use App\Models\LoyaltyTransaction;
use App\Models\User;

class LoyaltyService
{
    /**
     * Award loyalty points to a user
     */
    public function awardPoints(User $user, int $points, string $description): void
    {
        if ($points <= 0) return;

        // Create or update the total points
        $loyalty = LoyaltyPoint::firstOrCreate(
            ['user_id' => $user->id],
            ['points' => 0]
        );

        $loyalty->points += $points;
        $loyalty->save();

        // Log the transaction
        LoyaltyTransaction::create([
            'user_id' => $user->id,
            'points' => $points,
            'type' => 'earned',
            'description' => $description,
        ]);
    }

    /**
     * Redeem loyalty points
     */
    public function redeemPoints(User $user, int $points, string $description): bool
    {
        $loyalty = LoyaltyPoint::where('user_id', $user->id)->first();

        if (!$loyalty || $loyalty->points < $points) {
            return false;
        }

        $loyalty->points -= $points;
        $loyalty->save();

        LoyaltyTransaction::create([
            'user_id' => $user->id,
            'points' => $points,
            'type' => 'redeemed',
            'description' => $description,
        ]);

        return true;
    }
}
