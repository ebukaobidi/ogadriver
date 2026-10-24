<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\GuarantorVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AiVerificationController extends Controller
{
    protected $verificationService;

    public function __construct(GuarantorVerificationService $verificationService)
    {
        $this->verificationService = $verificationService;
    }

    /**
     * Initiate AI Guarantor Call
     */
    public function initiateGuarantorCall(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'guarantor_id' => 'required|integer|exists:guarantors,id',
            'driver_id' => 'required|integer|exists:drivers,id',
            'questions' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $result = $this->verificationService->initiateAiGuarantorCall(
            $request->guarantor_id,
            $request->driver_id,
            $request->questions
        );

        return response()->json($result);
    }

    /**
     * Analyze Guarantor Call
     */
    public function analyzeGuarantorCall(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'guarantor_id' => 'required|integer|exists:guarantors,id',
            'driver_id' => 'required|integer|exists:drivers,id',
            'transcript' => 'required|string',
            'answers' => 'required|array',
            'duration' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $result = $this->verificationService->analyzeGuarantorCall(
            $request->guarantor_id,
            $request->driver_id,
            $request->transcript,
            $request->answers,
            $request->duration
        );

        return response()->json($result);
    }

    /**
     * Location-Based Certification
     */
    public function locationCertification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'driver_id' => 'required|integer|exists:drivers,id',
            'address' => 'required|string',
            'coordinates' => 'required|array',
            'coordinates.lat' => 'required|numeric',
            'coordinates.lng' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $result = $this->verificationService->performLocationCertification(
            $request->driver_id,
            $request->address,
            $request->coordinates
        );

        return response()->json($result);
    }
}
