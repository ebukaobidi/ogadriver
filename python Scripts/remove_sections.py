import re

# 1. Update React Web (DriverProfileTab.jsx)
path_web = 'frontend/src/components/driver/DriverProfileTab.jsx'
with open(path_web, 'r', encoding='utf-8') as f:
    text_web = f.read()

# Using regex to remove from {/* NEW UI: Referral Card */} up to but NOT including {/* Deep Settings Accordion */} or {/* Log Out */}
# Actually, the quickest way is to just replace with regex DOTALL
pattern_web = r'\{/\* NEW UI: Referral Card \*/\}.*?\{/\* NEW UI: Bottom Actions \*/\}.*?</div>\s*</div>'
# Let's write a safer replace
parts = text_web.split('{/* NEW UI: Referral Card */}')
if len(parts) > 1:
    before = parts[0]
    after = parts[1]
    # find where bottom actions ends. It is followed by Log out or Accordions
    # In DriverProfileTab, the next thing is probably deep settings or log out
    idx = after.find('{/* Deep Settings Accordion')
    if idx == -1:
        idx = after.find('{/* Old Advanced Stats - Hidden but kept for data */}')
    if idx == -1:
        idx = after.find('{/* Log Out')
    
    if idx != -1:
        text_web = before + after[idx:]

with open(path_web, 'w', encoding='utf-8') as f:
    f.write(text_web)


# 2. Update React Native Mobile (DriverProfileScreen.js)
path_mobile = 'mobile/src/screens/DriverProfileScreen.js'
with open(path_mobile, 'r', encoding='utf-8') as f:
    text_mobile = f.read()

parts_mobile = text_mobile.split('{/* NEW UI: Referral Card */}')
if len(parts_mobile) > 1:
    before = parts_mobile[0]
    after = parts_mobile[1]
    idx = after.find('{/* Log Out */}')
    
    if idx != -1:
        text_mobile = before + after[idx:]

with open(path_mobile, 'w', encoding='utf-8') as f:
    f.write(text_mobile)

print("Done")
