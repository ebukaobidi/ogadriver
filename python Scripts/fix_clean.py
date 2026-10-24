# -*- coding: utf-8 -*-
import io

# 1. FIX DRIVER PORTAL FLOATING HEADER
path_portal = 'frontend/src/pages/DriverPortal.jsx'
with io.open(path_portal, 'r', encoding='utf-8') as f:
    text_portal = f.read()

old_floating = """{/* Floating Global Top Actions md:hidden */}
        <div className="md:hidden fixed top-3 left-4 right-4 z-[60] flex items-center justify-between pointer-events-none">"""

new_floating = """{/* Floating Global Top Actions md:hidden */}
        {activeTab !== 'profile' && (
        <div className="md:hidden fixed top-3 left-4 right-4 z-[60] flex items-center justify-between pointer-events-none">"""

old_floating_end = """<NotificationBell />
          </div>
        </div>"""

new_floating_end = """<NotificationBell />
          </div>
        </div>
        )}"""

if "activeTab !== 'profile'" not in text_portal:
    text_portal = text_portal.replace(old_floating, new_floating)
    text_portal = text_portal.replace(old_floating_end, new_floating_end)

with io.open(path_portal, 'w', encoding='utf-8') as f:
    f.write(text_portal)

# 2. FIX PROFILE TAB ISSUES
path_profile = 'frontend/src/components/driver/DriverProfileTab.jsx'
with io.open(path_profile, 'r', encoding='utf-8') as f:
    text_profile = f.read()

old_id = "@{driver?.formatted_id || driver?.alias || nickname || user?.id || 'DRV-0000'}"
new_id = "@{driver?.formatted_id || driver?.alias || nickname || 'DRV-' + (user?.id || '0000')}"
text_profile = text_profile.replace(old_id, new_id)

old_video = """{verificationProgress || 0}% <span className="text-slate-500 font-normal mx-1">&bull;</span> 
            <a href="#" className="hover:underline">Add introduction video</a>"""
new_video = """{verificationProgress || 0}%"""
text_profile = text_profile.replace(old_video, new_video)

with io.open(path_profile, 'w', encoding='utf-8') as f:
    f.write(text_profile)

