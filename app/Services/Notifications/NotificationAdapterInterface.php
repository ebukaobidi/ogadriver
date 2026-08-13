<?php

namespace App\Services\Notifications;

interface NotificationAdapterInterface
{
    /**
     * Send an SMS message
     */
    public function sendSms(string $phoneNumber, string $message): bool;

    /**
     * Send a WhatsApp message
     */
    public function sendWhatsApp(string $phoneNumber, string $message): bool;

    /**
     * Send a Push Notification
     */
    public function sendPush(string $deviceToken, string $title, string $body, array $data = []): bool;
}
