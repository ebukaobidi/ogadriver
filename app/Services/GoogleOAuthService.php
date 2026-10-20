<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Blacklist;

class GoogleOAuthService
{
    protected string $clientId;
    protected string $clientSecret;
    protected string $redirectUri;
    protected string $authUrl;
    protected string $tokenUrl;
    protected string $userInfoUrl;

    public function __construct()
    {
        $this->clientId = config('services.google.client_id')
            ?: (\class_exists('\App\Models\ApiSetting') ? (\App\Models\ApiSetting::getValue('googleClientId') ?? '') : '');
        $this->clientSecret = config('services.google.client_secret')
            ?: (\class_exists('\App\Models\ApiSetting') ? (\App\Models\ApiSetting::getValue('googleClientSecret') ?? '') : '');
        $this->redirectUri = config('services.google.redirect_uri')
            ?: (\class_exists('\App\Models\ApiSetting') ? (\App\Models\ApiSetting::getValue('googleRedirectUri') ?? '') : '');
        
        if (empty($this->redirectUri)) {
            $this->redirectUri = rtrim(config('app.url', 'https://ogadriver.ng'), '/') . '/auth/google/callback';
        }

        $this->authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        $this->tokenUrl = 'https://oauth2.googleapis.com/token';
        $this->userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    }

    public function getClientId(): string
    {
        return $this->clientId;
    }

    /**
     * Get Google OAuth authorization URL
     */
    public function getAuthUrl(?string $state = null): string
    {
        $params = [
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'offline',
            'prompt' => 'consent',
        ];

        if ($state) {
            $params['state'] = $state;
        }

        return $this->authUrl . '?' . http_build_query($params);
    }

    /**
     * Exchange authorization code for access token
     */
    public function exchangeCodeForToken(string $code): array
    {
        $response = Http::asForm()->post($this->tokenUrl, [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'code' => $code,
            'redirect_uri' => $this->redirectUri,
            'grant_type' => 'authorization_code',
        ]);

        if (!$response->successful()) {
            Log::error('Google OAuth token exchange failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to exchange authorization code for token');
        }

        return $response->json();
    }

    /**
     * Get user info from Google using access token
     */
    public function getUserInfo(string $accessToken): array
    {
        $response = Http::withToken($accessToken)->get($this->userInfoUrl);

        if (!$response->successful()) {
            Log::error('Google OAuth user info request failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to retrieve user info from Google');
        }

        return $response->json();
    }

    /**
     * Verify Google ID Token directly (used by Mobile Apps & Native SDKs)
     */
    public function verifyIdToken(string $idToken): array
    {
        $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $idToken,
        ]);

        if (!$response->successful()) {
            Log::error('Google ID token verification failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Invalid or expired Google ID token');
        }

        $data = $response->json();
        return [
            'id' => $data['sub'] ?? null,
            'email' => $data['email'] ?? null,
            'name' => $data['name'] ?? ($data['given_name'] ?? 'Google User'),
            'picture' => $data['picture'] ?? null,
        ];
    }

    /**
     * Find or create user from Google OAuth data
     */
    public function findOrCreateUser(array $userInfo, string $googleId, array $tokenData = []): User
    {
        // Check if Google ID is blacklisted
        if (Blacklist::isBlacklisted('google_account', $googleId)) {
            throw new \Exception('This Google account has been permanently banned from the platform');
        }

        // Check for existing user by Google ID
        $user = User::where('google_id', $googleId)->first();

        if ($user) {
            // Update tokens if provided
            $updateData = [
                'google_token' => $tokenData['access_token'] ?? $user->google_token,
                'google_refresh_token' => $tokenData['refresh_token'] ?? $user->google_refresh_token,
            ];
            if (empty($user->avatar) && !empty($userInfo['picture'])) {
                $updateData['avatar'] = $userInfo['picture'];
            }
            $user->update($updateData);
            return $user;
        }

        // Check for existing user by email
        $user = User::where('email', $userInfo['email'])->first();

        if ($user) {
            // Link Google account to existing user
            $updateData = [
                'google_id' => $googleId,
                'google_token' => $tokenData['access_token'] ?? null,
                'google_refresh_token' => $tokenData['refresh_token'] ?? null,
            ];
            if (empty($user->avatar) && !empty($userInfo['picture'])) {
                $updateData['avatar'] = $userInfo['picture'];
            }
            $user->update($updateData);
            return $user;
        }

        // Create new user
        $user = User::create([
            'name' => $userInfo['name'] ?? ($userInfo['given_name'] ?? 'User'),
            'email' => $userInfo['email'],
            'phone' => 'G-' . rand(100000, 999999) . rand(1000, 9999), // Dummy phone to satisfy NOT NULL
            'avatar' => $userInfo['picture'] ?? null,
            'google_id' => $googleId,
            'google_token' => $tokenData['access_token'] ?? null,
            'google_refresh_token' => $tokenData['refresh_token'] ?? null,
            'password' => bcrypt(\Illuminate\Support\Str::random(32)), // Random password since they use OAuth
            'email_verified_at' => now(),
            'phone_verified_at' => now(), // Auto-verify phone for Google users
            'is_active' => true, // Auto-activate Google users
            'profile_completed' => false,
            'terms_accepted' => false,
        ]);
        
        return $user;
    }

    /**
     * Refresh access token using refresh token
     */
    public function refreshToken(string $refreshToken): array
    {
        $response = Http::asForm()->post($this->tokenUrl, [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'refresh_token' => $refreshToken,
            'grant_type' => 'refresh_token',
        ]);

        if (!$response->successful()) {
            Log::error('Google OAuth token refresh failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to refresh access token');
        }

        return $response->json();
    }

    /**
     * Revoke Google access token
     */
    public function revokeToken(string $token): bool
    {
        $response = Http::get('https://oauth2.googleapis.com/revoke', [
            'token' => $token,
        ]);

        return $response->successful();
    }
}
