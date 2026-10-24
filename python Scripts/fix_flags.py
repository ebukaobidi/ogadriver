# -*- coding: utf-8 -*-
import io

path = 'frontend/src/pages/Register.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the array with the new one
old_array = "{['+234', '+233', '+254', '+27'].map(code => ("
new_array = """{[
                      { code: '+234', flag: '🇳🇬' }, 
                      { code: '+233', flag: '🇬🇭' }, 
                      { code: '+254', flag: '🇰🇪' }, 
                      { code: '+27', flag: '🇿🇦' }
                    ].map(country => ("""

text = text.replace(old_array, new_array)

# Replace the button code
text = text.replace("key={code} type=\"button\"", "key={country.code} type=\"button\"")
text = text.replace("onClick={() => setFormData({...formData, countryCode: code})}", "onClick={() => setFormData({...formData, countryCode: country.code})}")
text = text.replace("className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.countryCode === code ? 'bg-brandMint text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}", "className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${formData.countryCode === country.code ? 'bg-brandMint text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}")
text = text.replace("{code}\n                      </button>", "{country.flag} {country.code}\n                      </button>")

with io.open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(text)

