import re

path_web = 'frontend/src/components/driver/DriverProfileTab.jsx'
with open(path_web, 'r', encoding='utf-8') as f:
    text_web = f.read()

parts = text_web.split('{/* NEW UI: Referral Card */}')
if len(parts) > 1:
    before = parts[0]
    after = parts[1]
    
    idx = after.find('{/* 3. Performance Stats Dials (Moved to Profile) */}')
    
    if idx != -1:
        text_web = before + after[idx:]

with open(path_web, 'w', encoding='utf-8') as f:
    f.write(text_web)

print("Done Web")
