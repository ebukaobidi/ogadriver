# -*- coding: utf-8 -*-
import re
import io

path = 'frontend/src/pages/admin/RegionalCommandCenterPage.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add Import
import_pattern = r"import LocationActivationManager from '\.\.\/\.\.\/components\/admin\/LocationActivationManager';"
new_import = """import LocationActivationManager from '../../components/admin/LocationActivationManager';
import TerritoryFranchiseManager from '../../components/admin/TerritoryFranchiseManager';"""
text = re.sub(import_pattern, new_import, text)

# Add Tab to Header
# The header doesn't have tabs currently, it's just the KPI metrics.
# Let's add a Tab bar under the metrics or header.
main_pattern = r'\{\/\* Top KPI Metrics Overview Bar \*\/\}'
new_tabs = """{/* Sub-Navigation Tabs */}
          <div className="flex gap-4 border-b border-slate-800 mb-6 pb-2">
            <button
              onClick={() => setActiveTab('command')}
              className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'command' ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Territory Radar
              {activeTab === 'command' && <div className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-brandMint"></div>}
            </button>
            <button
              onClick={() => setActiveTab('activation')}
              className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'activation' ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Zone Activations
              {activeTab === 'activation' && <div className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-brandMint"></div>}
            </button>
            <button
              onClick={() => setActiveTab('franchise')}
              className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors relative flex items-center gap-2 ${activeTab === 'franchise' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Award size={14}/> Franchise Override
              {activeTab === 'franchise' && <div className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-amber-400"></div>}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'command' && (
            <>
              {/* Top KPI Metrics Overview Bar */}"""

text = re.sub(main_pattern, new_tabs, text)

# Now close the fragment for 'command' tab and add the 'franchise' tab condition at the bottom of the main content area
bottom_pattern = r'\{\/\* Left Column: Command Hub Map \*\/\}'

new_bottom = """{/* Left Column: Command Hub Map */}"""

# Wait, we need to wrap the existing content. The existing content is the entire Grid layout.
# It's better to just replace the whole main content rendering logic.
# Let's find: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">` and close it at the end of `<main>`

main_end_pattern = r'<\/main>'
new_main_end = """  </>
          )}

          {activeTab === 'activation' && (
             <LocationActivationManager />
          )}

          {activeTab === 'franchise' && (
             <TerritoryFranchiseManager />
          )}
        </main>"""
text = re.sub(main_end_pattern, new_main_end, text)


with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

