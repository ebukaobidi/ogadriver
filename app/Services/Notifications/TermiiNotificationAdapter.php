<?php

namespace App\Services\Notifications;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TermiiNotificationAdapter implements NotificationAdapterInterface
{
    protected function getBaseUrl(): string
    {
        $url = rtrim(config('services.termii.base_url', 'https://v4.api.termii.com'), '/');
        return str_contains($url, '/api') ? $url : $url . '/api';
    }

    public function sendSms(string $phoneNumber, string $message): bool
    {
        $apiKey = config('services.termii.api_key');
        if (empty($apiKey)) {
            Log::warning("Termii API Key not configured. Cannot send SMS to {$phoneNumber}");
            return false;
        }

        try {
            $baseUrl = $this->getBaseUrl();
            $response = Http::post("{$baseUrl}/sms/send", [
                'to' => $phoneNumber,
                'from' => config('services.termii.sender_id', 'OgaDriver'),
                'sms' => $message,
                'type' => 'plain',
                'channel' => 'generic',
                'api_key' => $apiKey,
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error("Termii SMS failed", ['response' => $response->json()]);
            return false;
        } catch (\Exception $e) {
            Log::error("Termii SMS Exception: " . $e->getMessage());
            return false;
        }
    }

    public function sendWhatsApp(string $phoneNumber, string $message): bool
    {
        $apiKey = config('services.termii.api_key');
        if (empty($apiKey)) {
            Log::warning("Termii API Key not configured. Cannot send WhatsApp to {$phoneNumber}");
            return false;
        }

        try {
            $baseUrl = $this->getBaseUrl();
            $response = Http::post("{$baseUrl}/sms/send", [
                'to' => $phoneNumber,
                'from' => config('services.termii.sender_id', 'OgaDriver'),
                'sms' => $message,
                'type' => 'plain',
                'channel' => 'whatsapp',
                'api_key' => $apiKey,
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error("Termii WhatsApp failed", ['response' => $response->json()]);
            return false;
        } catch (\Exception $e) {
            Log::error("Termii WhatsApp Exception: " . $e->getMessage());
            return false;
        }
    }

    public function sendPush(string $deviceToken, string $title, string $body, array $data = []): bool
    {
        $serverKey = config('services.fcm.server_key');
        if (empty($serverKey)) {
            Log::warning("FCM Server Key not configured. Cannot send Push to {$deviceToken}");
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'key=' . $serverKey,
                'Content-Type' => 'application/json',
            ])->post('https://fcm.googleapis.com/fcm/send', [
                'to' => $deviceToken,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                    'sound' => 'default',
                ],
                'data' => $data,
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error("FCM Push failed", ['response' => $response->json()]);
            return false;
        } catch (\Exception $e) {
            Log::error("FCM Push Exception: " . $e->getMessage());
            return false;
        }
    }
}
