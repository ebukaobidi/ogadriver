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
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:driver,hirer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if email is blacklisted
        if (Blacklist::isBlacklisted('email', $request->email)) {
            return response()->json([
                'success' => false,
                'message' => 'This email has been permanently banned from the platform',
            ], 403);
        }

        // Get role
        $role = Role::where('slug', $request->role)->first();
        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid role specified',
            ], 400);
        }

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role_id' => $role->id,
            'is_active' => true,
            'email_verified_at' => null, // Require email verification
        ]);

        // Auto-create profile based on role
        if ($role->slug === 'driver') {
            \App\Models\Driver::create(['user_id' => $user->id]);
        } elseif ($role->slug === 'hirer') {
            \App\Models\Hirer::create(['user_id' => $user->id]);
        }

        // Log user in
        Auth::login($user);

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Generate API token
        $apiToken = 'og_' . bin2hex(random_bytes(32));
        $user->update(['api_token' => $apiToken]);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
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
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:driver,hirer',
            'device_imei' => 'nullable|string',
            'device_fingerprint' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

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

        // Get role
        $role = Role::where('slug', $request->role)->first();
        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid role specified',
            ], 400);
        }

        // Create user with device info
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role_id' => $role->id,
            'is_active' => true,
            'email_verified_at' => null, // Require email verification
            'device_imei' => $request->device_imei,
            'device_fingerprint' => $request->device_fingerprint,
            'last_device_verified_at' => now(),
        ]);

        // Auto-create profile based on role
        if ($role->slug === 'driver') {
            \App\Models\Driver::create(['user_id' => $user->id]);
        } elseif ($role->slug === 'hirer') {
            \App\Models\Hirer::create(['user_id' => $user->id]);
        }

        // Log user in
        Auth::login($user);

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Generate API token
        $apiToken = 'og_' . bin2hex(random_bytes(32));
        $user->update(['api_token' => $apiToken]);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
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
        ], 201);
    }
}
