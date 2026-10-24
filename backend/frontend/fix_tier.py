# -*- coding: utf-8 -*-
with open('frontend/src/components/driver/DriverProfileTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad_tier = '''<div className={mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg }>
                    {driverTier} Tier
                  </div>'''
good_tier = '''<div className={`mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg ${tierColor}`}>
                    {driverTier} Tier
                  </div>'''

content = content.replace(bad_tier, good_tier)

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
