<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Driver;
use App\Notifications\MissingDocumentsReminder;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class RemindPendingDocuments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'driver:remind-documents';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan operatives with incomplete verification documents and dispatch email/SMS reminders';

    /**
     * Execute the console command.
     */
    public function handle(NotificationService $smsService)
    {
        $this->info('Scanning unverified drivers with missing documents...');

        $drivers = Driver::with(['user', 'documents'])
            ->where('is_verified', false)
            ->where('status', '!=', 'blacklisted')
            ->get();

        $expectedDocs = [
            ['name' => "FRSC Driver's License", 'type' => 'drivers_license', 'required' => true],
            ['name' => 'Guarantor Form A', 'type' => 'guarantor_form_a', 'required' => true],
            ['name' => 'Guarantor Form B', 'type' => 'guarantor_form_b', 'required' => true],
        ];

        $remindedCount = 0;

        foreach ($drivers as $driver) {
            if (!$driver->user) continue;

            $submittedTypes = $driver->documents->pluck('document_type')->toArray();
            $missing = [];

            foreach ($expectedDocs as $doc) {
                if (!in_array($doc['type'], $submittedTypes)) {
                    $missing[] = $doc;
                }
            }

            if (!empty($missing)) {
                try {
                    // Send Email and Database notification
                    $driver->user->notify(new MissingDocumentsReminder($driver, $missing));

                    // Send SMS notification
                    if ($driver->user->phone) {
                        $missingNames = implode(', ', array_column($missing, 'name'));
                        $smsService->send(
                            $driver->user->phone,
                            "OgaDriver Alert: Your verification is incomplete. Please submit: {$missingNames} on your portal.",
                            'sms'
                        );
                    }

                    $remindedCount++;
                    $this->line("Reminded Driver ID {$driver->id} ({$driver->user->email})");
                } catch (\Exception $e) {
                    Log::error("Failed to remind driver ID {$driver->id}: " . $e->getMessage());
                }
            }
        }

        $this->info("Completed. Dispatched reminders to {$remindedCount} operative(s).");
        return Command::SUCCESS;
    }
}
