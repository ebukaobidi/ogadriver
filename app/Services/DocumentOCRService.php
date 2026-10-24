<?php

namespace App\Services;

use App\Models\DriverDocument;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Google\Cloud\Vision\V1\ImageAnnotatorClient;
use Google\Cloud\Vision\V1\Feature\Type;

class DocumentOCRService
{
    protected ?ImageAnnotatorClient $visionClient;

    public function __construct()
    {
        // Initialize Google Vision client only if the library is available
        if (class_exists('Google\\Cloud\\Vision\\V1\\ImageAnnotatorClient')) {
            try {
                $this->visionClient = new ImageAnnotatorClient([
                    'credentials' => storage_path('app/google-credentials.json')
                ]);
            } catch (\Exception $e) {
                Log::warning('Google Vision API not configured', ['error' => $e->getMessage()]);
                $this->visionClient = null;
            }
        } else {
            Log::info('Google Cloud Vision SDK not installed; OCR will be disabled.');
            $this->visionClient = null;
        }
    }

    /**
     * Process document with OCR to extract key information
     */
    public function processDocument(DriverDocument $document): array
    {
        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            return [
                'success' => false,
                'error' => 'File not found',
                'ocr_data' => null
            ];
        }

        $imageContent = file_get_contents($filePath);
        $result = $this->analyzeContent($imageContent, $document->document_type);

        if ($result['success']) {
            $validationResult = $this->validateDocument($document, $result['extracted_data']);
            
            // Store OCR data and validation results in document
            $document->update([
                'ocr_data' => array_merge($result['extracted_data'], [
                    'raw_text' => $result['raw_text'],
                    'processed_at' => now()->toIso8601String(),
                    'validation' => $validationResult,
                ])
            ]);
            
            $result['validation_result'] = $validationResult;
        }

        return $result;
    }

    /**
     * Analyze image content without updating a model
     */
    public function analyzeContent(string $imageContent, string $documentType): array
    {
        try {
            if (!$this->visionClient) {
                Log::warning('Vision client not initialized; OCR skipped.');
                return [
                    'success' => false,
                    'error' => 'Vision client not configured',
                ];
            }
            $response = $this->visionClient->textDetection($imageContent);
            $texts = $response->getTextAnnotations();
            
            $fullText = '';
            foreach ($texts as $text) {
                $fullText .= $text->getDescription() . ' ';
            }

            $extractedData = $this->extractDocumentData($documentType, $fullText);

            return [
                'success' => true,
                'extracted_data' => $extractedData,
                'raw_text' => $fullText,
            ];

        } catch (\Exception $e) {
            Log::error('OCR analysis failed', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Extract relevant data based on document type
     */
    protected function extractDocumentData(string $documentType, string $text): array
    {
        $data = [
            'document_number' => $this->extractPattern($text, '/[A-Z]{2}\d{6,}/'),
            'issue_date' => $this->extractDate($text),
            'expiry_date' => $this->extractExpiryDate($text),
            'name' => $this->extractName($text),
        ];

        // Document-specific extractions
        switch ($documentType) {
            case 'drivers_license':
                $data['license_class'] = $this->extractPattern($text, '/Class\s*:\s*([A-Z0-9]+)/i');
                $data['state'] = $this->extractPattern($text, '/State\s*:\s*([A-Z]+)/i');
                break;
                
            case 'lasdri_card':
                $data['card_number'] = $this->extractPattern($text, '/\d{10,}/');
                break;
                
            case 'police_clearance':
                $data['clearance_number'] = $this->extractPattern($text, '/PC\/\d+\/\d+/i');
                break;
        }

        return $data;
    }

    /**
     * Extract pattern from text
     */
    protected function extractPattern(string $text, string $pattern): ?string
    {
        if (preg_match($pattern, $text, $matches)) {
            return $matches[1] ?? $matches[0] ?? null;
        }
        return null;
    }

    /**
     * Extract date from text
     */
    protected function extractDate(string $text): ?string
    {
        // Match various date formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, etc.
        $patterns = [
            '/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/',
            '/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                try {
                    // Try to parse and format as YYYY-MM-DD
                    if (strlen($matches[1]) === 4) {
                        return "{$matches[1]}-{$matches[2]}-{$matches[3]}";
                    } else {
                        return "{$matches[3]}-{$matches[2]}-{$matches[1]}";
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }
        }

        return null;
    }

    /**
     * Extract expiry date specifically
     */
    protected function extractExpiryDate(string $text): ?string
    {
        // Look for expiry/expiry date/expiry date keywords
        $expiryPatterns = [
            '/expir(?:y|ation)?\s*(?:date)?:?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i',
            '/valid\s*(?:until|till)?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i',
            '/expires?\s*(?:on)?:?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i',
        ];

        foreach ($expiryPatterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $dateStr = $this->extractDate($matches[1]);
                if ($dateStr) {
                    return $dateStr;
                }
            }
        }

        // Fallback to general date extraction
        return $this->extractDate($text);
    }

    /**
     * Extract name from text
     */
    protected function extractName(string $text): ?string
    {
        // Look for name patterns
        $namePatterns = [
            '/name\s*:\s*([A-Z][a-zA-Z\s]+)/i',
            '/(?:driver|holder)\s*name\s*:\s*([A-Z][a-zA-Z\s]+)/i',
        ];

        foreach ($namePatterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return trim($matches[1]);
            }
        }

        return null;
    }

    /**
     * Validate document against extracted data
     */
    protected function validateDocument(DriverDocument $document, array $extractedData): array
    {
        $validation = [
            'is_valid' => true,
            'warnings' => [],
            'errors' => [],
        ];

        // Check expiry date
        if (!empty($extractedData['expiry_date'])) {
            $extractedExpiry = \Carbon\Carbon::parse($extractedData['expiry_date']);
            $providedExpiry = $document->expiry_date;

            // Compare dates (allow 1 day difference)
            if ($extractedExpiry->diffInDays($providedExpiry) > 1) {
                $validation['warnings'][] = [
                    'field' => 'expiry_date',
                    'message' => "OCR extracted expiry date ({$extractedExpiry->format('Y-m-d')}) differs from provided date ({$providedExpiry->format('Y-m-d')})",
                ];
            }

            // Check if document is expired
            if ($extractedExpiry->isPast()) {
                $validation['errors'][] = [
                    'field' => 'expiry_date',
                    'message' => "Document appears to be expired (OCR date: {$extractedExpiry->format('Y-m-d')})",
                ];
                $validation['is_valid'] = false;
            }
        }

        // Check document number
        if (!empty($extractedData['document_number']) && !empty($document->document_number)) {
            if (strtoupper($extractedData['document_number']) !== strtoupper($document->document_number)) {
                $validation['warnings'][] = [
                    'field' => 'document_number',
                    'message' => "OCR extracted number ({$extractedData['document_number']}) differs from provided number ({$document->document_number})",
                ];
            }
        }

        return $validation;
    }

    /**
     * Batch process pending documents
     */
    public function processPendingDocuments(): array
    {
        $pendingDocuments = DriverDocument::where('status', 'pending')
            ->whereNull('ocr_data')
            ->limit(10)
            ->get();

        $results = [];
        foreach ($pendingDocuments as $document) {
            $results[$document->id] = $this->processDocument($document);
        }

        return $results;
    }

    public function __destruct()
    {
        if (isset($this->visionClient)) {
            $this->visionClient->close();
        }
    }
}
