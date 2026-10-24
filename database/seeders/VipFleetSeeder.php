<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Driver;
use App\Models\DriverVehicle;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class VipFleetSeeder extends Seeder
{
    public function run(): void
    {
        $corporate = User::firstOrCreate(
            ['email' => 'lorenzoemilio@protonmail.com'],
            [
                'name' => 'Verified Executive Corporate Fleet',
                'password' => Hash::make('password'),
                'phone' => 'VIP-CORP-' . rand(1000, 9999),
                'role' => 'driver',
                'is_active' => true,
                'is_vip_subscriber' => true,
            ]
        );

        $vehicles = [
            [
                'make' => 'Toyota',
                'model' => 'Land Cruiser 300 (B6+ Armored)',
                'category' => 'VVIP Armored Escort',
                'plate_number' => 'OGD-VIP-001',
                'daily_rate' => 250000,
                'hourly_rate' => 35000,
                'features' => json_encode([
                    'B6+ Ballistic Armored Protection (7.62mm Rifle Resistance)',
                    'Trained Ex-Special Forces Armed Chauffeur',
                    'Run-Flat Tactical Tires & Tinted Bulletproof Glass',
                    '24/7 Satellite Tracking & SOS Emergency Beacon',
                ]),
                'image' => 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
            ],
            [
                'make' => 'Mercedes-Benz',
                'model' => 'Maybach S680',
                'category' => 'Presidential Executive',
                'plate_number' => 'OGD-VIP-002',
                'daily_rate' => 350000,
                'hourly_rate' => 45000,
                'features' => json_encode([
                    'First-Class Reclining Rear Executive Seats with Massage',
                    'Executive Uniformed Multilingual Chauffeur',
                    'High-Speed Satellite Wi-Fi & Burmester 4D Audio',
                    'Complimentary Chilled Beverages & Champagne Cooler',
                ]),
                'image' => 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
            ],
            [
                'make' => 'Land Rover',
                'model' => 'Range Rover Autobiography LWB',
                'category' => 'Executive SUV',
                'plate_number' => 'OGD-VIP-003',
                'daily_rate' => 200000,
                'hourly_rate' => 28000,
                'features' => json_encode([
                    'Panoramic Executive Glass Roof',
                    'All-Terrain Active Security Escort Control',
                    'Tier 1 Gold Vetted Military Veteran Driver',
                    'Acoustic Noise Cancellation & Privacy Glass',
                ]),
                'image' => 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800',
            ],
            [
                'make' => 'Convoy',
                'model' => 'VIP Motorcade (Lead + Chase)',
                'category' => 'VIP Convoy Detail',
                'plate_number' => 'OGD-VIP-CONVOY',
                'daily_rate' => 500000,
                'hourly_rate' => 75000,
                'features' => json_encode([
                    '2 Executive Armored SUVs (Lead & Tactical Chase)',
                    '4 Trained Tactical Outrider & Escort Drivers',
                    'Police Outrider Siren & Clearance Support',
                    'Live Operations Room Telemetry Control',
                ]),
                'image' => 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&q=80&w=800',
            ]
        ];

        foreach ($vehicles as $idx => $veh) {
            $user = User::firstOrCreate(
                ['email' => "vipdriver{$idx}@ogadriver.ng"],
                [
                    'name' => 'Elite Operative ' . ($idx + 1),
                    'password' => Hash::make('password'),
                    'phone' => 'VIP-' . rand(10000, 99999),
                    'role' => 'driver',
                    'is_active' => true,
                    'is_vip_subscriber' => true,
                ]
            );

            $driver = Driver::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'license_number' => 'LIC-VIP-' . rand(100, 999),
                    'vehicle_type' => 'executive',
                    'is_verified' => true,
                    'rating' => 4.9,
                    'total_jobs' => 120,
                ]
            );

            DriverVehicle::updateOrCreate(
                ['driver_id' => $driver->id],
                [
                    'vehicle_type' => $veh['category'],
                    'make' => $veh['make'],
                    'model' => $veh['model'],
                    'plate_number' => $veh['plate_number'],
                    'expected_daily_rate' => $veh['daily_rate'],
                    'expected_monthly_rate' => $veh['daily_rate'] * 20,
                    'is_active' => true,
                    'front_photo' => $veh['image'], // we use this to store the image URL temporarily
                    'rejection_reason' => $veh['features'], // Hack to store JSON features since there is no 'features' column
                ]
            );
        }
    }
}
