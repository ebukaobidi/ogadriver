<?php

namespace App\Console\Commands;

use App\Models\Driver;
use App\Models\Guarantor;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckGuarantorRenewal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-guarantor-renewal';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check guarantor renewals for drivers with active subscriptions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting guarantor renewal check...');
        
        // Get drivers with active subscriptions that need guarantor checks
        $drivers = Driver::where('status', 'active')
            ->where('is_verified', true)
            ->whereHas('guarantors', function ($query) {
                $query->where('is_verified', true)
                      ->where('needsRenewalCheck', true);
            })
            ->with('guarantors')
            ->get();

        $this->info("Found {$drivers->count()} drivers requiring guarantor renewal checks");

        foreach ($drivers as $driver) {
            $this->info("Processing driver: {$driver->user->name} (ID: {$driver->id})");
            
            foreach ($driver->guarantors as $guarantor) {
                if (!$guarantor->needsRenewalCheck()) {
                    continue;
                }

                $this->info("  - Checking guarantor: {$guarantor->full_name} ({$guarantor->phone_number})");
                
                // Send WhatsApp/SMS verification to guarantor
                $this->sendGuarantorVerification($guarantor, $driver);
                
                // Mark as checked
                $guarantor->markRenewalChecked();
                
                $this->info("  ✓ Verification sent to {$guarantor->phone_number}");
            }
        }

        $this->info('Guarantor renewal check completed successfully.');
        
        return Command::SUCCESS;
    }

    /**
     * Send verification message to guarantor via WhatsApp/SMS
     */
    private function sendGuarantorVerification(Guarantor $guarantor, Driver $driver): void
    {
        $message = $this->buildVerificationMessage($guarantor, $driver);
        
        app(\App\Services\Notifications\NotificationService::class)->notifyGuarantorViaWhatsApp(
            $guarantor->phone_number,
            $message
        );
        // Log the message as a fallback/record
        Log::info('Guarantor verification message', [
            'guarantor_id' => $guarantor->id,
            'driver_id' => $driver->id,
            'phone_number' => $guarantor->phone_number,
            'message' => $message,
        ]);
        
        // Example integration (pseudo-code):
        // WhatsAppService::sendMessage($guarantor->phone_number, $message);
        // or
        // SMSService::send($guarantor->phone_number, $message);
    }

    /**
     * Build verification message for guarantor
     */
    private function buildVerificationMessage(Guarantor $guarantor, Driver $driver): string
    {
        $confirmationUrl = url("/guarantor/confirm/{$guarantor->id}/" . $this->generateConfirmationToken($guarantor));
        
        return "OGADRIVER GUARANTOR RENEWAL CONFIRMATION\n\n" .
               "Dear {$guarantor->full_name},\n\n" .
               "You are listed as a guarantor for driver {$driver->user->name}.\n" .
               "Their subscription has been renewed for another month.\n\n" .
               "Please confirm you still legally back this operator by clicking:\n" .
               "{$confirmationUrl}\n\n" .
               "Or reply YES to this message to confirm.\n\n" .
               "If you no longer wish to be a guarantor, reply NO.\n\n" .
               "Thank you,\n" .
               "Ogadriver.ng Security Team";
    }

    /**
     * Generate confirmation token for guarantor
     */
    private function generateConfirmationToken(Guarantor $guarantor): string
    {
        return hash('sha256', $guarantor->id . $guarantor->driver_id . now()->timestamp);
    }
}
