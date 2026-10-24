# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/pages/Register.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# I will use a Regex to replace the entire Phone Number input div block
pattern = r"<div>\s*<label className=\"block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2\">\s*Country & Phone Number\s*</label>\s*<div className=\"flex gap-2 mb-2\">.*?<input\s*type=\"tel\"\s*name=\"phone\""

replacement = """<div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative flex">
                    <div className="relative flex items-center border border-r-0 border-slate-800 bg-slate-900 rounded-l-xl focus-within:border-brandMint transition-colors">
                      <select
                        value={formData.countryCode}
                        onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                        className="appearance-none bg-transparent text-slate-300 font-bold sm:text-sm pl-3 pr-8 py-3 focus:outline-none cursor-pointer"
                      >
                        <option value="+234">🇳🇬 +234</option>
                        <option value="+233">🇬🇭 +233</option>
                        <option value="+254">🇰🇪 +254</option>
                        <option value="+27">🇿🇦 +27</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                    <input
                      type="tel"
                      name="phone\""""

text = re.sub(pattern, replacement, text, flags=re.DOTALL)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

