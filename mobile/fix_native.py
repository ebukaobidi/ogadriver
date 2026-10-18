# -*- coding: utf-8 -*-
import re

# 1. Update HirerDashboardScreen.js
try:
    with open('mobile/src/screens/HirerDashboardScreen.js', 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'import { Switch }' not in content and 'Switch' not in content:
        content = content.replace("import { View, Text", "import { Switch, View, Text")
        
    if 'const [stealthMode, setStealthMode] = useState(false);' not in content:
        content = content.replace('const [refreshing, setRefreshing] = useState(false);', 'const [refreshing, setRefreshing] = useState(false);\n  const [stealthMode, setStealthMode] = useState(false);')
        
    stealth_ui = '''{/* VIP Stealth Mode Toggle */}
          <View className="flex-row items-center justify-between mb-4 bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <View className="flex-row items-center">
              <Ionicons name="eye-off-outline" size={18} color="#a855f7" />
              <Text className="text-white font-medium text-xs ml-2">VIP Stealth Mode</Text>
            </View>
            <Switch value={stealthMode} onValueChange={setStealthMode} trackColor={{ false: '#334155', true: '#a855f7' }} thumbColor="#ffffff" />
          </View>
          
          {/* Glowing CTA Button */}'''
    content = content.replace('{/* Glowing CTA Button */}', stealth_ui)
    
    sos_ui = '''{/* SOS Emergency Bar */}
        <TouchableOpacity 
          className="bg-red-950/70 border-2 border-red-600 rounded-2xl p-4 mb-6 flex-row items-center justify-center shadow-lg shadow-red-600/30"
          onPress={() => Alert.alert("Emergency SOS", "Broadcasting live GPS coordinates to security & emergency contacts.")}
        >
          <Ionicons name="warning-outline" size={22} color="#ef4444" />
          <Text className="text-red-500 font-black tracking-widest text-base ml-2">⚠ SOS EMERGENCY</Text>
        </TouchableOpacity>'''
    content = content.replace('{/* Quick Action Grid */}', sos_ui + '\n\n        {/* Quick Action Grid */}')
    
    with open('mobile/src/screens/HirerDashboardScreen.js', 'w', encoding='utf-8') as f:
        f.write(content)
except Exception as e:
    print(e)
    
# 2. Update ProfileScreen.js
try:
    with open('mobile/src/screens/ProfileScreen.js', 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'const [corporateAccount, setCorporateAccount] = useState(false);' not in content:
        content = content.replace('const [tripPref, setTripPref] = useState(true);', 'const [tripPref, setTripPref] = useState(true);\n  const [corporateAccount, setCorporateAccount] = useState(false);')
        
    corp_ui = '''<View className="flex-row items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <Text className="text-white font-medium text-sm">Share Trip Status Automatically</Text>
              <Switch value={tripPref} onValueChange={setTripPref} trackColor={{ false: '#334155', true: '#10b981' }} thumbColor="#ffffff" />
            </View>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white font-medium text-sm">Corporate / Business Account</Text>
                <Text className="text-slate-400 text-[10px]">Enable business billing</Text>
              </View>
              <Switch value={corporateAccount} onValueChange={setCorporateAccount} trackColor={{ false: '#334155', true: '#3b82f6' }} thumbColor="#ffffff" />
            </View>'''
    content = re.sub(r'<View className="flex-row items-center justify-between">\s*<Text className="text-white font-medium text-sm">Share Trip Status Automatically</Text>\s*<Switch.*?/>\s*</View>', corp_ui, content, flags=re.DOTALL)
    
    with open('mobile/src/screens/ProfileScreen.js', 'w', encoding='utf-8') as f:
        f.write(content)
except Exception as e:
    print(e)
