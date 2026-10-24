# -*- coding: utf-8 -*-
import io

path = 'frontend/src/components/driver/SurgeMap.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove isOnline state
text = text.replace("const [isOnline, setIsOnline] = useState(false);\n", "")

# 2. Remove the Online/Offline Toggle div
import re
online_toggle_pattern = r"\{/\* Online/Offline Toggle \*/\}.*?</div>\s*\{/\* Oga Radio"
text = re.sub(online_toggle_pattern, "{/* Oga Radio", text, flags=re.DOTALL)

# 3. Simplify the UI: Remove the Visual Radial Heat Map Section
heat_map_pattern = r"\{/\* Visual Radial Heat Map Section \*/\}.*?\{loading && zones\.length === 0"
text = re.sub(heat_map_pattern, "{loading && zones.length === 0", text, flags=re.DOTALL)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

