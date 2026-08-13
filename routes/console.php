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
