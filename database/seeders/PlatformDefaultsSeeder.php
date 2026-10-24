<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Region;
use App\Models\FuelPrice;
use App\Models\VehicleCost;
use App\Models\AddOnFee;
use App\Models\PricingRule;

class PlatformDefaultsSeeder extends Seeder
{
    /**
     * Seed essential platform defaults for multi-region, fuel index, vehicle costs, and add-on revenue modules.
     */
    public function run(): void
    {
        // 1. Seed Default Regions
        $regions = [
            ['name' => 'Lagos', 'country_code' => 'NG', 'currency_code' => 'NGN', 'currency_symbol' => '₦', 'base_rate_per_km' => 250.00, 'base_rate_per_minute' => 30.00, 'minimum_fare' => 1000.00],
            ['name' => 'Abuja', 'country_code' => 'NG', 'currency_code' => 'NGN', 'currency_symbol' => '₦', 'base_rate_per_km' => 280.00, 'base_rate_per_minute' => 35.00, 'minimum_fare' => 1200.00],
            ['name' => 'Port Harcourt', 'country_code' => 'NG', 'currency_code' => 'NGN', 'currency_symbol' => '₦', 'base_rate_per_km' => 260.00, 'base_rate_per_minute' => 30.00, 'minimum_fare' => 1000.00],
            ['name' => 'Accra', 'country_code' => 'GH', 'currency_code' => 'GHS', 'currency_symbol' => 'GH₵', 'base_rate_per_km' => 8.50, 'base_rate_per_minute' => 1.20, 'minimum_fare' => 30.00],
            ['name' => 'Nairobi', 'country_code' => 'KE', 'currency_code' => 'KES', 'currency_symbol' => 'KSh', 'base_rate_per_km' => 60.00, 'base_rate_per_minute' => 8.00, 'minimum_fare' => 250.00],
        ];

        foreach ($regions as $r) {
            Region::updateOrCreate(['name' => $r['name']], $r);
        }

        // 2. Seed Fuel Prices
        $fuelPrices = [
            ['region' => 'Lagos', 'fuel_type' => 'PMS', 'price_per_liter' => 950.00, 'source' => 'manual'],
            ['region' => 'Abuja', 'fuel_type' => 'PMS', 'price_per_liter' => 980.00, 'source' => 'manual'],
            ['region' => 'Lagos', 'fuel_type' => 'AGO', 'price_per_liter' => 1200.00, 'source' => 'manual'],
        ];

        foreach ($fuelPrices as $fp) {
            FuelPrice::updateOrCreate(
                ['region' => $fp['region'], 'fuel_type' => $fp['fuel_type']],
                $fp
            );
        }

        // 3. Seed Vehicle Costs
        $vehicleCosts = [
            ['vehicle_type' => 'saloon', 'fuel_consumption_per_km' => 0.090, 'maintenance_cost_per_km' => 20.00, 'depreciation_cost_per_km' => 15.00],
            ['vehicle_type' => 'suv', 'fuel_consumption_per_km' => 0.130, 'maintenance_cost_per_km' => 35.00, 'depreciation_cost_per_km' => 25.00],
            ['vehicle_type' => 'van', 'fuel_consumption_per_km' => 0.140, 'maintenance_cost_per_km' => 40.00, 'depreciation_cost_per_km' => 30.00],
            ['vehicle_type' => 'truck', 'fuel_consumption_per_km' => 0.220, 'maintenance_cost_per_km' => 65.00, 'depreciation_cost_per_km' => 50.00],
            ['vehicle_type' => 'motorcycle', 'fuel_consumption_per_km' => 0.035, 'maintenance_cost_per_km' => 8.00, 'depreciation_cost_per_km' => 5.00],
        ];

        foreach ($vehicleCosts as $vc) {
            VehicleCost::updateOrCreate(['vehicle_type' => $vc['vehicle_type']], $vc);
        }

        // 4. Seed Add-On Fees
        $addOns = [
            ['slug' => 'vip-shield', 'name' => 'VIP Ride Shield', 'description' => 'Dedicated live trip monitoring by OgaDriver Safety Ops', 'amount' => 500.00, 'type' => 'fixed', 'is_active' => true],
            ['slug' => 'priority-matching', 'name' => 'Priority Driver Match', 'description' => 'Dispatches your trip request to top-rated 5-star drivers first', 'amount' => 300.00, 'type' => 'fixed', 'is_active' => true],
            ['slug' => 'goods-insurance', 'name' => 'Cargo & Goods Insurance', 'description' => 'Comprehensive transit insurance cover up to ₦1,000,000', 'amount' => 1000.00, 'type' => 'fixed', 'is_active' => true],
            ['slug' => 'instant-payout', 'name' => 'Instant Driver Payout', 'description' => 'Settle driver earnings immediately to bank upon trip end', 'amount' => 150.00, 'type' => 'fixed', 'is_active' => true],
        ];

        foreach ($addOns as $ao) {
            AddOnFee::updateOrCreate(['slug' => $ao['slug']], $ao);
        }

        // 5. Seed Default Pricing / Surge Rules
        $pricingRules = [
            ['name' => 'Morning Rush Hour Surge', 'region' => 'Lagos', 'multiplier' => 1.25, 'start_time' => '07:00:00', 'end_time' => '09:30:00', 'is_active' => true],
            ['name' => 'Evening Rush Hour Surge', 'region' => 'Lagos', 'multiplier' => 1.30, 'start_time' => '17:00:00', 'end_time' => '20:30:00', 'is_active' => true],
        ];

        foreach ($pricingRules as $pr) {
            PricingRule::updateOrCreate(['name' => $pr['name'], 'region' => $pr['region']], $pr);
        }
    }
}
