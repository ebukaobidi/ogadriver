<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send an SMS/WhatsApp notification to a user.
     * This is a mock implementation that logs the notification for future integration with Twilio/Termii.
     *
     * @param string $phoneNumber The recipient's phone number
     * @param string $message The message content
     * @param string $type The notification type (e.g., 'sms', 'whatsapp')
     * @return bool
     */
    /**
     * Send an SMS/WhatsApp notification to a user via Termii.
     */
    public function send(string $phoneNumber, string $message, string $type = 'sms'): bool
    {
        // 1. Normalize Nigerian phone number to international format (234...)
        $cleanPhone = preg_replace('/[^0-9]/', '', $phoneNumber);
        if (str_starts_with($cleanPhone, '0') && strlen($cleanPhone) === 11) {
            $cleanPhone = '234' . substr($cleanPhone, 1);
        } elseif (str_starts_with($cleanPhone, '234')) {
            // Already 234
        } elseif (strlen($cleanPhone) === 10) {
            $cleanPhone = '234' . $cleanPhone;
        }

        // Always log for debugging & audit trail
        Log::channel('single')->info("Dispatching {$type} notification to {$cleanPhone}", [
            'original_phone' => $phoneNumber,
            'message' => $message
        ]);

        $apiKey = config('services.termii.api_key', env('TERMII_API_KEY'));
        $senderId = config('services.termii.sender_id', env('TERMII_SENDER_ID', 'OgaDriver'));
        $baseUrl = rtrim(config('services.termii.base_url', env('TERMII_BASE_URL', 'https://v4.api.termii.com')), '/');
        if (!str_contains($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        if (empty($apiKey)) {
            Log::warning("Termii API key not configured. Mocking SMS dispatch to {$cleanPhone}");
            return true;
        }

        try {
            $channel = ($type === 'whatsapp') ? 'whatsapp' : 'generic';

            $response = \Illuminate\Support\Facades\Http::timeout(10)->post("{$baseUrl}/sms/send", [
                'to' => $cleanPhone,
                'from' => $senderId,
                'sms' => $message,
                'type' => 'plain',
                'channel' => $channel,
                'api_key' => $apiKey,
            ]);

            if ($response->successful()) {
                Log::info("Termii notification sent successfully to {$cleanPhone}", ['response' => $response->json()]);
                return true;
            }

            Log::error("Termii dispatch failed for {$cleanPhone}", [
                'status' => $response->status(),
                'response' => $response->json() ?? $response->body()
            ]);
            return false;
        } catch (\Throwable $e) {
            Log::error("Termii connection exception: " . $e->getMessage(), ['phone' => $cleanPhone]);
            return false;
        }
    }

    /**
     * Send verification code via SMS
     */
    public function sendVerificationCode(string $phoneNumber, string $code): bool
    {
        $message = "Your OgaDriver verification code is: {$code}. It expires in 15 minutes.";
        return $this->send($phoneNumber, $message, 'sms');
    }

    /**
     * Notify an operative about a new employment proposal
     */
    public function notifyNewProposal(string $phoneNumber, string $employerName, string $amount): void
    {
        $message = "OgaDriver: You have a new employment proposal from {$employerName} for {$amount}. Log in to your portal to accept or decline.";
        $this->send($phoneNumber, $message, 'whatsapp');
    }

    /**
     * Notify a user about a successful subscription
     */
    public function notifySubscriptionSuccess(string $phoneNumber, string $planName, string $role): void
    {
        $message = "OgaDriver: Your {$role} subscription for '{$planName}' is now active. Thank you for using our platform.";
        $this->send($phoneNumber, $message, 'sms');
    }

    /**
     * Notify an employer about safety verification completion
     */
    public function notifyVerificationComplete(string $phoneNumber, string $status): void
    {
        $message = "OgaDriver: Your safety verification status has been updated to {$status}.";
        $this->send($phoneNumber, $message, 'sms');
    }
}
