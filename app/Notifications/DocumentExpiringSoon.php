<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;

class DocumentExpiringSoon extends Notification implements ShouldQueue
{
    use Queueable;

    protected $document;
    protected $daysRemaining;

    public function __construct($document, $daysRemaining)
    {
        $this->document = $document;
        $this->daysRemaining = $daysRemaining;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $documentName = $this->getDocumentName($this->document->document_type);
        
        return (new MailMessage)
            ->subject("Document Expiring Soon - {$documentName}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your {$documentName} will expire in {$this->daysRemaining} days.")
            ->line("Expiry Date: {$this->document->expiry_date->format('F j, Y')}")
            ->line("Please renew your document before it expires to maintain your active status on the platform.")
            ->action('View Document', url('/driver/documents/' . $this->document->id))
            ->line('If you have already renewed this document, please upload the new version.')
            ->salutation('Best regards, OgaDriver Team');
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => 'Document Expiring Soon',
            'message' => "Your {$this->getDocumentName($this->document->document_type)} expires in {$this->daysRemaining} days",
            'document_id' => $this->document->id,
            'document_type' => $this->document->document_type,
            'expiry_date' => $this->document->expiry_date->toIso8601String(),
            'days_remaining' => $this->daysRemaining,
            'type' => 'document_expiry_warning',
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
