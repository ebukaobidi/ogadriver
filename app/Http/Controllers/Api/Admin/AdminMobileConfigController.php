<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;

class AdminMobileConfigController extends Controller
{
    /**
     * Get the current mobile app configuration.
     */
    public function getConfig()
    {
        $config = DB::table('mobile_configs')->first();
        $configData = $config ? (array) $config : [
            'force_update' => false,
            'maintenance_mode' => false,
            'min_version' => '1.0.0',
            'latest_version' => '1.0.0',
            'maintenance_message' => 'System is under maintenance. Please check back shortly.',
            'force_update_message' => 'Please update to the latest version to continue.',
        ];

        // Merge OgaPoints & Mobile Features from ApiSetting
        $loyaltySettings = \App\Models\ApiSetting::getByCategory('loyalty')->toArray();
        $generalSettings = \App\Models\ApiSetting::getByCategory('general')->toArray();

        $merged = array_merge($configData, [
            'points_earn_per_100' => (int) ($loyaltySettings['pointsEarnRatePer100'] ?? 1),
            'trip_completion_bonus_points' => (int) ($loyaltySettings['tripCompletionBonusPoints'] ?? 50),
            'max_discount_cap_percent' => (int) ($loyaltySettings['maxPointsDiscountPercentPerRide'] ?? 20),
            'min_points_to_redeem' => (int) ($loyaltySettings['minPointsToRedeem'] ?? 500),
            'max_daily_points_redeem' => (int) ($loyaltySettings['maxPointsRedeemPerDay'] ?? 5000),
            'concierge_hotline' => $generalSettings['mobileConciergeHotline'] ?? '+234 800 642 3748',
            'emergency_sos_hotline' => $generalSettings['mobileSosEmergencyHotline'] ?? '112 / +234 800 767 9111',
            'gift_funds_enabled' => (bool) ($generalSettings['mobileGiftFundsEnabled'] ?? true),
            'max_gift_transfer_daily' => (int) ($generalSettings['mobileMaxGiftTransferPerDay'] ?? 50000),
        ]);

        return response()->json(['success' => true, 'data' => $merged]);
    }

    /**
     * Update the mobile app configuration.
     */
    public function updateConfig(Request $request)
    {
        $validated = $request->validate([
            'force_update' => 'sometimes|boolean',
            'maintenance_mode' => 'sometimes|boolean',
            'min_version' => 'sometimes|string|max:50',
            'latest_version' => 'sometimes|string|max:50',
            'maintenance_message' => 'sometimes|string|max:255',
            'force_update_message' => 'sometimes|string|max:255',
        ]);

        if (!empty($validated)) {
            DB::table('mobile_configs')->update($validated);
        }

        // Save OgaPoints settings to ApiSetting
        $loyaltyKeys = [
            'points_earn_per_100' => 'pointsEarnRatePer100',
            'trip_completion_bonus_points' => 'tripCompletionBonusPoints',
            'max_discount_cap_percent' => 'maxPointsDiscountPercentPerRide',
            'min_points_to_redeem' => 'minPointsToRedeem',
            'max_daily_points_redeem' => 'maxPointsRedeemPerDay',
        ];

        foreach ($loyaltyKeys as $reqKey => $settingKey) {
            if ($request->has($reqKey)) {
                \App\Models\ApiSetting::setValue($settingKey, (string) $request->input($reqKey), 'loyalty', false, 'OgaPoints Setting');
            }
        }

        // Save mobile controls to ApiSetting
        $featureKeys = [
            'concierge_hotline' => 'mobileConciergeHotline',
            'emergency_sos_hotline' => 'mobileSosEmergencyHotline',
            'gift_funds_enabled' => 'mobileGiftFundsEnabled',
            'max_gift_transfer_daily' => 'mobileMaxGiftTransferPerDay',
        ];

        foreach ($featureKeys as $reqKey => $settingKey) {
            if ($request->has($reqKey)) {
                \App\Models\ApiSetting::setValue($settingKey, (string) $request->input($reqKey), 'general', false, 'Mobile Control');
            }
        }
        
        // Clear caches
        Cache::forget('mobile_app_config');
        Cache::forget('admin_global_settings');

        return $this->getConfig();
    }

    /**
     * Retrieve users and their FCM Device Tokens for inspection
     */
    public function getFcmTokens(Request $request)
    {
        $users = User::whereNotNull('fcm_token')
            ->select('id', 'name', 'email', 'role', 'fcm_token', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->paginate(50);
            
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Retrieve Mobile Activity Logs for security auditing
     */
    public function getMobileLogs(Request $request)
    {
        // Activity log automatically created by spatie/laravel-activitylog
        // Filter by log_name 'mobile_api' or standard
        $query = Activity::with('causer');
        
        if ($request->has('event')) {
            $query->where('event', $request->event);
        }
        
        if ($request->has('causer_id')) {
            $query->where('causer_id', $request->causer_id);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
}
