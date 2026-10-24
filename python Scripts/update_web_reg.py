# -*- coding: utf-8 -*-
import re
import io

path = 'frontend/src/pages/Register.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Modify initial state
state_pattern = r"phone: '',"
new_state = """phone: '',
      countryCode: '+234',"""
text = re.sub(state_pattern, new_state, text)

# Find the handleRegister function to merge countryCode and phone
# Wait, handleRegister might be called handleSubmit
submit_pattern = r"const handleSubmit = async \(e\) => \{"
new_submit = """const handleSubmit = async (e) => {
    // Format phone with country code
    const formattedPhone = formData.countryCode + formData.phone.replace(/^0+/, '');
    const submissionData = { ...formData, phone: formattedPhone };"""
text = re.sub(submit_pattern, new_submit, text)

# Now we need to change formData to submissionData in the authService.register call inside handleSubmit
# Wait, it might be passing formData directly.
auth_register_pattern = r'authService\.register\(formData\)'
new_auth = "authService.register(submissionData)"
text = re.sub(auth_register_pattern, new_auth, text)

# Now the UI
ui_pattern = r'<div>\s*<label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">\s*Phone Number \(Mandatory\)\s*<\/label>\s*<div className="relative">\s*<Phone className="w-5 h-5 text-slate-500 absolute left-4 top-1\/2 -translate-y-1\/2" \/>\s*<input\s*type="tel"\s*name="phone"\s*value=\{formData\.phone\}\s*onChange=\{handleChange\}\s*placeholder="e\.g\. 08012345678"\s*className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-3\.5 pl-12 pr-4 \ntext-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-sm transition-all"\s*required\s*\/>\s*<\/div>\s*<\/div>'

new_ui = """<div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Country & Phone Number
                </label>
                <div className="flex gap-2 mb-2">
                  {['+234', '+233', '+254', '+27'].map(code => (
                    <button 
                      key={code} type="button" 
                      onClick={() => setFormData({...formData, countryCode: code})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.countryCode === code ? 'bg-brandMint text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
                <div className="relative flex">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-800 bg-slate-900 text-slate-400 font-bold sm:text-sm">
                    {formData.countryCode}
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="801 234 5678"
                    className="flex-1 block w-full bg-slate-950 border border-slate-800 rounded-r-xl py-3.5 px-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-sm transition-all"
                    required
                  />
                </div>
              </div>"""

text = re.sub(ui_pattern, new_ui, text)

# I should use a more flexible regex for UI because of formatting
text2 = re.sub(r'<div>\s*<label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">\s*Phone Number.*?</label>\s*<div className="relative">.*?</div>\s*</div>', new_ui, text, flags=re.DOTALL)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text2)

