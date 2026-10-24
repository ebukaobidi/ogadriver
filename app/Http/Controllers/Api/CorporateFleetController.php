<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CorporateFleetController extends Controller
{
    /**
     * Get Corporate VIP Fleet Accounts and Vehicles
     */
    public function getVipFleet(Request $request)
    {
        // Query Corporate Account (or default mock account if not found)
        $corporateAccount = User::where('email', 'lorenzoemilio@protonmail.com')->first();

        $accountInfo = [
            'corporate_id' => $corporateAccount ? 'CORP-' . $corporateAccount->id : 'CORP-VIP-FLEET',
            'company_name' => $corporateAccount->name ?? 'Verified Executive Corporate Fleet',
            'verification_badge' => 'CORPORATE_PLATINUM_TIER_1',
            'rating' => 4.98,
            'total_trips' => 1420,
            'headquarters' => 'Lagos, Nigeria',
        ];

        // Fetch dynamic VIP vehicles
        $dbVehicles = \App\Models\DriverVehicle::with('driver.user')
            ->where('is_active', true)
            ->whereHas('driver', function($q) {
                $q->where('vehicle_type', 'executive');
            })
            ->get();

        $vehicles = [];
        foreach ($dbVehicles as $veh) {
            $features = [];
            if ($veh->rejection_reason && is_string($veh->rejection_reason) && str_starts_with($veh->rejection_reason, '[')) {
                $features = json_decode($veh->rejection_reason, true) ?? [];
            } else {
                $features = ['Premium Executive Service', 'Professional Chauffeur', 'High Security'];
            }

            $vehicles[] = [
                'id' => $veh->id,
                'name' => $veh->make . ' ' . $veh->model,
                'category' => $veh->vehicle_type ?? 'Executive SUV',
                'corporate_owner' => $veh->driver->user->name ?? 'Verified Corporate Fleet',
                'plate_number' => $veh->plate_number,
                'daily_rate' => $veh->expected_daily_rate,
                'hourly_rate' => $veh->expected_daily_rate ? round($veh->expected_daily_rate / 8) : 35000,
                'badge' => strtoupper($veh->vehicle_type ?? 'VIP'),
                'status' => 'available',
                'features' => $features,
                'image' => $veh->front_photo ?? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
            ];
        }

        // Fallback if DB empty (e.g. seeder not run)
        if (empty($vehicles)) {
            $vehicles = [
                [
                    'id' => 'armored_suv_b6',
                    'name' => 'Armored B6+ Toyota Land Cruiser 300',
                    'category' => 'VVIP Armored Escort',
                    'corporate_owner' => 'Verified Corporate Fleet',
                    'plate_number' => 'OGD-VIP-001',
                    'daily_rate' => 250000,
                    'hourly_rate' => 35000,
                    'badge' => 'MAX SECURITY B6+',
                    'status' => 'available',
                    'features' => [
                        'B6+ Ballistic Armored Protection (7.62mm Rifle Resistance)',
                        'Trained Ex-Special Forces Armed Chauffeur',
                        'Run-Flat Tactical Tires & Tinted Bulletproof Glass',
                        '24/7 Satellite Tracking & SOS Emergency Beacon',
                    ],
                    'image' => 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
                ]
            ];
        }

        return response()->json([
            'status' => 'success',
            'account' => $accountInfo,
            'vehicles' => $vehicles,
        ]);
    }

    /**
     * Check if user has active VIP Fleet Subscription (₦50,000/mo)
     */
    public function checkVipStatus(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['subscribed' => false, 'plan' => null]);
        }

        // Check if VIP Fleet toggle is globally disabled by admin
        $adminVipRestrictionEnabled = null;
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('system_settings')) {
                $adminVipRestrictionEnabled = DB::table('system_settings')
                    ->where('key', 'vip_fleet_subscription_required')
                    ->value('value');
            } elseif (\Illuminate\Support\Facades\Schema::hasTable('api_settings')) {
                $adminVipRestrictionEnabled = \App\Models\ApiSetting::getValue('vip_fleet_subscription_required');
            }
        } catch (\Throwable $e) {
            $adminVipRestrictionEnabled = null;
        }

        // If setting is 'false' or 0, anyone can view
        if ($adminVipRestrictionEnabled === 'false' || $adminVipRestrictionEnabled === '0') {
            return response()->json([
                'subscribed' => true,
                'bypass_by_admin' => true,
                'message' => 'VIP Fleet is currently open by Admin toggle.',
            ]);
        }

        $activeSub = $user->activeSubscription;

        $hasVipPlan = false;
        if ($activeSub && str_contains(strtolower($activeSub->plan_name ?? $activeSub->name ?? ''), 'vip')) {
            $hasVipPlan = true;
        }

        // Also check if user has direct vip attribute or super_admin status
        if ($user->role === 'super_admin' || $user->role === 'admin' || $user->is_vip_subscriber) {
            $hasVipPlan = true;
        }

        return response()->json([
            'subscribed' => $hasVipPlan,
            'plan_name' => $hasVipPlan ? ($activeSub->plan_name ?? 'VIP Fleet Plan') : null,
            'monthly_fee' => 50000,
        ]);
    }

    /**
     * Subscribe to VIP Fleet Plan (₦50,000 / month)
     */
    public function subscribeVipFleet(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $amount = 50000;

        // Check user wallet balance
        $wallet = $user->wallet;
        $availableBalance = $wallet ? (float) $wallet->available_balance : 0;

        if ($availableBalance < $amount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Insufficient wallet balance for VIP Fleet Subscription (₦50,000 required). Please top up your wallet.',
                'required_amount' => $amount,
                'available_balance' => $availableBalance,
            ], 422);
        }

        // Debit wallet
        $wallet->available_balance -= $amount;
        $wallet->balance -= $amount;
        $wallet->save();

        // Mark user as VIP subscriber
        $user->is_vip_subscriber = true;
        $user->save();

        // Log transaction
        DB::table('wallet_transactions')->insert([
            'wallet_id' => $wallet->id,
            'user_id' => $user->id,
            'type' => 'debit',
            'amount' => $amount,
            'description' => 'VIP Fleet Access Plan Subscription (1 Month)',
            'status' => 'completed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'VIP Fleet Plan activated successfully! You now have full access to Executive Armored Fleets.',
            'subscribed' => true,
        ]);
    }

    /**
     * Register a new VIP Fleet Operative / Armored Vehicle Partner
     */
    public function registerVipFleet(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => 'required|string|min:6',
            'company_name' => 'nullable|string|max:255',
            'vehicle_category' => 'nullable|string|max:255',
            'armor_level' => 'nullable|string|max:100',
            'vehicle_make' => 'nullable|string|max:255',
            'license_plate' => 'nullable|string|max:50',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => bcrypt($validated['password']),
            'role' => 'driver',
            'is_active' => true,
            'is_vip_subscriber' => true,
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
            'profile_completed' => true,
            'terms_accepted' => true,
        ]);

        // Create driver record
        if (\Illuminate\Support\Facades\Schema::hasTable('drivers')) {
            DB::table('drivers')->insert([
                'user_id' => $user->id,
                'license_class' => 'E',
                'vehicle_type' => 'executive',
                'vehicle_make' => $validated['vehicle_make'] ?? ($validated['vehicle_category'] ?? 'Executive VIP'),
                'license_number' => $validated['license_plate'] ?? ('VIP-' . rand(1000, 9999)),
                'is_verified' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $token = $user->createToken('vip_fleet_auth')->plainTextToken;

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'VIP Fleet Partner account registered successfully!',
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Book a VIP Fleet Vehicle with Concierge Add-ons
     */
    public function bookVipFleet(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->hirer) {
            return response()->json(['message' => 'Unauthenticated or missing hirer profile.'], 401);
        }

        $validated = $request->validate([
            'vehicle_id' => 'required|integer|exists:driver_vehicles,id',
            'pickup_location' => 'required|string',
            'dropoff_location' => 'required|string',
            'pickup_latitude' => 'required|numeric',
            'pickup_longitude' => 'required|numeric',
            'dropoff_latitude' => 'required|numeric',
            'dropoff_longitude' => 'required|numeric',
            'pickup_time' => 'required|date',
            'requires_cpo' => 'boolean',
            'requires_police_escort' => 'boolean',
            'stealth_mode' => 'boolean',
        ]);

        $vehicle = \App\Models\DriverVehicle::findOrFail($validated['vehicle_id']);
        
        // Calculate amount (daily rate + addons)
        $amount = $vehicle->expected_daily_rate ?: 250000;
        if ($validated['requires_cpo'] ?? false) {
            $amount += 150000; // 150k for armed CPO
        }
        if ($validated['requires_police_escort'] ?? false) {
            $amount += 250000; // 250k for outrider
        }

        $job = \App\Models\TransportJob::create([
            'hirer_id' => $user->hirer->id,
            'driver_id' => $vehicle->driver_id, // Directly assigning to the requested VIP driver
            'title' => 'VIP Fleet Booking: ' . ($vehicle->make . ' ' . $vehicle->model),
            'description' => 'VIP Concierge Service',
            'vehicle_type' => 'executive',
            'pickup_location' => $validated['pickup_location'],
            'pickup_latitude' => $validated['pickup_latitude'],
            'pickup_longitude' => $validated['pickup_longitude'],
            'dropoff_location' => $validated['dropoff_location'],
            'dropoff_latitude' => $validated['dropoff_latitude'],
            'dropoff_longitude' => $validated['dropoff_longitude'],
            'pickup_time' => $validated['pickup_time'],
            'amount' => $amount,
            'payment_method' => 'wallet',
            'currency' => 'NGN',
            'status' => 'assigned', // Auto-assign to the requested driver
            'requires_cpo' => $validated['requires_cpo'] ?? false,
            'requires_police_escort' => $validated['requires_police_escort'] ?? false,
            'stealth_mode' => $validated['stealth_mode'] ?? false,
            'is_vip_convoy' => ($validated['requires_police_escort'] ?? false) || str_contains(strtolower($vehicle->vehicle_type ?? ''), 'convoy'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'VIP Fleet Concierge booked successfully. Your elite operative has been notified.',
            'job' => $job,
        ]);
    }
}
