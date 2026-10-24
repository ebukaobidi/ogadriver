# -*- coding: utf-8 -*-
import io

path = 'database/seeders/SubscriptionPlanSeeder.php'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add Employment Seeker plan
new_plan = """            [
                'target_role' => 'operative',
                'name' => 'Trial Driver (30 Days)',"""

replacement = """            [
                'target_role' => 'operative',
                'name' => 'Employment Seeker (Fleet Job Board)',
                'price' => ',1,500',
                'period' => 'Monthly',
                'limits' => 'Job Board Access Only',
                'status' => 'active',
                'isPopular' => true,
                'features' => [
                    'Full visibility on the Job Board',
                    'Direct apply to Corporate & Fleet Jobs',
                    'Guarantor Vetting & Police Clearance Processing'
                ]
            ],
            [
                'target_role' => 'operative',
                'name' => 'Trial Driver (30 Days)',"""

text = text.replace(new_plan, replacement)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
