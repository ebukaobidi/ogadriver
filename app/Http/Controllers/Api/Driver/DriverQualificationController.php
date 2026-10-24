<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Services\DriverQualificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DriverQualificationController extends Controller
{
    protected DriverQualificationService $qualificationService;

    public function __construct(DriverQualificationService $qualificationService)
    {
        $this->qualificationService = $qualificationService;
    }

    /**
     * Check if driver qualifies for Hybrid tier
     */
    public function checkQualification(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;
        
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        $qualification = $this->qualificationService->qualifiesForHybrid($driver->id);

        return response()->json([
            'success' => true,
            'data' => $qualification,
        ]);
    }

    /**
     * Get driver qualification metrics
     */
    public function getQualificationMetrics(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;
        
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        $metrics = $this->qualificationService->getQualificationMetrics($driver);

        return response()->json([
            'success' => true,
            'data' => $metrics,
        ]);
    }

    /**
     * Request upgrade to Hybrid tier
     */
    public function requestUpgrade(Request $request): JsonResponse
    {
        $driver = $request->user()->driver;
        
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        try {
            $updatedDriver = $this->qualificationService->upgradeToHybrid($driver->id);

            return response()->json([
                'success' => true,
                'message' => 'Successfully upgraded to Hybrid tier',
                'data' => [
                    'subscription_tier' => $updatedDriver->subscription_tier,
                ],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get drivers approaching qualification (admin only)
     */
    public function getApproachingQualification(Request $request): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $limit = $request->input('limit', 10);
        $drivers = $this->qualificationService->getDriversApproachingQualification($limit);

        return response()->json([
            'success' => true,
            'data' => $drivers,
        ]);
    }
}
