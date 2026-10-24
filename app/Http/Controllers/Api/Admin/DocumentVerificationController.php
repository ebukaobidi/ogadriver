<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\DocumentVerificationService;
use App\Models\DriverDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DocumentVerificationController extends Controller
{
    protected DocumentVerificationService $verificationService;

    public function __construct(DocumentVerificationService $verificationService)
    {
        $this->verificationService = $verificationService;
    }

    /**
     * Verify a specific document (admin only)
     */
    public function verifyDocument(Request $request, $documentId): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $document = DriverDocument::find($documentId);
        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found',
            ], 404);
        }

        $result = $this->verificationService->verifyPoliceClearance($document);

        return response()->json([
            'success' => $result['success'],
            'data' => $result,
        ]);
    }

    /**
     * Run batch verification (admin only)
     */
    public function batchVerify(Request $request): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $results = $this->verificationService->batchVerifyPendingDocuments();

        return response()->json([
            'success' => true,
            'message' => 'Batch verification completed',
            'data' => $results,
        ]);
    }

    /**
     * Get documents requiring manual review (admin only)
     */
    public function getReviewQueue(Request $request): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $documents = $this->verificationService->getDocumentsRequiringReview();

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    /**
     * Manually approve document (admin only)
     */
    public function manualApprove(Request $request, $documentId): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'notes' => 'sometimes|string|max:500',
        ]);

        $notes = $request->input('notes', '');
        $approved = $this->verificationService->manualApproveDocument(
            $documentId,
            $request->user()->id,
            $notes
        );

        return response()->json([
            'success' => $approved,
            'message' => $approved ? 'Document approved' : 'Failed to approve document',
        ]);
    }

    /**
     * Manually reject document (admin only)
     */
    public function manualReject(Request $request, $documentId): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $reason = $request->input('reason');
        $rejected = $this->verificationService->manualRejectDocument(
            $documentId,
            $request->user()->id,
            $reason
        );

        return response()->json([
            'success' => $rejected,
            'message' => $rejected ? 'Document rejected' : 'Failed to reject document',
        ]);
    }

    /**
     * Get verification statistics (admin only)
     */
    public function getStatistics(Request $request): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $stats = $this->verificationService->getVerificationStatistics();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
