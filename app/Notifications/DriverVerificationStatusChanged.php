<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DriverVerificationStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    protected $status;
    protected $message;

    public function __construct(string $status, string $message)
    {
        $this->status = $status;
        $this->message = $message;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verification Status Update - OgaDriver')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line($this->message)
            ->line('Current Status: ' . ucfirst($this->status))
            ->action('View Dashboard', url('/driver/dashboard'))
            ->line('Thank you for using OgaDriver!');
    }

    public function toArray($notifiable): array
    {
        return [
            'status' => $this->status,
            'message' => $this->message,
            'type' => 'verification_status_change',
        ];
    }
}
