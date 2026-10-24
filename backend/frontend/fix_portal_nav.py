# -*- coding: utf-8 -*-
import re

with open('frontend/src/pages/DriverPortal.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for DriverAccountHubTab
if 'DriverAccountHubTab' not in content:
    content = content.replace("import DriverSettingsTab from '../components/driver/DriverSettingsTab';", "import DriverAccountHubTab from '../components/driver/DriverAccountHubTab';\nimport DriverSettingsTab from '../components/driver/DriverSettingsTab';")

# Replace Bottom Nav
old_nav = r'\{/\* Mobile Bottom Nav.*?</nav>'
new_nav = '''{/* Mobile Bottom Nav - 4 core tabs */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 z-50 flex items-center justify-around px-2 pb-5 pt-3">
        {/* Drive (Map) */}
        <button
          onClick={() => { setActiveTab('surge'); setMoreSheetOpen(false); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'surge' ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
        >
          <Zap className="w-6 h-6" />
          <span className="text-[10px] font-bold">Drive</span>
        </button>

        {/* Earnings */}
        <button
          onClick={() => { setActiveTab('dashboard'); setMoreSheetOpen(false); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
        >
          <Gift className="w-6 h-6" />
          <span className="text-[10px] font-bold">Earnings</span>
        </button>

        {/* Jobs */}
        <button
          onClick={() => { setActiveTab('proposals'); setMoreSheetOpen(false); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'proposals' ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
        >
          <Briefcase className="w-6 h-6" />
          <span className="text-[10px] font-bold">Jobs</span>
        </button>

        {/* Account Hub */}
        <button
          onClick={() => { setActiveTab('account'); setMoreSheetOpen(false); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'account' ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">Account</span>
        </button>
      </nav>'''

content = re.sub(old_nav, new_nav, content, flags=re.DOTALL)

# Remove the "More Bottom Sheet" entirely
more_sheet = r'\{/\* More Bottom Sheet \*/\}.*?\n\s*\n'
content = re.sub(more_sheet, '', content, flags=re.DOTALL)

# Remove the "MoreHorizontal" floating button that goes to profile
floating_btn = r'\{/\* Header.*?</button>'
content = re.sub(floating_btn, '', content, flags=re.DOTALL)

# Add the Account Hub tab renderer
hub_render = '''
          {activeTab === 'account' && (
            <DriverAccountHubTab setActiveTab={setActiveTab} driver={driver} user={user} />
          )}
'''
content = content.replace("{activeTab === 'surge' && (", hub_render + "\n          {activeTab === 'surge' && (")

with open('frontend/src/pages/DriverPortal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
