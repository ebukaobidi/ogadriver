# -*- coding: utf-8 -*-
with open('frontend/src/components/driver/DriverProfileTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

old_toggle = '''const PreferenceToggle = ({ label, description, checked, disabled, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-900/30 p-3">
    <span>
      <span className="block text-sm font-bold text-white">{label}</span>
      <span className="block text-[10px] text-slate-500">{description}</span>
    </span>
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
      className="h-5 w-5 rounded border-slate-700 bg-slate-900 accent-[#1cd188] disabled:opacity-50"
    />
  </label>
);'''

new_toggle = '''const PreferenceToggle = ({ label, description, checked, disabled, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-900/30 p-3">
    <span>
      <span className="block text-sm font-bold text-white">{label}</span>
      <span className="block text-[10px] text-slate-500">{description}</span>
    </span>
    <div className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-[#1cd188]' : 'bg-slate-700'} ${disabled ? 'opacity-50' : ''}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
    <input
      type="checkbox"
      className="sr-only"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
  </label>
);'''

# If exact match fails, use regex
if old_toggle in content:
    content = content.replace(old_toggle, new_toggle)
else:
    pattern = re.compile(r'const PreferenceToggle =.*?</label>\s*\);', re.DOTALL)
    content = pattern.sub(new_toggle, content)

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
