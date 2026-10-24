<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeLoginNotification extends Notification
{
    /**
     * This notification is sent ONCE after a user successfully verifies their account.
     * It is NOT sent on every login. No ShouldQueue — sends synchronously for cPanel hosting.
     */
    public function __construct()
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $roleName = 'User';
        if ($notifiable->role) {
            $slug = $notifiable->role->slug ?? '';
            if ($slug === 'driver') {
                $roleName = 'Operator';
            } elseif ($slug === 'hirer') {
                $roleName = 'Employer';
            } elseif ($slug === 'admin') {
                $roleName = 'Administrator';
            }
        }

        return (new MailMessage)
            ->subject('Welcome to OgaDriver — Your Account is Verified! ✅')
            ->greeting('Hello ' . ($notifiable->first_name ?? $notifiable->name) . ',')
            ->line('Congratulations! Your OgaDriver account has been successfully verified as a **' . $roleName . '**.')
            ->line('You now have full access to the platform. Here\'s what you can do next:')
            ->line('✅ Complete your profile to stand out')
            ->line('✅ Upload your documents for KYC verification')
            ->line('✅ Explore available opportunities on the platform')
            ->action('Go to Your Dashboard', url('/dashboard'))
            ->line('If you have any questions, our support team is always here to help.')
            ->line('Welcome aboard — we\'re glad to have you!')
            ->salutation('Best regards, The OgaDriver Team');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
