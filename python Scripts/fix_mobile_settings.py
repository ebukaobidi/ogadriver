import re

path = 'mobile/src/screens/DriverSettingsScreen.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Remove from array
array_item = '''    {
      id: 'surge_map',
      title: 'Surge Map',
      icon: 'pulse-outline',
      iconColor: '#10b981',
      route: 'OgaCopilot'
    }'''

text = text.replace(array_item, '')
# cleanup trailing commas if any, but it's the last item, so maybe the preceding comma needs removal?
text = text.replace('},\n    ]', '}\n    ]')

# Replace the Second Row
second_row_regex = r'\{\/\* Second Row: Surge Map on Left \+ Legal Subtext on Right \*\/\}.*?<\/View>'
new_second_row = '''          {/* Second Row: Legal Subtext */}
          <View className="flex-row items-center justify-between">
            <View className="w-full pl-3 pr-1">
              <Text className="text-slate-500 text-[10px] leading-tight text-center">
                Regulatory compliance terms and partner dispatch utilities updated for all active drivers. All rights reserved.
              </Text>
            </View>
          </View>'''

text = re.sub(r'\{\/\* Second Row: Surge Map on Left \+ Legal Subtext on Right \*\/\}.*?<\/View>\s*<\/View>', new_second_row + '\n        </View>', text, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
