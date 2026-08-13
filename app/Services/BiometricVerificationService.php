<?php

namespace App\Services;

use App\Models\Driver;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class BiometricVerificationService
{
    protected string $smileIdApiKey;
    protected string $smileIdPartnerId;
    protected string $verifiedAfricaApiKey;

    public function __construct()
    {
        $this->smileIdApiKey = config('services.smile_id.api_key');
        $this->smileIdPartnerId = config('services.smile_id.partner_id');
        $this->verifiedAfricaApiKey = config('services.verified_africa.api_key');
    }

    /**
     * Perform biometric liveness verification with Smile ID
     */
    public function verifyWithSmileId(Driver $driver, string $facialImagePath, string $ninNumber): array
    {
        try {
            // Prepare Smile ID API request
            $response = Http::withHeaders([
                'Ocp-Apim-Subscription-Key' => $this->smileIdApiKey,
            ])->post('https://api.smileidentity.com/v1/verification', [
                'partner_id' => $this->smileIdPartnerId,
                'callback_url' => config('app.url') . '/api/biometric/callback',
                'user_id' => $driver->id,
                'job_id' => uniqid('biometric_'),
                'job_type' => 5, // Biometric KYC
                'image' => base64_encode(file_get_contents(Storage::path($facialImagePath))),
                'id_number' => $ninNumber,
                'id_type' => 'nin',
            ]);

            $result = $response->json();

            if ($response->successful() && ($result['code'] ?? null) === '9000') {
                return [
                    'success' => true,
                    'verified' => true,
                    'confidence_score' => $result['confidence_score'] ?? null,
                    'reference' => $result['smile_job_id'] ?? null,
                    'provider' => 'smile_id',
                ];
            }

            return [
                'success' => false,
                'verified' => false,
                'error' => $result['error'] ?? 'Verification failed',
                'provider' => 'smile_id',
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'verified' => false,
                'error' => $e->getMessage(),
                'provider' => 'smile_id',
            ];
        }
    }

    /**
     * Perform biometric liveness verification with Verified.africa
     */
    public function verifyWithVerifiedAfrica(Driver $driver, string $facialImagePath, string $frscLicenseNumber): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->verifiedAfricaApiKey,
            ])->post('https://api.verified.africa/v1/biometric/verify', [
                'reference' => uniqid('biometric_'),
                'id_number' => $frscLicenseNumber,
                'id_type' => 'frsc_license',
                'image' => base64_encode(file_get_contents(Storage::path($facialImagePath))),
                'callback_url' => config('app.url') . '/api/biometric/callback',
            ]);

            $result = $response->json();

            if ($response->successful() && ($result['status'] ?? null) === 'verified') {
                return [
                    'success' => true,
                    'verified' => true,
                    'confidence_score' => $result['match_score'] ?? null,
                    'reference' => $result['reference'] ?? null,
                    'provider' => 'verified_africa',
                ];
            }

            return [
                'success' => false,
                'verified' => false,
                'error' => $result['message'] ?? 'Verification failed',
                'provider' => 'verified_africa',
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'verified' => false,
                'error' => $e->getMessage(),
                'provider' => 'verified_africa',
            ];
        }
    }

    /**
     * Perform biometric verification (auto-select provider)
     */
    public function verifyDriver(Driver $driver, string $facialImagePath): array
    {
        // Try Smile ID first if NIN is available
        if ($driver->nin_number) {
            $result = $this->verifyWithSmileId($driver, $facialImagePath, $driver->nin_number);
            if ($result['success'] && $result['verified']) {
                return $this->updateDriverBiometricStatus($driver, $result);
            }
        }

        // Fallback to Verified.africa if FRSC license is available
        if ($driver->frsc_license_number) {
            $result = $this->verifyWithVerifiedAfrica($driver, $facialImagePath, $driver->frsc_license_number);
            if ($result['success'] && $result['verified']) {
                return $this->updateDriverBiometricStatus($driver, $result);
            }
        }

        return [
            'success' => false,
            'verified' => false,
            'error' => 'No valid ID number provided for verification',
        ];
    }

    /**
     * Update driver biometric verification status
     */
    protected function updateDriverBiometricStatus(Driver $driver, array $result): array
    {
        $driver->update([
            'biometric_verified' => $result['verified'],
            'biometric_verified_at' => now(),
            'biometric_provider' => $result['provider'],
            'biometric_reference' => $result['reference'],
            'biometric_match_confirmed' => $result['verified'],
            'biometric_confidence_score' => $result['confidence_score'],
        ]);

        // If biometric verification fails, deactivate driver for security
        if (!$result['verified']) {
            $driver->update(['status' => 'suspended']);
        }

        return [
            'success' => true,
            'driver' => $driver->fresh(),
            'verification' => $result,
        ];
    }

    /**
     * Check if driver is biometrically verified
     */
    public function isBiometricVerified(Driver $driver): bool
    {
        return $driver->biometric_verified && 
               $driver->biometric_match_confirmed && 
               ($driver->biometric_confidence_score ?? 0) > 0.85;
    }

    /**
     * Process biometric verification callback
     */
    public function processCallback(array $callbackData): array
    {
        $reference = $callbackData['reference'] ?? $callbackData['smile_job_id'] ?? null;
        
        if (!$reference) {
            return ['success' => false, 'error' => 'Invalid callback data'];
        }

        $driver = Driver::where('biometric_reference', $reference)->first();
        
        if (!$driver) {
            return ['success' => false, 'error' => 'Driver not found'];
        }

        $verified = ($callbackData['code'] ?? null) === '9000' || 
                   ($callbackData['status'] ?? null) === 'verified';

        $driver->update([
            'biometric_verified' => $verified,
            'biometric_verified_at' => now(),
            'biometric_match_confirmed' => $verified,
            'biometric_confidence_score' => $callbackData['confidence_score'] ?? $callbackData['match_score'] ?? null,
        ]);

        if (!$verified) {
            $driver->update(['status' => 'suspended']);
        }

        return ['success' => true, 'driver' => $driver];
    }

    /**
     * Validate facial image for liveness detection
     */
    public function validateFacialImage(string $imagePath): array
    {
        if (!Storage::exists($imagePath)) {
            return ['valid' => false, 'error' => 'Image not found'];
        }

        // Basic validation - in production, use actual liveness detection
        $imageInfo = getimagesize(Storage::path($imagePath));
        
        if (!$imageInfo) {
            return ['valid' => false, 'error' => 'Invalid image file'];
        }

        // Check minimum dimensions
        if ($imageInfo[0] < 300 || $imageInfo[1] < 300) {
            return ['valid' => false, 'error' => 'Image too small (minimum 300x300)'];
        }

        return ['valid' => true];
    }
}
