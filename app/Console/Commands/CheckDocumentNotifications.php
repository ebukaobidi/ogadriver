<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DocumentNotificationService;
use Illuminate\Support\Facades\Log;

class CheckDocumentNotifications extends Command
{
    protected $signature = 'documents:check-notifications';
    protected $description = 'Check and send notifications for expiring, expired, and missing documents';

    protected DocumentNotificationService $notificationService;

    public function __construct(DocumentNotificationService $notificationService)
    {
        parent::__construct();
        $this->notificationService = $notificationService;
    }

    public function handle(): int
    {
        $this->info('Starting document notification checks...');

        try {
            $results = $this->notificationService->runAllChecks();

            $this->info('Expiring documents check:');
            $this->table(
                ['Notified', 'Skipped', 'Errors'],
                [[
                    $results['expiring']['notified'],
                    $results['expiring']['skipped'],
                    count($results['expiring']['errors'])
                ]]
            );

            $this->info('Expired documents check:');
            $this->table(
                ['Notified', 'Skipped', 'Errors'],
                [[
                    $results['expired']['notified'],
                    $results['expired']['skipped'],
                    count($results['expired']['errors'])
                ]]
            );

            $this->info('Missing documents check:');
            $this->table(
                ['Notified', 'Skipped', 'Errors'],
                [[
                    $results['missing']['notified'],
                    $results['missing']['skipped'],
                    count($results['missing']['errors'])
                ]]
            );

            $this->info('Notification Summary:');
            $this->table(
                ['Pending Documents', 'Expiring Documents', 'Expired Documents', 'Pending Drivers', 'Total Alerts'],
                [[
                    $results['summary']['pending_documents'],
                    $results['summary']['expiring_documents'],
                    $results['summary']['expired_documents'],
                    $results['summary']['pending_drivers'],
                    $results['summary']['total_alerts']
                ]]
            );

            $this->info('Document notification checks completed successfully.');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Error during document notification checks: ' . $e->getMessage());
            Log::error('Document notification check failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }
}
