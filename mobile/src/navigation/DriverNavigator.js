import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

import DriverProfileScreen from '../screens/DriverProfileScreen';
import DriverJobsScreen from '../screens/DriverJobsScreen';
import DriverWalletScreen from '../screens/DriverWalletScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ focused, name }) {
  return (
    <View className="items-center justify-center">
      <Text className={`text-lg ${focused ? 'text-brandMint' : 'text-slate-500'}`}>
        {name === 'Profile' ? '👤' : name === 'Jobs' ? '💼' : '💰'}
      </Text>
      <Text className={`text-xs mt-1 ${focused ? 'text-brandMint' : 'text-slate-500'}`}>{name}</Text>
    </View>
  );
}

export default function DriverNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#22d3ee',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen
        name="Profile"
        component={DriverProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Profile" />,
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={DriverJobsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Jobs" />,
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={DriverWalletScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Wallet" />,
        }}
      />
    </Tab.Navigator>
  );
}
