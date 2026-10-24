# -*- coding: utf-8 -*-
import io

path = 'frontend/src/components/driver/SurgeMap.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Inject the states
if "const [combatMode, setCombatMode] = useState(false);" not in text:
    text = text.replace("const [driverLoc, setDriverLoc] = useState(null);", "const [driverLoc, setDriverLoc] = useState(null);\n  const [combatMode, setCombatMode] = useState(false);\n  const [isOnline, setIsOnline] = useState(false);")

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

