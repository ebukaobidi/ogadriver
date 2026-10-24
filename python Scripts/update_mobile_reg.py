# -*- coding: utf-8 -*-
import re
import io

path = 'mobile/src/screens/RegisterScreen.js'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add state for countryCode
state_pattern = r'const \[phone, setPhone\] = useState\(''\);'
new_state = """const [phone, setPhone] = useState('');
 const [countryCode, setCountryCode] = useState('+234');"""

text = re.sub(state_pattern, new_state, text)

# Modify handleRegister payload
payload_pattern = r'phone,'
new_payload = """phone: `${countryCode}${phone.replace(/^0+/, '')}`,"""
text = re.sub(payload_pattern, new_payload, text, count=1)

# Modify the Phone Input UI
ui_pattern = r'<View className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">\s*<Text className="text-\[10px\] font-mono text-slate-500 uppercase tracking-widest mb-1">Phone Number<\/Text>\s*<TextInput\s*className="text-slate-900 dark:text-white text-base font-bold"\s*placeholder="\+234 800 000 0000"\s*placeholderTextColor="\#475569"\s*value=\{phone\}\s*onChangeText=\{setPhone\}\s*keyboardType="phone-pad"\s*\/>\s*<\/View>'

new_ui = """<View className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
 <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Country Code & Phone Number</Text>
 <View className="flex-row items-center border-b border-slate-700/50 pb-2 mb-2">
    <TouchableOpacity onPress={() => setCountryCode('+234')} className={`px-2 py-1 rounded mr-2 ${countryCode === '+234' ? 'bg-[#1cd188]/20 border border-[#1cd188]' : 'bg-slate-800'}`}><Text className={countryCode === '+234' ? 'text-[#1cd188] font-bold text-xs' : 'text-slate-400 text-xs'}>NG +234</Text></TouchableOpacity>
    <TouchableOpacity onPress={() => setCountryCode('+233')} className={`px-2 py-1 rounded mr-2 ${countryCode === '+233' ? 'bg-[#1cd188]/20 border border-[#1cd188]' : 'bg-slate-800'}`}><Text className={countryCode === '+233' ? 'text-[#1cd188] font-bold text-xs' : 'text-slate-400 text-xs'}>GH +233</Text></TouchableOpacity>
    <TouchableOpacity onPress={() => setCountryCode('+254')} className={`px-2 py-1 rounded mr-2 ${countryCode === '+254' ? 'bg-[#1cd188]/20 border border-[#1cd188]' : 'bg-slate-800'}`}><Text className={countryCode === '+254' ? 'text-[#1cd188] font-bold text-xs' : 'text-slate-400 text-xs'}>KE +254</Text></TouchableOpacity>
    <TouchableOpacity onPress={() => setCountryCode('+27')} className={`px-2 py-1 rounded ${countryCode === '+27' ? 'bg-[#1cd188]/20 border border-[#1cd188]' : 'bg-slate-800'}`}><Text className={countryCode === '+27' ? 'text-[#1cd188] font-bold text-xs' : 'text-slate-400 text-xs'}>ZA +27</Text></TouchableOpacity>
 </View>
 <View className="flex-row items-center">
    <Text className="text-[#1cd188] font-bold text-base mr-2">{countryCode}</Text>
    <TextInput
      className="flex-1 text-slate-900 dark:text-white text-base font-bold"
      placeholder="800 000 0000"
      placeholderTextColor="#475569"
      value={phone}
      onChangeText={setPhone}
      keyboardType="phone-pad"
    />
 </View>
 </View>"""

text = re.sub(ui_pattern, new_ui, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

