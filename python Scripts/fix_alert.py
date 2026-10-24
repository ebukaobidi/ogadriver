import re
path = "frontend/src/components/driver/SurgeMap.jsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace(
    "alert(Surge Locked! You now have 15 minutes to reach  with a guaranteed x multiplier.)",
    "alert(`Surge Locked! You now have 15 minutes to reach ${zone.name} with a guaranteed ${zone.multiplier}x multiplier.`)"
)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)
