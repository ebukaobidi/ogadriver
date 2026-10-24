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
                'name' => 'Trial Driver (30 Days)',
                'price' => '?5',
                'period' => '30 Days',
                'limits' => 'Verification Fee Only',
                'status' => 'active',
                'isPopular' => false,
                'features' => [
                    '0% Commission on all trips',
                    '30-Day Full Platform Access',
                    'Standard Algorithm Matching',
                    'Standard payout timeframe (24-48 hours)'
                ]
            ],
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
                    'Standard Algorithm Matching',
                    'See ride distance before accepting',
                    'Standard payout timeframe (24-48 hours)'
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
                    '5-Second Head Start on Ride Requests',
                    'See EXACT destination before accepting',
                    'Unlimited Free Instant Cashouts',
                    'Access to Premium Airport Pickups'
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
                    '10-Second Head Start on ALL Ride Requests (God Mode)',
                    'See EXACT destination & rider rating before accepting',
                    'Zero penalties for rejecting rides (Unlimited Declines)',
                    'Exclusive access to High-Paying Corporate/Fleet accounts',
                    'Free Weekly Car Wash Token & Fuel Discounts'
                ]
            ]'''

text = text[:operative_plans_start] + new_operative_plans + "\n        " + text[operative_plans_end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
