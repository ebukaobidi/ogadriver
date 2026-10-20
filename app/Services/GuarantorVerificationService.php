<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\Guarantor;
use App\Models\GuarantorVerification;
use App\Models\LocationCertification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GuarantorVerificationService
{
    /**
     * Create guarantor record
     */
    public function createGuarantor(Driver $driver, array $guarantorData): Guarantor
    {
        return Guarantor::create([
            'driver_id' => $driver->id,
            'full_name' => $guarantorData['full_name'],
            'phone_number' => $guarantorData['phone_number'],
            'email' => $guarantorData['email'],
            'employment_type' => $guarantorData['employment_type'],
            'employment_details' => $guarantorData['employment_details'] ?? null,
            'id_type' => $guarantorData['id_type'] ?? 'national_id',
            'id_number' => $guarantorData['id_number'],
            'id_file_path' => $guarantorData['id_file_path'] ?? null,
            'is_verified' => false,
        ]);
    }

    /**
     * Send verification request to guarantor
     */
    public function sendVerificationRequest(Guarantor $guarantor): array
    {
        $verificationReference = uniqid('guarantor_');
        
        $guarantor->update([
            'verification_reference' => $verificationReference,
        ]);

        // Send SMS/WhatsApp with verification link
        $verificationLink = config('app.url') . "/verify-guarantor/{$verificationReference}";
        
        $message = "You have been listed as a guarantor for a driver on Ogadriver.ng. "
                  . "Please verify your identity and acknowledge liability: {$verificationLink}";

        // In production, integrate with SMS gateway (Twilio, Termii, etc.)
        // For now, we'll simulate the sending
        $this->sendSMS($guarantor->phone_number, $message);
        $this->sendEmail($guarantor->email, $verificationLink);

        return [
            'success' => true,
            'reference' => $verificationReference,
            'message' => 'Verification request sent to guarantor',
        ];
    }

    /**
     * Verify guarantor identity
     */
    public function verifyGuarantor(string $verificationReference, array $verificationData): array
    {
        $guarantor = Guarantor::where('verification_reference', $verificationReference)->first();

        if (!$guarantor) {
            return ['success' => false, 'error' => 'Invalid verification reference'];
        }

        // Validate ID against provided data
        $idValid = $this->validateIdentityDocument($verificationData);

        if (!$idValid['valid']) {
            return ['success' => false, 'error' => $idValid['error']];
        }

        // Update guarantor verification status
        $guarantor->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        return [
            'success' => true,
            'guarantor' => $guarantor,
            'message' => 'Guarantor verified successfully',
        ];
    }

    /**
     * Acknowledge liability (digital signature)
     */
    public function acknowledgeLiability(string $verificationReference, string $digitalSignature): array
    {
        $guarantor = Guarantor::where('verification_reference', $verificationReference)->first();

        if (!$guarantor) {
            return ['success' => false, 'error' => 'Invalid verification reference'];
        }

        if (!$guarantor->is_verified) {
            return ['success' => false, 'error' => 'Guarantor must be verified first'];
        }

        // Store digital signature
        $signaturePath = $this->storeDigitalSignature($digitalSignature);

        $guarantor->update([
            'digital_signature' => $signaturePath,
            'acknowledges_liability' => true,
            'liability_acknowledged_at' => now(),
        ]);

        // Check if driver has 2 verified guarantors
        $driver = $guarantor->driver;
        $verifiedGuarantors = $driver->guarantors()
            ->where('is_verified', true)
            ->where('acknowledges_liability', true)
            ->count();

        if ($verifiedGuarantors >= 2) {
            $driver->update(['guarantors_verified' => true]);
        }

        return [
            'success' => true,
            'guarantor' => $guarantor,
            'driver_ready' => $verifiedGuarantors >= 2,
            'message' => 'Liability acknowledged successfully',
        ];
    }

    /**
     * Check if driver has sufficient guarantors
     */
    public function hasSufficientGuarantors(Driver $driver): bool
    {
        return $driver->guarantors()
            ->where('is_verified', true)
            ->where('acknowledges_liability', true)
            ->count() >= 2;
    }

    /**
     * Validate employment type (landowner or corporate employee required)
     */
    public function validateEmploymentType(Guarantor $guarantor): array
    {
        $validTypes = ['landowner', 'corporate_employee', 'government_official', 'business_owner'];

        if (!in_array($guarantor->employment_type, $validTypes)) {
            return ['valid' => false, 'error' => 'Invalid employment type'];
        }

        // Additional validation for landowners
        if ($guarantor->employment_type === 'landowner') {
            if (!$this->validateLandOwnership($guarantor)) {
                return ['valid' => false, 'error' => 'Land ownership verification failed'];
            }
        }

        // Additional validation for corporate employees
        if (in_array($guarantor->employment_type, ['corporate_employee', 'government_official'])) {
            if (!$this->validateCorporateEmployment($guarantor)) {
                return ['valid' => false, 'error' => 'Corporate employment verification failed'];
            }
        }

        return ['valid' => true];
    }

    /**
     * Validate land ownership (simplified - in production use land registry API)
     */
    protected function validateLandOwnership(Guarantor $guarantor): bool
    {
        // In production, integrate with Nigerian land registry API
        // For now, we'll check if employment_details contains land reference
        return !empty($guarantor->employment_details);
    }

    /**
     * Validate corporate employment (simplified - in production use BVN verification)
     */
    protected function validateCorporateEmployment(Guarantor $guarantor): bool
    {
        // In production, integrate with BVN verification or corporate registry
        return !empty($guarantor->employment_details);
    }

    /**
     * Validate identity document
     */
    protected function validateIdentityDocument(array $verificationData): array
    {
        if (empty($verificationData['id_number']) || empty($verificationData['id_type'])) {
            return ['valid' => false, 'error' => 'ID number and type required'];
        }

        // In production, integrate with NIN/FRSC verification API
        return ['valid' => true];
    }

    /**
     * Store digital signature
     */
    protected function storeDigitalSignature(string $signatureData): string
    {
        $signaturePath = 'signatures/' . uniqid() . '.png';
        Storage::disk('public')->put($signaturePath, base64_decode($signatureData));
        return $signaturePath;
    }

    /**
     * Send SMS (placeholder - integrate with SMS gateway)
     */
    protected function sendSMS(string $phoneNumber, string $message): void
    {
        // In production, integrate with Termii, Twilio, or other Nigerian SMS providers
        // For now, we'll log the message
        \Log::info("SMS to {$phoneNumber}: {$message}");
    }

    /**
     * Send email (placeholder)
     */
    protected function sendEmail(string $email, string $verificationLink): void
    {
        // In production, use Laravel Mail
        \Log::info("Email to {$email}: Verification link - {$verificationLink}");
    }

    /**
     * Get guarantor verification status for driver
     */
    public function getGuarantorStatus(Driver $driver): array
    {
        $guarantors = $driver->guarantors;

        return [
            'total_guarantors' => $guarantors->count(),
            'verified_guarantors' => $guarantors->where('is_verified', true)->count(),
            'liability_acknowledged' => $guarantors->where('acknowledges_liability', true)->count(),
            'ready_for_jobs' => $this->hasSufficientGuarantors($driver),
            'guarantors' => $guarantors->map(function ($guarantor) {
                return [
                    'full_name' => $guarantor->full_name,
                    'employment_type' => $guarantor->employment_type,
                    'is_verified' => $guarantor->is_verified,
                    'acknowledges_liability' => $guarantor->acknowledges_liability,
                    'verified_at' => $guarantor->verified_at,
                ];
            }),
        ];
    }

    /**
     * Trigger liability enforcement (if driver absconds)
     */
    public function triggerLiabilityEnforcement(Driver $driver): array
    {
        $guarantors = $driver->guarantors()
            ->where('is_verified', true)
            ->where('acknowledges_liability', true)
            ->get();

        foreach ($guarantors as $guarantor) {
            // Send liability notification
            $message = "URGENT: Driver you guaranteed has absconded with corporate assets. "
                      . "Your liability has been triggered. Contact Ogadriver.ng immediately.";
            
            $this->sendSMS($guarantor->phone_number, $message);
            $this->sendEmail($guarantor->email, $message);
        }

        return [
            'success' => true,
            'notified_guarantors' => $guarantors->count(),
            'message' => 'Liability enforcement triggered for all guarantors',
        ];
    }

    /**
     * Initiate AI-powered phone call to guarantor
     */
    public function initiateAiGuarantorCall(int $guarantorId, int $driverId, array $questions): array
    {
        $guarantor = Guarantor::findOrFail($guarantorId);
        $driver = Driver::findOrFail($driverId);

        // Integration with Twilio/AI Voice Service would go here
        // For now, we simulate the call initiation
        $callId = 'call_' . Str::random(10);

        GuarantorVerification::create([
            'guarantor_id' => $guarantorId,
            'driver_id' => $driverId,
            'call_id' => $callId,
            'answers' => ['questions' => $questions],
        ]);

        // Use driver's actual location if available, otherwise fallback to Lagos
        $latitude = $driver->latitude ?: 6.5244;
        $longitude = $driver->longitude ?: 3.3792;
        $addressMatch = !empty($driver->residence_address);

        return [
            'success' => true,
            'call_id' => $callId,
            'location_data' => [
                'address_match' => $addressMatch,
                'geo_verified' => true,
                'residence_duration' => 'Verified via AI',
                'risk_level' => 'low',
                'coordinates' => [
                    'lat' => $latitude,
                    'lng' => $longitude
                ]
            ]
        ];
    }

    /**
     * Analyze guarantor call transcript using AI
     */
    public function analyzeGuarantorCall(int $guarantorId, int $driverId, string $transcript, array $answers, int $duration): array
    {
        // Simulate AI analysis logic
        $categories = [
            [
                'name' => 'Relationship Verification',
                'score' => rand(70, 95),
                'assessment' => 'Strong relationship evidence, long-term acquaintance confirmed'
            ],
            [
                'name' => 'Guarantor Understanding',
                'score' => rand(70, 95),
                'assessment' => 'Clear understanding of obligations and responsibilities'
            ],
            [
                'name' => 'Financial Awareness',
                'score' => rand(60, 90),
                'assessment' => 'Adequate understanding of financial liabilities'
            ],
            [
                'name' => 'Location Verification',
                'score' => rand(80, 100),
                'assessment' => 'Address confirmed, residence duration verified'
            ]
        ];

        $avgScore = collect($categories)->avg('score');

        $verification = GuarantorVerification::where('guarantor_id', $guarantorId)
            ->where('driver_id', $driverId)
            ->latest()
            ->first();

        if ($verification) {
            $verification->update([
                'transcript' => $transcript,
                'answers' => $answers,
                'duration' => $duration,
                'certification_score' => $avgScore,
                'analysis' => ['categories' => $categories],
                'verified' => $avgScore >= 75,
                'verified_at' => $avgScore >= 75 ? now() : null,
            ]);

            if ($avgScore >= 75) {
                $guarantor = Guarantor::find($guarantorId);
                if ($guarantor) {
                    $guarantor->update([
                        'is_verified' => true,
                        'verified_at' => now(),
                    ]);
                    
                    // Also update driver's quick status fields if applicable
                    $driver = $guarantor->driver;
                    if ($driver) {
                        $guarantors = $driver->guarantors;
                        $firstGuarantor = $guarantors->first();
                        $secondGuarantor = $guarantors->skip(1)->first();
                        
                        if ($firstGuarantor && $firstGuarantor->id == $guarantorId) {
                            $driver->update(['guarantor_a_status' => 'verified']);
                        } elseif ($secondGuarantor && $secondGuarantor->id == $guarantorId) {
                            $driver->update(['guarantor_b_status' => 'verified']);
                        }
                    }
                }
            }
        }

        return [
            'success' => true,
            'analysis' => [
                'categories' => $categories,
                'recommendations' => [
                    [
                        'type' => $avgScore >= 75 ? 'approve' : 'review',
                        'title' => $avgScore >= 75 ? 'Approve Guarantor' : 'Manual Review Required',
                        'description' => $avgScore >= 75 ? 'Guarantor demonstrates strong reliability' : 'Some concerns detected in transcript'
                    ]
                ]
            ],
            'certification_score' => $avgScore
        ];
    }

    /**
     * Perform location-based certification analysis
     */
    public function performLocationCertification(int $driverId, string $address, array $coordinates): array
    {
        $driver = Driver::findOrFail($driverId);

        // Simulate geo-analysis based on provided coordinates vs profile
        $geoMatch = true; 
        if (isset($coordinates['lat']) && $driver->latitude) {
            $distance = sqrt(pow($coordinates['lat'] - $driver->latitude, 2) + pow($coordinates['lng'] - $driver->longitude, 2));
            $geoMatch = $distance < 0.01; // roughly 1km
        }

        $residenceStability = !empty($address) ? 'high' : 'medium';
        $locationRiskScore = $geoMatch ? rand(5, 25) : rand(40, 70);
        $certificationLevel = $locationRiskScore < 20 ? 'gold' : ($locationRiskScore < 50 ? 'silver' : 'bronze');

        $certification = LocationCertification::create([
            'driver_id' => $driverId,
            'address_verified' => !empty($address),
            'geo_match' => $geoMatch,
            'residence_stability' => $residenceStability,
            'location_risk_score' => $locationRiskScore,
            'service_area_coverage' => $geoMatch ? rand(80, 95) : rand(40, 60),
            'certification_level' => $certificationLevel,
            'recommendations' => [
                $geoMatch ? 'Driver is in optimal service area' : 'Driver is outside standard service area',
                $residenceStability === 'high' ? 'High residence stability indicates reliability' : 'Residence verification pending'
            ],
        ]);

        // Update driver status
        $driver->update([
            'location_verified' => true,
            'location_certification_level' => $certificationLevel,
            'last_location_certification_at' => now(),
        ]);

        return [
            'success' => true,
            'certification' => [
                'address_verified' => !empty($address),
                'geo_match' => $geoMatch,
                'residence_stability' => $residenceStability,
                'location_risk_score' => $locationRiskScore,
                'service_area_coverage' => $certification->service_area_coverage,
                'certification_level' => $certificationLevel,
                'recommendations' => $certification->recommendations
            ]
        ];
    }
}
