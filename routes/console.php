<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule document expiry check to run daily at midnight
Schedule::command('app:check-document-expiry')->dailyAt('00:00')->description('Check for expired driver documents and subscriptions');

// Schedule guarantor renewal check to run daily at 1:00 AM
Schedule::command('app:check-guarantor-renewal')->dailyAt('01:00')->description('Check for expiring guarantors and send notifications');

// Schedule trial period monitoring to run daily at 2:00 AM
Schedule::command('drivers:monitor-trials')->dailyAt('02:00')->description('Monitor and expire trial periods for drivers');

// Schedule document notification checks to run daily at 3:00 AM
Schedule::command('documents:check-notifications')->dailyAt('03:00')->description('Check and send notifications for expiring, expired, and missing documents');

// Schedule contract renewal alerts (7 and 14 days) to run daily at 4:00 AM
Schedule::command('alerts:send-renewals')->dailyAt('04:00')->description('Send renewal alerts to clients for expiring contracts');

// Schedule daily automated system maintenance and log pruning at 5:00 AM
Schedule::call(function () {
    \App\Models\User::where('verification_expires_at', '<', now()->subDays(1))
        ->update(['verification_code' => null]);

    if (class_exists(\Spatie\Activitylog\Models\Activity::class)) {
        \Spatie\Activitylog\Models\Activity::where('created_at', '<', now()->subDays(60))->delete();
    }
})->dailyAt('05:00')->description('System maintenance and log pruning');
