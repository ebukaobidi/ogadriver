<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Role;
use App\Models\Blacklist;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    /**
     * Register a new user manually
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'nullable|string|min:8|confirmed',
            'phone' => 'required|string|max:20|unique:users',
            'role' => 'nullable|in:driver,hirer',
            'referral_code' => 'nullable|string|exists:users,referral_code',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Default role to hirer if not provided
        $roleSlug = $request->input('role', 'hirer');

        // Check if email is blacklisted
        if (Blacklist::isBlacklisted('email', $request->email)) {
            return response()->json([
                'success' => false,
                'message' => 'This email has been permanently banned from the platform',
            ], 403);
        }

        // Check if phone is blacklisted
        if (Blacklist::isBlacklisted('phone', $request->phone)) {
            return response()->json([
                'success' => false,
                'message' => 'This phone number has been permanently banned from the platform',
            ], 403);
        }

        // Get role
        $role = Role::where('slug', $roleSlug)->first();
        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid role specified',
            ], 400);
        }

        $verificationCode = strval(random_int(100000, 999999));
        
        $password = $request->password ?: \Illuminate\Support\Str::random(16);

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($password),
            'phone' => $request->phone,
            'role_id' => $role->id,
            'is_active' => false, // Require verification to activate
            'email_verified_at' => null,
            'phone_verified_at' => null,
            'verification_code' => $verificationCode,
            'verification_expires_at' => now()->addMinutes(15),
            'referral_code' => strtoupper(Str::random(6)),
        ]);

        // Handle referral if code provided
        if ($request->filled('referral_code')) {
            $referrer = User::where('referral_code', $request->referral_code)->first();
            if ($referrer) {
                $user->referred_by_user_id = $referrer->id;
                $user->save();
                // Add pending reward to referrer
                $referrer->referral_pending_balance = ($referrer->referral_pending_balance ?? 0) + 1000;
                $referrer->save();

                \App\Models\Referral::firstOrCreate(
                    ['referrer_id' => $referrer->id, 'referred_id' => $user->id],
                    [
                        'referrer_role' => $referrer->role?->slug ?? 'hirer',
                        'referred_role' => $role->slug ?? 'hirer',
                        'status' => 'pending',
                        'reward_amount' => 1000.00,
                        'notes' => 'Registered via referral code ' . $request->referral_code,
                    ]
                );
            }
        }

        // Auto-create profile based on role
        if ($role->slug === 'driver') {
            \App\Models\Driver::create(['user_id' => $user->id]);
            
            // Notify Admins
            try {
                $admins = \App\Models\User::whereHas('role', function($q) {
                    $q->whereIn('slug', ['admin', 'super_admin']);
                })->get();
                
                foreach ($admins as $admin) {
                    $admin->notify(new \App\Notifications\SystemAlertNotification(
                        'New Driver Registration',
                        "A new driver, {$user->name}, has registered and is awaiting verification.",
                        'driver',
                        "/admin/drivers"
                    ));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Admin registration notification failed: ' . $e->getMessage());
            }
        } elseif ($role->slug === 'hirer') {
            \App\Models\Hirer::create(['user_id' => $user->id]);
        }

        // Send verification code
        try {
            $user->notify(new \App\Notifications\VerificationCodeNotification($verificationCode));
            
            $smsService = new \App\Services\NotificationService();
            $smsService->sendVerificationCode($user->phone, $verificationCode);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Verification code notification failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Registration successful! A verification code has been sent to your email and phone number.',
            'email' => $user->email,
            'phone' => $user->phone,
        ], 201);
    }

    /**
     * Register with device information (for mobile app)
     */
    public function registerWithDevice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'nullable|string|min:8|confirmed',
            'phone' => 'required|string|max:20|unique:users',
            'role' => 'nullable|in:driver,hirer',
            'device_imei' => 'nullable|string',
            'device_fingerprint' => 'nullable|string',
            'referral_code' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Default role to hirer if not provided
        $roleSlug = $request->input('role', 'hirer');

        // Check if device is blacklisted
        if ($request->device_imei && Blacklist::isBlacklisted('device', $request->device_imei)) {
            return response()->json([
                'success' => false,
                'message' => 'This device has been permanently banned from the platform',
            ], 403);
        }

        if ($request->device_fingerprint && Blacklist::isBlacklisted('device', $request->device_fingerprint)) {
            return response()->json([
                'success' => false,
                'message' => 'This device has been permanently banned from the platform',
            ], 403);
        }

        // Check if phone is blacklisted
        if (Blacklist::isBlacklisted('phone', $request->phone)) {
            return response()->json([
                'success' => false,
                'message' => 'This phone number has been permanently banned from the platform',
            ], 403);
        }

        // Get role
        $role = Role::where('slug', $roleSlug)->first();
        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid role specified',
            ], 400);
        }

        $verificationCode = strval(random_int(100000, 999999));
        
        $password = $request->password ?: \Illuminate\Support\Str::random(16);

        // Create user with device info
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($password),
            'phone' => $request->phone,
            'role_id' => $role->id,
            'is_active' => false, // Require verification to activate
            'email_verified_at' => null,
            'phone_verified_at' => null,
            'device_imei' => $request->device_imei,
            'device_fingerprint' => $request->device_fingerprint,
            'last_device_verified_at' => now(),
            'verification_code' => $verificationCode,
            'verification_expires_at' => now()->addMinutes(15),
            'referral_code' => strtoupper(Str::random(6)),
        ]);

        // Handle referral if code provided
        if ($request->filled('referral_code')) {
            $referrer = User::where('referral_code', $request->referral_code)->first();
            if ($referrer) {
                $user->referred_by_user_id = $referrer->id;
                $user->save();
                // Add pending reward to referrer
                $referrer->referral_pending_balance = ($referrer->referral_pending_balance ?? 0) + 1000;
                $referrer->save();

                \App\Models\Referral::firstOrCreate(
                    ['referrer_id' => $referrer->id, 'referred_id' => $user->id],
                    [
                        'referrer_role' => $referrer->role?->slug ?? 'hirer',
                        'referred_role' => $role->slug ?? 'hirer',
                        'status' => 'pending',
                        'reward_amount' => 1000.00,
                        'notes' => 'Registered via device referral code ' . $request->referral_code,
                    ]
                );
            }
        }

        // Auto-create profile based on role
        if ($role->slug === 'driver') {
            \App\Models\Driver::create(['user_id' => $user->id]);
            
            // Notify Admins
            try {
                $admins = \App\Models\User::whereHas('role', function($q) {
                    $q->whereIn('slug', ['admin', 'super_admin']);
                })->get();
                
                foreach ($admins as $admin) {
                    $admin->notify(new \App\Notifications\SystemAlertNotification(
                        'New Driver Registration',
                        "A new driver, {$user->name}, has registered and is awaiting verification.",
                        'driver',
                        "/admin/drivers"
                    ));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Admin registration notification failed: ' . $e->getMessage());
            }
        } elseif ($role->slug === 'hirer') {
            \App\Models\Hirer::create(['user_id' => $user->id]);
        }

        // Send verification code
        try {
            $user->notify(new \App\Notifications\VerificationCodeNotification($verificationCode));
            
            $smsService = new \App\Services\NotificationService();
            $smsService->sendVerificationCode($user->phone, $verificationCode);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Verification code notification failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Registration successful! A verification code has been sent to your email and phone number.',
            'email' => $user->email,
            'phone' => $user->phone,
        ], 201);
    }

    /**
     * Verify user email and phone with code
     */
    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'identity' => 'required|string', // can be email or phone
            'code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->identity)
            ->orWhere('phone', $request->identity)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        if ($user->verification_code !== $request->code) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code',
            ], 400);
        }

        if ($user->verification_expires_at && $user->verification_expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Verification code has expired',
            ], 400);
        }

        // Mark as verified and active
        $user->update([
            'is_active' => true,
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
            'verification_code' => null,
            'verification_expires_at' => null,
        ]);

        // Send one-time welcome email after successful verification
        try {
            $user->notify(new \App\Notifications\WelcomeLoginNotification());
        } catch (\Exception $e) {
            \Log::error('Welcome email failed: ' . $e->getMessage());
        }

        // Generate token for immediate login
        $apiToken = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Verification successful! Your account is now active.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar ? (str_starts_with($user->avatar, 'http') ? $user->avatar : asset('storage/' . $user->avatar)) : null,
                'avatar_secondary' => $user->avatar_secondary ? (str_starts_with($user->avatar_secondary, 'http') ? $user->avatar_secondary : asset('storage/' . $user->avatar_secondary)) : null,
                'avatar_tertiary' => $user->avatar_tertiary ? (str_starts_with($user->avatar_tertiary, 'http') ? $user->avatar_tertiary : asset('storage/' . $user->avatar_tertiary)) : null,
                'role' => $user->role ? $user->role->slug : null,
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at,
                'driver_id' => $user->driver ? $user->driver->id : null,
                'formatted_driver_id' => $user->driver ? $user->driver->formatted_id : null,
                'hirer_id' => $user->hirer ? $user->hirer->id : null,
            ],
            'token' => $apiToken,
        ], 200);
    }

    /**
     * Resend verification code
     */
    public function resendVerification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'identity' => 'required|string', // can be email or phone
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->identity)
            ->orWhere('phone', $request->identity)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $verificationCode = strval(random_int(100000, 999999));
        $user->update([
            'verification_code' => $verificationCode,
            'verification_expires_at' => now()->addMinutes(15),
        ]);

        // Send verification code
        try {
            $user->notify(new \App\Notifications\VerificationCodeNotification($verificationCode));
            
            $smsService = new \App\Services\NotificationService();
            $smsService->sendVerificationCode($user->phone, $verificationCode);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Resend verification code failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'A new verification code has been sent to your email and phone number.',
        ], 200);
    }
}
