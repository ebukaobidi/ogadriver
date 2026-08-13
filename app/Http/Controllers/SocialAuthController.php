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
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Check if user exists
            $user = User::where('email', $googleUser->getEmail())->first();
            
            if (!$user) {
                // Determine role based on intent (this would usually be passed via state or frontend redirect)
                // For this example, we default to driver, but it can be handled dynamically
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => bcrypt(str_random(16)),
                    'role' => 'driver', // Or 'hirer'
                    'email_verified_at' => now(),
                    // other needed fields
                ]);
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
