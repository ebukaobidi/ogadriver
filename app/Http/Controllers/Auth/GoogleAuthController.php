<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\GoogleOAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Blacklist;

class GoogleAuthController extends Controller
{
    protected GoogleOAuthService $googleOAuth;

    public function __construct(GoogleOAuthService $googleOAuth)
    {
        $this->googleOAuth = $googleOAuth;
    }

    /**
     * Redirect user to Google OAuth page
     */
    public function redirect()
    {
        // For stateless APIs, we can pass a simple state or skip it.
        $state = bin2hex(random_bytes(16));
        $authUrl = $this->googleOAuth->getAuthUrl($state);

        return redirect()->away($authUrl);
    }

    /**
     * Handle Google OAuth callback
     */
    public function callback(Request $request)
    {
        $frontendUrl = rtrim(config('app.frontend_url'), '/');

        // Handle Google errors
        if ($request->has('error')) {
            return redirect($frontendUrl . '/login?error=' . $request->input('error'));
        }

        $code = (string) $request->input('code');
        if (empty($code)) {
            return redirect($frontendUrl . '/login?error=no_code');
        }

        try {
            // Exchange code for access token and fetch user info
            $tokenData = $this->googleOAuth->exchangeCodeForToken($code);
            $userInfo = $this->googleOAuth->getUserInfo($tokenData['access_token']);
            $googleId = $userInfo['id'];

            // Reject blacklisted Google accounts
            if (Blacklist::isBlacklisted('google_account', $googleId)) {
                return redirect($frontendUrl . '/login?error=account_banned');
            }

            // Find or create the user in our DB
            $user = $this->googleOAuth->findOrCreateUser($userInfo, $googleId, $tokenData);

            // Optional device tracking
            if ($request->has('device_imei')) {
                $user->update(['device_imei' => $request->input('device_imei')]);
            }
            if ($request->has('device_fingerprint')) {
                $user->update(['device_fingerprint' => $request->input('device_fingerprint')]);
            }

            // Update last login timestamp
            $user->update(['last_login_at' => now()]);

            // Log the user in (remember me)
            Auth::login($user, true);
            // Regenerate session to avoid stale session causing redirect to login
            $request->session()->regenerate();

            // Ensure an API token exists for onboarding/dashboard
            if (empty($user->api_token)) {
                $user->api_token = 'og_' . bin2hex(random_bytes(32));
                $user->save();
            }

            // Always route through SPA callback so token is stored before protected routes load
            return redirect($frontendUrl . '/auth/google/callback?token=' . $user->api_token);
        } catch (\Exception $e) {
            \Log::error('Google Auth Failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return redirect($frontendUrl . '/login?error=auth_failed&msg=' . urlencode($e->getMessage()));
        }
    }

    /**
     * Logout user and revoke Google token
     */
    public function logout(Request $request)
    {
        $frontendUrl = rtrim(config('app.frontend_url'), '/');

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect($frontendUrl . '/login');
    }
}
