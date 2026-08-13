<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI Service Provider
    |--------------------------------------------------------------------------
    |
    | The AI service provider to use for verification. Options: 'google', 'aws', 'custom'
    |
    */
    'service_provider' => env('AI_SERVICE_PROVIDER', 'google'),

    /*
    |--------------------------------------------------------------------------
    | Google Cloud Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Google Cloud services (Speech-to-Text, Maps)
    |
    */
    'google' => [
        'project_id' => env('GOOGLE_CLOUD_PROJECT_ID'),
        'speech_api_key' => env('GOOGLE_SPEECH_API_KEY'),
        'maps_api_key' => env('GOOGLE_MAPS_API_KEY'),
        'speech' => [
            'language_code' => 'en-US',
            'alternative_language_codes' => ['pcm-Nigeria', 'yo-NG', 'ig-NG', 'ha-NG'],
            'enable_automatic_punctuation' => true,
            'model' => 'latest_long',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | AWS Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for AWS services (Transcribe, Comprehend)
    |
    */
    'aws' => [
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        'transcribe' => [
            'language_code' => 'en-US',
            'media_sample_rate_hertz' => 8000,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Twilio Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Twilio phone calls
    |
    */
    'twilio' => [
        'account_sid' => env('TWILIO_ACCOUNT_SID'),
        'auth_token' => env('TWILIO_AUTH_TOKEN'),
        'phone_number' => env('TWILIO_PHONE_NUMBER'),
        'recording_enabled' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom AI Service Endpoints
    |--------------------------------------------------------------------------
    |
    | Custom endpoints for AI services if using a custom provider
    |
    */
    'custom' => [
        'guarantor_call_endpoint' => env('AI_GUARANTOR_CALL_ENDPOINT'),
        'analysis_endpoint' => env('AI_ANALYSIS_ENDPOINT'),
        'location_certification_endpoint' => env('AI_LOCATION_CERTIFICATION_ENDPOINT'),
        'timeout' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | Verification Settings
    |--------------------------------------------------------------------------
    |
    | Settings for the verification process
    |
    */
    'verification' => [
        'min_confidence_score' => 70,
        'max_call_duration' => 300, // 5 minutes
        'retry_attempts' => 3,
        'retry_delay' => 60, // 1 minute
    ],

    /*
    |--------------------------------------------------------------------------
    | Location Certification Settings
    |--------------------------------------------------------------------------
    |
    | Settings for location-based driver certification
    |
    */
    'location' => [
        'max_distance_meters' => 5000, // 5km tolerance
        'min_residence_duration_months' => 6,
        'service_area_coverage_threshold' => 70, // percentage
        'risk_threshold' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Settings
    |--------------------------------------------------------------------------
    |
    | Security settings for AI verification
    |
    */
    'security' => [
        'encrypt_recordings' => true,
        'require_consent' => true,
        'retention_days' => 90,
        'audit_log_enabled' => true,
    ],
];
