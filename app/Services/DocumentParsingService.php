<?php

namespace App\Services;

use Aws\Textract\TextractClient;
use Aws\Exception\AwsException;
use Illuminate\Support\Facades\Storage;
use App\Models\DriverDocument;

class DocumentParsingService
{
    protected TextractClient $textractClient;

    public function __construct()
    {
        $this->textractClient = new TextractClient([
            'region' => config('services.aws.region', 'us-east-1'),
            'version' => 'latest',
            'credentials' => [
                'key' => config('services.aws.key'),
                'secret' => config('services.aws.secret'),
            ],
        ]);
    }

    /**
     * Parse document using AWS Textract
     */
    public function parseDocument(string $filePath, string $documentType): array
    {
        $fullPath = Storage::disk('public')->path($filePath);

        if (!file_exists($fullPath)) {
            throw new \Exception('File not found');
        }

        try {
            $image = file_get_contents($fullPath);
            
            $result = $this->textractClient->detectDocumentText([
                'Document' => [
                    'Bytes' => $image,
                ],
            ]);

            $blocks = $result->get('Blocks');
            $text = $this->extractText($blocks);

            return $this->extractDocumentData($text, $documentType);

        } catch (AwsException $e) {
            // Fallback to basic parsing if AWS fails
            return $this->basicParse($filePath, $documentType);
        }
    }

    /**
     * Extract text from Textract blocks
     */
    protected function extractText(array $blocks): string
    {
        $text = '';
        
        foreach ($blocks as $block) {
            if ($block['BlockType'] === 'LINE') {
                $text .= $block['Text'] . "\n";
            }
        }

        return $text;
    }

    /**
     * Extract document-specific data from OCR text
     */
    protected function extractDocumentData(string $text, string $documentType): array
    {
        $data = [
            'raw_text' => $text,
            'document_number' => null,
            'issue_date' => null,
            'expiry_date' => null,
            'name' => null,
            'confidence' => 0.7, // Default confidence
        ];

        $lines = explode("\n", $text);

        switch ($documentType) {
            case 'drivers_license':
                $data = array_merge($data, $this->parseDriversLicense($lines));
                break;
            case 'vehicle_registration':
                $data = array_merge($data, $this->parseVehicleRegistration($lines));
                break;
            case 'insurance':
                $data = array_merge($data, $this->parseInsurance($lines));
                break;
            case 'medical_certificate':
                $data = array_merge($data, $this->parseMedicalCertificate($lines));
                break;
            case 'police_clearance':
                $data = array_merge($data, $this->parsePoliceClearance($lines));
                break;
        }

        return $data;
    }

    /**
     * Parse driver's license
     */
    protected function parseDriversLicense(array $lines): array
    {
        $data = [
            'document_number' => null,
            'issue_date' => null,
            'expiry_date' => null,
            'name' => null,
            'license_class' => null,
        ];

        foreach ($lines as $line) {
            // Extract license number (common patterns)
            if (preg_match('/(?:DL|License|No)\s*[:#]?\s*([A-Z0-9]+)/i', $line, $matches)) {
                $data['document_number'] = $matches[1];
            }

            // Extract dates
            if (preg_match('/(?:Issue|Issued|Date)\s*[:#]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i', $line, $matches)) {
                $data['issue_date'] = $this->parseDate($matches[1]);
            }

            if (preg_match('/(?:Exp|Expiry|Valid|Valid Until)\s*[:#]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i', $line, $matches)) {
                $data['expiry_date'] = $this->parseDate($matches[1]);
            }

            // Extract name
            if (preg_match('/(?:Name|Holder)\s*[:#]?\s*([A-Z\s]+)/i', $line, $matches)) {
                $data['name'] = trim($matches[1]);
            }

            // Extract class
            if (preg_match('/(?:Class|Type)\s*[:#]?\s*([A-Z]+)/i', $line, $matches)) {
                $data['license_class'] = $matches[1];
            }
        }

        return $data;
    }

    /**
     * Parse vehicle registration
     */
    protected function parseVehicleRegistration(array $lines): array
    {
        $data = [
            'document_number' => null,
            'issue_date' => null,
            'expiry_date' => null,
            'vehicle_number' => null,
            'chassis_number' => null,
        ];

        foreach ($lines as $line) {
            if (preg_match('/(?:Reg|Registration|Plate)\s*[:#]?\s*([A-Z0-9]+)/i', $line, $matches)) {
                $data['document_number'] = $matches[1];
            }

            if (preg_match('/(?:Chassis|VIN)\s*[:#]?\s*([A-Z0-9]+)/i', $line, $matches)) {
                $data['chassis_number'] = $matches[1];
            }

            if (preg_match('/(?:Issue|Issued)\s*[:#]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i', $line, $matches)) {
                $data['issue_date'] = $this->parseDate($matches[1]);
            }

            if (preg_match('/(?:Exp|Expiry)\s*[:#]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i', $line, $matches)) {
                $data['expiry_date'] = $this->parseDate($matches[1]);
            }
        }

        return $data;
    }

