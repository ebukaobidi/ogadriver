<?php

namespace Database\Seeders;

use App\Models\ExecutiveCarHire;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ExecutiveCarHireSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Prestige Chauffeurs & Logistics',
                'description' => 'Premium executive car rental service in Lagos specializing in armored vehicles, luxury sedans for corporate executives, and VIP airport transfers with professional chauffeurs.',
                'state' => 'Lagos',
                'lga' => 'Ikoyi',
                'address' => '45 Glover Road, Ikoyi, Lagos',
                'registration_number' => 'RC-1234567',
                'contact_email' => 'bookings@prestigechauffeurs.ng',
                'contact_phone' => '+2348021112223',
                'logo_path' => 'car-hires/luxury_fleet_1.jpg',
                'is_active' => true,
                'is_verified' => true,
                'fleet' => [
                    'Luxury Sedans' => 'Mercedes-Benz S-Class, BMW 7 Series',
                    'Executive SUVs' => 'Range Rover Autobiography, Toyota Land Cruiser 300',
                    'Armored Vehicles' => 'B6/B7 Level Armored SUVs',
                ],
                'services' => [
                    'VIP Protection' => 'Armed escort services available on request',
                    'Airport Transfer' => 'Meet and greet at Murtala Muhammed International Airport',
                    'Corporate Hire' => 'Daily, weekly, and monthly corporate lease options',
                ],
            ],
            [
                'name' => 'Abuja Elite Rentals',
                'description' => 'The capital\'s foremost provider of luxury transportation for diplomats, government officials, and business leaders. Offering a wide range of premium vehicles and professional drivers.',
                'state' => 'FCT - Abuja',
                'lga' => 'Asokoro',
                'address' => '12 Yakubu Gowon Crescent, Asokoro, Abuja',
                'registration_number' => 'RC-7654321',
                'contact_email' => 'info@abujaeliterentals.com',
                'contact_phone' => '+2348093334445',
                'logo_path' => 'car-hires/abuja_fleet_1.jpg',
                'is_active' => true,
                'is_verified' => true,
                'fleet' => [
                    'Premium Sedans' => 'Toyota Camry (Latest Model), Honda Accord',
                    'Luxury SUVs' => 'Lexus LX 600, Toyota Prado',
                    'Mini-Vans' => 'Toyota Sienna (Executive Version), Mercedes-Benz V-Class',
                ],
                'services' => [
                    'Diplomatic Services' => 'Specialized handling for diplomatic missions',
                    'Event Logistics' => 'Coordinated transport for high-level summits and weddings',
                    'Interstate Travel' => 'Secure interstate travel with experienced drivers',
                ],
            ],
            [
                'name' => 'Oil City Executive Rides',
                'description' => 'Reliable and secure executive transportation in Port Harcourt, serving the oil and gas industry with rugged yet luxurious vehicles suitable for both city and field operations.',
                'state' => 'Rivers',
                'lga' => 'Port Harcourt',
                'address' => '156 Olu Obasanjo Road, Port Harcourt',
                'registration_number' => 'RC-9876543',
                'contact_email' => 'reservations@oilcityrides.ng',
                'contact_phone' => '+2348054445556',
                'logo_path' => 'car-hires/ph_fleet_1.jpg',
                'is_active' => true,
                'is_verified' => true,
                'fleet' => [
                    'Standard SUVs' => 'Toyota Hilux (Double Cabin), Ford Ranger',
                    'Executive SUVs' => 'Toyota Land Cruiser Prado',
                    'Executive Buses' => 'Toyota Hiace (Luxury Fit-out)',
                ],
                'services' => [
                    'Field Site Visits' => 'Off-road capable luxury vehicles',
                    'Protocol Services' => 'Airport pickup and drop-off with protocol assistance',
                    '24/7 Support' => 'Round-the-clock reservation and emergency support',
                ],
            ],
        ];

        foreach ($services as $serviceData) {
            $slug = Str::slug($serviceData['name']);
            ExecutiveCarHire::updateOrCreate(
                ['slug' => $slug],
                array_merge($serviceData, ['slug' => $slug])
            );
        }
    }
}
