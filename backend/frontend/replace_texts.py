# -*- coding: utf-8 -*-
import re

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update variables
pattern_vars = re.compile(r"  const boostPrice = currencySymbol === '₦' \? '500' : '0\.50';\n  const bonusPrice = currencySymbol === '₦' \? '5,000' : '5\.00';")
new_vars = '''  const boostPrice = currencySymbol === '₦' ? '500' : '0.50';
  const systemId = profileUser?.system_id || driver?.system_id || '—';
  const fleetBonus = currencySymbol === '₦' ? '500' : '5.00';
  const independentBonus = currencySymbol === '₦' ? '1,000' : '10.00';'''
content = pattern_vars.sub(new_vars, content)

# 2. Update displayId to systemId
content = content.replace("SYSTEM ID: {displayId}", "SYSTEM ID: {systemId}")

# 3. Update referral text
pattern_ref = re.compile(r"Invite other drivers to OgaDriver and earn \{currencySymbol\}\{bonusPrice\} for every verified activation\.")
new_ref = "Invite other drivers to OgaDriver and earn {currencySymbol}{independentBonus} for every Independent Operator and {currencySymbol}{fleetBonus} for every Fleet Operative."
content = pattern_ref.sub(new_ref, content)

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
