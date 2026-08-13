<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentExpiredNotification extends Notification
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
        return (new MailMessage)
            ->subject('Your Driver Document Has Expired - Ogadriver.ng')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your ' . str_replace('_', ' ', $this->document->document_type) . ' has expired.')
            ->line('Document Number: ' . ($this->document->document_number ?? 'N/A'))
            ->line('Expiry Date: ' . $this->document->expiry_date->format('F j, Y'))
            ->line('As a result, your driver account has been temporarily deactivated.')
            ->line('To reactivate your account, please upload a renewed document through the Ogadriver.ng portal.')
            ->action('Upload Renewed Document', url('/driver/documents'))
            ->line('If you believe this is an error, please contact our support team.')
            ->line('Thank you for using Ogadriver.ng!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'document_id' => $this->document->id,
            'document_type' => $this->document->document_type,
            'expiry_date' => $this->document->expiry_date->toIso8601String(),
            'message' => 'Your ' . str_replace('_', ' ', $this->document->document_type) . ' has expired and your account has been deactivated.',
        ];
    }
}
