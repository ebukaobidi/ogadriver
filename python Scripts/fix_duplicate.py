# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/pages/DriverPortal.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Remove the old DriverNearbyRidesTab rendering
old_render = """          {activeTab === 'surge' && (
              <DriverNearbyRidesTab />
            )}"""

text = text.replace(old_render, "")

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

