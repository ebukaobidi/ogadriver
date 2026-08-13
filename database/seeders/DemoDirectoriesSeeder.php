<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DrivingSchool;
use App\Models\ExecutiveCarHire;
use Illuminate\Support\Str;

class DemoDirectoriesSeeder extends Seeder
{
    public function run()
    {
        // Demo Driving Schools
        DrivingSchool::create([
            'name' => 'Elite Apex Driving Academy',
            'slug' => Str::slug('Elite Apex Driving Academy') . '-' . uniqid(),
            'description' => "Nigeria's premier driving school offering defensive driving, convoy driving, and executive chauffeur training. We provide state-of-the-art simulators and a fleet of dual-control vehicles.",
            'state' => 'Lagos',
            'lga' => 'Ikeja',
            'address' => '42 Opebi Road, Ikeja, Lagos',
            'accreditation_number' => 'FRSC/LAG/2026/001',
            'accreditation_body' => 'FRSC',
            'contact_email' => 'admissions@eliteapex.com',
            'contact_phone' => '+2348000000001',
            'is_active' => true,
            'is_verified' => true,
            'facilities' => [
                'Driving Simulators' => true,
                'Theory Classes' => 'Air-conditioned digital classrooms',
                'Practice Track' => 'Private 2km practice track',
                'Dual Control Cars' => true
            ],
            'images' => [
                'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop', // car driving
                'https://images.unsplash.com/photo-1590401824403-f36573c099b2?q=80&w=800&auto=format&fit=crop', // classroom
                'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800&auto=format&fit=crop', // car interior steering
                'https://images.unsplash.com/photo-1600320254374-ce2d293c324e?q=80&w=800&auto=format&fit=crop'  // traffic cones
            ],
            'videos' => [
                'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'https://www.youtube.com/watch?v=jNQXAC9IVRw'
            ]
        ]);

        DrivingSchool::create([
            'name' => 'SafeWheels Training Institute',
            'slug' => Str::slug('SafeWheels Training Institute') . '-' . uniqid(),
            'description' => "Affordable and highly rated driving school focusing on new drivers and confidence building. Get your license seamlessly.",
            'state' => 'Abuja',
            'lga' => 'Garki',
            'address' => '15 Garki Area 11, FCT',
            'accreditation_number' => 'FRSC/FCT/2026/088',
            'accreditation_body' => 'FRSC',
            'contact_email' => 'hello@safewheels.com.ng',
            'contact_phone' => '+2348000000002',
            'is_active' => true,
            'is_verified' => true,
            'facilities' => [
                'Flexible Timing' => true,
                'Female Instructors' => true,
                'Pick-up Service' => 'Available in Garki & Wuse'
            ],
            'images' => [
                'https://images.unsplash.com/photo-1621245084934-2e90e75a6c0b?q=80&w=800&auto=format&fit=crop', // car key
                'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=800&auto=format&fit=crop', // road trip
            ],
            'videos' => [
                'https://www.youtube.com/watch?v=3JZ_D3ELwOQ'
            ]
        ]);

        // Demo Car Hires
        ExecutiveCarHire::create([
            'name' => 'Prestige Executive Motors',
            'slug' => Str::slug('Prestige Executive Motors') . '-' . uniqid(),
            'description' => "Top-tier executive car hire services for VIPs, corporate delegates, and special events. We offer armored vehicles and professionally trained chauffeurs.",
            'state' => 'Lagos',
            'lga' => 'Victoria Island',
            'address' => '100 Adeola Odeku, VI, Lagos',
            'registration_number' => 'RC-998877',
            'contact_email' => 'bookings@prestigemotors.com',
            'contact_phone' => '+2348000000003',
            'is_active' => true,
            'is_verified' => true,
            'fleet' => [
                'Luxury Sedans' => 'Mercedes S-Class, BMW 7 Series',
                'SUVs' => 'Range Rover Autobiography, Toyota Land Cruiser',
                'Armored' => 'Lexus LX 570 B6 Armored'
            ],
            'services' => [
                'Airport Transfers' => 'MMIA Priority Pickup',
                'Escort Services' => 'Armed Mobile Police escort available'
            ],
            'images' => [
                'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop', // luxury car
                'https://images.unsplash.com/photo-1503376713915-d9006e897914?q=80&w=800&auto=format&fit=crop', // car front
                'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=800&auto=format&fit=crop', // black suv
                'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=800&auto=format&fit=crop' // interior
            ],
            'videos' => [
                'https://www.youtube.com/watch?v=7MdbS_kU-E0',
                'https://www.youtube.com/watch?v=LqN684j0yYg'
            ]
        ]);

        ExecutiveCarHire::create([
            'name' => 'Royal Rides Abuja',
            'slug' => Str::slug('Royal Rides Abuja') . '-' . uniqid(),
            'description' => "Reliable and elegant car hire for weddings, conferences, and daily executive commute in the FCT.",
            'state' => 'Abuja',
            'lga' => 'Maitama',
            'address' => '12 Gana Street, Maitama, FCT',
            'registration_number' => 'RC-112233',
            'contact_email' => 'info@royalrides.com.ng',
            'contact_phone' => '+2348000000004',
            'is_active' => true,
            'is_verified' => true,
            'fleet' => [
                'Standard Exec' => 'Toyota Camry, Honda Accord',
                'Bridal/Wedding' => 'Rolls Royce Phantom, Limousine'
            ],
            'services' => [
                'Wedding Convoy' => 'Full convoy setup with decorators',
                'Inter-state' => 'Abuja - Kaduna - Kano executive rides'
            ],
            'images' => [
                'https://images.unsplash.com/photo-1567156943807-f6ee0572eab6?q=80&w=800&auto=format&fit=crop', // white wedding car
                'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop', // blue luxury
            ],
            'videos' => [
                'https://www.youtube.com/watch?v=Z216f2t6xO4'
            ]
        ]);
    }
}
