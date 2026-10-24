<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionDunningService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubscriptionDunningController extends Controller
{
    protected SubscriptionDunningService $dunningService;

    public function __construct(SubscriptionDunningService $dunningService)
    {
        $this->dunningService = $dunningService;
    }

    /**
     * Run dunning check (admin only)
     */
    public function runDunningCheck(Request $request): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $results = $this->dunningService->checkExpiringSubscriptions();

        return response()->json([
            'success' => true,
            'message' => 'Dunning check completed',
            'data' => $results,
        ]);
    }

    /**
     * Get churn risk analysis (admin only)
     */
    public function getChurnRisk(Request $request): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $churnRisk = $this->dunningService->getChurnRiskUsers();

        return response()->json([
            'success' => true,
            'data' => $churnRisk,
        ]);
    }

    /**
     * Send churn prevention offer (admin only)
     */
    public function sendChurnOffer(Request $request): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'user_id' => 'required|integer',
            'offer_type' => 'sometimes|string|in:discount,trial_extension,upgrade',
        ]);

        $userId = $request->input('user_id');
        $offerType = $request->input('offer_type', 'discount');

        $sent = $this->dunningService->sendChurnPreventionOffer($userId, $offerType);

        return response()->json([
            'success' => $sent,
            'message' => $sent ? 'Churn prevention offer sent' : 'Failed to send offer',
        ]);
    }

    /**
     * Reactivate subscription (admin only)
     */
    public function reactivateSubscription(Request $request, $subscriptionId): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $reactivated = $this->dunningService->reactivateSubscription($subscriptionId);

        return response()->json([
            'success' => $reactivated,
            'message' => $reactivated ? 'Subscription reactivated' : 'Failed to reactivate subscription',
        ]);
    }
}
