import re

path = 'database/seeders/SubscriptionPlanSeeder.php'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace Operative Plans
operative_plans_start = text.find('// Operative Plans')
operative_plans_end = text.find('];', operative_plans_start)

new_operative_plans = '''// Operative Plans (0% Commission Model - Pay As You Go Included)
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
                    'Standard Algorithm Matching'
                ]
            ],
            [
                'target_role' => 'operative',
                'name' => 'Standard (Pay-As-You-Go)',
                'price' => '?300',
                'period' => 'Daily',
                'limits' => '24 Hours Access',
                'status' => 'active',
                'isPopular' => false,
                'features' => [
                    '0% Commission for 24 Hours',
                    'Perfect for part-time driving',
                    'Only pay on days you work',
                    'Standard Algorithm Matching'
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
                    'Pause subscription if car breaks down (Garage Mode)'
                ]
            ],
            [
                'target_role' => 'operative',
                'name' => 'Premium (Weekly Flex)',
                'price' => '?3,000',
                'period' => 'Weekly',
                'limits' => '7 Days Access',
                'status' => 'active',
                'isPopular' => false,
                'features' => [
                    '0% Commission for 7 Days',
                    '5-Second Head Start on Ride Requests',
                    'See EXACT destination before accepting'
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
                    'Pause subscription if sick (Garage Mode)'
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
                    'Unlimited Declines without penalty',
                    'Exclusive access to Corporate accounts',
                    'Pause subscription up to 14 days (Garage Mode)'
                ]
            ]'''

text = text[:operative_plans_start] + new_operative_plans + "\n        " + text[operative_plans_end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