    /**
     * Parse insurance document
     */
    protected function parseInsurance(array $lines): array
    {
        $data = [
            'document_number' => null,
            'issue_date' => null,
            'expiry_date' => null,
            'policy_number' => null,
            'insurance_company' => null,
        ];

        foreach ($lines as $line) {
            if (preg_match('/(?:Policy|No)\s*[:#]?\s*([A-Z0-9]+)/i', $line, $matches)) {
                $data['document_number'] = $matches[1];
                $data['policy_number'] = $matches[1];
            }

            if (preg_match('/(?:Company|Insurer)\s*[:#]?\s*([A-Z\s]+)/i', $line, $matches)) {
                $data['insurance_company'] = trim($matches[1]);
            }

            if (preg_match('/(?:Issue|Start|Effective)\s*[:#]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i', $line, $matches)) {
                $data['issue_date'] = $this->parseDate($matches[1]);
            }

            if (preg_match('/(?:Exp|Expiry|End)\s*[:#]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i', $line, $matches)) {
                $data['expiry_date'] = $this->parseDate($matches[1]);
            }
        }

        return $data;
    }

    /**
     * Parse medical certificate
     */
    protected function parseMedicalCertificate(array $lines): array
    {
        $data = [
            'document_number' => null,
            'issue_date' => null,
            'expiry_date' => null,
            'doctor_name' => null,
            'hospital_name' => null,
        ];

        foreach ($lines as $line) {
            if (preg_match('/(?:Cert|Certificate|Ref)\s*[:#]?\s*([A-Z0-9]+)/i', $line, $matches)) {
                $data['document_number'] = $matches[1];
            }

            if (preg_match('/(?:Doctor|Physician)\s*[:#]?\s*([A-Z\s]+)/i', $line, $matches)) {
                $data['doctor_name'] = trim($matches[1]);
            }

            if (preg_match('/(?:Hospital|Clinic|Medical)\s*[:#]?\s*([A-Z\s]+)/i', $line, $matches)) {
                $data['hospital_name'] = trim($matches[1]);
            }

            if (preg_match('/(?:Issue|Date)\s*[:#]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i', $line, $matches)) {
                $data['issue_date'] = $this->parseDate($matches[1]);
            }

            if (preg_match('/(?:Exp|Expiry|Valid)\s*[:#]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i', $line, $matches)) {
                $data['expiry_date'] = $this->parseDate($matches[1]);
            }
        }

        return $data;
    }

    /**
     * Parse police clearance
     */
    protected function parsePoliceClearance(array $lines): array
    {
        $data = [
            'document_number' => null,
            'issue_date' => null,
            'expiry_date' => null,
            'clearance_type' => null,
        ];

        foreach ($lines as $line) {
            if (preg_match('/(?:Ref|Reference|No)\s*[:#]?\s*([A-Z0-9]+)/i', $line, $matches)) {
                $data['document_number'] = $matches[1];
            }

            if (preg_match('/(?:Issue|Date)\s*[:#]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i', $line, $matches)) {
                $data['issue_date'] = $this->parseDate($matches[1]);
            }

            if (preg_match('/(?:Exp|Expiry|Valid)\s*[:#]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i', $line, $matches)) {
                $data['expiry_date'] = $this->parseDate($matches[1]);
            }
        }

        return $data;
    }

    /**
     * Parse date string to carbon instance
     */
    protected function parseDate(string $dateString): ?string
    {
        try {
            $date = \Carbon\Carbon::parse($dateString);
            return $date->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Basic parsing fallback (regex-based without AWS)
     */
    protected function basicParse(string $filePath, string $documentType): array
    {
        return [
            'raw_text' => '',
            'document_number' => null,
            'issue_date' => null,
            'expiry_date' => null,
            'name' => null,
            'confidence' => 0.3, // Low confidence for basic parsing
            'method' => 'basic_fallback',
        ];
    }

    /**
     * Update document with OCR data
     */
    public function updateDocumentWithOCR(DriverDocument $document): DriverDocument
    {
        $ocrData = $this->parseDocument($document->file_path, $document->document_type);

        $document->update([
            'ocr_data' => $ocrData,
            'document_number' => $ocrData['document_number'] ?? $document->document_number,
            'issue_date' => $ocrData['issue_date'] ?? $document->issue_date,
            'expiry_date' => $ocrData['expiry_date'] ?? $document->expiry_date,
        ]);

        return $document;
    }

    /**
     * Validate extracted data against document type requirements
     */
    public function validateOCRData(array $ocrData, string $documentType): array
    {
        $errors = [];
        $warnings = [];

        $requiredFields = [
            'drivers_license' => ['document_number', 'expiry_date'],
            'vehicle_registration' => ['document_number', 'expiry_date'],
            'insurance' => ['policy_number', 'expiry_date'],
            'medical_certificate' => ['expiry_date'],
            'police_clearance' => ['document_number', 'expiry_date'],
        ];

        foreach ($requiredFields[$documentType] ?? [] as $field) {
            if (empty($ocrData[$field])) {
                $errors[] = "Required field '{$field}' not found in document";
            }
        }

        // Check if expiry date is valid
        if (!empty($ocrData['expiry_date'])) {
            $expiryDate = \Carbon\Carbon::parse($ocrData['expiry_date']);
            if ($expiryDate->lt(now())) {
                $warnings[] = "Document has expired on {$ocrData['expiry_date']}";
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
        ];
    }
}
