<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\DriverDocument;
use App\Notifications\DriverVerificationStatusChanged;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DriverVerificationService
{
    /**
     * Get complete verification status for a driver
     */
    public function getVerificationStatus(Driver $driver): array
    {
        $status = [
            'email_verified' => $driver->user->email_verified_at !== null,
            'documents_uploaded' => $this->hasRequiredDocuments($driver),
            'documents_verified' => $this->areDocumentsVerified($driver),
            'biometric_verified' => $driver->biometric_verified ?? false,
            'guarantors_verified' => $this->hasVerifiedGuarantors($driver),
            'simulator_completed' => $driver->simulator_completed ?? false,
            'is_fully_verified' => false,
            'can_take_jobs' => false,
            'progress_percentage' => $this->calculateProgressPercentage($driver),
        ];

        // Determine if driver is fully verified (requires admin approval)
        $status['is_fully_verified'] = 
            $status['email_verified'] &&
            $status['documents_uploaded'] &&
            $status['documents_verified'] &&
            $status['biometric_verified'] &&
            $status['guarantors_verified'] &&
            $status['simulator_completed'];

        // Determine if driver can take jobs (basic verification)
        $status['can_take_jobs'] = 
            $status['email_verified'] &&
            $status['documents_uploaded'] &&
            $driver->is_verified;

        return $status;
    }

    /**
     * Calculate accurate verification progress percentage
     */
    protected function calculateProgressPercentage(Driver $driver): int
    {
        $totalSteps = 6;
        $completedSteps = 0;

        // Step 1: Email verification (15%)
        if ($driver->user->email_verified_at !== null) {
            $completedSteps++;
        }

        // Step 2: Document upload (25%)
        if ($this->hasRequiredDocuments($driver)) {
            $completedSteps++;
        }

        // Step 3: Document verification by admin (25%)
        if ($this->areDocumentsVerified($driver)) {
            $completedSteps++;
        }

        // Step 4: Biometric verification (15%)
        if ($driver->biometric_verified ?? false) {
            $completedSteps++;
        }

        // Step 5: Guarantor verification (10%)
        if ($this->hasVerifiedGuarantors($driver)) {
            $completedSteps++;
        }

        // Step 6: Simulator training completion (10%)
        if ($driver->simulator_completed ?? false) {
            $completedSteps++;
        }

        return ($completedSteps / $totalSteps) * 100;
    }

    /**
     * Check if driver has uploaded required documents
     */
    protected function hasRequiredDocuments(Driver $driver): bool
    {
        $requiredDocs = ['license_front', 'license_selfie', 'police_clearance'];
        $uploadedDocs = $driver->documents()->whereIn('document_type', $requiredDocs)->count();
        
        return $uploadedDocs >= count($requiredDocs);
    }

    /**
     * Check if documents are verified by admin
     */
    protected function areDocumentsVerified(Driver $driver): bool
    {
        $requiredDocs = ['license_front', 'license_selfie', 'police_clearance'];
        $verifiedDocs = $driver->documents()
            ->whereIn('document_type', $requiredDocs)
            ->where('is_verified', true)
            ->count();
        
        return $verifiedDocs >= count($requiredDocs);
    }

    /**
     * Check if driver has 2 verified guarantors
     */
    protected function hasVerifiedGuarantors(Driver $driver): bool
    {
        return $driver->guarantors()
            ->where('is_verified', true)
            ->where('acknowledges_liability', true)
            ->count() >= 2;
    }

    /**
     * Update driver verification status based on completed steps
     */
    public function updateVerificationStatus(Driver $driver): void
    {
        $previousStatus = $driver->replicate();
        $status = $this->getVerificationStatus($driver);

        // Basic verification (can take jobs with restrictions)
        if ($status['email_verified'] && $status['documents_uploaded']) {
            $driver->update(['is_verified' => true]);
        }

        // Full verification (no restrictions) - Only start trial and list after admin approval
        if ($status['is_fully_verified']) {
            $driver->update([
                'is_verified' => true,
                'status' => 'active',
            ]);

            // Start trial period if not already started (only after admin approval)
            if (!$driver->is_on_trial && !$driver->trial_started_at) {
                $this->startTrialPeriod($driver);
                $this->logVerificationChange($driver, 'trial_started', 'Trial period started after full verification');
            }

            // List driver if not already listed
            if (!$driver->is_listed) {
                $this->listDriver($driver);
                $this->logVerificationChange($driver, 'driver_listed', 'Driver listed in directory');
            }
        }

        // Send notification if verification status changed
        if ($previousStatus->is_verified !== $driver->is_verified || $previousStatus->status !== $driver->status) {
            $message = $status['is_fully_verified'] 
                ? 'Congratulations! Your verification is complete. You are now eligible for dispatch.'
                : 'Your verification status has been updated.';
            
            $driver->user->notify(new DriverVerificationStatusChanged(
                $status['is_fully_verified'] ? 'verified' : 'pending',
                $message
            ));
            
            $this->logVerificationChange($driver, 'status_updated', $message);
        }
    }

    /**
     * Start 15-day trial period for driver
     */
    public function startTrialPeriod(Driver $driver): void
    {
        $trialStart = now();
        $trialEnd = now()->addDays(15);

        $driver->update([
            'trial_started_at' => $trialStart,
            'trial_ends_at' => $trialEnd,
            'is_on_trial' => true,
        ]);
    }

    /**
     * List driver for their level
     */
    public function listDriver(Driver $driver): void
    {
        $driver->update([
            'is_listed' => true,
            'listed_at' => now(),
            'status' => 'active',
        ]);
    }

    /**
     * Delist driver after trial period ends
     */
    public function delistDriver(Driver $driver, string $reason = 'trial_period_ended'): void
    {
        $driver->update([
            'is_listed' => false,
            'delisted_at' => now(),
            'delisted_reason' => $reason,
            'is_on_trial' => false,
            'status' => 'inactive',
        ]);

        $this->logVerificationChange($driver, 'driver_delisted', "Driver delisted: {$reason}");
    }

    /**
     * Check if driver is eligible for dispatch (requires both verification and active subscription)
     */
    public function isEligibleForDispatch(Driver $driver): bool
    {
        // Check if driver is fully verified
        $status = $this->getVerificationStatus($driver);
        if (!$status['is_fully_verified']) {
            return false;
        }

        // Check if driver is listed
        if (!$driver->is_listed) {
            return false;
        }

        // Check if driver has active subscription or is on trial
        if ($driver->is_on_trial && !$this->isTrialExpired($driver)) {
            return true;
        }

        // Check subscription status (assuming subscription model exists)
        if ($driver->subscription_expires_at && $driver->subscription_expires_at->isFuture()) {
            return true;
        }

        return false;
    }

    /**
     * Get dispatch eligibility status
     */
    public function getDispatchStatus(Driver $driver): array
    {
        $status = $this->getVerificationStatus($driver);
        $trialStatus = $this->getTrialStatus($driver);
        
        $isEligible = $this->isEligibleForDispatch($driver);
        
        return [
            'eligible' => $isEligible,
            'reason' => $this->getDispatchIneligibilityReason($driver, $status, $trialStatus),
            'verification_complete' => $status['is_fully_verified'],
            'subscription_active' => $driver->is_on_trial || ($driver->subscription_expires_at && $driver->subscription_expires_at->isFuture()),
            'trial_active' => $trialStatus['on_trial'] && !$trialStatus['trial_expired'],
        ];
    }

    /**
     * Get reason why driver is not eligible for dispatch
     */
    protected function getDispatchIneligibilityReason(Driver $driver, array $status, array $trialStatus): string
    {
        if (!$status['is_fully_verified']) {
            return 'Verification incomplete';
        }

        if (!$driver->is_listed) {
            return 'Not listed in directory';
        }

        if ($trialStatus['trial_expired']) {
            return 'Trial period expired';
        }

        if (!$driver->is_on_trial && (!$driver->subscription_expires_at || $driver->subscription_expires_at->isPast())) {
            return 'Subscription expired';
        }

        return 'Unknown';
    }
    /**
     * Log verification status changes
     */
    protected function logVerificationChange(Driver $driver, string $action, string $details): void
    {
        Log::info('Driver Verification Change', [
            'driver_id' => $driver->id,
            'user_id' => $driver->user_id,
            'action' => $action,
            'details' => $details,
            'is_verified' => $driver->is_verified,
            'is_on_trial' => $driver->is_on_trial,
            'is_listed' => $driver->is_listed,
            'trial_ends_at' => $driver->trial_ends_at,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Check if trial period has expired
     */
    public function isTrialExpired(Driver $driver): bool
    {
        return $driver->is_on_trial && 
               $driver->trial_ends_at && 
               $driver->trial_ends_at->isPast();
    }

    /**
     * Get trial period status
     */
    public function getTrialStatus(Driver $driver): array
    {
        if (!$driver->is_on_trial) {
            return [
                'on_trial' => false,
                'trial_started' => false,
                'trial_expired' => false,
                'days_remaining' => 0,
                'trial_ends_at' => null,
            ];
        }

        $daysRemaining = $driver->trial_ends_at ? now()->diffInDays($driver->trial_ends_at, false) : 0;
        $isExpired = $this->isTrialExpired($driver);

        return [
            'on_trial' => true,
            'trial_started' => $driver->trial_started_at !== null,
            'trial_expired' => $isExpired,
            'days_remaining' => max(0, $daysRemaining),
            'trial_ends_at' => $driver->trial_ends_at,
            'trial_started_at' => $driver->trial_started_at,
        ];
    }

    /**
     * Get verification checklist for frontend display
     */
    public function getVerificationChecklist(Driver $driver): array
    {
        $status = $this->getVerificationStatus($driver);

        return [
            [
                'step' => 'email_verification',
                'title' => 'Email Verification',
                'description' => 'Verify your email address',
                'completed' => $status['email_verified'],
                'required' => true,
            ],
            [
                'step' => 'document_upload',
                'title' => 'Document Upload',
                'description' => 'Upload driver\'s license, selfie, and police clearance',
                'completed' => $status['documents_uploaded'],
                'required' => true,
            ],
            [
                'step' => 'document_verification',
                'title' => 'Document Verification',
                'description' => 'Wait for admin to verify your documents',
                'completed' => $status['documents_verified'],
                'required' => true,
            ],
            [
                'step' => 'biometric_verification',
                'title' => 'Biometric Verification',
                'description' => 'Complete NIN/FRSC biometric verification',
                'completed' => $status['biometric_verified'],
                'required' => true,
            ],
            [
                'step' => 'guarantor_verification',
                'title' => 'Guarantor Verification',
                'description' => 'Get 2 verified guarantors',
                'completed' => $status['guarantors_verified'],
                'required' => true,
            ],
            [
                'step' => 'simulator_training',
                'title' => 'Road Simulator Training',
                'description' => 'Complete the road safety simulator training',
                'completed' => $status['simulator_completed'],
                'required' => true,
            ],
        ];
    }

    /**
     * Save simulator training results
     */
    public function saveSimulatorResult(Driver $driver, int $score, string $difficulty): void
    {
        $normalizedDifficulty = strtolower($difficulty);
        $driver->update([
            'simulator_high_score' => max($driver->simulator_high_score ?? 0, $score),
            'simulator_difficulty' => $normalizedDifficulty,
        ]);

        // Support both point threshold (500+) and percentage threshold (70%+)
        $minScore = match ($normalizedDifficulty) {
            'expert' => 1500,
            'advanced' => 1000,
            'intermediate' => 750,
            default => 500,
        };

        $minPercentage = match ($normalizedDifficulty) {
            'expert' => 85,
            'advanced' => 80,
            'intermediate' => 75,
            default => 70,
        };

        $isPassed = ($score >= $minScore) || ($score >= $minPercentage);

        if ($isPassed && !$driver->simulator_completed) {
            $driver->update([
                'simulator_completed' => true,
                'simulator_completed_at' => now(),
            ]);

            // Update verification status
            $this->updateVerificationStatus($driver);
            
            $this->logVerificationChange($driver, 'simulator_completed', "Road simulator training completed with score: {$score}");
        }
    }
}
