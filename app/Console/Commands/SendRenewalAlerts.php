<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Job;
use Carbon\Carbon;
use App\Notifications\ContractExpiringNotification;

class SendRenewalAlerts extends Command
{
    protected $signature = 'alerts:send-renewals';
    protected $description = 'Send renewal alerts to clients for expiring contracts (14 or 7 days prior)';

    public function handle()
    {
        $this->info('Scanning for expiring contracts...');

        $now = Carbon::now();
        
        $expiring14Days = Job::where('status', 'in_progress')
            ->whereNotNull('end_date')
            ->whereDate('end_date', $now->copy()->addDays(14)->toDateString())
            ->with('hirer.user')
            ->get();

        $expiring7Days = Job::where('status', 'in_progress')
            ->whereNotNull('end_date')
            ->whereDate('end_date', $now->copy()->addDays(7)->toDateString())
            ->with('hirer.user')
            ->get();

        foreach ($expiring14Days as $job) {
            if ($job->hirer && $job->hirer->user) {
                $job->hirer->user->notify(new ContractExpiringNotification($job, 14));
            }
        }

        foreach ($expiring7Days as $job) {
            if ($job->hirer && $job->hirer->user) {
                $job->hirer->user->notify(new ContractExpiringNotification($job, 7));
            }
        }

        $this->info('Renewal alerts dispatched successfully.');
        return Command::SUCCESS;
    }
}
