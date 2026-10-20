<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(Request $request)
    {
        $role = $request->query('role', 'hirer'); // default to hirer (client) if unspecified
        // Pass the requested role through Google's state parameter so it returns in the callback
        return Socialite::driver('google')->stateless()->with(['state' => $role])->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            // Retrieve the role from the returned state parameter (fallback to hirer)
            $intendedRole = $request->input('state', 'hirer');
            $validRole = in_array($intendedRole, ['driver', 'hirer']) ? $intendedRole : 'hirer';

            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Check if user exists
            $user = User::where('email', $googleUser->getEmail())->first();
            
            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                    'role' => $validRole,
                    'email_verified_at' => now(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            } else {
                // Link google ID if not set
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'avatar' => $user->avatar ?? $googleUser->getAvatar(),
                    ]);
                }
                // If a returning user clicks "Sign up as Driver" but they are a hirer, you might want to upgrade their role here, 
                // but for now, we leave their existing role intact to prevent accidental overwrites.
            }
            
            Auth::login($user);
            
            // Return token for API or redirect
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Redirect to frontend with token
            return redirect(config('app.frontend_url') . '/dashboard?token=' . $token);
            
        } catch (\Exception $e) {
            return redirect(config('app.frontend_url') . '/login?error=oauth_failed');
        }
    }
}
