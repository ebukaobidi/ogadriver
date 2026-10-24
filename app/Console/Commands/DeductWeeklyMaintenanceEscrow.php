<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DriverVehicle;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DeductWeeklyMaintenanceEscrow extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fleet:deduct-escrow';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deduct weekly maintenance escrow from drivers for their fleet owners';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Weekly Maintenance Escrow Deductions...');

        $vehicles = DriverVehicle::whereNotNull('fleet_owner_id')
            ->where('escrow_weekly_deduction', '>', 0)
            ->where('is_active', true)
            ->with('driver')
            ->get();

        $processed = 0;

        foreach ($vehicles as $vehicle) {
            if (!$vehicle->driver) continue;

            DB::transaction(function () use ($vehicle, &$processed) {
                $driverWallet = Wallet::where('user_id', $vehicle->driver->user_id)->first();
                
                if ($driverWallet && $driverWallet->available_balance >= $vehicle->escrow_weekly_deduction) {
                    // Deduct from Driver
                    $driverWallet->decrement('balance', $vehicle->escrow_weekly_deduction);
                    $driverWallet->decrement('available_balance', $vehicle->escrow_weekly_deduction);

                    // Add to Vehicle's Escrow Vault
                    $vehicle->increment('escrow_balance', $vehicle->escrow_weekly_deduction);

                    Log::info("Escrow Deducted: ₦{$vehicle->escrow_weekly_deduction} from Driver {$vehicle->driver->id} for Vehicle {$vehicle->license_plate}");
                    $processed++;
                } else {
                    Log::warning("Escrow Failed: Driver {$vehicle->driver->id} has insufficient funds (Needs ₦{$vehicle->escrow_weekly_deduction})");
                    // System could automatically suspend them here, or queue a debt
                }
            });
        }

        $this->info("Completed. Processed {$processed} escrow deductions.");
    }
}
