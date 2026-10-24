<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;

class MissingDocumentsReminder extends Notification implements ShouldQueue
{
    use Queueable;

    protected $driver;
    protected $missingDocuments;

    public function __construct($driver, $missingDocuments)
    {
        $this->driver = $driver;
        $this->missingDocuments = $missingDocuments;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $missingCount = count($this->missingDocuments);
        $requiredCount = count(array_filter($this->missingDocuments, fn($doc) => $doc['required']));
        
        $mail = (new MailMessage)
            ->subject("Incomplete Verification Documents")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your driver verification is incomplete. You are missing {$missingCount} document(s).");

        if ($requiredCount > 0) {
            $mail->line("{$requiredCount} required document(s) must be uploaded to complete your verification:");
        } else {
            $mail->line("The following documents are still pending:");
        }

        foreach ($this->missingDocuments as $doc) {
            $status = $doc['required'] ? ' (Required)' : ' (Optional)';
            $mail->line("- {$doc['name']}{$status}");
        }

        $mail->line("Please upload these documents to complete your verification and start receiving job opportunities.")
            ->action('Upload Documents', url('/driver/documents'))
            ->line('If you have already uploaded these documents, please wait for admin verification.')
            ->salutation('Best regards, OgaDriver Team');

        return $mail;
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => 'Missing Verification Documents',
            'message' => "You have " . count($this->missingDocuments) . " document(s) pending upload",
            'driver_id' => $this->driver->id,
            'missing_documents' => $this->missingDocuments,
            'missing_count' => count($this->missingDocuments),
            'required_count' => count(array_filter($this->missingDocuments, fn($doc) => $doc['required'])),
            'type' => 'missing_documents',
            'priority' => 'medium',
        ];
    }
}
