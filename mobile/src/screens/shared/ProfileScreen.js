import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
  Switch,
  Modal,
  TextInput,
  Platform,
  Share,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService, api } from '../../api/api';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import MapLocationPickerModal from '../../components/MapLocationPickerModal';
import { useTheme } from '../../context/ThemeContext';
import { useCountry } from '../../context/CountryContext';
import loyaltyService from '../../services/loyaltyService';

const Storage = {
  getItemAsync: async (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
  setItemAsync: async (key, val) => {
    if (Platform.OS === 'web') return localStorage.setItem(key, val);
    return await SecureStore.setItemAsync(key, val);
  },
  deleteItemAsync: async (key) => {
    if (Platform.OS === 'web') return localStorage.removeItem(key);
    return await SecureStore.deleteItemAsync(key);
  }
};

export default function ProfileScreen({ navigation, route }) {
  const onLogout = route.params?.onLogout;
  const { isDark, themeMode, updateThemeMode, themeColors } = useTheme();

  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Financial & Wallet State for Paying Clients
  const [walletBalance, setWalletBalance] = useState(145000);
  const [monthlySpend, setMonthlySpend] = useState(85000);
  const [userPoints, setUserPoints] = useState(1250);
  const [addFundsVisible, setAddFundsVisible] = useState(false);
  const [fundAmount, setFundAmount] = useState('25000');
  const [conciergeModalVisible, setConciergeModalVisible] = useState(false);

  // Client Preferences
  const [ridePref, setRidePref] = useState(true);
  const [tripPref, setTripPref] = useState(false);
  const [corporateAccount, setCorporateAccount] = useState(true);

  // Saved Places State
  const [homeAddress, setHomeAddress] = useState('Victoria Island, Lagos');
  const [workAddress, setWorkAddress] = useState('Ikoyi Commercial Hub, Lagos');
  const [airportAddress, setAirportAddress] = useState('Murtala Muhammed Int’l Airport (MM2)');
  const [customPlaces, setCustomPlaces] = useState([]);
  const [addPlaceModalVisible, setAddPlaceModalVisible] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingPlaceType, setEditingPlaceType] = useState('home');

  // Edit Profile Modal State
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [companyName, setCompanyName] = useState('Apex Global Enterprises');

  // Country & Currency Selector (Global Country System)
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const { country: selectedCountry, updateCountry, supportedCountries } = useCountry();

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Please enable gallery access to choose an avatar.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEditAvatar(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Avatar Error', 'Could not open photo library.');
    }
  };

  const fetchProfile = async () => {
    try {
      const u = await authService.getUser();
      if (u) {
        setUser(u);
        setEditName(u.name || '');
        setEditPhone(u.phone || '');
        setEditEmail(u.email || '');
        setEditAvatar(u.avatar || null);
      }

      const savedStr = await Storage.getItemAsync('saved_places');
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (parsed.home) setHomeAddress(parsed.home);
        if (parsed.work) setWorkAddress(parsed.work);
        if (parsed.airport) setAirportAddress(parsed.airport);
        if (parsed.custom && Array.isArray(parsed.custom)) setCustomPlaces(parsed.custom);
      }

      const savedCountry = await Storage.getItemAsync('client_country_settings');
      if (savedCountry) {
        setSelectedCountry(JSON.parse(savedCountry));
      }

      const storedKyc = await Storage.getItemAsync('client_kyc_data');
      if (storedKyc) {
        setKycData(JSON.parse(storedKyc));
      }

      const pts = await loyaltyService.getPoints();
      setUserPoints(pts);
    } catch (e) {
      console.log('Error fetching client profile:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
  };

  const handleOpenEditPlace = (type) => {
    setEditingPlaceType(type);
    setPickerVisible(true);
  };

  const handleSavePlace = async ({ type, address }) => {
    const updated = {
      home: type === 'home' ? address : homeAddress,
      work: type === 'work' ? address : workAddress,
      airport: type === 'airport' ? address : airportAddress,
      custom: customPlaces,
    };

    if (type === 'home') setHomeAddress(address);
    if (type === 'work') setWorkAddress(address);
    if (type === 'airport') setAirportAddress(address);

    try {
      await Storage.setItemAsync('saved_places', JSON.stringify(updated));
      await api.post('/v1/user/saved-places', updated).catch(() => {});
      Alert.alert('Saved Place Updated', `${type.toUpperCase()} location has been saved.`);
    } catch (e) {
      console.log('Error saving place:', e);
    }
  };

  const handleAddCustomPlaceConfirm = async () => {
    if (!newPlaceName.trim()) {
      Alert.alert('Place Name Required', 'Please enter a name for this place (e.g., Mom’s House, Gym, Branch Office).');
      return;
    }
    if (!newPlaceAddress.trim()) {
      Alert.alert('Address Required', 'Please provide the street address or location description.');
      return;
    }

    const newPlace = {
      id: Date.now().toString(),
      name: newPlaceName.trim(),
      address: newPlaceAddress.trim(),
    };

    const updatedCustom = [...customPlaces, newPlace];
    setCustomPlaces(updatedCustom);
    setAddPlaceModalVisible(false);
    setNewPlaceName('');
    setNewPlaceAddress('');

    const fullSaved = {
      home: homeAddress,
      work: workAddress,
      airport: airportAddress,
      custom: updatedCustom,
    };

    try {
      await Storage.setItemAsync('saved_places', JSON.stringify(fullSaved));
      await api.post('/v1/user/saved-places', fullSaved).catch(() => {});
      Alert.alert('Place Added', `"${newPlace.name}" has been saved for 1-tap quick booking.`);
    } catch (e) {
      console.log('Error saving custom place:', e);
    }
  };

  const handleDeleteCustomPlace = (placeId, placeName) => {
    Alert.alert(
      'Remove Place',
      `Delete "${placeName}" from your saved places?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedCustom = customPlaces.filter((p) => p.id !== placeId);
            setCustomPlaces(updatedCustom);
            const fullSaved = {
              home: homeAddress,
              work: workAddress,
              airport: airportAddress,
              custom: updatedCustom,
            };
            await Storage.setItemAsync('saved_places', JSON.stringify(fullSaved));
          },
        },
      ]
    );
  };

  const handleDeletePlace = (type) => {
    Alert.alert(
      'Remove Location',
      `Clear saved location for ${type === 'home' ? 'Home' : type === 'work' ? 'Work / Office' : 'Airport'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = {
              home: type === 'home' ? 'Not set' : homeAddress,
              work: type === 'work' ? 'Not set' : workAddress,
              airport: type === 'airport' ? 'Not set' : airportAddress,
              custom: customPlaces,
            };
            if (type === 'home') setHomeAddress('Not set');
            if (type === 'work') setWorkAddress('Not set');
            if (type === 'airport') setAirportAddress('Not set');
            await Storage.setItemAsync('saved_places', JSON.stringify(updated));
          },
        },
      ]
    );
  };

  const handleSaveProfileChanges = async () => {
    try {
      const cleanPhone = editPhone.trim();
      if (!cleanPhone || cleanPhone.length < 10) {
        Alert.alert(
          'Valid Phone Required',
          'A verified telephone number is mandatory to bind your client identity and prevent multiple account creation.'
        );
        return;
      }
      if (!editName.trim()) {
        Alert.alert('Name Required', 'Please enter your full name.');
        return;
      }

      const updatedUser = {
        ...user,
        name: editName.trim(),
        phone: cleanPhone,
        avatar: editAvatar || user?.avatar,
      };

      setUser(updatedUser);
      await authService.updateUser(updatedUser).catch(() => {});
      await Storage.setItemAsync('custom_user_profile', JSON.stringify(updatedUser));
      setEditProfileVisible(false);
      Alert.alert('Profile Saved', 'Your profile details and avatar have been successfully updated.');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile information.');
    }
  };

  const handleAddFundsConfirm = () => {
    const amountNum = parseInt(fundAmount, 10) || 0;
    if (amountNum < 1000) {
      Alert.alert('Minimum Deposit', 'Minimum wallet top-up is ₦1,000.');
      return;
    }
    setWalletBalance((prev) => prev + amountNum);
    setAddFundsVisible(false);
    Alert.alert(
      'Wallet Credited',
      `₦${amountNum.toLocaleString()} added to your OgaDriver client wallet.`
    );
  };

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: `Use my OgaDriver Client Invite Code OGA-CLIENT-77 to get ₦2,000 bonus on your first verified ride or driver hire! Download at https://ogadriver.ng`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your client account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
          } catch (e) {}
          if (onLogout) onLogout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone. All your profile data, bookings, and saved preferences will be permanently erased.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await authService.deleteAccount();
              Alert.alert('Account Deleted', res?.message || 'Your account has been deleted successfully.');
              if (onLogout) onLogout();
            } catch (err) {
              const msg = err.response?.data?.message || err.message || 'Failed to delete account. Please ensure all active bookings are resolved first.';
              Alert.alert('Unable to Delete Account', msg);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090d16' : '#ffffff' }}>
      {/* Top Standard App Bar */}
      <View
        style={{
          backgroundColor: isDark ? '#090d16' : '#ffffff',
          borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="flex-row justify-between items-center px-4 py-3 border-b"
      >
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-xl bg-emerald-500 items-center justify-center mr-3 shadow-md shadow-emerald-500/20">
            <Ionicons name="person" size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-lg tracking-tight">
              Client Account
            </Text>
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] font-normal">
              Employer & Passenger Portal
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          {/* Country Flag Pill */}
          <TouchableOpacity
            onPress={() => setCountryModalVisible(true)}
            style={{
              backgroundColor: isDark ? '#121927' : '#f1f5f9',
              borderColor: isDark ? '#1e293b' : '#cbd5e1',
            }}
            className="flex-row items-center px-2.5 py-1.5 rounded-xl border mr-1"
          >
            <Text className="text-sm mr-1">{selectedCountry.flag}</Text>
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs">
              {selectedCountry.currency}
            </Text>
          </TouchableOpacity>

          {/* Theme Quick Toggle */}
          <TouchableOpacity
            onPress={() => updateThemeMode(isDark ? 'light' : 'dark')}
            style={{
              backgroundColor: isDark ? '#121927' : '#f1f5f9',
              borderColor: isDark ? '#1e293b' : '#cbd5e1',
            }}
            className="p-2 rounded-xl border"
          >
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={16} color={isDark ? '#fbbf24' : '#64748b'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4 pb-12"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
      >
        {/* 1. CLIENT IDENTITY CARD */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="border rounded-3xl p-5 mb-5 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center space-x-3.5 flex-1">
              <TouchableOpacity
                onPress={() => setEditProfileVisible(true)}
                activeOpacity={0.8}
                className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500 items-center justify-center overflow-hidden relative"
              >
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} className="w-full h-full" />
                ) : (
                  <Text className="text-emerald-500 font-black text-2xl">
                    {(user?.name || 'Oga')[0].toUpperCase()}
                  </Text>
                )}
                <View className="absolute bottom-0 right-0 bg-emerald-500 rounded-tl-lg p-0.5">
                  <Ionicons name="pencil" size={10} color="#ffffff" />
                </View>
              </TouchableOpacity>

              <View className="flex-1">
                <View className="flex-row items-center space-x-1.5">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-lg tracking-tight" numberOfLines={1}>
                    {user?.name || 'Oga Babatunde'}
                  </Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <TouchableOpacity
                    onPress={() => navigation.navigate('KycVerification')}
                    className="bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex-row items-center mr-2"
                  >
                    <Ionicons name="checkmark-circle" size={10} color="#10b981" style={{ marginRight: 2 }} />
                    <Text className="text-emerald-500 font-black text-[9px] uppercase tracking-wider">
                      {kycData?.status === 'verified' ? 'Tier 2 KYC' : 'Verify KYC'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] font-medium">
                    Corporate Account
                  </Text>
                </View>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mt-1">
                  {user?.phone || '+234 803 123 4567'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setEditProfileVisible(true)}
              style={{
                backgroundColor: isDark ? '#1a2333' : '#f1f5f9',
                borderColor: isDark ? '#1e293b' : '#cbd5e1',
              }}
              className="p-2.5 rounded-xl border"
            >
              <Ionicons name="pencil" size={16} color="#10b981" />
            </TouchableOpacity>
          </View>

          {/* Quick Stats Pill Bar */}
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#f8fafc',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="flex-row justify-between items-center p-3 rounded-2xl border"
          >
            <View className="items-center flex-1 border-r border-slate-700/20">
              <Text className="text-emerald-500 font-black text-base">4.9 ★</Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-bold uppercase mt-0.5">
                Client Rating
              </Text>
            </View>

            <View className="items-center flex-1 border-r border-slate-700/20">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-black text-base">
                28
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-bold uppercase mt-0.5">
                Total Trips
              </Text>
            </View>

            <View className="items-center flex-1">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-black text-base">
                3
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-bold uppercase mt-0.5">
                Drivers Hired
              </Text>
            </View>
          </View>
        </View>

        {/* 2. THE MONEY HUB: CLIENT WALLET & BILLING (FOR THOSE WHO PAY) */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#052e16',
            borderColor: isDark ? '#1e293b' : '#0a5c25',
          }}
          className="border rounded-3xl p-5 mb-5 shadow-xl"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="wallet-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={{ color: '#ffffff' }} className="font-normal text-xs uppercase tracking-wider">
                Prepaid Wallet
              </Text>
            </View>
            <View className="bg-white/20 px-2 py-0.5 rounded-md border border-white/30">
              <Text style={{ color: '#ffffff' }} className="font-black text-[10px] uppercase">Instant Pay</Text>
            </View>
          </View>

          {/* Balance Amount */}
          <Text style={{ color: '#ffffff' }} className="font-black text-3xl tracking-tight mb-1">
            ₦{walletBalance.toLocaleString()}
          </Text>
          <Text style={{ color: '#ffffff' }} className="text-xs mb-4 opacity-90">
            Spend this month: ₦{monthlySpend.toLocaleString()} • 0% transaction surcharges
          </Text>

          {/* 3 Action Buttons for Wallet */}
          <View className="flex-row space-x-2.5">
            <TouchableOpacity
              onPress={() => setAddFundsVisible(true)}
              className="flex-1 py-3 rounded-xl bg-emerald-500 active:bg-emerald-600 items-center justify-center flex-row shadow-sm"
            >
              <Ionicons name="add-circle" size={16} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={{ color: '#ffffff' }} className="font-black text-xs uppercase">Add Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('PaymentCards')}
              className="flex-1 py-3 rounded-xl bg-white/10 active:bg-white/20 items-center justify-center border border-white/20 flex-row"
            >
              <Ionicons name="card-outline" size={16} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={{ color: '#ffffff' }} className="font-bold text-xs">Cards</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Invoices')}
              className="flex-1 py-3 rounded-xl bg-white/10 active:bg-white/20 items-center justify-center border border-white/20 flex-row"
            >
              <Ionicons name="document-text-outline" size={16} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={{ color: '#ffffff' }} className="font-bold text-xs">Invoices</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. DEDICATED "MY BOOKINGS" SECTION (Moved from bottom Nav to Account as NEW) */}
        <View className="mb-4">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('HirerBookings')}
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mr-3">
                <Ionicons name="calendar" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm mr-2">
                    My Bookings
                  </Text>
                  <View className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    <Text className="text-[9px] font-normal uppercase text-emerald-500">NEW</Text>
                  </View>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </View>

        {/* Secondary Account Shortcuts (Browse Drivers, Referrals, Loyalty) */}
        <View className="flex-row space-x-2.5 mb-5">
          <TouchableOpacity
            className="flex-1"
            onPress={() => navigation.navigate('SearchDrivers')}
          >
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="border rounded-2xl p-3 items-center shadow-sm"
            >
              <View 
                style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5', borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0' }}
                className="w-10 h-10 rounded-xl border items-center justify-center mb-1.5"
              >
                <Ionicons name="people" size={19} color="#10b981" />
              </View>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                Drivers
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1"
            onPress={() => navigation.navigate('GiftFunds')}
          >
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="border rounded-2xl p-3 items-center shadow-sm"
            >
              <View 
                style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5', borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0' }}
                className="w-10 h-10 rounded-xl border items-center justify-center mb-1.5"
              >
                <Ionicons name="gift" size={19} color="#10b981" />
              </View>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                Gift Funds
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1"
            onPress={() => navigation.navigate('Loyalty')}
          >
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="border rounded-2xl p-3 items-center shadow-sm"
            >
              <View 
                style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5', borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0' }}
                className="w-10 h-10 rounded-xl border items-center justify-center mb-1.5"
              >
                <Ionicons name="star" size={19} color="#10b981" />
              </View>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                OgaPoints
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. SAVED PLACES (WITH MAP LOCATION PICKER MODAL & ADD NEW BTN) */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-2.5 px-1">
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm tracking-tight">
              Saved Places
            </Text>
            <TouchableOpacity
              onPress={() => setAddPlaceModalVisible(true)}
              className="flex-row items-center bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl"
            >
              <Ionicons name="add-circle" size={14} color="#10b981" style={{ marginRight: 4 }} />
              <Text className="text-emerald-500 font-normal text-xs">Add New Place</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-3xl p-4 shadow-sm"
          >
            {/* Home Address */}
            <View className="flex-row items-center justify-between border-b border-slate-700/20 pb-3 mb-3">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-9 h-9 rounded-xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/20">
                  <Ionicons name="home-outline" size={18} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                    My Home
                  </Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px]" numberOfLines={1}>
                    {homeAddress}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => handleOpenEditPlace('home')} className="p-2 mr-1 bg-emerald-500/10 rounded-lg">
                  <Ionicons name="create-outline" size={15} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePlace('home')} className="p-2 bg-red-500/10 rounded-lg">
                  <Ionicons name="trash-outline" size={15} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Work / Office Address */}
            <View className="flex-row items-center justify-between border-b border-slate-700/20 pb-3 mb-3">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-9 h-9 rounded-xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/20">
                  <Ionicons name="briefcase-outline" size={18} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                    Work / Office
                  </Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px]" numberOfLines={1}>
                    {workAddress}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => handleOpenEditPlace('work')} className="p-2 mr-1 bg-emerald-500/10 rounded-lg">
                  <Ionicons name="create-outline" size={15} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePlace('work')} className="p-2 bg-red-500/10 rounded-lg">
                  <Ionicons name="trash-outline" size={15} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Airport Terminal */}
            <View className={`flex-row items-center justify-between ${customPlaces.length > 0 ? 'border-b border-slate-700/20 pb-3 mb-3' : ''}`}>
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-9 h-9 rounded-xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/20">
                  <Ionicons name="airplane-outline" size={18} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                    Airport Terminal
                  </Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px]" numberOfLines={1}>
                    {airportAddress}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => handleOpenEditPlace('airport')} className="p-2 mr-1 bg-emerald-500/10 rounded-lg">
                  <Ionicons name="create-outline" size={15} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePlace('airport')} className="p-2 bg-red-500/10 rounded-lg">
                  <Ionicons name="trash-outline" size={15} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Dynamic Custom Added Places */}
            {customPlaces.map((cp, idx) => (
              <View
                key={cp.id}
                className={`flex-row items-center justify-between ${idx !== customPlaces.length - 1 ? 'border-b border-slate-700/20 pb-3 mb-3' : 'pt-1'}`}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-9 h-9 rounded-xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/20">
                    <Ionicons name="location-outline" size={18} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                      {cp.name}
                    </Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px]" numberOfLines={1}>
                      {cp.address}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => handleDeleteCustomPlace(cp.id, cp.name)}
                    className="p-2 bg-red-500/10 rounded-lg"
                  >
                    <Ionicons name="trash-outline" size={15} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 5. CLIENT & RIDE PREFERENCES (FLEXIBLE OPTIONS) */}
        <View className="mb-5">
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm tracking-tight mb-2.5 px-1">
            Trip & Chauffeur Preferences
          </Text>

          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-3xl p-4 shadow-sm"
          >
            <View className="flex-row items-center justify-between border-b border-slate-700/20 pb-3 mb-3">
              <View className="flex-1 pr-3">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                  Quiet Ride Preferred
                </Text>
              </View>
              <Switch
                value={ridePref}
                onValueChange={setRidePref}
                trackColor={{ false: '#475569', true: '#10b981' }}
              />
            </View>

            <View className="flex-row items-center justify-between border-b border-slate-700/20 pb-3 mb-3">
              <View className="flex-1 pr-3">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                  Auto-Share Live Trip Status
                </Text>
              </View>
              <Switch
                value={tripPref}
                onValueChange={setTripPref}
                trackColor={{ false: '#475569', true: '#10b981' }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                  Corporate Business Account
                </Text>
              </View>
              <Switch
                value={corporateAccount}
                onValueChange={setCorporateAccount}
                trackColor={{ false: '#475569', true: '#10b981' }}
              />
            </View>
          </View>
        </View>

        {/* 6. RAPID SOS EMERGENCY CARD */}
        <TouchableOpacity
          className="bg-red-500/10 border-2 border-red-500 rounded-3xl p-4 mb-5 flex-row items-center justify-between shadow-lg shadow-red-500/10"
          activeOpacity={0.85}
          onPress={() => navigation.navigate('EmergencySos')}
        >
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-10 h-10 rounded-2xl bg-red-500/20 items-center justify-center mr-3 border border-red-500/30">
              <Ionicons name="warning" size={20} color="#ef4444" />
            </View>
            <View>
              <Text className="text-red-500 font-normal text-sm tracking-wider uppercase">
                Emergency SOS Dispatch
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ef4444" />
        </TouchableOpacity>

        {/* 7. SETTINGS, SECURITY & CLIENT GOVERNANCE */}
        <View className="mb-6">
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm tracking-tight mb-2.5 px-1">
            Security & Client Support
          </Text>

          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-3xl overflow-hidden shadow-sm"
          >
            {/* KYC & Identity Verification Menu Item */}
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-slate-700/20"
              onPress={() => navigation.navigate('KycVerification')}
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-9 h-9 rounded-xl bg-emerald-500/15 items-center justify-center mr-3 border border-emerald-500/30">
                  <Ionicons name="shield-checkmark" size={18} color="#10b981" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs">
                      KYC & Identity Verification
                    </Text>
                    <View className="ml-2 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      <Text className="text-emerald-500 font-black text-[8px] uppercase">
                        {kycData?.status === 'verified' ? 'Tier 2 Certified' : 'Action Needed'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-slate-700/20"
              onPress={() => navigation.navigate('AppSettings')}
            >
              <View className="flex-row items-center">
                <Ionicons name="shield-checkmark-outline" size={18} color="#10b981" />
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs ml-3">
                  App Lock & Biometric PIN
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-slate-700/20"
              onPress={() => setConciergeModalVisible(true)}
            >
              <View className="flex-row items-center">
                <Ionicons name="headset-outline" size={18} color="#10b981" />
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs ml-3">
                  24/7 Client Concierge Hotline
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => navigation.navigate('TermsAndPrivacy')}
            >
              <View className="flex-row items-center">
                <Ionicons name="document-text-outline" size={18} color="#10b981" />
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs ml-3">
                  Terms of Service & Privacy
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 8. SIGN OUT BUTTON */}
        <TouchableOpacity
          style={{
            backgroundColor: isDark ? '#121927' : '#fef2f2',
            borderColor: '#fca5a5',
          }}
          className="border py-3.5 rounded-2xl flex-row items-center justify-center mb-4 active:opacity-80"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text className="text-red-500 font-normal text-xs uppercase tracking-wider ml-2">
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* 9. DELETE ACCOUNT (Apple App Store & Google Play Requirement) */}
        <TouchableOpacity
          style={{
            backgroundColor: 'transparent',
            borderColor: isDark ? '#334155' : '#e2e8f0',
          }}
          className="border py-3 rounded-2xl flex-row items-center justify-center mb-8 active:opacity-80"
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={16} color="#94a3b8" />
          <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="font-normal text-xs uppercase tracking-wider ml-2">
            Delete Account
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL 1: ADD FUNDS / WALLET TOP-UP */}
      <Modal visible={addFundsVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="rounded-t-3xl p-6 border-t"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-normal tracking-tight">
                Top Up Client Wallet
              </Text>
              <TouchableOpacity onPress={() => setAddFundsVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-3">
              Funds are instantly available for Ride hailing, Driver hires, and corporate packages.
            </Text>

            {/* Quick Amount Chips */}
            <View className="flex-row space-x-2 mb-4">
              {[10000, 25000, 50000, 100000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setFundAmount(amt.toString())}
                  style={{
                    backgroundColor: fundAmount === amt.toString() ? '#10b981' : isDark ? '#121927' : '#f1f5f9',
                    borderColor: fundAmount === amt.toString() ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="flex-1 py-2.5 rounded-xl border items-center justify-center"
                >
                  <Text
                    style={{ color: fundAmount === amt.toString() ? '#ffffff' : isDark ? '#ffffff' : '#0f172a' }}
                    className="font-black text-xs"
                  >
                    ₦{(amt / 1000).toFixed(0)}k
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Amount Input */}
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#f8fafc',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="flex-row items-center border rounded-2xl px-4 py-3 mb-4"
            >
              <Text className="text-emerald-500 font-black text-lg mr-2">₦</Text>
              <TextInput
                keyboardType="numeric"
                value={fundAmount}
                onChangeText={setFundAmount}
                placeholder="Enter deposit amount"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                className="flex-1 font-black text-lg"
              />
            </View>

            {/* Bank Transfer Details Fallback */}
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#f0fdf4',
                borderColor: isDark ? '#1e293b' : '#bbf7d0',
              }}
              className="p-3.5 rounded-2xl border mb-6"
            >
              <Text style={{ color: isDark ? '#34d399' : '#166534' }} className="font-bold text-xs mb-1">
                Virtual Dedicated Account:
              </Text>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-mono text-xs font-bold">
                Wema Bank • 9900223344 • OgaDriver - {user?.name || 'Client'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleAddFundsConfirm}
              className="w-full py-4 rounded-2xl bg-emerald-500 active:bg-emerald-600 items-center justify-center shadow-lg shadow-emerald-500/20"
            >
              <Text className="text-white font-black text-sm uppercase tracking-wider">
                Proceed with Payment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: EDIT PROFILE INFORMATION */}
      <Modal visible={editProfileVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="rounded-t-3xl p-6 border-t"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-normal tracking-tight">
                Edit Profile
              </Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80vh]">
              {/* Avatar Changer Section */}
              <View className="items-center mb-5">
                <TouchableOpacity
                  onPress={handlePickAvatar}
                  activeOpacity={0.8}
                  className="relative"
                >
                  <View className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 items-center justify-center overflow-hidden">
                    {editAvatar || user?.avatar ? (
                      <Image
                        source={{ uri: editAvatar || user.avatar }}
                        className="w-full h-full"
                      />
                    ) : (
                      <Text className="text-emerald-500 font-black text-3xl">
                        {(editName || user?.name || 'O')[0].toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 items-center justify-center shadow-md">
                    <Ionicons name="camera" size={14} color="#ffffff" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handlePickAvatar} className="mt-2">
                  <Text className="text-emerald-500 font-bold text-xs">
                    Change Profile Avatar
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="space-y-3.5 mb-6">
                {/* 1. Full Name */}
                <View
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="border rounded-2xl px-3.5 py-2.5"
                >
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase font-bold mb-0.5">
                    Full Legal Name / Title *
                  </Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="e.g. Babatunde Adeyemi"
                    placeholderTextColor="#94a3b8"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    className="text-xs font-semibold"
                  />
                </View>

                {/* 2. Phone Number with Anti-Duplicate Notice */}
                <View
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="border rounded-2xl px-3.5 py-2.5"
                >
                  <View className="flex-row items-center justify-between mb-0.5">
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase font-bold">
                      Phone Number *
                    </Text>
                    <View className="bg-emerald-500/15 px-1.5 py-0.2 rounded">
                      <Text className="text-emerald-500 font-bold text-[9px]">Verified ID</Text>
                    </View>
                  </View>
                  <TextInput
                    value={editPhone}
                    onChangeText={setEditPhone}
                    keyboardType="phone-pad"
                    placeholder="+234 803 123 4567"
                    placeholderTextColor="#94a3b8"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    className="text-xs font-semibold"
                  />
                  <Text style={{ color: isDark ? '#64748b' : '#94a3b8' }} className="text-[9px] mt-1 leading-3">
                    Unique verified phone line. Multiple user account registration with identical phone numbers is prohibited.
                  </Text>
                </View>

                {/* 3. Email Address (Locked / Immutable once registered) */}
                <View
                  style={{
                    backgroundColor: isDark ? '#0d131f' : '#f1f5f9',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="border rounded-2xl px-3.5 py-2.5 opacity-90"
                >
                  <View className="flex-row items-center justify-between mb-0.5">
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase font-bold">
                      Registered Email Address
                    </Text>
                    <View className="flex-row items-center bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      <Ionicons name="lock-closed" size={10} color="#64748b" style={{ marginRight: 2 }} />
                      <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="font-bold text-[8px] uppercase">
                        Locked
                      </Text>
                    </View>
                  </View>
                  <TextInput
                    value={editEmail || user?.email || 'client@ogadriver.ng'}
                    editable={false}
                    keyboardType="email-address"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                    className="text-xs font-medium"
                  />
                  <Text style={{ color: isDark ? '#64748b' : '#94a3b8' }} className="text-[9px] mt-1 leading-3">
                    Registered email is bound to your account and cannot be modified after registration.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSaveProfileChanges}
                className="w-full py-4 rounded-2xl bg-emerald-500 active:bg-emerald-600 items-center justify-center shadow-lg mb-4"
              >
                <Text className="text-white font-black text-sm uppercase tracking-wider">
                  Save Profile
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: COUNTRY & CURRENCY SELECTOR */}
      <Modal visible={countryModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="rounded-t-3xl p-6 border-t"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-normal tracking-tight">
                Select Country & Currency
              </Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-4">
              Choose your operating region and preferred billing currency:
            </Text>

            <View className="space-y-2 mb-6">
              {supportedCountries.map((c) => {
                const isSelected = selectedCountry.code === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => {
                      updateCountry(c);
                      setCountryModalVisible(false);
                      Alert.alert('Operating Country Set', `System operating country set to ${c.name} (${c.currency} ${c.symbol}).`);
                    }}
                    style={{
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(16,185,129,0.12)'
                          : '#ecfdf5'
                        : isDark
                        ? '#121927'
                        : '#ffffff',
                      borderColor: isSelected ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                      borderWidth: isSelected ? 2 : 1,
                    }}
                    className="p-3.5 rounded-2xl flex-row items-center justify-between shadow-sm mb-2"
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{c.flag}</Text>
                      <View>
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                          {c.name}
                        </Text>
                        <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px]">
                          {c.dialCode} • {c.currency} ({c.symbol})
                        </Text>
                      </View>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={18} color="#10b981" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: 24/7 VIP CLIENT CONCIERGE HOTLINE */}
      <Modal visible={conciergeModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-end">
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="rounded-t-3xl p-6 border-t"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/30">
                  <Ionicons name="headset" size={22} color="#10b981" />
                </View>
                <View>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-normal tracking-tight">
                    Client Concierge Desk
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                    <Text className="text-emerald-500 font-bold text-[11px]">
                      Active 24/7 • Avg. Response &lt; 45s
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setConciergeModalVisible(false)} className="p-1">
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-5 leading-5">
              Dedicated high-priority dispatch, chauffeur assistance, emergency routing, and billing dispute resolution.
            </Text>

            {/* Concierge Channels */}
            <View className="space-y-3 mb-6">
              {/* Channel 1: Direct Toll-Free Phone Call */}
              <TouchableOpacity
                onPress={() => {
                  setConciergeModalVisible(false);
                  Linking.openURL('tel:+2348006423748').catch(() =>
                    Alert.alert('Phone Dial Error', 'Could not launch dialer for +234 800-OGA-HELP')
                  );
                }}
                className="p-4 rounded-2xl bg-emerald-500 active:bg-emerald-600 flex-row items-center justify-between shadow-md shadow-emerald-500/20"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mr-3">
                    <Ionicons name="call" size={20} color="#ffffff" />
                  </View>
                  <View>
                    <Text className="text-white font-black text-sm">Direct Phone Hotline</Text>
                    <Text className="text-white/90 text-xs font-mono font-bold">+234 800-OGA-HELP (Toll-Free)</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ffffff" />
              </TouchableOpacity>

              {/* Channel 2: WhatsApp VIP Desk */}
              <TouchableOpacity
                onPress={() => {
                  setConciergeModalVisible(false);
                  Linking.openURL('https://wa.me/2348030006423?text=' + encodeURIComponent('Hello OgaDriver VIP Concierge Desk, I need immediate client assistance.')).catch(() =>
                    Alert.alert('WhatsApp Error', 'Could not open WhatsApp.')
                  );
                }}
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="p-4 rounded-2xl border flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/20">
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                  </View>
                  <View>
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm">WhatsApp VIP Desk</Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs">Instant messaging & live document share</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#64748b" />
              </TouchableOpacity>

              {/* Channel 3: Live In-App Chat */}
              <TouchableOpacity
                onPress={() => {
                  setConciergeModalVisible(false);
                  navigation.navigate('Chat', { name: 'VIP Concierge Desk', recipientId: 'concierge_support' });
                }}
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="p-4 rounded-2xl border flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/20">
                    <Ionicons name="chatbubbles-outline" size={20} color="#10b981" />
                  </View>
                  <View>
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm">Live In-App Support Chat</Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs">Encrypted in-app messaging channel</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#64748b" />
              </TouchableOpacity>

              {/* Channel 4: Priority Email Desk */}
              <TouchableOpacity
                onPress={() => {
                  setConciergeModalVisible(false);
                  Linking.openURL('mailto:concierge@ogadriver.ng?subject=' + encodeURIComponent('VIP Client Concierge Request')).catch(() =>
                    Alert.alert('Email Error', 'Could not open email client.')
                  );
                }}
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="p-4 rounded-2xl border flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/20">
                    <Ionicons name="mail-outline" size={20} color="#10b981" />
                  </View>
                  <View>
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm">Priority Client Email</Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs">concierge@ogadriver.ng</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setConciergeModalVisible(false)}
              style={{
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              }}
              className="py-3.5 rounded-xl items-center"
            >
              <Text style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="font-bold text-xs uppercase">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: ADD NEW SAVED PLACE */}
      <Modal visible={addPlaceModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-end">
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="rounded-t-3xl p-6 border-t"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-emerald-500/15 items-center justify-center mr-3 border border-emerald-500/30">
                  <Ionicons name="location" size={22} color="#10b981" />
                </View>
                <View>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-normal tracking-tight">
                    Add New Saved Place
                  </Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px]">
                    Quick 1-tap route selection for rides and driver hires
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setAddPlaceModalVisible(false)} className="p-1">
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="space-y-3.5 mb-6">
              {/* Place Name */}
              <View
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="border rounded-2xl px-3.5 py-2.5"
              >
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase font-normal mb-0.5">
                  Place Label / Name *
                </Text>
                <TextInput
                  value={newPlaceName}
                  onChangeText={setNewPlaceName}
                  placeholder="e.g. Gym, Parents’ House, Branch Office, Beach Club"
                  placeholderTextColor="#94a3b8"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  className="text-xs font-normal"
                />
              </View>

              {/* Place Street Address */}
              <View
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="border rounded-2xl px-3.5 py-2.5"
              >
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase font-normal mb-0.5">
                  Street Address / Landmark *
                </Text>
                <TextInput
                  value={newPlaceAddress}
                  onChangeText={setNewPlaceAddress}
                  placeholder="e.g. 25 Admiralty Way, Lekki Phase 1, Lagos"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={2}
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  className="text-xs font-normal"
                />
              </View>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setAddPlaceModalVisible(false)}
                style={{
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                }}
                className="flex-1 py-3.5 rounded-xl items-center"
              >
                <Text style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="font-normal text-xs uppercase">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddCustomPlaceConfirm}
                className="flex-1 py-3.5 rounded-xl bg-emerald-500 active:bg-emerald-600 items-center justify-center shadow-md shadow-emerald-500/20"
              >
                <Text className="text-white font-normal text-xs uppercase tracking-wider">
                  Save Place
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MAP LOCATION PICKER MODAL (HOME / WORK / AIRPORT) */}
      <MapLocationPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        placeType={editingPlaceType}
        initialAddress={
          editingPlaceType === 'home'
            ? homeAddress
            : editingPlaceType === 'work'
            ? workAddress
            : airportAddress
        }
        onSave={handleSavePlace}
      />
    </SafeAreaView>
  );
}
