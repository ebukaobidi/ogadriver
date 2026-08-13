<?php

return [
    'siteName' => env('SITE_NAME', 'OgaDriver'),
    'siteUrl' => env('SITE_URL', 'https://ogadriver.ng'),
    'siteDescription' => env('SITE_DESCRIPTION', 'Nigeria\'s premier peer-to-peer operative directory and escrow matchmaking platform.'),
    'contactEmail' => env('CONTACT_EMAIL', 'command@ogadriver.ng'),
    'supportEmail' => env('SUPPORT_EMAIL', 'sos@ogadriver.ng'),
    'contactPhone' => env('CONTACT_PHONE', '+234 800 123 4567'),
    'customerCareNumbers' => [
        '+234 (0) 800 000 0000',
        '+234 (0) 800 000 0001'
    ],
    'address' => env('ADDRESS', 'HQ, Lagos Island, Lagos, Nigeria'),
    'timezone' => env('TIMEZONE', 'Africa/Lagos'),
    'currency' => env('CURRENCY', 'NGN'),
    'currencySymbol' => env('CURRENCY_SYMBOL', '₦'),
    'language' => env('LANGUAGE', 'en'),
    'companyRegistration' => env('COMPANY_REGISTRATION', 'RC1234567'),
    'taxId' => env('TAX_ID', 'TAX-987654321'),
    'baseAccessFee' => env('BASE_ACCESS_FEE', 10000),
    'disputeResolutionSLA' => env('DISPUTE_RESOLUTION_SLA', '48 hours')
];
