<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiSetting;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class AdminSettingsController extends Controller
{
    protected CacheService $cacheService;

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    public function index()
    {
        $dbSettings = ApiSetting::getByCategory('general');
        $defaultSettings = config('site') ?: [];
        
        $settings = array_merge($defaultSettings, $dbSettings->toArray());
        $settings['hire_monetization_mode'] = ApiSetting::getValue('hire_monetization_mode', 'driver_points');
        $settings['points_per_hire_application'] = (int) ApiSetting::getValue('points_per_hire_application', 2);
        $settings['cost_per_hire_point'] = (float) ApiSetting::getValue('cost_per_hire_point', 150.0);
        $settings['require_active_subscription_for_hire'] = (bool) ApiSetting::getValue('require_active_subscription_for_hire', true);
        $settings['min_wallet_credit_ngn'] = 5000.0;
        $settings['min_wallet_credit_usd'] = 50.0;
        $settings['min_wallet_credit_international_usd'] = 5.0;

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    public function getPublicSettings()
    {
        $dbSettings = ApiSetting::getByCategory('general');
        $data = $dbSettings->toArray();
        $defaults = config('site');
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'tawktoPropertyId' => $data['tawktoPropertyId'] ?? $defaults['tawktoPropertyId'],
                'customerCareNumber' => $data['customerCareNumbers'][0] ?? ($data['whatsappNumber'] ?? $defaults['whatsappNumber']),
                'whatsappNumber' => $data['whatsappNumber'] ?? $defaults['whatsappNumber'],
                'whatsappMessage' => $data['whatsappMessage'] ?? $defaults['whatsappMessage'],
                'siteName' => $data['siteName'] ?? $defaults['siteName'],
                'primaryFont' => $data['primaryFont'] ?? 'Inter',
            ]
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'siteName' => 'sometimes|required|string',
            'siteUrl' => 'sometimes|required|url',
            'customerCareNumbers' => 'sometimes|array',
            'customerCareNumbers.*' => 'string',
            'contactEmail' => 'sometimes|email',
            'contactPhone' => 'sometimes|string',
            'address' => 'sometimes|string',
            'tawktoPropertyId' => 'sometimes|nullable|string',
            'whatsappNumber' => 'sometimes|nullable|string',
            'whatsappMessage' => 'sometimes|nullable|string',
            'primaryFont' => 'sometimes|string',
        ]);

        foreach ($request->except('_token') as $key => $value) {
            $valueToStore = is_array($value) ? json_encode($value) : (string)$value;
            ApiSetting::setValue($key, $valueToStore, 'general', false);
        }

        if ($request->has('fuelPricePerLiter') && class_exists('\App\Models\FuelPrice')) {
            try {
                \App\Models\FuelPrice::create([
                    'region' => 'Lagos',
                    'fuel_type' => 'PMS',
                    'price_per_liter' => (float) $request->input('fuelPricePerLiter'),
                    'source' => 'Admin Live System Settings',
                    'effective_at' => now(),
                ]);
            } catch (\Exception $e) {
                // log or pass silently
            }
        }

        // Clear cache
        Cache::forget('admin_global_settings');

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully'
        ]);
    }

    public function getApiSettings()
    {
        // Try to get from database first, fall back to cache
        try {
            $dbSettings = ApiSetting::all()->mapWithKeys(function ($setting) {
                return [$setting->key => $setting->decrypted_value];
            })->toArray();

            if (!empty($dbSettings)) {
                return response()->json([
                    'status' => 'success',
                    'data' => $dbSettings,
                    'source' => 'database'
                ]);
            }
        } catch (\Exception $e) {
            // Fall back to cache if database table doesn't exist
        }

        $settings = Cache::rememberForever('admin_api_settings', function () {
            return [
                'googleMapsKey' => config('services.google_maps.key', ''),
                'pushNotificationKey' => config('services.push_notification.key', ''),
                'opaySecretKey' => config('services.opay.secret_key', ''),
                'opayPublicKey' => config('services.opay.public_key', ''),
                'moniepointSecretKey' => config('services.moniepoint.secret_key', ''),
                'moniepointApiUrl' => config('services.moniepoint.api_url', 'https://api.moniepoint.com'),
                'nimcApiKey' => config('services.nimc.api_key', ''),
                'bvnValidationKey' => config('services.bvn_validation.key', ''),
                'webhookSecret' => config('services.webhook.secret', ''),
                'enableWebhooks' => config('services.webhook.enable', false),
                // AI Settings
                'aiServiceProvider' => config('ai.service_provider', 'google'),
                'googleCloudProjectId' => config('ai.google.project_id', ''),
                'googleSpeechApiKey' => config('ai.google.speech_api_key', ''),
                'googleMapsApiKey' => config('ai.google.maps_api_key', ''),
                'twilioAccountSid' => config('ai.twilio.account_sid', ''),
                'twilioAuthToken' => config('ai.twilio.auth_token', ''),
                'twilioPhoneNumber' => config('ai.twilio.phone_number', ''),
                // Payment Settings
                'paystackPublicKey' => env('PAYSTACK_PUBLIC_KEY', ''),
                'paystackSecretKey' => env('PAYSTACK_SECRET_KEY', ''),
                // AWS Settings
                'awsAccessKeyId' => env('AWS_ACCESS_KEY_ID', ''),
                'awsSecretAccessKey' => env('AWS_SECRET_ACCESS_KEY', ''),
                'awsDefaultRegion' => env('AWS_DEFAULT_REGION', 'us-east-1'),
                'awsBucket' => env('AWS_BUCKET', ''),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $settings,
            'source' => 'cache'
        ]);
    }

    public function updateApiSettings(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable|string',
            'settings.*.category' => 'required|string|in:general,ai,payment,aws,twilio,verification',
            'settings.*.is_encrypted' => 'sometimes|boolean',
            'settings.*.description' => 'nullable|string',
        ]);

        try {
            foreach ($request->settings as $setting) {
                ApiSetting::setValue(
                    $setting['key'],
                    $setting['value'] ?? '',
                    $setting['category'],
                    $setting['is_encrypted'] ?? true,
                    $setting['description'] ?? null
                );
            }

            // Clear cache to force refresh from database
            Cache::forget('admin_api_settings');

            return response()->json([
                'status' => 'success',
                'message' => 'API settings updated successfully'
            ]);
        } catch (\Exception $e) {
            // Fall back to cache if database operations fail
            $current = Cache::get('admin_api_settings', []);
            $flatSettings = [];
            foreach ($request->settings as $setting) {
                $flatSettings[$setting['key']] = $setting['value'] ?? '';
            }
            $updated = array_merge($current, $flatSettings);
            Cache::forever('admin_api_settings', $updated);

            return response()->json([
                'status' => 'success',
                'message' => 'API settings updated successfully (cached)',
                'fallback' => true
            ]);
        }
    }

    public function getNotificationSettings()
    {
        $settings = Cache::rememberForever('admin_notification_settings', function () {
            return [
                'emailNotifications' => true,
                'smsNotifications' => false,
                'pushNotifications' => true,
                'inAppNotifications' => true,
                'newBookingAlert' => true,
                'bookingConfirmation' => true,
                'bookingReminder' => true,
                'driverArrival' => true,
                'paymentReceived' => true,
                'subscriptionRenewal' => true,
                'promotionalEmails' => false,
                'systemAlerts' => true,
                'securityAlerts' => true,
                'dailyDigest' => false,
                'weeklyReport' => true,
                'monthlyReport' => true
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    public function updateNotificationSettings(Request $request)
    {
        Cache::forever('admin_notification_settings', $request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Notification settings updated successfully'
        ]);
    }

    /**
     * Clear cache by type - for forcing updates to users
     */
    public function triggerOta(Request $request)
    {
        // Placeholder for broadcasting an OTA update socket event
        return response()->json(['status' => 'success']);
    }

    public function clearCache(Request $request)
    {
        $request->validate([
            'cache_type' => 'required|string|in:all,admin,drivers,users,locations,settings,verifications,subscriptions'
        ]);

        $cacheType = $request->cache_type;
        $clearedCaches = [];

        try {
            switch ($cacheType) {
                case 'all':
                    // Clear all application cache
                    Cache::flush();
                    $clearedCaches = ['All application cache'];
                    break;

                case 'admin':
                    // Clear admin-specific cache
                    $this->cacheService->forgetTags(['admin']);
                    Cache::forget('admin_global_settings');
                    Cache::forget('admin_api_settings');
                    Cache::forget('admin_notification_settings');
                    $clearedCaches = ['Admin dashboard', 'API settings', 'Notification settings'];
                    break;

                case 'drivers':
                    // Clear driver-related cache
                    $this->cacheService->forgetTags(['drivers', 'verifications', 'stats']);
                    $clearedCaches = ['Driver profiles', 'Driver listings', 'Verification queue', 'Statistics'];
                    break;

                case 'users':
                    // Clear user-related cache
                    $this->cacheService->forgetTags(['users']);
                    $clearedCaches = ['User profiles', 'User listings'];
                    break;

                case 'locations':
                    // Clear location cache
                    $this->cacheService->clearLocationCache();
                    $clearedCaches = ['States', 'Cities'];
                    break;

                case 'settings':
                    // Clear settings cache
                    Cache::forget('admin_global_settings');
                    Cache::forget('admin_api_settings');
                    Cache::forget('admin_notification_settings');
                    Cache::forget('public_settings');
                    $clearedCaches = ['Global settings', 'API settings', 'Notification settings', 'Public settings'];
                    break;

                case 'verifications':
                    // Clear verification cache
                    $this->cacheService->forgetTags(['verifications', 'stats']);
                    $clearedCaches = ['Verification queue', 'Statistics'];
                    break;

                case 'subscriptions':
                    // Clear subscription cache
                    $this->cacheService->forgetTags(['subscriptions']);
                    $clearedCaches = ['Subscription data', 'Subscription plans'];
                    break;
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Cache cleared successfully',
                'data' => [
                    'cache_type' => $cacheType,
                    'cleared_caches' => $clearedCaches,
                    'cleared_at' => now()->toIso8601String()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to clear cache: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cache status and statistics
     */
    public function getCacheStatus()
    {
        try {
            $status = [
                'cache_driver' => config('cache.default'),
                'supports_tags' => Cache::supportsTags(),
                'cache_types' => [
                    'all' => 'Clear all application cache',
                    'admin' => 'Clear admin dashboard and settings cache',
                    'drivers' => 'Clear driver profiles and verification cache',
                    'users' => 'Clear user profiles and listings cache',
                    'locations' => 'Clear states and cities cache',
                    'settings' => 'Clear all settings cache',
                    'verifications' => 'Clear verification queue cache',
                    'subscriptions' => 'Clear subscription data cache'
                ],
                'recent_activity' => [
                    'last_cleared' => Cache::get('cache_last_cleared', null),
                    'total_clears' => Cache::get('cache_total_clears', 0)
                ]
            ];

            return response()->json([
                'status' => 'success',
                'data' => $status
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get cache status: ' . $e->getMessage()
            ], 500);
        }
    }
}


