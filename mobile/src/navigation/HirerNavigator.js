import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HirerDashboardScreen from '../screens/HirerDashboardScreen';
import HirerDashboardScreenV2 from '../screens/HirerDashboardScreenV2';
import PostJobScreen from '../screens/PostJobScreen';
import HirerBookingsScreen from '../screens/HirerBookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchDriversScreen from '../screens/SearchDriversScreen';
import PlacementPaymentScreen from '../screens/PlacementPaymentScreen';
import ReportInfractionScreen from '../screens/ReportInfractionScreen';
import ReferralScreen from '../screens/ReferralScreen';
import LoyaltyScreen from '../screens/LoyaltyScreen';
import ChatScreen from '../screens/ChatScreen';
import ConversationsListScreen from '../screens/ConversationsListScreen';
import AppSettingsScreen from '../screens/AppSettingsScreen';
import VipFleetScreen from '../screens/VipFleetScreen';
import NaijaHirerHomeScreen from '../screens/NaijaHirerHomeScreen';

const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HirerDashboardMain" component={HirerDashboardScreen} />
      <Stack.Screen name="VipFleet" component={VipFleetScreen} />
      <Stack.Screen name="SearchDrivers" component={SearchDriversScreen} />
      <Stack.Screen name="PlacementPayment" component={PlacementPaymentScreen} />
      <Stack.Screen name="ReportInfraction" component={ReportInfractionScreen} />
      <Stack.Screen name="Referrals" component={ReferralScreen} />
      <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
      <Stack.Screen name="Conversations" component={ConversationsListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="PostJob" component={PostJobScreen} />
      <Stack.Screen name="HirerBookings" component={HirerBookingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default function HirerNavigator() {
  return <HomeStack />;
}
