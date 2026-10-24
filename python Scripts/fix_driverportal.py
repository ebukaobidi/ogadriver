# -*- coding: utf-8 -*-
import io

path = 'frontend/src/pages/DriverPortal.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update MoreVertical onClick
old_onclick = "onClick={() => setMoreSheetOpen(prev => !prev)}"
new_onclick = "onClick={() => setActiveTab('profile')}"
text = text.replace(old_onclick, new_onclick)

# 2. Remove MessagingButton and NotificationBell from the header
old_icons = """<div className="flex items-center gap-2 pointer-events-auto">
            <MessagingButton />
            <NotificationBell />
          </div>"""
text = text.replace(old_icons, "")

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

