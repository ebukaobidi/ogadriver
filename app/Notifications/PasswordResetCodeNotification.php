<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetCodeNotification extends Notification
{
    protected string $code;

    public function __construct(string $code)
    {
        $this->code = $code;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reset Your OgaDriver Password')
            ->greeting('Hello ' . ($notifiable->first_name ?? $notifiable->name) . ',')
            ->line('You requested to reset your password. Use the code below to complete the process:')
            ->line('**Your Reset Code: ' . $this->code . '**')
            ->line('This code will expire in **15 minutes**.')
            ->line('If you did not request a password reset, please ignore this email. Your account is safe.')
            ->salutation('Best regards, The OgaDriver Team');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
