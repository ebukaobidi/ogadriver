<?php

namespace App\Jobs;

use App\Models\DriverDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessDriverDocumentImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $documentId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $documentId)
    {
        $this->documentId = $documentId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Placeholder implementation – in a real system you would process the image.
        $doc = DriverDocument::find($this->documentId);
        if ($doc) {
            Log::info('Processing driver document image', ['id' => $this->documentId]);
            // Add any image processing or analysis here.
        } else {
            Log::warning('ProcessDriverDocumentImage: Document not found', ['id' => $this->documentId]);
        }
    }
}
?>
