import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

import DriverProfileScreen from '../screens/driver/DriverProfileScreen';
import DriverJobsScreen from '../screens/driver/DriverJobsScreen';
import DriverWalletScreen from '../screens/driver/DriverWalletScreen';
import DriverDocumentsScreen from '../screens/driver/DriverDocumentsScreen';
import JobDetailsScreen from '../screens/hirer/JobDetailsScreen';
import DriverSettingsScreen from '../screens/driver/DriverSettingsScreen';
import DriverAssessmentScreen from '../screens/driver/DriverAssessmentScreen';
import VehicleInspectionScreen from '../screens/driver/VehicleInspectionScreen';
import ReferralScreen from '../screens/shared/ReferralScreen';
import EarningsScreen from '../screens/driver/EarningsScreen';
import LoyaltyScreen from '../screens/shared/LoyaltyScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import ConversationsListScreen from '../screens/shared/ConversationsListScreen';
import AppSettingsScreen from '../screens/shared/AppSettingsScreen';
import InstantCashoutScreen from '../screens/driver/InstantCashoutScreen';
import EmergencySosScreen from '../screens/shared/EmergencySosScreen';
import OgaCopilotScreen from '../screens/driver/OgaCopilotScreen';
import WeeklySprintScreen from '../screens/driver/WeeklySprintScreen';
import PerkQrScreen from '../screens/shared/PerkQrScreen';
import ScheduleScreen from '../screens/driver/ScheduleScreen';
import SearchDriversScreen from '../screens/hirer/SearchDriversScreen';
import ProposalsScreen from '../screens/driver/ProposalsScreen';
import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import NaijaDriverHomeScreen from '../screens/driver/NaijaDriverHomeScreen';
import BoostProfileScreen from '../screens/driver/BoostProfileScreen';
import InstantFuelLoanScreen from '../screens/driver/InstantFuelLoanScreen';
import MyDestinationScreen from '../screens/driver/MyDestinationScreen';
import TripSimulationScreen from '../screens/driver/TripSimulationScreen';
import DriverSubscriptionScreen from '../screens/driver/DriverSubscriptionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={NaijaDriverHomeScreen} />
      <Stack.Screen name="DriverSubscription" component={DriverSubscriptionScreen} />
      <Stack.Screen name="InstantCashout" component={InstantCashoutScreen} />
      <Stack.Screen name="InstantFuelLoan" component={InstantFuelLoanScreen} />
      <Stack.Screen name="MyDestination" component={MyDestinationScreen} />
      <Stack.Screen name="TripSimulation" component={TripSimulationScreen} />
      <Stack.Screen name="BoostProfile" component={BoostProfileScreen} />
      <Stack.Screen name="EmergencySos" component={EmergencySosScreen} />
      <Stack.Screen name="OgaCopilot" component={OgaCopilotScreen} />
      <Stack.Screen name="WeeklySprint" component={WeeklySprintScreen} />
      <Stack.Screen name="PerkQr" component={PerkQrScreen} />
      <Stack.Screen name="DriverWallet" component={DriverWalletScreen} />
      <Stack.Screen name="DriverAssessment" component={DriverAssessmentScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="VehicleInspection" component={VehicleInspectionScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
      <Stack.Screen name="Conversations" component={ConversationsListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Proposals" component={ProposalsScreen} />
      <Stack.Screen name="SearchDrivers" component={SearchDriversScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
    </Stack.Navigator>
  );
}

function AccountStack({ route }) {
  const params = route?.params || {};
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverProfileMain" component={DriverProfileScreen} initialParams={params} />
      <Stack.Screen name="DriverSubscription" component={DriverSubscriptionScreen} />
      <Stack.Screen name="BoostProfile" component={BoostProfileScreen} />
      <Stack.Screen name="InstantFuelLoan" component={InstantFuelLoanScreen} />
      <Stack.Screen name="MyDestination" component={MyDestinationScreen} />
      <Stack.Screen name="TripSimulation" component={TripSimulationScreen} />
      <Stack.Screen name="DriverAssessment" component={DriverAssessmentScreen} />
      <Stack.Screen name="DriverSettings" component={DriverSettingsScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="DriverDocuments" component={DriverDocumentsScreen} />
      <Stack.Screen name="Referrals" component={ReferralScreen} />
    
      <Stack.Screen name="PerkQr" component={PerkQrScreen} />
      <Stack.Screen name="DriverWallet" component={DriverWalletScreen} />
      <Stack.Screen name="VehicleInspection" component={VehicleInspectionScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="Conversations" component={ConversationsListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

export default function DriverNavigator({ route: parentRoute }) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const params = parentRoute?.params || {};

  const activeColor = isDark ? '#00e588' : '#059669';
  const inactiveColor = isDark ? '#64748b' : '#94a3b8';
  const tabBg = isDark ? '#090d16' : '#ffffff';
  const tabBorder = isDark ? '#1e293b' : '#e2e8f0';

  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 24 : 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Jobs') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopWidth: 1,
          borderTopColor: tabBorder,
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
          fontSize: 10,
          fontWeight: 'normal',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Jobs" component={DriverJobsScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={AccountStack} initialParams={params} />
    </Tab.Navigator>
  );
}
