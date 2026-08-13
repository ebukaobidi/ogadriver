<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            // Employer Plans
            [
                'target_role' => 'employer',
                'name' => 'Standard Gate',
                'price' => '₦5,000',
                'period' => 'Pay-Per-Match',
                'limits' => '5 Standard Operatives Only',
                'status' => 'active',
                'isPopular' => false,
                'features' => [
                    'Access to Standard Operative Directory',
                    'Basic Identity Verification checks',
                    'Standard Matchmaking timeframe (48hrs)',
                    'Pay a flat fee per successful match'
                ]
            ],
            [
                'target_role' => 'employer',
                'name' => 'Elite Perimeter',
                'price' => '₦25,000',
                'period' => 'Monthly',
                'limits' => 'Access to Elite Operatives',
                'status' => 'active',
                'isPopular' => true,
                'features' => [
                    'Priority matching with Elite Operatives (Ex-Military/Trained)',
                    'Full Digital Guarantor Dossier Access',
                    'Live GPS Telemetry tracking during transit',
                    '24/7 Priority Security Support',
                    'Instant Matchmaking (Under 2 hours)'
                ]
            ],
            [
                'target_role' => 'employer',
                'name' => 'Sovereign Fleet',
                'price' => '₦250,000',
                'period' => 'Yearly',
                'limits' => 'Corporate Fleet Operations',
                'status' => 'active',
                'isPopular' => false,
                'features' => [
                    'Fleet-level SOS & Grid Monitoring',
                    'Custom Integration API for Corporate Systems',
                    'Dedicated Kidnap Prevention Liaison',
                    'Bulk Recruitment of Elite Operatives',
                    'Direct SLA Guarantees & Insurance Underwriting'
                ]
            ],

            // Operative Plans
            [
                'target_role' => 'operative',
                'name' => 'Trial Operative',
                'price' => '₦0',
                'period' => '15 Days',
                'limits' => '15 Days Trial Period',
                'status' => 'active',
                'isPopular' => false,
                'features' => [
                    'Profile listed in Standard Directory',
                    'Access to basic job requests',
                    'Standard background vetting',
                    'Standard payout timeframe (5-7 days)'
                ]
            ],
            [
                'target_role' => 'operative',
                'name' => 'Standard Operative',
                'price' => '₦5,000',
                'period' => 'Monthly',
                'limits' => 'Unlimited Standard Jobs',
                'status' => 'active',
                'isPopular' => false,
                'features' => [
                    'Highlighted Profile in Employer Searches',
                    'Priority Algorithm Matching',
                    'Access to Standard & Premium Job Requests',
                    'Faster payout timeframe (24-48 hours)',
                    'Dedicated support channel'
                ]
            ],
            [
                'target_role' => 'operative',
                'name' => 'Elite Operative',
                'price' => '₦15,000',
                'period' => 'Monthly',
                'limits' => 'Unlimited Premium Jobs',
                'status' => 'active',
                'isPopular' => true,
                'features' => [
                    'Top Tier Placement in Employer Searches',
                    'Instant Algorithm Matching',
                    'Access to Elite & Fleet Job Requests',
                    'Same-day payout timeframe',
                    '24/7 VIP Dedicated support channel'
                ]
            ],
            [
                'target_role' => 'operative',
                'name' => 'Fleet Operative',
                'price' => 'Managed',
                'period' => 'Contract',
                'limits' => 'Corporate Assignments',
                'status' => 'active',
                'isPopular' => false,
                'features' => [
                    'Assigned directly to Sovereign Fleet employers',
                    'Guaranteed minimum contract terms',
                    'Corporate Insurance coverage included',
                    'Continuous advanced training access'
                ]
            ],
        ];

        // Disable foreign key constraints temporarily
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        
        SubscriptionPlan::truncate();

        foreach ($plans as $plan) {
            SubscriptionPlan::create($plan);
        }
        
        // Re-enable foreign key constraints
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
    }
}
