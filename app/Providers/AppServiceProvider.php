<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Notifications\NotificationAdapterInterface;
use App\Services\Notifications\TermiiNotificationAdapter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind the Termii Notification Adapter implementation
        $this->app->bind(NotificationAdapterInterface::class, TermiiNotificationAdapter::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\RateLimiter::for('financial', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('pin-verify', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
        });

        try {
            // Only try to load config if the table exists to avoid errors during initial migration
            if (\Illuminate\Support\Facades\Schema::hasTable('api_settings')) {
                config([
                    'security.enable_ip_whitelist' => env('SECURITY_ENABLE_IP_WHITELIST') ?? (bool) \App\Models\ApiSetting::getValue('enable_ip_whitelist', false),
                    'security.ip_whitelist' => env('SECURITY_IP_WHITELIST') ?? (array) \App\Models\ApiSetting::getValue('ip_whitelist', []),
                    'security.max_login_attempts' => env('SECURITY_MAX_LOGIN_ATTEMPTS') ?? (int) \App\Models\ApiSetting::getValue('max_login_attempts', 5),
                    'security.login_cooldown_minutes' => env('SECURITY_LOGIN_COOLDOWN_MINUTES') ?? (int) \App\Models\ApiSetting::getValue('login_cooldown_minutes', 15),
                    'security.max_concurrent_sessions' => env('SECURITY_MAX_CONCURRENT_SESSIONS') ?? (int) \App\Models\ApiSetting::getValue('max_concurrent_sessions', 3),
                ]);
            }
        } catch (\Exception $e) {
            // Silently fail if database is not yet ready (e.g. during fresh installation/migrations)
        }
    }
}
