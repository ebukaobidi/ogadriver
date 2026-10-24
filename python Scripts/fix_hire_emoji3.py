# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/hirer/HirerAccount.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace rendering
text = text.replace("{place.icon || 'dY\"?'}", "{(place.icon === 'Briefcase' || place.icon === 'Office') ? <Briefcase className=\"w-5 h-5 text-blue-400\" /> : <MapPin className=\"w-5 h-5 text-brandMint\" />}")
text = text.replace("icon: place.icon || 'dY\"?'", "icon: place.icon || 'MapPin'")

# Replace icon presets loop
old_preset = r"\{?\['dY\?', 'dY\?', 'o\^,\?', 'dY\?<,\?', 'dY>', 'dY\"\?'\]\.map\(icon => \("
new_preset = "{['Home', 'Briefcase', 'MapPin', 'Users', 'Star'].map(icon => ("
text = re.sub(old_preset, new_preset, text)

# Replace the preset button rendering
old_preset_btn = r"onClick=\{.*?setPlaceForm\(\{ \.\.\.placeForm, icon \}\).*?className=\{`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-colors \$\{.*?placeForm\.icon === icon \? 'bg-\[#1cd188\]/20 border-\[#1cd188\]' : 'bg-slate-900 border-slate-700 hover:border-slate-500'\}  `\}>.*?\{icon\}.*?</button>"
new_preset_btn = """onClick={() => setPlaceForm({ ...placeForm, icon })}
                    type="button"
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-colors ${
                      placeForm.icon === icon ? 'bg-[#1cd188]/20 border-[#1cd188] text-[#1cd188]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {icon === 'Home' && <MapPin className="w-5 h-5" />}
                    {icon === 'Briefcase' && <Briefcase className="w-5 h-5" />}
                    {icon === 'MapPin' && <MapPin className="w-5 h-5" />}
                    {icon === 'Users' && <Users className="w-5 h-5" />}
                    {icon === 'Star' && <Star className="w-5 h-5" />}
                  </button>"""
text = re.sub(old_preset_btn, new_preset_btn, text, flags=re.DOTALL)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
