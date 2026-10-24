<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ReferralController extends Controller
{
    /**
     * Withdraw the authenticated user's referral balance.
     */
    public function withdraw(Request $request)
    {
        $user = $request->user();
        if (($user->referral_balance ?? 0) <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'No referral balance available for withdrawal.',
            ], 400);
        }

        // In a real application, integrate with a payment gateway here.
        $amount = $user->referral_balance;
        $user->referral_balance = 0;
        $user->save();

        Log::info("Referral withdrawal: user_id={$user->id}, amount={$amount}");
        return response()->json([
            'success' => true,
            'message' => "Successfully withdrew ₦{$amount}.",
        ]);
    }

    /**
     * Get the referral stats for the authenticated user (works for Drivers, Hirers, Creators).
     */
    public function getReferral(Request $request, $driverId = null)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $referralCount = User::where('referred_by_user_id', $user->id)->count();
        $referredDriversCount = User::where('referred_by_user_id', $user->id)
            ->whereHas('role', function ($q) {
                $q->where('slug', 'driver');
            })->count();
        $referredRidersCount = $referralCount - $referredDriversCount;
        
        $wallet = \App\Models\Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'available_balance' => 0, 'currency' => 'NGN']
        );

        $loyaltyPoints = \App\Models\LoyaltyPoint::where('user_id', $user->id)->value('points_balance') ?? 0;

        $referralList = \App\Models\Referral::with('referred:id,name,email,role_id,created_at')
            ->where('referrer_id', $user->id)
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($ref) {
                return [
                    'id' => $ref->id,
                    'referred_name' => $ref->referred?->name ?? 'Referred User',
                    'role' => $ref->referred_role,
                    'status' => $ref->status,
                    'reward_amount' => (float) $ref->reward_amount,
                    'date' => $ref->created_at?->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'referral_code' => $user->referral_code,
                'referral_link' => 'https://ogadriver.ng/register?ref=' . $user->referral_code,
                'role' => $user->role?->slug ?? 'hirer',
                'is_creator' => $user->isCreator(),
                'referral_count' => $referralCount,
                'referred_drivers_count' => $referredDriversCount,
                'referred_riders_count' => $referredRidersCount,
                'total_earned' => (float) ($user->referral_rewarded ?? 0),
                'pending_balance' => (float) ($user->referral_pending_balance ?? 0),
                'claimable_balance' => (float) ($user->referral_balance ?? 0),
                'wallet_balance' => (float) $wallet->balance,
                'points_balance' => (int) $loyaltyPoints,
                'reward_per_driver_sub' => '10% recurring cash',
                'reward_per_rider_trip' => 'Loyalty points + 1.5% micro cash',
                'referrals' => $referralList,
            ]
        ]);
    }

    public function claimBonus(Request $request, $driverId = null)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        
        // Find all users referred by this user
        $referredUsers = \App\Models\User::where('referred_by_user_id', $user->id)->get();
        
        $totalEarned = 0;
        $qualifiedReferredIds = [];
        
        foreach ($referredUsers as $referred) {
            // Check if referred user is a driver and is verified
            $driver = \App\Models\Driver::where('user_id', $referred->id)->first();
            $isVerified = $driver && $driver->is_verified;
            
            // Check if referred user has a completed payment (e.g., active subscription or paid onboarding fee)
            $hasPaid = \App\Models\Subscription::where('user_id', $referred->id)->where('status', 'active')->exists();
            if (!$hasPaid && \App\Models\Subscription::where('user_id', $referred->id)->exists()) {
                 $hasPaid = \App\Models\Subscription::where('user_id', $referred->id)->where('status', 'expired')->exists();
            }
            
            // Assuming bonus is 1000 per verified & paid referred driver
            if ($isVerified && $hasPaid) {
                $totalEarned += 1000;
                $qualifiedReferredIds[] = $referred->id;
            }
        }
        
        $alreadyClaimed = $user->referral_rewarded ?? 0;
        $claimable = max(0, $totalEarned - $alreadyClaimed);
        
        if ($claimable <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'No approved referral bonuses available to claim at this time.',
            ], 400);
        }

        $wallet = \App\Models\Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'available_balance' => 0, 'currency' => 'NGN']
        );
        
        $wallet->credit($claimable, 'credit', 'referral_bonus', 'Referral bonus payout for approved drivers');

        $user->referral_rewarded = $alreadyClaimed + $claimable;
        $user->referral_balance = 0; // Reset balance since we use rewarded for tracking
        $user->save();

        if (!empty($qualifiedReferredIds)) {
            \App\Models\Referral::where('referrer_id', $user->id)
                ->whereIn('referred_id', $qualifiedReferredIds)
                ->update(['status' => 'rewarded', 'rewarded_at' => now()]);
        }

        Log::info("Referral bonus claimed to wallet: user_id={$user->id}, amount={$claimable}");

        return response()->json([
            'success' => true,
            'message' => "Successfully claimed ₦{$claimable} to your wallet.",
            'data' => [
                'referral_balance' => 0,
                'wallet_balance' => $wallet->balance,
            ]
        ]);
    }
}
?>
