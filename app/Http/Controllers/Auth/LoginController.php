<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\Blacklist;
use App\Services\NotificationService;

class LoginController extends Controller
{
    /**
     * Login user with email/password
     */
    public function login(Request $request)
    {
        // Validating login request

        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Login validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if email is blacklisted
        if (Blacklist::isBlacklisted('email', $request->email)) {
            \Log::error('Login failed: email blacklisted', ['email' => $request->email]);
            return response()->json([
                'success' => false,
                'message' => 'This email has been permanently banned from the platform',
            ], 403);
        }

        // Attempt login
        // Attempt login

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();

            // Check if user is active
            if (!$user->is_active) {
                \Log::error('Login failed: user inactive', ['user_id' => $user->id]);
                Auth::logout();
                
                if ($user->phone_verified_at === null || $user->email_verified_at === null) {
                    // Auto-generate and send a fresh verification code
                    $verificationCode = strval(random_int(100000, 999999));
                    $user->update([
                        'verification_code'      => $verificationCode,
                        'verification_expires_at' => now()->addMinutes(15),
                    ]);
                    try {
                        $user->notify(new \App\Notifications\VerificationCodeNotification($verificationCode));
                        $smsService = new NotificationService();
                        $smsService->sendVerificationCode($user->phone, $verificationCode);
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error('Verification code auto-send on login failed: ' . $e->getMessage());
                    }
                    return response()->json([
                        'success'             => false,
                        'message'             => 'Your account is not yet verified. A new verification code has been sent to your email and phone.',
                        'needs_verification'  => true,
                        'verification_sent'   => true,
                        'email'               => $user->email,
                        'phone'               => $user->phone,
                    ], 403);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been deactivated',
                ], 403);
            }

            // Update last login
            $user->update(['last_login_at' => now()]);

            // Update device info if provided
            if ($request->has('device_imei')) {
                $user->update(['device_imei' => $request->device_imei]);
            }
            if ($request->has('device_fingerprint')) {
                $user->update(['device_fingerprint' => $request->device_fingerprint]);
            }

            // Generate API token using Sanctum
            $apiToken = $user->createToken('auth_token')->plainTextToken;
            
            // Security Audit Logging using spatie/laravel-activitylog
            // Check if X-App-Version header is present to identify mobile logins
            if ($request->hasHeader('X-App-Version')) {
                activity('mobile_api')
                    ->causedBy($user)
                    ->withProperties([
                        'device_model' => $request->header('User-Agent'),
                        'app_version' => $request->header('X-App-Version', 'unknown'),
                        'ip' => $request->ip()
                    ])
                    ->event('mobile_login')
                    ->log('User logged in via mobile app');
            }

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
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

