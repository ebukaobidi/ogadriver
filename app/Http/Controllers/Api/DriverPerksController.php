<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Driver;
use App\Models\DriverPerk;
use App\Models\PerkRedemption;
use Illuminate\Support\Str;

class DriverPerksController extends Controller
{
    /**
     * Get active fuel & spare parts perk partners
     */
    public function getPerks()
    {
        $perks = DriverPerk::where('is_active', true)->get();
        if ($perks->isEmpty()) {
            // Seed default perk partners if empty
            $defaults = [
                ['title' => '10% Fuel Discount', 'partner_name' => 'NNPC Mega Station', 'category' => 'fuel', 'discount_percentage' => 10.00, 'description' => 'Show your OgaDriver Perk QR code at any NNPC station in Lagos & Abuja for 10% instant discount.'],
                ['title' => '8% PMS Fuel Rebate', 'partner_name' => 'TotalEnergies Stations', 'category' => 'fuel', 'discount_percentage' => 8.00, 'description' => 'Save 8% per liter on PMS/AGO fuel purchases.'],
                ['title' => '15% Mechanic & Servicing', 'partner_name' => 'AutoMedics Nigeria', 'category' => 'maintenance', 'discount_percentage' => 15.00, 'description' => '15% off engine servicing, brake pad replacements, and computer diagnostics.'],
                ['title' => '12% New Tire Discount', 'partner_name' => 'Dunlop Express Outlets', 'category' => 'tire', 'discount_percentage' => 12.00, 'description' => 'Discounted high-durability tires for operative drivers.'],
            ];
            foreach ($defaults as $d) {
                DriverPerk::create($d);
            }
            $perks = DriverPerk::where('is_active', true)->get();
        }

        return response()->json([
            'success' => true,
            'data' => $perks,
        ]);
    }

    /**
     * Generate dynamic QR token for fuel station scanning
     */
    public function generateQr(Request $request)
    {
        $request->validate([
            'perk_id' => 'required|exists:driver_perks,id',
        ]);

        $user = auth()->user();
        $driver = Driver::where('user_id', $user->id)->first();
        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver record missing'], 404);
        }

        $qrToken = 'PERK-QR-' . strtoupper(Str::random(12));

        $redemption = PerkRedemption::create([
            'perk_id' => $request->perk_id,
            'driver_id' => $driver->id,
            'qr_token' => $qrToken,
            'status' => 'generated',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'qr_token' => $qrToken,
                'redemption_id' => $redemption->id,
                'expires_at' => now()->addHours(24)->toDateTimeString(),
            ],
        ]);
    }
}
