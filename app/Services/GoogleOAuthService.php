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
        $this->clientId = config('services.google.client_id') ?? '';
        $this->clientSecret = config('services.google.client_secret') ?? '';
        $this->redirectUri = config('services.google.redirect_uri') ?? '';
        $this->authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        $this->tokenUrl = 'https://oauth2.googleapis.com/token';
        $this->userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
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
            if (!empty($tokenData)) {
                $user->update([
                    'google_token' => $tokenData['access_token'] ?? $user->google_token,
                    'google_refresh_token' => $tokenData['refresh_token'] ?? $user->google_refresh_token,
                ]);
            }
            return $user;
        }

        // Check for existing user by email
        $user = User::where('email', $userInfo['email'])->first();

        if ($user) {
            // Link Google account to existing user
            $user->update([
                'google_id' => $googleId,
                'google_token' => $tokenData['access_token'] ?? null,
                'google_refresh_token' => $tokenData['refresh_token'] ?? null,
            ]);
            return $user;
        }

        // Create new user
        return User::create([
            'name' => $userInfo['name'],
            'email' => $userInfo['email'],
            'google_id' => $googleId,
            'google_token' => $tokenData['access_token'] ?? null,
            'google_refresh_token' => $tokenData['refresh_token'] ?? null,
            'password' => bcrypt(\Illuminate\Support\Str::random(32)), // Random password since they use OAuth
            'email_verified_at' => now(),
            'profile_completed' => false,
            'terms_accepted' => false,
        ]);
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
