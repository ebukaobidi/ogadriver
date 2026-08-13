<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentExpiringSoonNotification extends Notification
{
    use Queueable;

    public function __construct(
        public $document
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $daysUntilExpiry = $this->document->expiry_date->diffInDays(now());
        
        return (new MailMessage)
            ->subject('Your Driver Document Is Expiring Soon - Ogadriver.ng')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your ' . str_replace('_', ' ', $this->document->document_type) . ' is expiring in ' . $daysUntilExpiry . ' day(s).')
            ->line('Document Number: ' . ($this->document->document_number ?? 'N/A'))
            ->line('Expiry Date: ' . $this->document->expiry_date->format('F j, Y'))
            ->line('Please renew your document before the expiry date to avoid account deactivation.')
            ->line('You can upload your renewed document through the Ogadriver.ng portal.')
            ->action('Upload Renewed Document', url('/driver/documents'))
            ->line('If you have already renewed this document, please upload the new version to update your records.')
            ->line('Thank you for using Ogadriver.ng!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $daysUntilExpiry = $this->document->expiry_date->diffInDays(now());
        
        return [
            'document_id' => $this->document->id,
            'document_type' => $this->document->document_type,
            'expiry_date' => $this->document->expiry_date->toIso8601String(),
            'days_until_expiry' => $daysUntilExpiry,
            'message' => 'Your ' . str_replace('_', ' ', $this->document->document_type) . ' is expiring in ' . $daysUntilExpiry . ' day(s).',
        ];
    }
}
