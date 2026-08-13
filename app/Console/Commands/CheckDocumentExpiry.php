<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckDocumentExpiry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-document-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for expired driver documents and deactivate affected drivers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired documents...');

        // Find expired documents
        $expiredDocuments = \App\Models\DriverDocument::expired()
            ->where('status', 'approved')
            ->get();

        $deactivatedDrivers = 0;
        $notifiedDrivers = 0;

        foreach ($expiredDocuments as $document) {
            $driver = $document->driver;
            
            if ($driver && $driver->status === 'active') {
                // Deactivate driver
                $driver->update(['status' => 'inactive']);
                $deactivatedDrivers++;
                
                $this->warn("Driver ID {$driver->id} deactivated due to expired {$document->document_type}");
                
                // Send notification to driver
                $driver->user->notify(new \App\Notifications\DocumentExpiredNotification($document));
                $notifiedDrivers++;
            }
        }

        // Check for documents expiring soon (within 30 days)
        $expiringSoonDocuments = \App\Models\DriverDocument::expiringSoon(30)
            ->where('status', 'approved')
            ->get();

        foreach ($expiringSoonDocuments as $document) {
            $driver = $document->driver;
            
            if ($driver && $driver->status === 'active') {
                // Send warning notification
                $driver->user->notify(new \App\Notifications\DocumentExpiringSoonNotification($document));
                $notifiedDrivers++;
            }
        }

        // Check for expired subscriptions
        $expiredSubscriptions = \App\Models\Subscription::where('status', 'active')
            ->where('ends_at', '<', now())
            ->get();

        foreach ($expiredSubscriptions as $subscription) {
            $subscription->update(['status' => 'expired']);
            
            // Downgrade hirer if subscription was corporate/enterprise
            if ($subscription->type === 'corporate' || $subscription->type === 'enterprise') {
                $hirer = $subscription->user->hirer;
                if ($hirer) {
                    $hirer->update([
                        'subscription_tier' => 'free',
                        'max_concurrent_contracts' => 5,
                        'can_view_direct_contacts' => false,
                        'can_bulk_broadcast' => false,
                        'has_api_access' => false,
                    ]);
                    $this->warn("Hirer ID {$hirer->id} downgraded to free tier due to expired subscription");
                }
            }
        }

        $this->info("Document expiry check completed:");
        $this->info("- Deactivated drivers: {$deactivatedDrivers}");
        $this->info("- Notifications sent: {$notifiedDrivers}");
        $this->info("- Expired subscriptions processed: {$expiredSubscriptions->count()}");

        return Command::SUCCESS;
    }
}
