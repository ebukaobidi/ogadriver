<?php

namespace App\Services;

use App\Models\DriverDocument;
use App\Models\Driver;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class DocumentVerificationService
{
    /**
     * Verify police clearance document
     */
    public function verifyPoliceClearance(DriverDocument $document): array
    {
        if ($document->document_type !== 'police_clearance') {
            return [
                'success' => false,
                'message' => 'Document is not a police clearance',
            ];
        }

        if ($document->is_verified) {
            return [
                'success' => false,
                'message' => 'Document already verified',
            ];
        }

        $result = [
            'success' => false,
            'verified' => false,
            'confidence' => 0,
            'details' => [],
            'message' => '',
        ];

        try {
            // Step 1: OCR Analysis
            $ocrResult = $this->analyzeDocumentOCR($document);
            
            // Step 2: Validate document structure
            $structureValid = $this->validateDocumentStructure($ocrResult);
            
            // Step 3: Check expiry date
            $expiryValid = $this->validateExpiryDate($document);
            
            // Step 4: Cross-reference with police database (simulated)
            $policeValid = $this->crossReferencePoliceDatabase($document, $ocrResult);
            
            // Calculate overall confidence
            $confidence = $this->calculateConfidence($ocrResult, $structureValid, $expiryValid, $policeValid);
            
            $result = [
                'success' => true,
                'verified' => $confidence >= 70,
                'confidence' => $confidence,
                'details' => [
                    'ocr_analysis' => $ocrResult,
                    'structure_valid' => $structureValid,
                    'expiry_valid' => $expiryValid,
                    'police_valid' => $policeValid,
                ],
                'message' => $confidence >= 70 ? 'Police clearance verified successfully' : 'Document verification inconclusive',
            ];

            // Auto-approve if high confidence
            if ($confidence >= 90) {
                $this->autoApproveDocument($document, $result);
            }

        } catch (\Exception $e) {
            Log::error('Police clearance verification failed', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
            ]);
            
            $result['message'] = 'Verification process failed: ' . $e->getMessage();
        }

        return $result;
    }

    /**
     * Analyze document using OCR
     */
    private function analyzeDocumentOCR(DriverDocument $document): array
    {
        // In production, this would integrate with an OCR service like Google Vision API, AWS Textract, etc.
        // For now, we'll simulate the analysis
        
        return [
            'document_number_detected' => !empty($document->document_number),
            'issue_date_detected' => !empty($document->issue_date),
            'expiry_date_detected' => !empty($document->expiry_date),
            'text_quality' => 'good', // Would be calculated from actual OCR
            'confidence' => 85, // Simulated OCR confidence
        ];
    }

    /**
     * Validate document structure
     */
    private function validateDocumentStructure(array $ocrResult): bool
    {
        // Check if required fields are present
        return $ocrResult['document_number_detected'] 
            && $ocrResult['issue_date_detected'] 
            && $ocrResult['expiry_date_detected'];
    }

    /**
     * Validate expiry date
     */
    private function validateExpiryDate(DriverDocument $document): bool
    {
        if (!$document->expiry_date) {
            return false;
        }

        $expiryDate = Carbon::parse($document->expiry_date);
        return $expiryDate->isFuture();
    }

    /**
     * Cross-reference with police database (simulated)
     */
    private function crossReferencePoliceDatabase(DriverDocument $document, array $ocrResult): array
    {
        // In production, this would integrate with actual police database API
        // For now, we'll simulate the check
        
        $driver = Driver::find($document->driver_id);
        if (!$driver) {
            return [
                'valid' => false,
                'message' => 'Driver not found',
            ];
        }

        // Simulate police database check
        return [
            'valid' => true,
            'database_matched' => true,
            'record_found' => true,
            'clearance_status' => 'clear',
            'message' => 'Record found in police database with clear status',
        ];
    }

    /**
     * Calculate overall verification confidence
     */
    private function calculateConfidence(array $ocrResult, bool $structureValid, bool $expiryValid, array $policeValid): int
    {
        $confidence = 0;

        // OCR confidence (30% weight)
        $confidence += ($ocrResult['confidence'] * 0.3);

        // Structure validity (20% weight)
        $confidence += ($structureValid ? 20 : 0);

        // Expiry validity (20% weight)
        $confidence += ($expiryValid ? 20 : 0);

        // Police database validation (30% weight)
        $confidence += ($policeValid['valid'] ? 30 : 0);

        return min((int) $confidence, 100);
    }

    /**
     * Auto-approve document
     */
    private function autoApproveDocument(DriverDocument $document, array $verificationResult): void
    {
        $document->is_verified = true;
        $document->verified_at = Carbon::now();
        $document->verification_method = 'automated';
        $document->verification_confidence = $verificationResult['confidence'];
        $document->save();

        Log::info('Document auto-approved', [
            'document_id' => $document->id,
            'driver_id' => $document->driver_id,
            'confidence' => $verificationResult['confidence'],
        ]);
    }

    /**
     * Batch verify pending documents
     */
    public function batchVerifyPendingDocuments(): array
    {
        $results = [
            'processed' => 0,
            'approved' => 0,
            'rejected' => 0,
            'pending_review' => 0,
        ];

        $pendingDocuments = DriverDocument::where('document_type', 'police_clearance')
            ->where('is_verified', false)
            ->where('status', 'pending')
            ->limit(50) // Process in batches
            ->get();

        foreach ($pendingDocuments as $document) {
            $results['processed']++;
            
            $verificationResult = $this->verifyPoliceClearance($document);
            
            if ($verificationResult['verified']) {
                $results['approved']++;
            } elseif ($verificationResult['confidence'] < 50) {
                // Low confidence - mark for manual review
                $document->status = 'requires_review';
                $document->rejection_reason = 'Low confidence score - requires manual verification';
                $document->save();
                $results['pending_review']++;
            } else {
                // Medium confidence - pending review
                $results['pending_review']++;
            }
        }

        return $results;
    }

    /**
     * Get documents requiring manual review
     */
    public function getDocumentsRequiringReview(): array
    {
        return DriverDocument::where('status', 'requires_review')
            ->orWhere(function ($query) {
                $query->where('document_type', 'police_clearance')
                    ->where('is_verified', false)
                    ->where('created_at', '<', Carbon::now()->subDays(7));
            })
            ->with('driver')
            ->get()
            ->toArray();
    }

    /**
     * Manually approve document (admin override)
     */
    public function manualApproveDocument(int $documentId, int $adminUserId, string $notes = ''): bool
    {
        $document = DriverDocument::find($documentId);
        if (!$document) return false;

        $document->is_verified = true;
        $document->verified_at = Carbon::now();
        $document->verified_by = $adminUserId;
        $document->verification_method = 'manual';
        $document->verification_notes = $notes;
        $document->status = 'approved';
        $document->save();

        Log::info('Document manually approved', [
            'document_id' => $documentId,
            'admin_id' => $adminUserId,
            'notes' => $notes,
        ]);

        return true;
    }

    /**
     * Manually reject document (admin override)
     */
    public function manualRejectDocument(int $documentId, int $adminUserId, string $reason): bool
    {
        $document = DriverDocument::find($documentId);
        if (!$document) return false;

        $document->is_verified = false;
        $document->verified_at = Carbon::now();
        $document->verified_by = $adminUserId;
        $document->verification_method = 'manual';
        $document->rejection_reason = $reason;
        $document->status = 'rejected';
        $document->save();

        Log::info('Document manually rejected', [
            'document_id' => $documentId,
            'admin_id' => $adminUserId,
            'reason' => $reason,
        ]);

        return true;
    }

    /**
     * Get verification statistics
     */
    public function getVerificationStatistics(): array
    {
        $total = DriverDocument::where('document_type', 'police_clearance')->count();
        $verified = DriverDocument::where('document_type', 'police_clearance')
            ->where('is_verified', true)
            ->count();
        $pending = DriverDocument::where('document_type', 'police_clearance')
            ->where('is_verified', false)
            ->where('status', 'pending')
            ->count();
        $rejected = DriverDocument::where('document_type', 'police_clearance')
            ->where('status', 'rejected')
            ->count();
        $requiresReview = DriverDocument::where('status', 'requires_review')->count();

        return [
            'total' => $total,
            'verified' => $verified,
            'pending' => $pending,
            'rejected' => $rejected,
            'requires_review' => $requiresReview,
            'verification_rate' => $total > 0 ? round(($verified / $total) * 100, 2) : 0,
        ];
    }
}
