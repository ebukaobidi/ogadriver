<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Role;
use App\Models\Driver;
use App\Models\Hirer;

class OnboardingController extends Controller
{
    /**
     * Complete onboarding for a new user (usually from Google OAuth).
     */
    public function completeOnboarding(Request $request)
    {
        $request->validate([
            'role' => 'required|in:driver,hirer',
            'service_mode' => 'nullable|in:driver_only,driver_with_vehicle,both',
            'country_id' => 'required|integer', // We will assume the frontend sends a valid country ID
            'phone' => 'required|string|max:20|unique:users,phone,' . Auth::id(),
            'nickname' => 'nullable|string|max:255',
            'gender' => 'nullable|string|in:male,female,other'
        ], [
            'phone.unique' => 'This phone number is already registered to another account.',
        ]);

        $user = Auth::user();

        if ($user->role_id) {
            return response()->json([
                'success' => false,
                'message' => 'User has already completed onboarding.'
            ], 400);
        }

        $role = Role::where('slug', $request->role)->first();
        if (!$role) {
            return response()->json(['success' => false, 'message' => 'Role not found.'], 404);
        }

        // Update user
        $user->role_id = $role->id;
        $user->country_id = $request->country_id;
        $user->phone = $request->phone;
        
        if ($request->has('nickname')) {
            $user->nickname = $request->nickname;
        }
        if ($request->has('gender')) {
            $user->gender = $request->gender;
        }

        $user->terms_accepted = true;
        $user->profile_completed = true;
        $user->save();

        // Create associated profile if it doesn't exist
        if ($request->role === 'driver') {
            $serviceMode = $request->input('service_mode', 'driver_only');
            Driver::firstOrCreate(['user_id' => $user->id], [
                'status' => 'pending',
                'is_verified' => false,
                'service_mode' => $serviceMode,
                'has_vehicle' => in_array($serviceMode, ['driver_with_vehicle', 'both'])
            ]);
        } elseif ($request->role === 'hirer') {
            Hirer::firstOrCreate(['user_id' => $user->id], [
                'company_name' => $user->name,
                'contact_email' => $user->email,
                'status' => 'active'
            ]);
        }

        // Refresh user to get role relationship
        $user->load('role');

        return response()->json([
            'success' => true,
            'message' => 'Onboarding completed successfully',
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
                'hirer_id' => $user->hirer ? $user->hirer->id : null,
            ]
        ]);
    }
}
