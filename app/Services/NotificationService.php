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
    public function send(string $phoneNumber, string $message, string $type = 'sms'): bool
    {
        // Log the notification for debugging/audit
        Log::channel('single')->info("Sending {$type} notification to {$phoneNumber}", [
            'message' => $message
        ]);

        // In a real implementation, you would call your SMS/WhatsApp provider API here
        // e.g., Termii, Twilio, InfoBip

        return true;
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
