# -*- coding: utf-8 -*-
import io
import re

path_portal = 'frontend/src/pages/DriverPortal.jsx'
with io.open(path_portal, 'r', encoding='utf-8') as f:
    text_portal = f.read()

pattern = r"\{/\* Floating Global Top Actions md:hidden \*/\}\s*<div className=\"md:hidden fixed top-3 left-4 right-4 z-\[60\] flex items-center justify-between pointer-events-none\">\s*<button.*?<NotificationBell />\s*</div>\s*</div>"

replacement = """{/* Floating Global Top Actions md:hidden */}
        {activeTab !== 'profile' && (
          <div className="md:hidden fixed top-3 left-4 right-4 z-[60] flex items-center justify-between pointer-events-none">
            <button
              onClick={() => setActiveTab('profile')}
              className="w-11 h-11 rounded-full bg-[#1e293b]/90 backdrop-blur-md border border-slate-700 flex items-center justify-center text-white pointer-events-auto shadow-lg"
              aria-label="Profile Menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 pointer-events-auto">
              <MessagingButton />
              <NotificationBell />
            </div>
          </div>
        )}"""

text_portal = re.sub(pattern, replacement, text_portal, flags=re.DOTALL)

with io.open(path_portal, 'w', encoding='utf-8') as f:
    f.write(text_portal)

