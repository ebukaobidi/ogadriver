<?php

namespace App\Services\Notifications;

use Illuminate\Support\Facades\Log;

class MockNotificationAdapter implements NotificationAdapterInterface
{
    public function sendSms(string $phoneNumber, string $message): bool
    {
        Log::info("Mock SMS sent to {$phoneNumber}", ['message' => $message]);
        return true;
    }

    public function sendWhatsApp(string $phoneNumber, string $message): bool
    {
        Log::info("Mock WhatsApp sent to {$phoneNumber}", ['message' => $message]);
        return true;
    }

    public function sendPush(string $deviceToken, string $title, string $body, array $data = []): bool
    {
        Log::info("Mock Push sent to token {$deviceToken}", [
            'title' => $title,
            'body' => $body,
            'data' => $data
        ]);
        return true;
    }
}
