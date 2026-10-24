<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guarantor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GuarantorVerificationController extends Controller
{
    /**
     * Submit Guarantor Information by Driver
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'guarantor_type' => 'required|in:form_a,form_b',
            'full_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'relationship' => 'required|string|max:100',
            'home_address' => 'required|string',
            'workplace_name' => 'nullable|string|max:255',
            'workplace_address' => 'nullable|string',
            'nin_or_bvn' => 'nullable|string|max:20',
        ]);

        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'User profile is not registered as a driver.',
            ], 400);
        }

        $token = \Illuminate\Support\Str::random(32);

        $guarantor = Guarantor::updateOrCreate(
            [
                'driver_id' => $driver->id,
                'guarantor_type' => $request->guarantor_type,
            ],
            [
                'full_name' => $request->full_name,
                'phone_number' => $request->phone_number,
                'email' => $request->email,
                'relationship' => $request->relationship,
                'home_address' => $request->home_address,
                'workplace_name' => $request->workplace_name,
                'workplace_address' => $request->workplace_address,
                'nin_or_bvn' => $request->nin_or_bvn,
                'verification_token' => $token,
                'status' => 'pending',
            ]
        );

        // Update driver guarantor status
        if ($request->guarantor_type === 'form_a') {
            $driver->update(['guarantor_a_status' => 'pending']);
        } else {
            $driver->update(['guarantor_b_status' => 'pending']);
        }

        return response()->json([
            'success' => true,
            'message' => "Guarantor {$request->guarantor_type} submitted successfully. Verification link dispatched.",
            'data' => [
                'guarantor' => $guarantor,
                'verification_link' => url("/verify-guarantor/{$token}"),
            ],
        ]);
    }

    /**
     * Confirm Guarantor Bond digitally via token link
     */
    public function verifyToken(string $token): JsonResponse
    {
        $guarantor = Guarantor::where('verification_token', $token)->firstOrFail();

        $guarantor->update([
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        $driver = $guarantor->driver;
        if ($driver) {
            if ($guarantor->guarantor_type === 'form_a') {
                $driver->update(['guarantor_a_status' => 'verified']);
            } else {
                $driver->update(['guarantor_b_status' => 'verified']);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Guarantor sponsorship bond confirmed successfully!',
            'data' => $guarantor,
        ]);
    }

    /**
     * Trigger Termii AI Voice Call to Guarantor for Telephone Verification
     */
    public function triggerAiVoiceCall(Request $request, int $guarantorId): JsonResponse
    {
        $guarantor = Guarantor::findOrFail($guarantorId);
        $termiiApiKey = env('TERMII_API_KEY');
        $termiiBaseUrl = env('TERMII_BASE_URL', 'https://v4.api.termii.com');

        $otpCode = strval(random_int(1000, 9999));
        $guarantor->update(['verification_code' => $otpCode]);

        try {
            $response = \Illuminate\Support\Facades\Http::post("{$termiiBaseUrl}/api/v1/voice/send-code", [
                'api_key' => $termiiApiKey,
                'phone_number' => $guarantor->phone_number,
                'code' => $otpCode,
            ]);

            return response()->json([
                'success' => true,
                'message' => "AI Voice Call dispatched to guarantor at {$guarantor->phone_number}.",
                'call_status' => $response->json() ?? ['status' => 'queued'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to dispatch AI Voice Call: ' . $e->getMessage(),
            ], 500);
        }
    }
}
