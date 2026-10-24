# -*- coding: utf-8 -*-
import re
import io

path = 'mobile/src/navigation/DriverNavigator.js'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# First replace TabIcon function to handle uniform color and non-floating icon
tab_icon_pattern = re.compile(r'function TabIcon\(\{ focused, name \}\) \{.*?return \(\s*<View className="items-center justify-center">\s*<Ionicons name=\{iconName\} size=\{22\} color=\{focused \? \'#1cd188\' : \'#64748b\'\} \/>\s*<Text style=\{\{ fontSize: 9, marginTop: 2, color: focused \? \'#1cd188\' : \'#64748b\', fontWeight: focused \? \'bold\' : \'normal\' \}\}>\{name\}<\/Text>\s*<\/View>\s*\);\s*\}', re.DOTALL)

new_tab_icon = """function TabIcon({ focused, name }) {
  let iconName;
  if (name === 'Home') iconName = focused ? 'flash' : 'flash-outline';
  else if (name === 'Jobs') iconName = focused ? 'briefcase' : 'briefcase-outline';
  else if (name === 'Schedule') iconName = focused ? 'calendar' : 'calendar-outline';
  else iconName = focused ? 'ellipsis-vertical' : 'ellipsis-vertical-outline';

  const color = focused ? '#1cd188' : '#64748b';

  return (
    <View className="items-center justify-center pt-2">
      <Ionicons name={iconName} size={24} color={color} />
      <Text style={{ fontSize: 10, marginTop: 4, color: color, fontWeight: focused ? '900' : 'bold' }}>{name}</Text>
    </View>
  );
}"""

text = tab_icon_pattern.sub(new_tab_icon, text)

# Now rewrite the screens in DriverNavigator component
nav_pattern = re.compile(r'<Tab\.Navigator\s*screenOptions=\{\{.*?<\/Tab\.Navigator>', re.DOTALL)

new_nav = """<Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          paddingBottom: 10,
          paddingTop: 5,
          height: 65,
          elevation: 10,
        },
        tabBarActiveTintColor: '#1cd188',
        tabBarInactiveTintColor: '#64748b',
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Home" />,
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Jobs" />,
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Schedule" />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="More" />,
        }}
      />
    </Tab.Navigator>"""

text = nav_pattern.sub(new_nav, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

