<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;

class DocumentExpired extends Notification implements ShouldQueue
{
    use Queueable;

    protected $document;

    public function __construct($document)
    {
        $this->document = $document;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $documentName = $this->getDocumentName($this->document->document_type);
        
        return (new MailMessage)
            ->subject("Document Expired - {$documentName}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your {$documentName} has expired.")
            ->line("Expiry Date: {$this->document->expiry_date->format('F j, Y')}")
            ->line("Your driver status has been temporarily suspended until you upload a renewed document.")
            ->action('Upload New Document', url('/driver/documents/upload'))
            ->line('Please upload your renewed document as soon as possible to restore your active status.')
            ->salutation('Best regards, OgaDriver Team');
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => 'Document Expired',
            'message' => "Your {$this->getDocumentName($this->document->document_type)} has expired",
            'document_id' => $this->document->id,
            'document_type' => $this->document->document_type,
            'expiry_date' => $this->document->expiry_date->toIso8601String(),
            'type' => 'document_expired',
            'priority' => 'high',
        ];
    }

    protected function getDocumentName($type)
    {
        $names = [
            'drivers_license' => 'Driver\'s License',
            'medical_certificate' => 'Medical Certificate',
            'police_clearance' => 'Police Clearance',
            'insurance' => 'Vehicle Insurance',
            'vehicle_registration' => 'Vehicle Registration',
            'guarantor_form_a' => 'Guarantor Form A',
            'guarantor_form_b' => 'Guarantor Form B',
            'lasdri_card' => 'LASDRI Card',
        ];

        return $names[$type] ?? 'Document';
    }
}
