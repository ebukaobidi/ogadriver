<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContractExpiringNotification extends Notification
{
    use Queueable;

    protected $job;
    protected $daysRemaining;

    public function __construct($job, $daysRemaining)
    {
        $this->job = $job;
        $this->daysRemaining = $daysRemaining;
    }

    public function via($notifiable)
    {
        // For now, we route to mail and database
        // In the future, channels like SMS or WhatsApp can be added here
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Contract Expiring Soon: Action Required')
                    ->line('Your contract with driver ' . ($this->job->driver->user->name ?? 'N/A') . ' is expiring in ' . $this->daysRemaining . ' days.')
                    ->line('Please log in to your dashboard to renew the retainer or request a fresh driver.')
                    ->action('View Contract', url('/dashboard/bookings'))
                    ->line('Thank you for using OgaDriver.');
    }

    public function toArray($notifiable)
    {
        return [
            'job_id' => $this->job->id,
            'message' => 'Contract expiring in ' . $this->daysRemaining . ' days.',
            'type' => 'contract_expiring'
        ];
    }
}
