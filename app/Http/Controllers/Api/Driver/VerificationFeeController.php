<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Services\VerificationFeeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VerificationFeeController extends Controller
{
    protected VerificationFeeService $verificationFeeService;

    public function __construct(VerificationFeeService $verificationFeeService)
    {
        $this->verificationFeeService = $verificationFeeService;
    }

    /**
     * Get verification fee information
     */
    public function getFeeInfo(): JsonResponse
    {
        $feeInfo = $this->verificationFeeService->getVerificationFeeAmount();
        
        return response()->json([
            'success' => true,
            'data' => $feeInfo,
        ]);
    }

    /**
     * Get driver verification status
     */
    public function getVerificationStatus(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;
        
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        $status = $this->verificationFeeService->getVerificationStatus($driver->id);

        return response()->json([
            'success' => true,
            'data' => $status,
        ]);
    }

    /**
     * Process verification fee payment
     * This initiates payment - actual processing happens via webhook
     */
    public function initiatePayment(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;
        
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        if ($this->verificationFeeService->hasPaidVerificationFee($driver->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Verification fee already paid',
            ], 400);
        }

        // Payment gateway integration will be handled online
        // This endpoint prepares the payment request
        $feeInfo = $this->verificationFeeService->getVerificationFeeAmount();

        return response()->json([
            'success' => true,
            'data' => [
                'amount' => $feeInfo['amount'],
                'currency' => $feeInfo['currency'],
                'description' => $feeInfo['description'],
                'driver_id' => $driver->id,
                'payment_required' => true,
                // Payment gateway integration will add authorization_url here
            ],
        ]);
    }

    /**
     * Webhook handler for payment confirmation
     * Called by payment gateway after successful payment
     */
    public function handlePaymentWebhook(Request $request): JsonResponse
    {
        try {
            $reference = $request->input('reference');
            $status = $request->input('status');
            $driverId = $request->input('metadata.driver_id');

            if ($status === 'successful' && $driverId) {
                $this->verificationFeeService->processVerificationFee(
                    $driverId,
                    'payment_gateway',
                    $reference
                );

                // Start free trial after payment
                $this->verificationFeeService->startFreeTrial($driverId, 17);
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get trial status
     */
    public function getTrialStatus(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;
        
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'is_on_trial' => $driver->is_on_trial,
                'trial_started_at' => $driver->trial_started_at?->toIso8601String(),
                'trial_ends_at' => $driver->trial_ends_at?->toIso8601String(),
                'days_remaining' => $this->verificationFeeService->getTrialDaysRemaining($driver->id),
                'is_trial_active' => $this->verificationFeeService->isTrialActive($driver->id),
            ],
        ]);
    }
}
