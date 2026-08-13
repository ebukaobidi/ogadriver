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

class LoginController extends Controller
{
    /**
     * Login user with email/password
     */
    public function login(Request $request)
    {
        \Log::info('Login attempt', ['email' => $request->email]);

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
        $user = User::where('email', $request->email)->first();
        \Log::info('User lookup', ['email' => $request->email, 'user_found' => $user ? 'yes' : 'no']);

        if ($user) {
            \Log::info('User details', ['id' => $user->id, 'is_active' => $user->is_active, 'email_verified_at' => $user->email_verified_at]);
            \Log::info('Password check', ['password_matches' => Hash::check($request->password, $user->password)]);
        }

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            \Log::info('Login successful', ['user_id' => $user->id, 'email' => $user->email]);

            // Check if user is active
            if (!$user->is_active) {
                \Log::error('Login failed: user inactive', ['user_id' => $user->id]);
                Auth::logout();
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

            // Generate API token (store in user table)
            $apiToken = 'og_' . bin2hex(random_bytes(32));
            $user->update(['api_token' => $apiToken]);

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

        \Log::error('Login failed: invalid credentials', ['email' => $request->email]);
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials',
        ], 401);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->update(['api_token' => null]);
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
        
        return response()->json([
            'success' => true,
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
        ], 200);
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
            
            return response()->json([
                'success' => true,
                'message' => ucfirst($type) . ' image updated successfully',
                'url' => Storage::url($path)
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
}
