import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RideBookingScreen from '../screens/hirer/RideBookingScreen';
import HirerDashboardScreen from '../screens/hirer/HirerDashboardScreen';
import HirerDashboardScreenV2 from '../screens/hirer/HirerDashboardScreenV2';
import PostJobScreen from '../screens/hirer/PostJobScreen';
import HirerBookingsScreen from '../screens/hirer/HirerBookingsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import SearchDriversScreen from '../screens/hirer/SearchDriversScreen';
import HireBookingScreen from '../screens/hirer/HireBookingScreen';
import PlacementPaymentScreen from '../screens/hirer/PlacementPaymentScreen';
import ReportInfractionScreen from '../screens/shared/ReportInfractionScreen';
import ReferralScreen from '../screens/shared/ReferralScreen';
import LoyaltyScreen from '../screens/shared/LoyaltyScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import ConversationsListScreen from '../screens/shared/ConversationsListScreen';
import AppSettingsScreen from '../screens/shared/AppSettingsScreen';
import VipFleetScreen from '../screens/hirer/VipFleetScreen';
import NaijaHirerHomeScreen from '../screens/hirer/NaijaHirerHomeScreen';
import JobDetailsScreen from '../screens/hirer/JobDetailsScreen';
import TermsAndPrivacyScreen from '../screens/shared/TermsAndPrivacyScreen';
import PaymentCardsScreen from '../screens/shared/PaymentCardsScreen';
import InvoicesScreen from '../screens/shared/InvoicesScreen';
import EmergencySosScreen from '../screens/shared/EmergencySosScreen';
import KycVerificationScreen from '../screens/shared/KycVerificationScreen';
import GiftFundsScreen from '../screens/shared/GiftFundsScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="RideBooking">
      <Stack.Screen name="RideBooking" component={RideBookingScreen} />
      <Stack.Screen name="NaijaHirerHome" component={NaijaHirerHomeScreen} />
      <Stack.Screen name="HirerDashboardMain" component={HirerDashboardScreen} />
      <Stack.Screen name="VipFleet" component={VipFleetScreen} />
      <Stack.Screen name="SearchDrivers" component={SearchDriversScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="PlacementPayment" component={PlacementPaymentScreen} />
      <Stack.Screen name="ReportInfraction" component={ReportInfractionScreen} />
      <Stack.Screen name="Referrals" component={ReferralScreen} />
      <Stack.Screen name="HirerBookings" component={HirerBookingsScreen} />
      <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
      <Stack.Screen name="Conversations" component={ConversationsListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="PostJob" component={PostJobScreen} />
      <Stack.Screen name="MyDrivers" component={SearchDriversScreen} />
      <Stack.Screen name="Negotiate" component={RideBookingScreen} />
      <Stack.Screen name="Wallet" component={PlacementPaymentScreen} />
      <Stack.Screen name="TermsAndPrivacy" component={TermsAndPrivacyScreen} />
      <Stack.Screen name="PaymentCards" component={PaymentCardsScreen} />
      <Stack.Screen name="Invoices" component={InvoicesScreen} />
      <Stack.Screen name="EmergencySos" component={EmergencySosScreen} />
      <Stack.Screen name="KycVerification" component={KycVerificationScreen} />
      <Stack.Screen name="GiftFunds" component={GiftFundsScreen} />
    </Stack.Navigator>
  );
}

function AccountStack({ route }) {
  const params = route?.params || {};
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} initialParams={params} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="Referrals" component={ReferralScreen} />
      <Stack.Screen name="HirerBookings" component={HirerBookingsScreen} />
      <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
      <Stack.Screen name="SearchDrivers" component={SearchDriversScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ReportInfraction" component={ReportInfractionScreen} />
      <Stack.Screen name="PlacementPayment" component={PlacementPaymentScreen} />
      <Stack.Screen name="TermsAndPrivacy" component={TermsAndPrivacyScreen} />
      <Stack.Screen name="PaymentCards" component={PaymentCardsScreen} />
      <Stack.Screen name="Invoices" component={InvoicesScreen} />
      <Stack.Screen name="EmergencySos" component={EmergencySosScreen} />
      <Stack.Screen name="KycVerification" component={KycVerificationScreen} />
      <Stack.Screen name="GiftFunds" component={GiftFundsScreen} />
      <Stack.Screen name="PostJob" component={PostJobScreen} />
      <Stack.Screen name="RideBooking" component={RideBookingScreen} />
      <Stack.Screen name="HireBooking" component={HireBookingScreen} />
    </Stack.Navigator>
  );
}

function HireStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="HireBookingMain">
      <Stack.Screen name="HireBookingMain" component={HireBookingScreen} />
      <Stack.Screen name="HirerBookings" component={HirerBookingsScreen} />
      <Stack.Screen name="PostJob" component={PostJobScreen} />
      <Stack.Screen name="VipFleet" component={VipFleetScreen} />
    </Stack.Navigator>
  );
}

export default function HirerNavigator({ route: parentRoute }) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const params = parentRoute?.params || {};

  const activeColor = isDark ? '#10b981' : '#059669';
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
          if (route.name === 'Ride') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Hire') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Account') {
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
          height: Platform.OS === 'ios' ? 56 + bottomInset : (bottomInset > 0 ? 56 + bottomInset : 62),
          paddingBottom: bottomInset > 0 ? bottomInset : (Platform.OS === 'ios' ? 24 : 8),
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="Ride" component={HomeStack} />
      <Tab.Screen name="Hire" component={HireStack} />
      <Tab.Screen name="Bookings" component={HirerBookingsScreen} />
      <Tab.Screen name="Account" component={AccountStack} initialParams={params} />
    </Tab.Navigator>
  );
}
