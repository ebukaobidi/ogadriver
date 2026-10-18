# -*- coding: utf-8 -*-
import re
import os

# 1. Update DriverNavigator.js
try:
    with open('mobile/src/navigation/DriverNavigator.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacing the TabNavigator setup
    # Actually, the subagent provided a partial code snippet. It's safer to just do string replacements for the specific parts.
    # We will replace the entire MoreStack and ScheduleStack with AccountStack and EarningsStack.
    # And replace the Tab.Navigator screens.
    
    # We'll just replace the TabIcon function first
    if 'function AccountStack' not in content:
        # Add stacks
        stacks = '''
function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverProfileMain" component={DriverProfileScreen} />
      <Stack.Screen name="DriverSettings" component={DriverSettingsScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="DriverDocuments" component={DriverDocumentsScreen} />
    </Stack.Navigator>
  );
}

function EarningsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EarningsMain" component={EarningsScreen} />
      <Stack.Screen name="DriverWallet" component={DriverWalletScreen} />
      <Stack.Screen name="InstantCashout" component={InstantCashoutScreen} />
    </Stack.Navigator>
  );
}
'''
        content = content.replace("function HomeStack() {", stacks + "\nfunction HomeStack() {")
        
        # Replace TabIcon logic
        old_tab_icon = r'let iconName;\s*if \(name === \'Home\'\) iconName = focused \? \'flash\' : \'flash-outline\';\s*else if \(name === \'Jobs\'\) iconName = focused \? \'briefcase\' : \'briefcase-outline\';\s*else if \(name === \'Schedule\'\) iconName = focused \? \'calendar\' : \'calendar-outline\';\s*else iconName = focused \? \'ellipsis-horizontal\' : \'ellipsis-horizontal-outline\';'
        new_tab_icon = '''let iconName;
  if (name === 'Home') iconName = focused ? 'flash' : 'flash-outline';
  else if (name === 'Earnings') iconName = focused ? 'cash' : 'cash-outline';
  else if (name === 'Jobs') iconName = focused ? 'briefcase' : 'briefcase-outline';
  else iconName = focused ? 'person' : 'person-outline';'''
        content = re.sub(old_tab_icon, new_tab_icon, content)
        
        # Replace Tab.Screens
        old_tabs = r'<Tab\.Screen name="Home".*?</Tab\.Navigator>'
        new_tabs = '''<Tab.Screen name="Home" component={HomeStack} options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Home" /> }} />
      <Tab.Screen name="Earnings" component={EarningsStack} options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Earnings" /> }} />
      <Tab.Screen name="Jobs" component={JobsStack} options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Jobs" /> }} />
      <Tab.Screen name="Account" component={AccountStack} options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Account" /> }} />
    </Tab.Navigator>'''
        content = re.sub(old_tabs, new_tabs, content, flags=re.DOTALL)
        
        with open('mobile/src/navigation/DriverNavigator.js', 'w', encoding='utf-8') as f:
            f.write(content)
except Exception as e:
    print(f"Error in DriverNavigator: {e}")

# 2. Update DriverProfileScreen.js
try:
    with open('mobile/src/screens/DriverProfileScreen.js', 'r', encoding='utf-8') as f:
        content = f.read()

    paystack_mock = '''
            {/* NEW UI: Paystack Bank Verification Mock */}
            <View className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-6 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Ionicons name="card" size={16} color="#1cd188" />
                  <Text className="text-white font-bold ml-2">Bank Account</Text>
                </View>
                <Text className="text-amber-400 text-xs font-bold">Unverified</Text>
              </View>
              <Text className="text-slate-400 text-xs mb-4">Please verify your bank account via Paystack to receive payouts.</Text>
              <TouchableOpacity className="bg-[#1cd188] py-3 rounded-xl items-center justify-center" onPress={() => Alert.alert("Paystack Mock", "Redirecting to Paystack Bank UI...")}>
                <Text className="text-slate-900 font-bold tracking-wide">Verify Account</Text>
              </TouchableOpacity>
            </View>
            
            {/* Employment Status block */}
'''
    content = re.sub(r'\{\/\*\s*Employment Status block\s*\*\/\}', paystack_mock, content)
    
    with open('mobile/src/screens/DriverProfileScreen.js', 'w', encoding='utf-8') as f:
        f.write(content)
except Exception as e:
    print(f"Error in DriverProfileScreen: {e}")

# 3. Update JobDetailsScreen.js
try:
    with open('mobile/src/screens/JobDetailsScreen.js', 'r', encoding='utf-8') as f:
        content = f.read()

    if 'import { Linking }' not in content:
        content = content.replace("import { View, Text", "import { Linking, View, Text")
        
    nav_handler = '''
  const handleNavigate = (lat, lng) => {
    if (lat && lng) {
      Linking.openURL(`google.navigation:q=${lat},${lng}`);
    } else {
      Alert.alert('Error', 'Location coordinates are not available.');
    }
  };
'''
    if 'handleNavigate' not in content:
        content = content.replace("export default function JobDetailsScreen", nav_handler + "\nexport default function JobDetailsScreen")
        
    old_pickup = r'<View className="flex-row items-start flex-1">\s*<Ionicons name="location".*?</View>\s*</View>'
    new_pickup = '''<View className="flex-row items-start justify-between w-full">
                <View className="flex-row items-start flex-1">
                  <Ionicons name="location" size={18} color="#64748b" />
                  <View className="ml-3 flex-1">
                    <Text className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Pickup</Text>
                    <Text className="text-slate-900 dark:text-white font-bold">{job.stealth_mode && !job.nda_signed_at ? 'HIDDEN (Private Route)' : job.pickup_location}</Text>
                  </View>
                </View>
                {(!job.stealth_mode || job.nda_signed_at) && job.pickup_latitude && (
                  <TouchableOpacity onPress={() => handleNavigate(job.pickup_latitude, job.pickup_longitude)} className="bg-slate-200 dark:bg-slate-700 p-2 rounded-lg ml-2">
                    <Ionicons name="navigate" size={16} color="#22d3ee" />
                  </TouchableOpacity>
                )}
              </View>'''
    content = re.sub(old_pickup, new_pickup, content, flags=re.DOTALL)

    with open('mobile/src/screens/JobDetailsScreen.js', 'w', encoding='utf-8') as f:
        f.write(content)
except Exception as e:
    print(f"Error in JobDetailsScreen: {e}")
