<?php

namespace App\Jobs;

use App\Models\DriverDocument;
use App\Services\DocumentOCRService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessDocumentOCR implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $document;

    /**
     * Create a new job instance.
     */
    public function __construct(DriverDocument $document)
    {
        $this->document = $document;
    }

    /**
     * Execute the job.
     */
    public function handle(DocumentOCRService $ocrService): void
    {
        // Only run OCR if Google credentials exist
        if (file_exists(storage_path('app/google-credentials.json'))) {
            $ocrService->processDocument($this->document);
        }
    }
}
