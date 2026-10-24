<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ForgotPasswordController extends Controller
{
    /**
     * Send a password reset code to the user's email.
     */
    public function sendResetCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Don't reveal whether the email exists for security
            return response()->json([
                'success' => true,
                'message' => 'If an account with that email exists, a reset code has been sent.',
            ]);
        }

        // Generate a 6-digit reset code
        $resetCode = strval(random_int(100000, 999999));

        $user->update([
            'verification_code' => $resetCode,
            'verification_expires_at' => now()->addMinutes(15),
        ]);

        // Send the reset code via email
        try {
            $user->notify(new \App\Notifications\PasswordResetCodeNotification($resetCode));
        } catch (\Exception $e) {
            Log::error('Password reset email failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reset code. Please try again later.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'If an account with that email exists, a reset code has been sent.',
        ]);
    }

    /**
     * Verify the reset code and set a new password.
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or reset code.',
            ], 400);
        }

        if ($user->verification_code !== $request->code) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid reset code.',
            ], 400);
        }

        if ($user->verification_expires_at && $user->verification_expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Reset code has expired. Please request a new one.',
            ], 400);
        }

        // Update password and clear the reset code
        $user->update([
            'password' => Hash::make($request->password),
            'verification_code' => null,
            'verification_expires_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password has been reset successfully. You can now log in.',
        ]);
    }
}
