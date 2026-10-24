# -*- coding: utf-8 -*-
import re

with open('frontend/src/components/driver/DriverSettingsTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_toggle = '''const PreferenceToggle = ({ icon: Icon, title, description, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-slate-700">
    <span className="flex items-center gap-3">
      {Icon && <Icon className="h-5 w-5 shrink-0 text-[#1cd188]" />}
      <span>
        <span className="block text-sm font-bold text-white">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-400">{description}</span>
      </span>
    </span>
    <div className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-[#1cd188]' : 'bg-slate-700'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" />
  </label>
);'''

pattern = re.compile(r'const PreferenceToggle =.*?</label>\s*\);', re.DOTALL)
content = pattern.sub(new_toggle, content)

with open('frontend/src/components/driver/DriverSettingsTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
