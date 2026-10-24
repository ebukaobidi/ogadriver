# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverProfileTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix Track A button
pattern_a = r"onClick=\{handleVehicleOwnershipToggle\}"
text = re.sub(pattern_a, "onClick={() => setDriverStatus(true)}", text)

# Fix Track B button
pattern_b = r"onClick=\{async \(\) => \{\s*setPrefs\(p => \(\{ \.\.\.p, has_vehicle: false \}\)\);\s*if \(driver\?\.id\) \{\s*try \{\s*await api\.put\(`/drivers/\$\{driver\.id\}`,\s*\{\s*has_vehicle: false\s*\}\);\s*alert\('Driver Status Saved: Fleet Operative'\);\s*\}\s*catch\(e\)\s*\{\}\s*\}\s*setOpenSection\('employment'\);\s*\}\}"
text = re.sub(pattern_b, "onClick={() => setDriverStatus(false)}", text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

