<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class LocationIqService
{
    protected string $apiKey;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.locationiq.api_key', env('LOCATIONIQ_API_KEY', 'pk.8ae3192c04f86a50c49464280dfb044e'));
        $this->baseUrl = config('services.locationiq.base_url', env('LOCATIONIQ_BASE_URL', 'https://us1.locationiq.com/v1'));
    }

    /**
     * Reverse geocode latitude and longitude to an address string
     */
    public function reverseGeocode(float $latitude, float $longitude): ?array
    {
        if (empty($this->apiKey)) {
            Log::warning('LocationIQ API Key missing');
            return null;
        }

        $cacheKey = "locationiq:reverse:" . round($latitude, 4) . ":" . round($longitude, 4);

        return Cache::remember($cacheKey, 86400, function () use ($latitude, $longitude) {
            try {
                $response = Http::get("{$this->baseUrl}/reverse.php", [
                    'key' => $this->apiKey,
                    'lat' => $latitude,
                    'lon' => $longitude,
                    'format' => 'json',
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return [
                        'display_name' => $data['display_name'] ?? null,
                        'address' => $data['address'] ?? [],
                    ];
                }

                Log::error('LocationIQ Reverse Geocoding failed', ['response' => $response->json()]);
                return null;
            } catch (\Exception $e) {
                Log::error('LocationIQ Exception: ' . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Forward geocode address query to latitude and longitude
     */
    public function geocode(string $address): ?array
    {
        if (empty($this->apiKey) || empty(trim($address))) {
            return null;
        }

        $cacheKey = "locationiq:forward:" . md5(strtolower(trim($address)));

        return Cache::remember($cacheKey, 86400, function () use ($address) {
            try {
                $response = Http::get("{$this->baseUrl}/search.php", [
                    'key' => $this->apiKey,
                    'q' => $address,
                    'format' => 'json',
                    'limit' => 1,
                ]);

                if ($response->successful() && !empty($response->json())) {
                    $data = $response->json()[0];
                    return [
                        'latitude' => (float) $data['lat'],
                        'longitude' => (float) $data['lon'],
                        'display_name' => $data['display_name'] ?? $address,
                    ];
                }

                return null;
            } catch (\Exception $e) {
                Log::error('LocationIQ Geocoding Exception: ' . $e->getMessage());
                return null;
            }
        });
    }
}
