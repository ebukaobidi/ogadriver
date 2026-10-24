import re

path = 'database/seeders/SubscriptionPlanSeeder.php'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace Operative Plans
operative_plans_start = text.find('// Operative Plans')
operative_plans_end = text.find('];', operative_plans_start)

new_operative_plans = '''// Operative Plans (0% Commission Model)
            [
                'target_role' => 'operative',
                'name' => 'Standard Operative',
                'price' => '?5,000',
                'period' => 'Monthly',
                'limits' => 'Standard Class Jobs',
                'status' => 'active',
                'isPopular' => false,
                'features' => [
                    '0% Commission on all trips',
                    'Access to Standard Job Requests',
                    'Standard payout timeframe (24-48 hours)',
                    'Profile listed in Standard Directory'
                ]
            ],
            [
                'target_role' => 'operative',
                'name' => 'Premium Operative',
                'price' => '?10,000',
                'period' => 'Monthly',
                'limits' => 'Premium Class Jobs',
                'status' => 'active',
                'isPopular' => true,
                'features' => [
                    '0% Commission on all trips',
                    'Access to Premium & Standard Job Requests',
                    'Priority Algorithm Matching',
                    'Faster payout timeframe (24 hours)'
                ]
            ],
            [
                'target_role' => 'operative',
                'name' => 'Elite Operative',
                'price' => '?15,000',
                'period' => 'Monthly',
                'limits' => 'Elite Class Jobs',
                'status' => 'active',
                'isPopular' => false,
                'features' => [
                    '0% Commission on all trips',
                    'Access to Elite, Premium & Standard Jobs',
                    'Top Tier Placement in Employer Searches',
                    'Same-day instant payouts',
                    '24/7 VIP Dedicated support channel'
                ]
            ]'''

text = text[:operative_plans_start] + new_operative_plans + "\n        " + text[operative_plans_end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
