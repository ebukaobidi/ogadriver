<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AppConfigController extends Controller
{
    /**
     * Get public mobile app configuration.
     * This endpoint should be called when the mobile app starts.
     */
    public function index()
    {
        $config = Cache::remember('mobile_app_config', 3600, function () {
            // Using DB config to make it dynamic from Admin dashboard.
            $baseConfig = DB::table('mobile_configs')->first() ?? (object) [
                'force_update' => false,
                'maintenance_mode' => false,
                'min_version' => '1.0.0',
                'latest_version' => '1.0.0',
                'maintenance_message' => 'We are undergoing scheduled maintenance. Please check back later.',
                'force_update_message' => 'A new version of the app is available. Please update to continue.',
            ];

            $configData = (array) $baseConfig;

            // Merge dynamic OgaPoints and mobile parameters from ApiSetting
            $loyaltySettings = \App\Models\ApiSetting::getByCategory('loyalty')->toArray();
            $generalSettings = \App\Models\ApiSetting::getByCategory('general')->toArray();

            return (object) array_merge($configData, [
                'points_earn_per_100' => (int) ($loyaltySettings['pointsEarnRatePer100'] ?? 1),
                'trip_completion_bonus_points' => (int) ($loyaltySettings['tripCompletionBonusPoints'] ?? 50),
                'weekly_hire_bonus_points' => (int) ($loyaltySettings['weeklyHireBonusPoints'] ?? 200),
                'referral_bonus_points' => (int) ($loyaltySettings['referralBonusPoints'] ?? 500),
                'max_discount_cap_percent' => (int) ($loyaltySettings['maxPointsDiscountPercentPerRide'] ?? 20),
                'min_points_to_redeem' => (int) ($loyaltySettings['minPointsToRedeem'] ?? 500),
                'max_daily_points_redeem' => (int) ($loyaltySettings['maxPointsRedeemPerDay'] ?? 5000),
                'points_to_naira_ratio' => (float) ($loyaltySettings['pointsToNairaRatio'] ?? 1.0),
                // Mobile Hotlines & Governance
                'concierge_hotline' => $generalSettings['mobileConciergeHotline'] ?? '+234 800 642 3748',
                'emergency_sos_hotline' => $generalSettings['mobileSosEmergencyHotline'] ?? '112 / +234 800 767 9111',
                'gift_funds_enabled' => (bool) ($generalSettings['mobileGiftFundsEnabled'] ?? true),
                'max_gift_transfer_daily' => (int) ($generalSettings['mobileMaxGiftTransferPerDay'] ?? 50000),
            ]);
        });

        return response()->json([
            'success' => true,
            'data' => $config
        ]);
    }
}
