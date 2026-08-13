<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class AdminSettingsController extends Controller
{
    public function index()
    {
        $dbSettings = ApiSetting::getByCategory('general');
        $defaultSettings = config('site');
        
        $settings = array_merge($defaultSettings, $dbSettings->toArray());

        return response()->json([
            'status' => 'success',
            'data' => $settings
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
        ]);

        foreach ($request->except('_token') as $key => $value) {
            $valueToStore = is_array($value) ? json_encode($value) : (string)$value;
            ApiSetting::setValue($key, $valueToStore, 'general', false);
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
            'settings.*.category' => 'required|string|in:general,ai,payment,aws,twilio',
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
}


