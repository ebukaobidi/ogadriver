<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Driver;
use App\Models\TransportJob;
use Illuminate\Support\Facades\Log;

class SecurityController extends Controller
{
    /**
     * Biometric Dead-Man Switch Verification
     */
    public function verifyIdentity(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->driver) {
            return response()->json(['success' => false, 'message' => 'Not a driver'], 403);
        }

        $request->validate([
            'image' => 'required|string', // Base64 image
            'job_id' => 'required|integer|exists:jobs,id',
        ]);

        // Simulate AI Facial Verification (Compare uploaded base64 against driver avatar)
        // In production, this would call AWS Rekognition or Azure Face API.
        $verificationPassed = $this->simulateFacialRecognition($request->image, $user->avatar);

        if (!$verificationPassed) {
            // Dead-Man Switch TRIGGERED: Lock job and alert hirer!
            $job = \App\Models\TransportJob::find($request->job_id);
            $job->update(['status' => 'suspended', 'dispute_reason' => 'Biometric Verification Failed']);
            
            // Alert System
            \App\Models\EmergencySosAlert::create([
                'job_id' => $job->id,
                'user_id' => $user->id,
                'reporter_type' => 'system',
                'type' => 'biometric_failure',
                'latitude' => 0,
                'longitude' => 0,
                'status' => 'pending',
                'details' => "DEAD-MAN SWITCH ACTIVATED: Driver failed facial recognition during active job #{$job->id}.",
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Biometric verification failed. Security lockdown initiated.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Identity verified.',
        ]);
    }

    private function simulateFacialRecognition(string $base64Image, ?string $avatarUrl): bool
    {
        // For demonstration, a fake 90% pass rate. 
        // In a real scenario, compare the embeddings.
        return rand(1, 100) <= 90;
    }
}
