import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import ProposalsScreen from '../screens/ProposalsScreen';
import ContractsScreen from '../screens/ContractsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ route }) {
  const onLogout = route.params?.onLogout;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Inbox') {
            iconName = focused ? 'mail' : 'mail-outline';
          } else if (route.name === 'Ops') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Dossier') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1cd188',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: 'monospace',
          fontSize: 10,
          textTransform: 'uppercase',
        }
      })}
    >
      <Tab.Screen name="Inbox" component={ProposalsScreen} />
      <Tab.Screen name="Ops" component={ContractsScreen} />
      <Tab.Screen 
        name="Dossier" 
        component={ProfileScreen} 
        initialParams={{ onLogout }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) setIsAuthenticated(true);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            initialParams={{ onLogin: () => setIsAuthenticated(true) }}
          />
        ) : (
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            initialParams={{ onLogout: () => setIsAuthenticated(false) }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