        // Check if user exists to provide exact login feedback rationale
        $userExists = User::where('email', $request->email)->first();
        if (!$userExists) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials: No account found with this email address. Please check your spelling or register.',
                'error_code' => 'EMAIL_NOT_FOUND',
            ], 401);
        }

        // Check if password match fails
        if (!Hash::check($request->password, $userExists->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials: Incorrect password. Please check your password or click "Forgot Password" to reset.',
                'error_code' => 'INCORRECT_PASSWORD',
            ], 401);
        }

        // Check if user account is pending phone/email verification
        if ($userExists->phone_verified_at === null || $userExists->email_verified_at === null) {
            $verificationCode = strval(random_int(100000, 999999));
            $userExists->update([
                'verification_code'      => $verificationCode,
                'verification_expires_at' => now()->addMinutes(15),
            ]);
            try {
                $userExists->notify(new \App\Notifications\VerificationCodeNotification($verificationCode));
                $smsService = new NotificationService();
                $smsService->sendVerificationCode($userExists->phone, $verificationCode);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Verification code auto-send on login failed: ' . $e->getMessage());
            }

            return response()->json([
                'success'             => false,
                'message'             => 'Account Pending Verification: Your account has not been verified yet. A 6-digit verification code has been sent to your email and phone.',
                'needs_verification'  => true,
                'verification_sent'   => true,
                'email'               => $userExists->email,
                'phone'               => $userExists->phone,
                'error_code'          => 'ACCOUNT_NOT_VERIFIED',
            ], 403);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid login credentials. Please check your email and password and try again.',
            'error_code' => 'INVALID_CREDENTIALS',
        ], 401);
    }

    /**
     * Request OTP for passwordless login
     */
    public function requestOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $user = User::where('phone', $request->phone)
            ->orWhere('email', $request->phone)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        if (Blacklist::isBlacklisted('email', $user->email) || Blacklist::isBlacklisted('phone', $user->phone)) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been permanently banned',
            ], 403);
        }

        $verificationCode = strval(random_int(100000, 999999));
        $user->update([
            'verification_code' => $verificationCode,
            'verification_expires_at' => now()->addMinutes(15),
        ]);

        try {
            $user->notify(new \App\Notifications\VerificationCodeNotification($verificationCode));
            $smsService = new NotificationService();
            $smsService->sendVerificationCode($user->phone, $verificationCode);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('OTP send failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent to your phone and email',
        ]);
    }

    /**
     * Login via OTP
     */
    public function loginWithOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string',
        ]);

        $user = User::where('phone', $request->phone)
            ->orWhere('email', $request->phone)
            ->first();

        if (!$user || $user->verification_code !== $request->code) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP code',
            ], 401);
        }

        if ($user->verification_expires_at && $user->verification_expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'OTP code has expired',
            ], 401);
        }

        // Activate user if not active
        if (!$user->is_active) {
            $user->is_active = true;
            $user->email_verified_at = $user->email_verified_at ?? now();
            $user->phone_verified_at = $user->phone_verified_at ?? now();
        }

        $user->verification_code = null;
        $user->verification_expires_at = null;
        $user->last_login_at = now();

        if ($request->has('device_imei')) {
            $user->device_imei = $request->device_imei;
        }
        if ($request->has('device_fingerprint')) {
            $user->device_fingerprint = $request->device_fingerprint;
        }

        $user->save();

        $apiToken = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar ? (str_starts_with($user->avatar, 'http') ? $user->avatar : asset('storage/' . $user->avatar)) : null,
                'role' => $user->role ? $user->role->slug : null,
                'is_active' => $user->is_active,
                'driver_id' => $user->driver ? $user->driver->id : null,
                'hirer_id' => $user->hirer ? $user->hirer->id : null,
            ],
            'token' => $apiToken,
        ], 200);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user) {
            // SPA/session auth yields TransientToken (no delete()).
            // Only revoke real Personal Access Tokens (Bearer API tokens).
            $token = $user->currentAccessToken();
            if ($token instanceof \Laravel\Sanctum\PersonalAccessToken) {
                $token->delete();
            } elseif ($token && method_exists($token, 'delete') && !($token instanceof \Laravel\Sanctum\TransientToken)) {
                $token->delete();
            }

            // End web session when present (Sanctum stateful SPA / cookie auth)
            try {
                if ($request->hasSession()) {
                    \Illuminate\Support\Facades\Auth::guard('web')->logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                }
            } catch (\Throwable $e) {
                // Session may not exist for pure token API clients
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get authenticated user info
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->loadMissing(['role', 'driver', 'hirer', 'wallet']);

        // Auto-provision hirer profile for employer accounts missing the row
        // (legacy users / incomplete registration).
        if ($user->role && in_array($user->role->slug, ['hirer', 'employer'], true) && !$user->hirer) {
            $user->hirer()->create([
                'company_name' => $user->name,
                'subscription_tier' => 'free',
                'max_concurrent_contracts' => 3,
                'verification_status' => 'unverified',
            ]);
            $user->load('hirer');
        }

        if (!$user->wallet) {
            \App\Models\Wallet::create([
                'user_id' => $user->id,
                'balance' => 0,
                'available_balance' => 0,
                'currency' => 'NGN',
            ]);
            $user->load('wallet');
        }

        $payload = $this->userPayload($user);

        return response()->json([
            'success' => true,
            'user' => $payload,
            // Flat shape for clients that call GET /user
            'data' => $payload,
            'id' => $payload['id'],
            'name' => $payload['name'],
            'email' => $payload['email'],
            'phone' => $payload['phone'],
            'avatar' => $payload['avatar'],
            'role' => $payload['role'],
            'hirer' => $payload['hirer'],
            'hirer_id' => $payload['hirer_id'],
            'driver_id' => $payload['driver_id'],
            'wallet' => $payload['wallet'],
            'profile_completed' => $payload['profile_completed'],
            'profile_missing' => $payload['profile_missing'],
        ], 200);
    }

    /**
     * Update account holder profile (name, phone, avatar metadata, employer extras).
     * Mandatory fields for hire/ride portal: name, phone, avatar.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $user->loadMissing(['role', 'hirer', 'wallet']);

        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'phone' => 'required|string|max:32|unique:users,phone,' . $user->id,
            'nickname' => 'nullable|string|max:80',
            'gender' => 'nullable|string|in:male,female,other,prefer_not_to_say',
            'date_of_birth' => 'nullable|date|before:today',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'company_name' => 'nullable|string|max:255',
            'account_type' => 'nullable|string|in:employer,pickup_dropoff,individual',
        ], [
            'phone.unique' => 'This phone number is already registered to another account.',
            'email.unique' => 'This email address is already registered to another account.',
        ]);

        $user->name = $validated['name'];
        $user->phone = $validated['phone'];
        if (array_key_exists('nickname', $validated)) {
            $user->nickname = $validated['nickname'];
        }
        if (array_key_exists('gender', $validated)) {
            $user->gender = $validated['gender'];
        }
        if (!empty($validated['date_of_birth'])) {
            $user->date_of_birth = $validated['date_of_birth'];
        }
        if (!empty($validated['email'])) {
            $user->email = $validated['email'];
        }

        $avatarPath = $user->getRawOriginal('avatar');
        $profileComplete = !empty($user->name)
            && !empty($user->phone)
            && !empty($avatarPath);

        $user->profile_completed = $profileComplete;
        
        try {
            $user->save();
        } catch (\Throwable $e) {
            if (str_contains($e->getMessage(), 'users_phone_unique') || str_contains($e->getMessage(), '1062')) {
                return response()->json([
                    'message' => 'This phone number is already registered to another account.',
                    'errors' => [
                        'phone' => ['This phone number is already in use by another user account.']
                    ]
                ], 422);
            }
            throw $e;
        }

        $roleSlug = $user->role?->slug;
        if (in_array($roleSlug, ['hirer', 'employer'], true)) {
            if (!$user->hirer) {
                $user->hirer()->create([
                    'company_name' => $validated['company_name'] ?? $user->name,
                    'subscription_tier' => 'free',
                    'max_concurrent_contracts' => 3,
                    'verification_status' => 'pending',
                ]);
            } elseif (!empty($validated['company_name'])) {
                $user->hirer->update(['company_name' => $validated['company_name']]);
            }
            $user->load('hirer');
        }

        if ($request->filled('account_type') && $user->hirer) {
            $meta = is_array($user->hirer->metadata ?? null) ? $user->hirer->metadata : [];
            // store lightly on company_name suffix only if no metadata column — skip if not fillable
        }

        $user->loadMissing(['wallet', 'driver', 'hirer', 'role']);
        $payload = $this->userPayload($user->fresh(['role', 'driver', 'hirer', 'wallet']));

        return response()->json([
            'success' => true,
            'message' => $payload['profile_completed']
                ? 'Profile updated successfully.'
                : 'Profile saved. Please add a profile photo to complete your account.',
            'user' => $payload,
            'data' => $payload,
            'profile_completed' => $payload['profile_completed'],
            'profile_missing' => $payload['profile_missing'],
        ]);
    }

    protected function userPayload(User $user): array
    {
        $avatarRaw = $user->getRawOriginal('avatar');
        $missing = [];
        if (empty($user->name) || trim((string) $user->name) === '') {
            $missing[] = 'name';
        }
        if (empty($user->phone)) {
            $missing[] = 'phone';
        }
        if (empty($avatarRaw)) {
            $missing[] = 'avatar';
        }

        $profileCompleted = empty($missing) || (bool) $user->profile_completed && empty($missing);
        if (!empty($missing) && $user->profile_completed) {
            $user->forceFill(['profile_completed' => false])->saveQuietly();
            $profileCompleted = false;
        } elseif (empty($missing) && !$user->profile_completed) {
            $user->forceFill(['profile_completed' => true])->saveQuietly();
            $profileCompleted = true;
        }

        $wallet = $user->wallet;
        if (!$wallet) {
            $wallet = \App\Models\Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0, 'available_balance' => 0, 'currency' => 'NGN']
            );
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'nickname' => $user->nickname,
            'email' => $user->email,
            'phone' => $user->phone,
            'gender' => $user->gender,
            'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
            'avatar' => $user->avatar,
            'avatar_secondary' => $user->avatar_secondary,
            'avatar_tertiary' => $user->avatar_tertiary,
            'role' => $user->role ? $user->role->slug : null,
            'is_active' => $user->is_active,
            'last_login_at' => $user->last_login_at,
            'profile_completed' => $profileCompleted,
            'profile_missing' => $missing,
            'driver_id' => $user->driver ? $user->driver->id : null,
            'formatted_driver_id' => $user->driver ? $user->driver->formatted_id : null,
            'hirer_id' => $user->hirer ? $user->hirer->id : null,
            'hirer' => $user->hirer,
            'driver' => $user->driver ? [
                'id' => $user->driver->id,
                'status' => $user->driver->status,
                'is_online' => $user->driver->is_online,
                'has_vehicle' => (bool) $user->driver->has_vehicle,
            ] : null,
            'wallet' => [
                'balance' => (float) $wallet->balance,
                'available_balance' => (float) $wallet->available_balance,
                'currency' => $wallet->currency ?? 'NGN',
            ],
            'wallet_balance' => (float) $wallet->available_balance,
        ];
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'type' => 'nullable|string|in:primary,secondary,tertiary'
        ]);

        $user = $request->user();
        
        $type = $request->type ?? 'primary';
        $column = 'avatar';
        if ($type === 'secondary') $column = 'avatar_secondary';
        if ($type === 'tertiary') $column = 'avatar_tertiary';

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            
            // Delete old avatar if it exists and is local
            $oldAvatar = $user->getRawOriginal($column);
            if ($oldAvatar && !str_starts_with($oldAvatar, 'http')) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldAvatar);
            }

            $user->update([$column => $path]);

            // Completing primary avatar may finish mandatory profile
            if ($column === 'avatar') {
                $user->refresh();
                $complete = !empty($user->name) && !empty($user->phone) && !empty($user->getRawOriginal('avatar'));
                if ($complete && !$user->profile_completed) {
                    $user->forceFill(['profile_completed' => true])->saveQuietly();
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => ucfirst($type) . ' image updated successfully',
                'url' => asset('storage/' . $path),
                'avatar' => asset('storage/' . $path),
                'profile_completed' => (bool) $user->fresh()->profile_completed,
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'No file uploaded'
        ], 400);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password does not match'
            ], 400);
        }

        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
    }

    /**
     * In-App Account Deletion (Apple App Store Guideline 5.1.1(v) & Google Play Compliance)
     */
    public function deleteAccount(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Check for active or ongoing trips/bookings
        $hasActiveDriverTrip = false;
        if ($user->driver) {
            $hasActiveDriverTrip = \App\Models\Booking::where('driver_id', $user->driver->id)
                ->whereIn('status', ['accepted', 'arrived', 'in_progress'])
                ->exists();
        }

        $hasActiveHirerTrip = false;
        if ($user->hirer) {
            $hasActiveHirerTrip = \App\Models\Booking::where('hirer_id', $user->hirer->id)
                ->whereIn('status', ['pending', 'accepted', 'arrived', 'in_progress'])
                ->exists();
        }

        if ($hasActiveDriverTrip || $hasActiveHirerTrip) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your account while you have active or ongoing trips/bookings. Please complete or cancel them first.'
            ], 400);
        }

        // Clean up driver profile
        if ($user->driver) {
            $user->driver->update([
                'is_online' => false,
                'status' => 'suspended',
                'is_listed' => false,
            ]);
        }

        // Revoke all active authentication tokens
        $user->tokens()->delete();

        $originalEmail = $user->email;
        $timestamp = time();

        // Anonymize and deactivate user credentials
        $user->update([
            'is_active' => false,
            'email' => 'deleted_' . $timestamp . '_' . $originalEmail,
            'phone' => 'deleted_' . $timestamp . '_' . ($user->phone ?? ''),
            'device_imei' => null,
            'device_fingerprint' => null,
            'google_id' => null,
            'google_token' => null,
            'google_refresh_token' => null,
        ]);

        \Log::info("Account deletion executed for user ID: {$user->id} ({$originalEmail})");

        return response()->json([
            'success' => true,
            'message' => 'Your account has been deleted successfully.'
        ]);
    }

    /**
     * Web Account Deletion Information Page (Google Play Data Safety Requirement)
     */
    public function showDeleteAccountPage()
    {
        if (view()->exists('delete_account')) {
            return view('delete_account');
        }

        return response()->file(resource_path('views/delete_account.blade.php'));
    }

    /**
     * Process Web Account Deletion Request
     */
    public function submitWebDeleteRequest(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'reason' => 'nullable|string|max:500',
            'confirm_checkbox' => 'accepted'
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return back()->with('status', 'If an account with that email exists, an account deletion verification notice has been sent to confirm ownership.');
        }

        // Check for active bookings
        $hasActiveDriverTrip = $user->driver && \App\Models\Booking::where('driver_id', $user->driver->id)
            ->whereIn('status', ['accepted', 'arrived', 'in_progress'])
            ->exists();

        $hasActiveHirerTrip = $user->hirer && \App\Models\Booking::where('hirer_id', $user->hirer->id)
            ->whereIn('status', ['pending', 'accepted', 'arrived', 'in_progress'])
            ->exists();

        if ($hasActiveDriverTrip || $hasActiveHirerTrip) {
            return back()->withErrors(['email' => 'Cannot delete account with active or ongoing bookings. Please complete trips first.']);
        }

        // Deactivate driver
        if ($user->driver) {
            $user->driver->update([
                'is_online' => false,
                'status' => 'suspended',
                'is_listed' => false,
            ]);
        }

        $user->tokens()->delete();
        $timestamp = time();
        $user->update([
            'is_active' => false,
            'email' => 'deleted_' . $timestamp . '_' . $user->email,
            'phone' => 'deleted_' . $timestamp . '_' . ($user->phone ?? ''),
        ]);

        return back()->with('status', 'Your account and associated profile data have been permanently deactivated and scheduled for purge.');
    }
}
