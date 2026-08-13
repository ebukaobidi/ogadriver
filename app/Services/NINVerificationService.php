<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NINVerificationService
{
    public function verifyNIN(string $nin, string $firstName, string $lastName): array
    {
        // Placeholder for actual API integration (e.g., SmileID, Mono)
        Log::info("Verifying NIN: {$nin}");

        // In a real implementation:
        // $response = Http::withToken(config('services.kyc.api_key'))
        //     ->post('https://api.kycprovider.com/verify-nin', [
        //         'nin' => $nin,
        //         'first_name' => $firstName,
        //         'last_name' => $lastName,
        //     ]);

        // Return a mock success response for now
        return [
            'success' => true,
            'data' => [
                'full_name' => "$firstName $lastName",
                'nin' => $nin,
                'status' => 'verified'
            ]
        ];
    }
}
