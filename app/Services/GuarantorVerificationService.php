<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\Guarantor;
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
}
