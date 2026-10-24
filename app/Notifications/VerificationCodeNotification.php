<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerificationCodeNotification extends Notification
{

    protected $code;

    /**
     * Create a new notification instance.
     */
    public function __construct($code)
    {
        $this->code = $code;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('OgaDriver Verification Code')
            ->greeting('Hello ' . ($notifiable->name ?? 'User') . ',')
            ->line('Your verification code is: ' . $this->code)
            ->line('This code is valid for 15 minutes. Please do not share this code with anyone.')
            ->line('Thank you for choosing OgaDriver!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Verification Code',
            'message' => 'Your verification code is: ' . $this->code,
            'type' => 'security',
            'code' => $this->code,
        ];
    }
}
