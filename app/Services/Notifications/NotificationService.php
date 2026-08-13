<?php

namespace App\Services\Notifications;

class NotificationService
{
    protected NotificationAdapterInterface $adapter;

    public function __construct(NotificationAdapterInterface $adapter)
    {
        $this->adapter = $adapter;
    }

    public function notifyEmployer(string $phoneNumber, string $message): bool
    {
        // Primary channel SMS
        return $this->adapter->sendSms($phoneNumber, $message);
    }

    public function notifyDriver(string $phoneNumber, string $message): bool
    {
        // Primary channel Push / fallback to SMS or WhatsApp
        // For this mock, we just use WhatsApp
        return $this->adapter->sendWhatsApp($phoneNumber, $message);
    }

    public function notifyGuarantorViaWhatsApp(string $phoneNumber, string $message): bool
    {
        return $this->adapter->sendWhatsApp($phoneNumber, $message);
    }

    public function notifyBiometricFailure(string $employerPhoneNumber, string $driverName): bool
    {
        $message = "SECURITY ALERT: OgaDriver detected a proxy driver attempt for your booking with {$driverName}. The booking has been locked. Please check your dashboard.";
        return $this->adapter->sendSms($employerPhoneNumber, $message);
    }
}
