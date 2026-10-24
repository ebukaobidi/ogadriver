<?php
/**
 * Security configuration for OgaDriver application.
 *
 * This file centralizes security‑related settings that are persisted in the
 * `api_settings` table via the `ApiSetting` model. Values are retrieved using
 * `ApiSetting::getValue()` which handles optional encryption and JSON decoding.
 *
 * The configuration values can be overridden via environment variables for
 * local development or temporary overrides.
 */
return [
    // Toggle IP whitelist enforcement. When true, requests from IPs not in the
    // whitelist will be denied. Controlled from the admin UI.
    'enable_ip_whitelist' => env('SECURITY_ENABLE_IP_WHITELIST', false),

    // List of allowed IP addresses or CIDR ranges. Stored as a JSON array
    // in the `api_settings` table under the key `ip_whitelist`.
    'ip_whitelist' => env('SECURITY_IP_WHITELIST', []),

    // Maximum number of login attempts before throttling is applied.
    'max_login_attempts' => env('SECURITY_MAX_LOGIN_ATTEMPTS', 5),

    // Number of minutes a user must wait after exceeding login attempts.
    'login_cooldown_minutes' => env('SECURITY_LOGIN_COOLDOWN_MINUTES', 15),

    // Maximum concurrent sessions per user account.
    'max_concurrent_sessions' => env('SECURITY_MAX_CONCURRENT_SESSIONS', 3),
];
