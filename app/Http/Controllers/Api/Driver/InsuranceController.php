<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Services\InsuranceService;
use App\Models\DriverDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InsuranceController extends Controller
{
    protected InsuranceService $insuranceService;

    public function __construct(InsuranceService $insuranceService)
    {
        $this->insuranceService = $insuranceService;
    }

    /**
     * Get driver insurance status
     */
    public function getInsuranceStatus(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;
        
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        $status = $this->insuranceService->getInsuranceStatusForDisplay($driver->id);

        return response()->json([
            'success' => true,
            'data' => $status,
        ]);
    }

    /**
     * Get driver insurance documents
     */
    public function getInsuranceDocuments(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;
        
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        $documents = $this->insuranceService->getDriverInsurance($driver->id);

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    /**
     * Check if driver meets Hybrid tier insurance recommendations
     */
    public function checkHybridRecommendations(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;
        
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        $status = $this->insuranceService->meetsHybridRecommendations($driver->id);

        return response()->json([
            'success' => true,
            'data' => $status,
        ]);
    }

    /**
     * Validate insurance document before approval (admin only)
     */
    public function validateDocument(Request $request, $documentId): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $document = DriverDocument::findOrFail($documentId);

        if ($document->document_type !== 'insurance') {
            return response()->json([
                'success' => false,
                'message' => 'Document is not an insurance document',
            ], 400);
        }

        $validation = $this->insuranceService->validateInsuranceDocument($document);

        return response()->json([
            'success' => true,
            'data' => $validation,
        ]);
    }

    /**
     * Get insurance expiry warnings (admin only)
     */
    public function getExpiryWarnings(Request $request): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $daysThreshold = $request->input('days_threshold', 30);
        $warnings = $this->insuranceService->getExpiryWarnings($daysThreshold);

        return response()->json([
            'success' => true,
            'data' => $warnings,
        ]);
    }

    /**
     * Get insurance partnership recommendations (admin only)
     */
    public function getPartnershipRecommendations(Request $request): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $recommendations = $this->insuranceService->getPartnershipRecommendations();

        return response()->json([
            'success' => true,
            'data' => $recommendations,
        ]);
    }
}
