<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // OSM configuration for map tiles and default location settings

    'osm' => [
    'tile_url'    => env('OSM_TILE_URL', 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
    'attribution' => '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    'default_lat' => env('MAP_DEFAULT_LAT', 6.5244), // Default Lagos Latitude
    'default_lng' => env('MAP_DEFAULT_LNG', 3.3792), // Default Lagos Longitude
    'default_zoom'=> env('MAP_DEFAULT_ZOOM', 13),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', env('APP_URL') . '/auth/google/callback'),
        'redirect_uri' => env('GOOGLE_REDIRECT_URI', env('APP_URL') . '/auth/google/callback'),
    ],

    'payment' => [
        'webhook_secret' => env('PAYMENT_WEBHOOK_SECRET'),
    ],

    'paystack' => [
        'public_key' => env('PAYSTACK_PUBLIC_KEY'),
        'secret_key' => env('PAYSTACK_SECRET_KEY'),
        'callback_url' => env('PAYSTACK_CALLBACK_URL', env('APP_URL') . '/api/payments/callback'),
    ],

    'opay' => [
        'public_key' => env('OPAY_PUBLIC_KEY'),
        'secret_key' => env('OPAY_SECRET_KEY'),
        'callback_url' => env('OPAY_CALLBACK_URL', env('APP_URL') . '/api/payments/opay/callback'),
    ],

    'termii' => [
        'api_key' => env('TERMII_API_KEY'),
        'sender_id' => env('TERMII_SENDER_ID', 'OgaDriver'),
        'base_url' => env('TERMII_BASE_URL', 'https://v4.api.termii.com'),
    ],

    'locationiq' => [
        'api_key' => env('LOCATIONIQ_API_KEY'),
        'base_url' => env('LOCATIONIQ_BASE_URL', 'https://us1.locationiq.com/v1'),
    ],

    'firebase' => [
        'credentials' => env('FIREBASE_CREDENTIALS', 'storage/app/firebase-credentials.json'),
        'project_id' => env('FIREBASE_PROJECT_ID', 'ogadriver-e5e7b'),
        'vapid_public_key' => env('FCM_VAPID_PUBLIC_KEY', env('VAPID_PUBLIC_KEY')),
    ],

];
