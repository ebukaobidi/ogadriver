<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SiteContent;

class ServiceContentSeeder extends Seeder
{
    public function run(): void
    {
        $contents = [
            // Driving School Landing Page
            ['section_key' => 'driving_school', 'key_name' => 'hero_title', 'value' => 'Master the Road with <span class="text-brandMint">Professional Driving Schools</span>', 'type' => 'html'],
            ['section_key' => 'driving_school', 'key_name' => 'hero_subtitle', 'value' => 'Find and enroll in FRSC-accredited driving schools across Nigeria. Certified instructors, modern fleets, and flexible schedules.', 'type' => 'text'],
            ['section_key' => 'driving_school', 'key_name' => 'banner_image', 'value' => 'defaults/driving-school-banner.jpg', 'type' => 'image'],
            
            // Executive Car Hire Landing Page
            ['section_key' => 'car_hire', 'key_name' => 'hero_title', 'value' => 'Premium <span class="text-brandMint">Executive Car Hire</span> Services', 'type' => 'html'],
            ['section_key' => 'car_hire', 'key_name' => 'hero_subtitle', 'value' => 'Luxury travel for corporate events, weddings, and special occasions. Professional chauffeurs and a diverse fleet of high-end vehicles.', 'type' => 'text'],
            ['section_key' => 'car_hire', 'key_name' => 'banner_image', 'value' => 'defaults/car-hire-banner.jpg', 'type' => 'image'],
        ];

        foreach ($contents as $content) {
            SiteContent::updateOrCreate(
                ['section_key' => $content['section_key'], 'key_name' => $content['key_name']],
                $content
            );
        }
    }
}
