import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

import HirerDashboardScreen from '../screens/HirerDashboardScreen';
import PostJobScreen from '../screens/PostJobScreen';
import HirerBookingsScreen from '../screens/HirerBookingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ focused, name }) {
  return (
    <View className="items-center justify-center">
      <Text className={`text-lg ${focused ? 'text-brandMint' : 'text-slate-500'}`}>
        {name === 'Dashboard' ? '🏠' : name === 'Post Job' ? '➕' : '📋'}
      </Text>
      <Text className={`text-xs mt-1 ${focused ? 'text-brandMint' : 'text-slate-500'}`}>{name}</Text>
    </View>
  );
}

export default function HirerNavigator() {
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
        name="Dashboard"
        component={HirerDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Dashboard" />,
        }}
      />
      <Tab.Screen
        name="Post Job"
        component={PostJobScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Post Job" />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={HirerBookingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Bookings" />,
        }}
      />
    </Tab.Navigator>
  );
}
