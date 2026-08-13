<?php

namespace App\Console\Commands;

use App\Models\Driver;
use App\Services\DriverVerificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MonitorTrialPeriods extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'drivers:monitor-trials';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitor and expire trial periods for drivers';

    /**
     * Execute the console command.
     */
    public function handle(DriverVerificationService $verificationService): int
    {
        $this->info('Starting trial period monitoring...');

        // Get all drivers on trial
        $driversOnTrial = Driver::where('is_on_trial', true)
            ->where('is_listed', true)
            ->whereNotNull('trial_ends_at')
            ->get();

        $expiredCount = 0;
        $warningCount = 0;

        foreach ($driversOnTrial as $driver) {
            $trialStatus = $verificationService->getTrialStatus($driver);

            if ($trialStatus['trial_expired']) {
                // Delist driver
                $verificationService->delistDriver($driver, 'trial_period_ended');
                $expiredCount++;
                
                $this->warn("Driver ID {$driver->id} ({$driver->user->name}) - Trial expired, delisted");
                Log::info("Driver {$driver->id} delisted due to trial period expiration");
            } elseif ($trialStatus['days_remaining'] <= 3) {
                // Send warning for drivers with 3 or fewer days remaining
                $warningCount++;
                $this->info("Driver ID {$driver->id} ({$driver->user->name}) - {$trialStatus['days_remaining']} days remaining");
                
                // In production, send email/SMS notification to driver
                // $this->sendTrialWarningNotification($driver, $trialStatus['days_remaining']);
            }
        }

        $this->info("Trial period monitoring complete.");
        $this->info("Drivers delisted: {$expiredCount}");
        $this->info("Drivers with trial ending soon: {$warningCount}");

        return Command::SUCCESS;
    }
}
