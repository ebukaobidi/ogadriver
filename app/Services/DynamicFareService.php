<?php

namespace App\Services;

use App\Models\FuelPrice;
use App\Models\VehicleCost;
use App\Models\PricingRule;
use App\Models\Region;

class DynamicFareService
{
    /**
     * Calculate comprehensive fare considering real-world fuel prices, vehicle costs, region, and surge rules
     */
    public function calculateFare(
        float $distanceKm,
        float $durationMinutes,
        string $vehicleType = 'saloon',
        string $regionName = 'Lagos'
    ): array {
        // 1. Get Region base rates or fallback to ApiSetting / System Defaults
        $region = Region::where('name', $regionName)->where('is_active', true)->first();
        $ratePerKm = $region ? (float)$region->base_rate_per_km : (float)(\class_exists('\App\Models\ApiSetting') ? \App\Models\ApiSetting::getValue('defaultRatePerKm', 250.00) : 250.00);
        $ratePerMin = $region ? (float)$region->base_rate_per_minute : (float)(\class_exists('\App\Models\ApiSetting') ? \App\Models\ApiSetting::getValue('defaultRatePerMin', 30.00) : 30.00);
        $minFare = $region ? (float)$region->minimum_fare : (float)(\class_exists('\App\Models\ApiSetting') ? \App\Models\ApiSetting::getValue('minimumFare', 1000.00) : 1000.00);
        $currency = $region ? $region->currency_symbol : '₦';

        // 2. Get Fuel Price Adjustment from latest FuelPrice record or Admin ApiSetting
        $latestFuel = FuelPrice::where('region', $regionName)->latest('effective_at')->first();
        $adminFuelSetting = \class_exists('\App\Models\ApiSetting') ? \App\Models\ApiSetting::getValue('fuelPricePerLiter') : null;
        $fuelPricePerLiter = $latestFuel
            ? (float) $latestFuel->price_per_liter
            : ($adminFuelSetting ? (float) $adminFuelSetting : 950.00);
        
        // Standard baseline fuel price is NGN 700 (or as configured in Admin Settings)
        $adminBaselineSetting = \class_exists('\App\Models\ApiSetting') ? \App\Models\ApiSetting::getValue('baselineFuelPrice') : null;
        $baselineFuelPrice = $adminBaselineSetting ? (float) $adminBaselineSetting : 700.00;
        $fuelFactor = max(1.0, $fuelPricePerLiter / max(1.0, $baselineFuelPrice));

        // 3. Get Vehicle Operational Cost
        $vCost = VehicleCost::where('vehicle_type', $vehicleType)->first();
        $fuelConsumptionKm = $vCost ? (float) $vCost->fuel_consumption_per_km : 0.10; // Liters per km
        $maintCostKm = $vCost ? (float) $vCost->maintenance_cost_per_km : 25.00;

        // Actual fuel cost for this trip
        $tripFuelCost = $distanceKm * $fuelConsumptionKm * $fuelPricePerLiter;
        $tripMaintCost = $distanceKm * $maintCostKm;

        // Base Distance & Time Fare adjusted for Fuel
        $baseDistanceFare = ($distanceKm * $ratePerKm) * $fuelFactor;
        $baseTimeFare = $durationMinutes * $ratePerMin;
        $subtotalFare = max($minFare, $baseDistanceFare + $baseTimeFare);

        // 4. Check Surge / Dynamic Pricing Rules
        $now = now();
        $currentTime = $now->format('H:i:s');
        $currentDay = $now->dayOfWeek; // 0 = Sunday, 6 = Saturday

        $activeSurgeRule = PricingRule::where('is_active', true)
            ->where('region', $regionName)
            ->where(function ($q) use ($currentTime) {
                $q->whereNull('start_time')
                  ->orWhere(function ($sub) use ($currentTime) {
                      $sub->where('start_time', '<=', $currentTime)
                          ->where('end_time', '>=', $currentTime);
                  });
            })
            ->orderBy('multiplier', 'desc')
            ->first();

        $surgeMultiplier = $activeSurgeRule ? (float) $activeSurgeRule->multiplier : 1.00;
        $surgeAmount = ($subtotalFare * $surgeMultiplier) - $subtotalFare;

        $totalFare = $subtotalFare * $surgeMultiplier;

        return [
            'currency' => $currency,
            'distance_km' => $distanceKm,
            'duration_minutes' => $durationMinutes,
            'subtotal_fare' => round($subtotalFare, 2),
            'surge_multiplier' => $surgeMultiplier,
            'surge_amount' => round($surgeAmount, 2),
            'total_fare' => round($totalFare, 2),
            'driver_earnings' => round($totalFare, 2), // 100% of ride fare goes to driver (0% commission)
            'breakdown' => [
                'estimated_fuel_cost' => round($tripFuelCost, 2),
                'estimated_maintenance_cost' => round($tripMaintCost, 2),
                'fuel_price_per_liter' => $fuelPricePerLiter,
                'fuel_adjustment_factor' => round($fuelFactor, 2),
                'surge_rule_applied' => $activeSurgeRule ? $activeSurgeRule->name : 'Standard Fare',
            ],
        ];
    }
}
