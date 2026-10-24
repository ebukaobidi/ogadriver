<?php

namespace App\Services;

use App\Models\DriverDocument;
use App\Models\Driver;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DocumentValidationService
{
    protected DocumentOCRService $ocrService;

    public function __construct(DocumentOCRService $ocrService)
    {
        $this->ocrService = $ocrService;
    }

    /**
     * Validate document before allowing admin approval
     */
    public function validateForApproval(DriverDocument $document): array
    {
        $validation = [
            'can_approve' => true,
            'errors' => [],
            'warnings' => [],
            'score' => 100,
        ];

        // 1. Check if document is expired
        if ($document->expiry_date && $document->expiry_date->isPast()) {
            $validation['can_approve'] = false;
            $validation['errors'][] = [
                'field' => 'expiry_date',
                'message' => 'Document is expired',
                'severity' => 'critical',
            ];
            $validation['score'] -= 50;
        }

        // 2. Check if document is expiring soon (within 30 days)
        if ($document->expiry_date && $document->expiry_date->lte(Carbon::now()->addDays(30))) {
            $validation['warnings'][] = [
                'field' => 'expiry_date',
                'message' => 'Document expires soon (' . $document->expiry_date->diffForHumans() . ')',
                'severity' => 'warning',
            ];
            $validation['score'] -= 20;
        }

        // 3. Run OCR validation if available
        if ($document->ocr_data) {
            $ocrValidation = $this->validateOCRData($document);
            $validation['warnings'] = array_merge($validation['warnings'], $ocrValidation['warnings']);
            $validation['errors'] = array_merge($validation['errors'], $ocrValidation['errors']);
            $validation['score'] -= $ocrValidation['deduction'];
            
            if (!$ocrValidation['is_valid']) {
                $validation['can_approve'] = false;
            }
        }

        // 4. Check document type requirements
        $typeValidation = $this->validateDocumentType($document);
        $validation['warnings'] = array_merge($validation['warnings'], $typeValidation['warnings']);
        $validation['errors'] = array_merge($validation['errors'], $typeValidation['errors']);
        $validation['score'] -= $typeValidation['deduction'];

        if (!$typeValidation['is_valid']) {
            $validation['can_approve'] = false;
        }

        // 5. Check file integrity
        $fileValidation = $this->validateFile($document);
        $validation['warnings'] = array_merge($validation['warnings'], $fileValidation['warnings']);
        $validation['errors'] = array_merge($validation['errors'], $fileValidation['errors']);
        $validation['score'] -= $fileValidation['deduction'];

        if (!$fileValidation['is_valid']) {
            $validation['can_approve'] = false;
        }

        // Ensure score doesn't go below 0
        $validation['score'] = max(0, $validation['score']);

        return $validation;
    }

    /**
     * Validate OCR extracted data
     */
    protected function validateOCRData(DriverDocument $document): array
    {
        $result = [
            'is_valid' => true,
            'warnings' => [],
            'errors' => [],
            'deduction' => 0,
        ];

        if (empty($document->ocr_data)) {
            return $result;
        }

        $ocrData = $document->ocr_data;

        // Check if OCR detected expiry date matches provided
        if (!empty($ocrData['expiry_date'])) {
            $ocrExpiry = Carbon::parse($ocrData['expiry_date']);
            $providedExpiry = $document->expiry_date;

            if ($ocrExpiry->diffInDays($providedExpiry) > 7) {
                $result['warnings'][] = [
                    'field' => 'expiry_date',
                    'message' => "OCR expiry date ({$ocrExpiry->format('Y-m-d')}) differs significantly from provided date ({$providedExpiry->format('Y-m-d')})",
                    'severity' => 'medium',
                ];
                $result['deduction'] += 15;
            }
        }

        // Check if OCR detected document number matches
        if (!empty($ocrData['document_number']) && !empty($document->document_number)) {
            if (strtoupper($ocrData['document_number']) !== strtoupper($document->document_number)) {
                $result['errors'][] = [
                    'field' => 'document_number',
                    'message' => "OCR document number ({$ocrData['document_number']}) does not match provided number ({$document->document_number})",
                    'severity' => 'high',
                ];
                $result['deduction'] += 30;
                $result['is_valid'] = false;
            }
        }

        return $result;
    }

    /**
     * Validate document type specific requirements
     */
    protected function validateDocumentType(DriverDocument $document): array
    {
        $result = [
            'is_valid' => true,
            'warnings' => [],
            'errors' => [],
            'deduction' => 0,
        ];

        switch ($document->document_type) {
            case 'drivers_license':
                if (empty($document->document_number)) {
                    $result['errors'][] = [
                        'field' => 'document_number',
                        'message' => 'Driver\'s license number is required',
                        'severity' => 'high',
                    ];
                    $result['deduction'] += 25;
                    $result['is_valid'] = false;
                }
                break;

            case 'lasdri_card':
                if (empty($document->document_number)) {
                    $result['errors'][] = [
                        'field' => 'document_number',
                        'message' => 'LASDRI card number is required',
                        'severity' => 'high',
                    ];
                    $result['deduction'] += 25;
                    $result['is_valid'] = false;
                }
                break;

            case 'police_clearance':
                if (empty($document->document_number)) {
                    $result['warnings'][] = [
                        'field' => 'document_number',
                        'message' => 'Police clearance number recommended',
                        'severity' => 'low',
                    ];
                    $result['deduction'] += 10;
                }
                break;
        }

        return $result;
    }

    /**
     * Validate file integrity
     */
    protected function validateFile(DriverDocument $document): array
    {
        $result = [
            'is_valid' => true,
            'warnings' => [],
            'errors' => [],
            'deduction' => 0,
        ];

        $filePath = storage_path('app/public/' . $document->file_path);

        if (!file_exists($filePath)) {
            $result['errors'][] = [
                'field' => 'file',
                'message' => 'Document file not found',
                'severity' => 'critical',
            ];
            $result['deduction'] += 100;
            $result['is_valid'] = false;
            return $result;
        }

        $fileSize = filesize($filePath);
        
        // Check if file is too small (might be corrupted)
        if ($fileSize < 1024) {
            $result['errors'][] = [
                'field' => 'file',
                'message' => 'File appears to be corrupted or empty',
                'severity' => 'critical',
            ];
            $result['deduction'] += 50;
            $result['is_valid'] = false;
        }

        // Check if file is too large
        if ($fileSize > 5 * 1024 * 1024) {
            $result['warnings'][] = [
                'field' => 'file',
                'message' => 'File size is larger than recommended',
                'severity' => 'low',
            ];
            $result['deduction'] += 5;
        }

        return $result;
    }

    /**
     * Get missing documents for a driver
     */
    public function getMissingDocuments(Driver $driver): array
    {
        $requiredDocuments = [
            'drivers_license' => 'Driver\'s License',
            'medical_certificate' => 'Medical Certificate',
            'police_clearance' => 'Police Clearance',
            'insurance' => 'Vehicle Insurance',
            'vehicle_registration' => 'Vehicle Registration',
            'guarantor_form_a' => 'Guarantor Form A',
            'guarantor_form_b' => 'Guarantor Form B',
        ];

        $uploadedDocuments = $driver->documents()
            ->where('status', '!=', 'rejected')
            ->pluck('document_type')
            ->toArray();

        $missing = [];
        foreach ($requiredDocuments as $type => $name) {
            if (!in_array($type, $uploadedDocuments)) {
                $missing[] = [
                    'type' => $type,
                    'name' => $name,
                    'required' => in_array($type, ['drivers_license', 'police_clearance']),
                ];
            }
        }

        return $missing;
    }

    /**
     * Get documents expiring soon
     */
    public function getExpiringDocuments(Driver $driver, int $days = 30): array
    {
        return $driver->documents()
            ->where('status', 'approved')
            ->where('expiry_date', '<=', Carbon::now()->addDays($days))
            ->where('expiry_date', '>', Carbon::now())
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'type' => $doc->document_type,
                    'expiry_date' => $doc->expiry_date->format('Y-m-d'),
                    'days_remaining' => $doc->expiry_date->diffInDays(Carbon::now()),
                    'file_url' => $doc->file_url,
                ];
            })
            ->toArray();
    }

    /**
     * Get expired documents
     */
    public function getExpiredDocuments(Driver $driver): array
    {
        return $driver->documents()
            ->where('status', 'approved')
            ->where('expiry_date', '<', Carbon::now())
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'type' => $doc->document_type,
                    'expiry_date' => $doc->expiry_date->format('Y-m-d'),
                    'days_expired' => Carbon::now()->diffInDays($doc->expiry_date),
                    'file_url' => $doc->file_url,
                ];
            })
            ->toArray();
    }
}
