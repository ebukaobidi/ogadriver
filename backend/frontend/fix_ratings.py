# -*- coding: utf-8 -*-
with open('frontend/src/components/driver/DriverProfileTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad = '''<p className="mt-1 text-sm text-slate-200">
                    {driver.rating ?? '—'} ★ • {driver.subscription_tier || '—'}
                  </p>'''
good = '''<p className="mt-1 text-sm text-slate-200 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => setActiveTab && setActiveTab('ratings')} title="View Ratings">
                    {driver.rating ?? '—'} ★ • {driver.subscription_tier || '—'}
                  </p>'''

content = content.replace(bad, good)

# Also check for 'setActiveTab' prop
if 'setActiveTab' not in content.split(') {')[0]:
    # Need to add setActiveTab to props if not there. Let's see the function signature
    pass # Wait, let's look at the signature using python string replace

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
