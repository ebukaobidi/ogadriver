<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\DriverDocument;
use Illuminate\Support\Facades\DB;

class InsuranceService
{
    /**
     * Insurance document types
     */
    public const INSURANCE_TYPES = [
        'third_party' => 'Third Party Motor Insurance',
        'comprehensive' => 'Comprehensive Motor Insurance',
        'personal_accident' => 'Personal Accident Insurance',
        'health' => 'Health Insurance',
        'passenger_liability' => 'Passenger Liability Insurance',
    ];

    /**
     * Minimum insurance requirements for operation
     */
    public const MINIMUM_INSURANCE_REQUIRED = 'third_party';

    /**
     * Recommended insurance for Hybrid tier
     */
    public const HYBRID_RECOMMENDED_INSURANCE = ['comprehensive', 'personal_accident'];

    /**
     * Check if driver has valid insurance
     */
    public function hasValidInsurance(int $driverId, string $insuranceType = null): bool
    {
        $query = DriverDocument::where('driver_id', $driverId)
            ->where('document_type', 'insurance')
            ->where('status', 'approved')
            ->where('expiry_date', '>', now());

        if ($insuranceType) {
            $query->where('document_number', 'like', $insuranceType . '%');
        }

        return $query->exists();
    }

    /**
     * Get driver's insurance documents
     */
    public function getDriverInsurance(int $driverId): array
    {
        $documents = DriverDocument::where('driver_id', $driverId)
            ->where('document_type', 'insurance')
            ->get();

        return $documents->map(function ($doc) {
            return [
                'id' => $doc->id,
                'type' => $this->extractInsuranceType($doc->document_number),
                'document_number' => $doc->document_number,
                'issue_date' => $doc->issue_date?->toIso8601String(),
                'expiry_date' => $doc->expiry_date->toIso8601String(),
                'is_valid' => $doc->expiry_date->isFuture(),
                'days_until_expiry' => now()->diffInDays($doc->expiry_date, false),
                'status' => $doc->status,
                'is_verified' => $doc->is_verified,
            ];
        })->toArray();
    }

    /**
     * Extract insurance type from document number
     */
    private function extractInsuranceType(?string $documentNumber): string
    {
        if (!$documentNumber) {
            return 'unknown';
        }

        foreach (self::INSURANCE_TYPES as $type => $name) {
            if (str_starts_with($documentNumber, $type)) {
                return $type;
            }
        }

        return 'third_party'; // Default to third party
    }

    /**
     * Check if driver meets minimum insurance requirements
     */
    public function meetsMinimumRequirements(int $driverId): bool
    {
        return $this->hasValidInsurance($driverId, self::MINIMUM_INSURANCE_REQUIRED);
    }

    /**
     * Check if driver meets Hybrid tier insurance recommendations
     */
    public function meetsHybridRecommendations(int $driverId): array
    {
        $status = [
            'meets_all' => true,
            'missing' => [],
            'expiring_soon' => [],
        ];

        foreach (self::HYBRID_RECOMMENDED_INSURANCE as $type) {
            if (!$this->hasValidInsurance($driverId, $type)) {
                $status['meets_all'] = false;
                $status['missing'][] = $type;
            }
        }

        // Check for expiring insurance
        $documents = DriverDocument::where('driver_id', $driverId)
            ->where('document_type', 'insurance')
            ->where('expiry_date', '<=', now()->addDays(30))
            ->where('expiry_date', '>', now())
            ->get();

        foreach ($documents as $doc) {
            $status['expiring_soon'][] = [
                'type' => $this->extractInsuranceType($doc->document_number),
                'expiry_date' => $doc->expiry_date->toIso8601String(),
                'days_remaining' => now()->diffInDays($doc->expiry_date),
            ];
        }

        return $status;
    }

    /**
     * Deactivate drivers with expired insurance
     */
    public function deactivateExpiredInsuranceDrivers(): int
    {
        $deactivatedCount = 0;

        // Find drivers with expired insurance
        $expiredDocuments = DriverDocument::where('document_type', 'insurance')
            ->where('status', 'approved')
            ->where('expiry_date', '<', now())
            ->get();

        foreach ($expiredDocuments as $document) {
            $driver = $document->driver;

            // Check if this was their only valid insurance
            $hasOtherValidInsurance = DriverDocument::where('driver_id', $driver->id)
                ->where('document_type', 'insurance')
                ->where('id', '!=', $document->id)
                ->where('status', 'approved')
                ->where('expiry_date', '>', now())
                ->exists();

            if (!$hasOtherValidInsurance) {
                $driver->update([
                    'is_online' => false,
                    'status' => 'inactive',
                ]);

                // Send notification
                // This would trigger a notification to the driver

                $deactivatedCount++;
            }
        }

        return $deactivatedCount;
    }

