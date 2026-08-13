<?php

namespace Database\Seeders;

use App\Models\DrivingSchool;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DrivingSchoolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schools = [
            [
                'name' => 'Elite Driving Academy',
                'description' => 'Premier accredited driving school offering comprehensive driver training programs, modern dual-control training vehicles, state-of-the-art simulator sessions, and FRSC driving license certification.',
                'state' => 'Lagos',
                'lga' => 'Ikeja',
                'address' => '123 Mobolaji Bank Anthony Way, Ikeja, Lagos',
                'accreditation_number' => 'FRSC/DS/LG/2024/001',
                'accreditation_body' => 'FRSC',
                'contact_email' => 'info@elitedriving.ng',
                'contact_phone' => '+2348031234567',
                'logo_path' => 'driving-schools/nigerian_learner_car_1785885234782.jpg',
                'is_active' => true,
                'is_verified' => true,
                'facilities' => [
                    'Driving Simulators' => 'High-definition 3D Simulators with Nigerian Traffic Scenarios',
                    'Dual-Control Fleet' => 'Automatic & Manual Sedans & SUVs with Red L Learner Plates',
                    'Classrooms' => 'Air-conditioned multimedia lecture rooms with FRSC signboards',
                    'Track Facilities' => 'Private off-road practice circuit & maneuvering bay',
                    'Certification' => 'Official FRSC Driving School Portal Direct Verification',
                    'Night Driving Modules' => 'Yes (Real Road Practice)',
                    'Defensive Driving Course' => 'Certified Specialist Trainers',
                ],
            ],
            [
                'name' => 'Capital City Drivers Institute',
                'description' => 'Abuja\'s leading professional driving institute specializing in executive chauffeur training, defensive driving techniques, VIP protection driving, and standard driver licensing.',
                'state' => 'FCT - Abuja',
                'lga' => 'Maitama',
                'address' => '45 Constitution Avenue, Maitama, Abuja',
                'accreditation_number' => 'FRSC/DS/FCT/2024/014',
                'accreditation_body' => 'FRSC',
                'contact_email' => 'admin@capitaldrivers.ng',
                'contact_phone' => '+2348098765432',
                'logo_path' => 'driving-schools/nigerian_driving_fleet_1785885324776.jpg',
                'is_active' => true,
                'is_verified' => true,
                'facilities' => [
                    'VIP Chauffeur Training' => 'Executive Armored & Luxury Vehicle Modules',
                    'Classrooms' => 'Smart Board Interactive Classrooms',
                    'Dual-Control Fleet' => 'Latest Model Dual-Control Sedans with Learner Signage',
                    'First Aid & Safety' => 'Red Cross Certified First Aid Training',
                    'Certification' => 'FRSC & VIO Approved Direct Registration',
                ],
            ],
            [
                'name' => 'Lekki Peninsula Driving School',
                'description' => 'Ultra-modern driver training centre located in Lekki Phase 1, featuring female driving instructors, flexible weekend classes, emergency braking instruction, and home pickup options.',
                'state' => 'Lagos',
                'lga' => 'Eti-Osa',
                'address' => '18 Admiralty Way, Lekki Phase 1, Lagos',
                'accreditation_number' => 'FRSC/DS/LG/2024/089',
                'accreditation_body' => 'FRSC',
                'contact_email' => 'hello@lekkidrivingschool.ng',
                'contact_phone' => '+2348123456789',
                'logo_path' => 'driving-schools/nigerian_driving_simulator_1785885304028.jpg',
                'is_active' => true,
                'is_verified' => true,
                'facilities' => [
                    'Female Instructors' => 'Available on request for personalized coaching',
                    'Doorstep Pickup' => 'Available across Lekki, Victoria Island, & Ikoyi',
                    'Simulators' => 'Virtual Traffic Hazard Simulators & Practice Stations',
                    'Flexible Hours' => 'Weekend & Evening Batches Available',
                ],
            ],
            [
                'name' => 'Port Harcourt Professional Drivers School',
                'description' => 'Rivers State accredited training center offering industrial heavy-duty vehicle driving, haulage truck safety certifications, and commercial passenger vehicle training.',
                'state' => 'Rivers',
                'lga' => 'Port Harcourt',
                'address' => '88 Aba Road, Port Harcourt, Rivers State',
                'accreditation_number' => 'FRSC/DS/RV/2024/022',
                'accreditation_body' => 'FRSC',
                'contact_email' => 'training@phdrivers.com.ng',
                'contact_phone' => '+2348055551212',
                'logo_path' => 'driving-schools/nigerian_learner_car_1785885234782.jpg',
                'is_active' => true,
                'is_verified' => true,
                'facilities' => [
                    'Heavy Duty Vehicle Operations' => 'Truck & Bus Maneuvering Bay with Dual Brakes',
                    'Industrial Logistics' => 'Corporate Fleet Safety Audits & Certification',
                    'Mechanics Basics' => 'Vehicle Maintenance & Maintenance Workshop',
                ],
            ],
            [
                'name' => 'Pacesetter Driving Academy',
                'description' => 'Ibadan\'s top-rated driving school providing affordable beginner, refresher, and defensive driving packages with guaranteed FRSC license processing support.',
                'state' => 'Oyo',
                'lga' => 'Ibadan North',
                'address' => '12 Ring Road, Challenge, Ibadan, Oyo State',
                'accreditation_number' => 'FRSC/DS/OY/2024/007',
                'accreditation_body' => 'FRSC',
                'contact_email' => 'support@pacesetterdriving.ng',
                'contact_phone' => '+2348077778899',
                'logo_path' => 'driving-schools/nigerian_driving_fleet_1785885324776.jpg',
                'is_active' => true,
                'is_verified' => false,
                'facilities' => [
                    'Dual-Control Fleet' => 'Compact Sedans & Hatchbacks with Learner Badges',
                    'Theory Hall' => 'Traffic Laws & Road Signs Interactive Sessions',
                    'Flexible Payment' => 'Installment Payment Plans Supported',
                ],
            ],
            [
                'name' => 'Arewa Drivers Training Centre',
                'description' => 'Premier northern driver institute focused on safe urban navigation, interstate highway safety rules, vehicle maintenance basics, and commercial driver certification.',
                'state' => 'Kano',
                'lga' => 'Kano Municipal',
                'address' => '5 Bayero University Road, Kano State',
                'accreditation_number' => 'FRSC/DS/KN/2024/005',
                'accreditation_body' => 'FRSC',
                'contact_email' => 'info@arewadriving.ng',
                'contact_phone' => '+2348023456789',
                'logo_path' => 'driving-schools/nigerian_driving_simulator_1785885304028.jpg',
                'is_active' => true,
                'is_verified' => true,
                'facilities' => [
                    'Multilingual Instruction' => 'Hausa & English Courses with Audio-Visual Aids',
                    'Highway Driving' => 'Long Distance Simulation & Practical Road Sessions',
                    'License Assistance' => 'FRSC Direct Portal Integration',
                ],
            ],
        ];

        foreach ($schools as $schoolData) {
            $slug = Str::slug($schoolData['name']);
            DrivingSchool::updateOrCreate(
                ['slug' => $slug],
                array_merge($schoolData, ['slug' => $slug])
            );
        }
    }
}

