import re

path = 'frontend/src/pages/DriverPortal.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Change default tab to 'surge'
text = text.replace("return 'proposals';", "return 'surge';")
text = text.replace("if (saved && saved !== 'dashboard') return saved;", "if (saved) return saved;")

# 2. Update Bottom Nav
text = text.replace("setActiveTab('nearby');", "setActiveTab('surge');")
text = text.replace("activeTab === 'nearby'", "activeTab === 'surge'")
text = text.replace(">Nearby</span>", ">Home</span>")
text = text.replace("<Car ", "<Zap ")

# 3. Remove Surge from More Sheet
surge_item = "{ id: 'surge',     icon: Zap },"
text = text.replace(surge_item, "")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