    /**
     * Get insurance partnership recommendations
     */
    public function getPartnershipRecommendations(): array
    {
        return [
            'phase_1' => [
                'description' => 'Mandatory third-party verification',
                'actions' => [
                    'Enforce valid third-party insurance as hard verification requirement',
                    'Auto-suspend drivers when insurance expires',
                    'Display insurance status on driver profiles',
                ],
            ],
            'phase_2' => [
                'description' => 'Group partnerships for Hybrid tier',
                'recommended_partners' => [
                    'MyCover.ai' => 'API-based embedded insurance',
                    'Bastion Health' => 'Health insurance plans',
                    'AXA Mansard' => 'Personal accident cover',
                    'Leadway Health' => 'Group health schemes',
                    'Heala' => 'Affordable health plans',
                ],
                'implementation' => [
                    'Include basic personal accident in Hybrid subscription',
                    'Offer optional family health top-up',
                    'Display "Insured" badge on Hybrid profiles',
                ],
            ],
            'phase_3' => [
                'description' => 'Scale and compliance',
                'actions' => [
                    'Add passenger liability cover for on-demand trips',
                    'Enable employer-paid add-on insurance',
                    'Monitor NHIA 2026 compliance requirements',
                ],
            ],
        ];
    }

    /**
     * Get insurance status for driver display
     */
    public function getInsuranceStatusForDisplay(int $driverId): array
    {
        $driver = Driver::find($driverId);

        if (!$driver) {
            return ['status' => 'driver_not_found'];
        }

        $hasMinimum = $this->meetsMinimumRequirements($driverId);
        $hybridStatus = $this->meetsHybridRecommendations($driverId);
        $insurances = $this->getDriverInsurance($driverId);

        return [
            'has_minimum_insurance' => $hasMinimum,
            'can_operate' => $hasMinimum,
            'meets_hybrid_recommendations' => $hybridStatus['meets_all'],
            'missing_hybrid_insurance' => $hybridStatus['missing'],
            'expiring_soon' => $hybridStatus['expiring_soon'],
            'insurances' => $insurances,
            'insurance_badge' => $this->getInsuranceBadge($driverId),
        ];
    }

    /**
     * Get insurance badge for display
     */
    private function getInsuranceBadge(int $driverId): ?string
    {
        if (!$this->meetsMinimumRequirements($driverId)) {
            return null;
        }

        $hybridStatus = $this->meetsHybridRecommendations($driverId);
        if ($hybridStatus['meets_all']) {
            return 'fully_insured';
        }

        return 'basic_insured';
    }

    /**
     * Validate insurance document before approval
     */
    public function validateInsuranceDocument(DriverDocument $document): array
    {
        $validation = [
            'valid' => true,
            'errors' => [],
        ];

        // Check if document type is insurance
        if ($document->document_type !== 'insurance') {
            $validation['valid'] = false;
            $validation['errors'][] = 'Document type must be insurance';
        }

        // Check expiry date
        if (!$document->expiry_date || $document->expiry_date->isPast()) {
            $validation['valid'] = false;
            $validation['errors'][] = 'Insurance must have a valid future expiry date';
        }

        // Check issue date
        if (!$document->issue_date) {
            $validation['valid'] = false;
            $validation['errors'][] = 'Insurance issue date is required';
        }

        // Check document number format
        if (!$document->document_number) {
            $validation['valid'] = false;
            $validation['errors'][] = 'Insurance policy number is required';
        }

        return $validation;
    }

    /**
     * Get insurance expiry warnings for drivers
     */
    public function getExpiryWarnings(int $daysThreshold = 30): array
    {
        $expiringDocuments = DriverDocument::where('document_type', 'insurance')
            ->where('status', 'approved')
            ->where('expiry_date', '<=', now()->addDays($daysThreshold))
            ->where('expiry_date', '>', now())
            ->with('driver.user')
            ->get();

        return $expiringDocuments->map(function ($doc) {
            return [
                'driver_id' => $doc->driver_id,
                'driver_name' => $doc->driver->user->name ?? 'Unknown',
                'insurance_type' => $this->extractInsuranceType($doc->document_number),
                'expiry_date' => $doc->expiry_date->toIso8601String(),
                'days_remaining' => now()->diffInDays($doc->expiry_date),
                'document_id' => $doc->id,
            ];
        })->toArray();
    }
}
