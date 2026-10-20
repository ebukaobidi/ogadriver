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
    public function redirect(Request $request)
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('APP_URL')), '/');
        if (empty($this->googleOAuth->getClientId())) {
            return redirect($frontendUrl . '/login?error=google_not_configured');
        }

        // Store source or redirect URI if passed from mobile
        $source = $request->query('source', 'web');
        $stateData = json_encode([
            'nonce' => bin2hex(random_bytes(8)),
            'source' => $source
        ]);
        $state = base64_encode($stateData);

        $authUrl = $this->googleOAuth->getAuthUrl($state);
        return redirect()->away($authUrl);
    }

    /**
     * Handle Google OAuth callback
     */
    public function callback(Request $request)
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('APP_URL')), '/');

        // Check state for source (mobile vs web)
        $isMobile = false;
        if ($request->has('state')) {
            $decoded = json_decode(base64_decode($request->input('state')), true);
            if (isset($decoded['source']) && $decoded['source'] === 'mobile') {
                $isMobile = true;
            }
        }

        // Handle Google errors
        if ($request->has('error')) {
            if ($isMobile) {
                return redirect('ogadriver://auth/callback?error=' . urlencode($request->input('error')));
            }
            return redirect($frontendUrl . '/login?error=' . $request->input('error'));
        }

        $code = (string) $request->input('code');
        if (empty($code)) {
            if ($isMobile) {
                return redirect('ogadriver://auth/callback?error=no_code');
            }
            return redirect($frontendUrl . '/login?error=no_code');
        }

        try {
            // Exchange code for access token and fetch user info
            $tokenData = $this->googleOAuth->exchangeCodeForToken($code);
            $userInfo = $this->googleOAuth->getUserInfo($tokenData['access_token']);
            $googleId = $userInfo['id'] ?? null;

            if (!$googleId) {
                throw new \Exception('Invalid Google profile data returned.');
            }

            // Reject blacklisted Google accounts
            if (Blacklist::isBlacklisted('google_account', $googleId)) {
                if ($isMobile) {
                    return redirect('ogadriver://auth/callback?error=account_banned');
                }
                return redirect($frontendUrl . '/login?error=account_banned');
            }

            // Find or create the user in DB
            $user = $this->googleOAuth->findOrCreateUser($userInfo, $googleId, $tokenData);

            // Device tracking
            if ($request->has('device_imei')) {
                $user->update(['device_imei' => $request->input('device_imei')]);
            }
            if ($request->has('device_fingerprint')) {
                $user->update(['device_fingerprint' => $request->input('device_fingerprint')]);
            }

            $user->update(['last_login_at' => now()]);

            // Log user in session
            Auth::login($user, true);
            if ($request->hasSession()) {
                $request->session()->regenerate();
            }

            // Generate Sanctum API token
            $apiToken = $user->createToken('google_auth')->plainTextToken;

            if ($isMobile) {
                return redirect('ogadriver://auth/callback?token=' . $apiToken . '&role=' . ($user->role ? $user->role->slug : ''));
            }

            // Web SPA callback
            return redirect($frontendUrl . '/auth/google/callback?token=' . $apiToken);
        } catch (\Exception $e) {
            \Log::error('Google Auth Failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            if ($isMobile) {
                return redirect('ogadriver://auth/callback?error=auth_failed&msg=' . urlencode($e->getMessage()));
            }
            return redirect($frontendUrl . '/login?error=auth_failed&msg=' . urlencode($e->getMessage()));
        }
    }

    /**
     * API Native Token Login (Used by Mobile App or Single-Page Google One Tap)
     */
    public function tokenLogin(Request $request)
    {
        $request->validate([
            'id_token' => 'nullable|string',
            'access_token' => 'nullable|string',
        ]);

        try {
            $userInfo = null;
            $googleId = null;

            if ($request->has('id_token') && !empty($request->input('id_token'))) {
                $userInfo = $this->googleOAuth->verifyIdToken($request->input('id_token'));
                $googleId = $userInfo['id'];
            } elseif ($request->has('access_token') && !empty($request->input('access_token'))) {
                $userInfo = $this->googleOAuth->getUserInfo($request->input('access_token'));
                $googleId = $userInfo['id'] ?? null;
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Either id_token or access_token is required.'
                ], 422);
            }

            if (!$googleId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to resolve Google user identity.'
                ], 422);
            }

            if (Blacklist::isBlacklisted('google_account', $googleId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This Google account is permanently restricted.'
                ], 403);
            }

            $user = $this->googleOAuth->findOrCreateUser($userInfo, $googleId);
            $user->update(['last_login_at' => now()]);

            $token = $user->createToken('google_mobile_auth')->plainTextToken;
            $user->load('role', 'driver', 'hirer');

            $needsOnboarding = !$user->role_id || !$user->profile_completed;

            return response()->json([
                'success' => true,
                'message' => 'Google Authentication successful',
                'token' => $token,
                'needs_onboarding' => $needsOnboarding,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'role' => $user->role ? $user->role->slug : null,
                    'driver' => $user->driver,
                    'hirer' => $user->hirer,
                    'profile_completed' => (bool) $user->profile_completed
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('API Google Token Login Failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Google Authentication failed: ' . $e->getMessage()
            ], 401);
        }
    }

    /**
     * Logout user and revoke Google token
     */
    public function logout(Request $request)
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('APP_URL')), '/');

        Auth::logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return redirect($frontendUrl . '/login');
    }
}
