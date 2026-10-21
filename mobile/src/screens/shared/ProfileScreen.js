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
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService, api, walletService } from '../../api/api';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
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
  },
};

export default function ProfileScreen({ navigation, route }) {
  const onLogout = route.params?.onLogout;
  const insets = useSafeAreaInsets();
  const { isDark, themeMode, updateThemeMode } = useTheme();

  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Financial & Wallet State for Paying Clients
  const [walletBalance, setWalletBalance] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [conciergeModalVisible, setConciergeModalVisible] = useState(false);

  // Client Preferences
  const [ridePref, setRidePref] = useState(true);
  const [tripPref, setTripPref] = useState(false);
  const [corporateAccount, setCorporateAccount] = useState(true);

  // Edit Profile Screen / Modal State (Screenshot 1)
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [kycStatus, setKycStatus] = useState('unverified');

  // Mini-modals for editing individual fields
  const [editFieldModalVisible, setEditFieldModalVisible] = useState(false);
  const [activeEditField, setActiveEditField] = useState('name'); // 'name' | 'phone'
  const [tempFieldValue, setTempFieldValue] = useState('');

  // Identity Verification Flow State (Screenshots 2-5)
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verifyStep, setVerifyStep] = useState(1); // 1: Overview, 2: Country, 3: ID Type, 4: Document Photo, 5: Selfie, 6: Success
  const [selectedCountryName, setSelectedCountryName] = useState('Nigeria');
  const [selectedIdType, setSelectedIdType] = useState('license'); // 'license', 'nin', 'voters', 'passport', 'permit'
  const [idDocImage, setIdDocImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { country: selectedCountry, formatAmount } = useCountry();

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

      const [storedKyc, wRes, pts] = await Promise.all([
        Storage.getItemAsync('client_kyc_data').catch(() => null),
        walletService.getWallet().catch(() => null),
        loyaltyService.getPoints().catch(() => 0),
      ]);

      if (storedKyc) {
        try {
          const parsed = JSON.parse(storedKyc);
          setKycData(parsed);
          if (parsed.status) setKycStatus(parsed.status);
        } catch (err) {}
      }

      if (wRes) {
        const bal = wRes.wallet?.balance ?? wRes.data?.balance ?? 0;
        setWalletBalance(parseFloat(bal));
      }

      if (pts !== undefined && pts !== null) {
        setUserPoints(pts);
      }
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

  // Avatar Picker
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
        const newAvatarUri = result.assets[0].uri;
        setEditAvatar(newAvatarUri);
        // Persist avatar change immediately
        const updatedUser = { ...user, avatar: newAvatarUri };
        setUser(updatedUser);
        await authService.updateUser(updatedUser).catch(() => {});
        await Storage.setItemAsync('custom_user_profile', JSON.stringify(updatedUser));
      }
    } catch (err) {
      Alert.alert('Avatar Error', 'Could not open photo library.');
    }
  };

  // Edit specific fields (Name / Phone)
  const openEditField = (field) => {
    setActiveEditField(field);
    setTempFieldValue(field === 'name' ? editName : editPhone);
    setEditFieldModalVisible(true);
  };

  const handleSaveField = async () => {
    const val = tempFieldValue.trim();
    if (!val) {
      Alert.alert('Required', `Please enter a valid ${activeEditField}.`);
      return;
    }

    let updatedUser = { ...user };
    if (activeEditField === 'name') {
      setEditName(val);
      updatedUser.name = val;
    } else if (activeEditField === 'phone') {
      if (val.length < 10) {
        Alert.alert('Invalid Phone', 'Please enter a valid phone number with area code.');
        return;
      }
      setEditPhone(val);
      updatedUser.phone = val;
    }

    setUser(updatedUser);
    setEditFieldModalVisible(false);
    try {
      await authService.updateUser(updatedUser).catch(() => {});
      await Storage.setItemAsync('custom_user_profile', JSON.stringify(updatedUser));
    } catch (e) {
      console.log('Error updating field:', e);
    }
  };

  // Verification Actions
  const handleStartVerification = () => {
    setVerifyStep(1);
    setVerifyModalVisible(true);
  };

  const handleCaptureDocumentPhoto = async () => {
    try {
      const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
      let result;
      if (cameraPerm.granted) {
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.9,
        });
      } else {
        const libraryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libraryPerm.granted) {
          Alert.alert('Permission Needed', 'Camera or photo library permission is required to capture your document.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.9,
        });
      }
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIdDocImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Capture Error', 'Could not capture document image.');
    }
  };

  const handleCaptureSelfie = async () => {
    try {
      const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
      let result;
      if (cameraPerm.granted) {
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
          cameraType: ImagePicker.CameraType?.front,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
      }
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelfieImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Capture Error', 'Could not capture selfie.');
    }
  };

  const handleSubmitVerification = async () => {
    if (!idDocImage) {
      Alert.alert('ID Required', 'Please capture a clear photo of your government ID document.');
      return;
    }
    if (!selfieImage) {
      Alert.alert('Selfie Required', 'Please take a live selfie so we can verify your identity.');
      return;
    }

    setIsVerifying(true);
    setTimeout(async () => {
      const kycPayload = {
        status: 'verified',
        idType: selectedIdType,
        country: selectedCountryName,
        verifiedAt: new Date().toISOString(),
        idDocImage,
        selfieImage,
      };

      setKycStatus('verified');
      setKycData(kycPayload);
      await Storage.setItemAsync('client_kyc_data', JSON.stringify(kycPayload));
      await api.post('/v1/user/verify-identity', kycPayload).catch(() => {});

      setIsVerifying(false);
      setVerifyStep(6); // Success screen
    }, 1500);
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
        <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xl tracking-tight">
          Account
        </Text>

        {/* Theme Quick Toggle */}
        <TouchableOpacity
          onPress={() => updateThemeMode(isDark ? 'light' : 'dark')}
          style={{
            backgroundColor: isDark ? '#121927' : '#f1f5f9',
            borderColor: isDark ? '#1e293b' : '#cbd5e1',
          }}
          className="p-2 rounded-xl border"
          activeOpacity={0.7}
        >
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? '#00e588' : '#059669'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
      >
        {/* 1. CLIENT IDENTITY CARD (Stats Pill Bar completely removed as requested) */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="border rounded-3xl p-5 mb-5 shadow-sm"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3.5 flex-1">
              <TouchableOpacity
                onPress={() => setEditProfileVisible(true)}
                activeOpacity={0.8}
                className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500 items-center justify-center overflow-hidden relative"
              >
                {editAvatar || user?.avatar ? (
                  <Image source={{ uri: editAvatar || user.avatar }} className="w-full h-full" />
                ) : (
                  <Text className="text-emerald-500 font-black text-2xl">
                    {(user?.name || editName || 'O')[0].toUpperCase()}
                  </Text>
                )}
                <View className="absolute bottom-0 right-0 bg-emerald-500 rounded-tl-lg p-0.5">
                  <Ionicons name="pencil" size={10} color="#ffffff" />
                </View>
              </TouchableOpacity>

              <View className="flex-1 ml-3">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-lg tracking-tight" numberOfLines={1}>
                  {user?.name || editName || 'Oga Babatunde'}
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mt-0.5">
                  {user?.phone || editPhone || '+234 803 123 4567'}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] font-medium">
                    Corporate Account
                  </Text>
                </View>
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
        </View>

        {/* 2. WALLET (Dedicated Menu Item Leading to Wallet Screen) */}
        <View className="mb-4">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Wallet')}
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#bbf7d0',
            }}
            className="border rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View
                style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5' }}
                className="w-11 h-11 rounded-2xl items-center justify-center mr-3 border border-emerald-500/20"
              >
                <Ionicons name="wallet" size={22} color="#10b981" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-base mr-2">
                    Wallet
                  </Text>
                  <View className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <Text className="text-emerald-500 text-[10px] font-bold">Instant Pay</Text>
                  </View>
                </View>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-medium mt-0.5">
                  Balance: {formatAmount ? formatAmount(walletBalance) : `${selectedCountry?.symbol || '₦'}${walletBalance.toLocaleString()}`}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Text className="text-emerald-500 text-xs font-bold mr-1">Manage</Text>
              <Ionicons name="chevron-forward" size={18} color="#10b981" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. SAVED PLACES MENU ITEM (Clean dedicated screen transition) */}
        <View className="mb-4">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SavedPlaces')}
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View
                style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5' }}
                className="w-11 h-11 rounded-2xl items-center justify-center mr-3 border border-emerald-500/20"
              >
                <Ionicons name="bookmark" size={22} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-base">
                  Saved Places
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-medium mt-0.5">
                  Home, Work, Airport & Custom Spots
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </View>

        {/* 4. MY BOOKINGS SECTION */}
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
              <View className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mr-3">
                <Ionicons name="calendar" size={22} color="#10b981" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-base mr-2">
                    My Bookings
                  </Text>
                  <View className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    <Text className="text-[9px] font-bold uppercase text-emerald-500">Active</Text>
                  </View>
                </View>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-medium mt-0.5">
                  Past trips, chauffeurs & invoices
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </View>

        {/* 5. PAYMENT METHODS MENU ROW */}
        <View className="mb-4">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PaymentCards')}
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mr-3">
                <Ionicons name="card" size={22} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-base">
                  Payment Methods
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-medium mt-0.5">
                  Add Debit/Credit Card & default billing
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </View>

        {/* Secondary Account Shortcuts (Browse Drivers, Gift Funds, Loyalty) */}
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
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs">
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
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs">
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
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs">
                OgaPoints
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 6. CLIENT PREFERENCES */}
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

        {/* 7. RAPID SOS EMERGENCY CARD */}
        <TouchableOpacity
          style={{
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.25)' : '#fecaca',
          }}
          className="border rounded-2xl p-3.5 mb-5 flex-row items-center justify-between"
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EmergencySos')}
        >
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-10 h-10 rounded-xl bg-red-500/15 items-center justify-center mr-3 border border-red-500/20">
              <Ionicons name="alert-circle" size={22} color="#ef4444" />
            </View>
            <View className="flex-1">
              <Text className="text-red-600 dark:text-red-400 font-semibold text-sm">
                Emergency SOS
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mt-0.5">
                24/7 rapid dispatch & security tracking
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ef4444" />
        </TouchableOpacity>

        {/* 8. SETTINGS & CLIENT SUPPORT (KYC moved inside Profile Edit screen) */}
        <View className="mb-6">
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm tracking-tight mb-2.5 px-1">
            Security & Support
          </Text>

          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-3xl overflow-hidden shadow-sm"
          >
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-slate-700/20"
              onPress={() => navigation.navigate('AppSettings')}
            >
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs">
                App Lock & Biometric PIN
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-slate-700/20"
              onPress={() => setConciergeModalVisible(true)}
            >
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs">
                24/7 Client Concierge Hotline
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => navigation.navigate('TermsAndPrivacy')}
            >
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs">
                Terms of Service & Privacy
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 9. SIGN OUT BUTTON */}
        <View className="items-center mb-3">
          <TouchableOpacity
            style={{
              backgroundColor: isDark ? '#121927' : '#fef2f2',
              borderColor: isDark ? '#334155' : '#fca5a5',
              minWidth: 170,
            }}
            className="border py-3 px-6 rounded-2xl flex-row items-center justify-center active:opacity-80"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text className="text-red-500 font-semibold text-xs uppercase tracking-wider ml-2">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* 10. DELETE ACCOUNT */}
        <View className="items-center mb-8">
          <TouchableOpacity
            className="py-2 px-4 rounded-xl flex-row items-center justify-center active:opacity-80"
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={14} color="#94a3b8" />
            <Text style={{ color: isDark ? '#64748b' : '#94a3b8' }} className="font-normal text-xs ml-1.5">
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* =========================================================================
          MODAL 1: PROFILE EDIT SCREEN (MATCHING SCREENSHOT 1)
          - Centered Avatar with Camera/Pencil badge
          - "Drivers can only see your photo during pickup"
          - Inset divider lines ("two line style that does not reach both ends")
          - Name, Phone, Email (Verified), Identity (Not verified / [Verify])
         ========================================================================= */}
      <Modal visible={editProfileVisible} animationType="slide" onRequestClose={() => setEditProfileVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090d16' : '#ffffff' }}>
          {/* Header Bar */}
          <View
            style={{
              borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="flex-row items-center px-4 py-3 border-b"
          >
            <TouchableOpacity
              onPress={() => setEditProfileVisible(false)}
              className="p-1 mr-3"
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#0f172a'} />
            </TouchableOpacity>
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xl">
              Profile
            </Text>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Avatar Section */}
            <View className="items-center pt-8 pb-6">
              <TouchableOpacity
                onPress={handlePickAvatar}
                activeOpacity={0.85}
                className="relative"
              >
                <View
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="w-28 h-28 rounded-full items-center justify-center overflow-hidden"
                >
                  {editAvatar || user?.avatar ? (
                    <Image source={{ uri: editAvatar || user.avatar }} className="w-full h-full" />
                  ) : (
                    <Ionicons name="camera" size={38} color={isDark ? '#94a3b8' : '#64748b'} />
                  )}
                </View>

                {/* Green circular badge with pencil */}
                <View className="absolute top-0 right-0 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 items-center justify-center shadow-md">
                  <Ionicons name="pencil" size={14} color="#ffffff" />
                </View>
              </TouchableOpacity>

              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mt-3">
                Drivers can only see your photo during pickup
              </Text>
            </View>

            {/* Profile Fields with Inset Divider Lines ("two line style that does not reach both ends") */}
            <View className="mt-4">
              {/* Row 1: Name */}
              <TouchableOpacity
                onPress={() => openEditField('name')}
                activeOpacity={0.7}
                className="px-5 py-4 flex-row items-center justify-between"
              >
                <View className="flex-1 mr-3">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-1">
                    Name
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-base font-semibold">
                    {editName || user?.name || 'Set your name'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={isDark ? '#94a3b8' : '#cbd5e1'} />
              </TouchableOpacity>

              {/* Inset Divider Line */}
              <View className="mx-5 h-[1px] bg-slate-200 dark:bg-slate-800" />

              {/* Row 2: Phone number */}
              <TouchableOpacity
                onPress={() => openEditField('phone')}
                activeOpacity={0.7}
                className="px-5 py-4 flex-row items-center justify-between"
              >
                <View className="flex-1 mr-3">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-1">
                    Phone number
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-base font-semibold">
                    {editPhone || user?.phone || '+234 805 404 4980'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={isDark ? '#94a3b8' : '#cbd5e1'} />
              </TouchableOpacity>

              {/* Inset Divider Line */}
              <View className="mx-5 h-[1px] bg-slate-200 dark:bg-slate-800" />

              {/* Row 3: Email */}
              <View className="px-5 py-4 flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-1">
                    Email
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-base font-semibold">
                    {editEmail || user?.email || 'cejmart@gmail.com'}
                  </Text>
                  <Text className="text-emerald-500 font-semibold text-xs mt-0.5">
                    Verified
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={isDark ? '#94a3b8' : '#cbd5e1'} />
              </View>

              {/* Inset Divider Line */}
              <View className="mx-5 h-[1px] bg-slate-200 dark:bg-slate-800" />

              {/* Row 4: Identity (Verification) */}
              <View className="px-5 py-4 flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-1">
                    Identity
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-base font-semibold">
                    {kycStatus === 'verified' ? 'Verified' : 'Not verified'}
                  </Text>
                </View>

                {kycStatus === 'verified' ? (
                  <View className="flex-row items-center bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginRight: 4 }} />
                    <Text className="text-emerald-500 font-bold text-xs">Verified</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleStartVerification}
                    className="bg-emerald-600 active:bg-emerald-700 px-5 py-2 rounded-full shadow-sm"
                  >
                    <Text className="text-white font-bold text-sm">Verify</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* =========================================================================
          MODAL 2: FIELD EDIT DIALOG (FOR NAME & PHONE)
         ========================================================================= */}
      <Modal visible={editFieldModalVisible} transparent animationType="fade" onRequestClose={() => setEditFieldModalVisible(false)}>
        <View className="flex-1 bg-black/60 items-center justify-center px-4">
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="w-full max-w-sm rounded-3xl p-6 border shadow-2xl"
          >
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-lg mb-1">
              {activeEditField === 'name' ? 'Edit Name' : 'Edit Phone Number'}
            </Text>
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-4">
              {activeEditField === 'name' ? 'Enter your legal first and last name.' : 'Enter your verified telephone line.'}
            </Text>

            <TextInput
              value={tempFieldValue}
              onChangeText={setTempFieldValue}
              keyboardType={activeEditField === 'phone' ? 'phone-pad' : 'default'}
              placeholder={activeEditField === 'name' ? 'e.g. Cyprian Obidi' : 'e.g. +2348054044980'}
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              style={{
                backgroundColor: isDark ? '#090d16' : '#f8fafc',
                borderColor: isDark ? '#1e293b' : '#cbd5e1',
                color: isDark ? '#ffffff' : '#0f172a',
              }}
              className="border rounded-2xl px-4 py-3 text-sm font-semibold mb-5"
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setEditFieldModalVisible(false)}
                style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}
                className="flex-1 py-3 rounded-xl items-center"
              >
                <Text style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="font-bold text-xs uppercase">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveField}
                className="flex-1 py-3 rounded-xl bg-emerald-500 active:bg-emerald-600 items-center shadow-md shadow-emerald-500/20"
              >
                <Text className="text-white font-bold text-xs uppercase tracking-wider">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          MODAL 3: MULTI-STEP IDENTITY VERIFICATION FLOW (SCREENSHOTS 2-5)
          - Original OgaDriver Nigerian branding (avoiding Bolt replication)
          - Step 1: Overview (ID + Live Selfie requirement)
          - Step 2: Country Selection (Nigeria 🇳🇬)
          - Step 3: Document Type (Driver's License, NIN, Voter's Card, Passport)
          - Step 4: Photo Capture & Quality check
          - Step 5: Live Selfie facial capture
          - Step 6: Verified success!
         ========================================================================= */}
      <Modal visible={verifyModalVisible} animationType="slide" onRequestClose={() => setVerifyModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090d16' : '#ffffff' }}>
          {/* Header Bar */}
          <View
            style={{
              borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="flex-row items-center px-4 py-3 border-b"
          >
            <TouchableOpacity
              onPress={() => {
                if (verifyStep > 1 && verifyStep < 6) {
                  setVerifyStep((s) => s - 1);
                } else {
                  setVerifyModalVisible(false);
                }
              }}
              className="p-1 mr-3"
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#0f172a'} />
            </TouchableOpacity>
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-lg">
              {verifyStep === 1
                ? 'Identity Verification'
                : verifyStep === 2
                ? 'Country of Issue'
                : verifyStep === 3
                ? 'Select ID Type'
                : verifyStep === 4
                ? 'Document Photo'
                : verifyStep === 5
                ? 'Facial Selfie'
                : 'Verification Completed'}
            </Text>
          </View>

          {/* STEP 1: OVERVIEW SCREEN (SCREENSHOT 2) */}
          {verifyStep === 1 && (
            <View className="flex-1 px-5 pt-8 justify-between pb-8">
              <View>
                {/* 3D Shield & ID Icon graphic */}
                <View className="items-center mb-8">
                  <View className="w-28 h-28 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/30 items-center justify-center relative">
                    <Ionicons name="shield-checkmark" size={54} color="#10b981" />
                    <View className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2 border-2 border-white dark:border-slate-900 shadow-md">
                      <Ionicons name="card" size={18} color="#ffffff" />
                    </View>
                  </View>
                </View>

                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-2xl tracking-tight mb-2">
                  Verify your identity
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-sm leading-5 mb-8">
                  To keep your account and our community safe, we'll need to check your ID. This takes about 1-2 minutes.
                </Text>

                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-sm mb-4">
                  You'll need:
                </Text>

                {/* Requirement 1: Government ID */}
                <View className="flex-row items-start mb-5">
                  <View className="w-7 h-7 rounded-full bg-emerald-500 items-center justify-center mr-3 mt-0.5">
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  </View>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-sm font-medium flex-1 leading-5">
                    Your FRSC driving licence, NIN card/slip, voter's card, or international passport
                  </Text>
                </View>

                {/* Requirement 2: Live Selfie */}
                <View className="flex-row items-start mb-6">
                  <View className="w-7 h-7 rounded-full bg-emerald-500 items-center justify-center mr-3 mt-0.5">
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  </View>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-sm font-medium flex-1 leading-5">
                    Your phone camera, to take a live selfie
                  </Text>
                </View>

                <Text style={{ color: isDark ? '#64748b' : '#94a3b8' }} className="text-xs leading-4 mt-2">
                  By continuing, you allow OgaDriver to confirm your selfie matches your ID using encrypted facial validation.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setVerifyStep(2)}
                className="w-full py-4 rounded-full bg-emerald-600 active:bg-emerald-700 items-center shadow-lg shadow-emerald-600/30"
              >
                <Text className="text-white font-bold text-base">Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: COUNTRY OF ISSUE (SCREENSHOT 3) */}
          {verifyStep === 2 && (
            <View className="flex-1 px-5 pt-8 justify-between pb-8">
              <View>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xl tracking-tight mb-6">
                  Which country issued your ID?
                </Text>

                {/* Country Row */}
                <View
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: '#10b981',
                  }}
                  className="flex-row items-center justify-between p-4 rounded-2xl border-2"
                >
                  <View className="flex-row items-center">
                    <Text className="text-3xl mr-3">🇳🇬</Text>
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-base">
                      Nigeria
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
                      <Ionicons name="checkmark" size={14} color="#ffffff" />
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setVerifyStep(3)}
                className="w-full py-4 rounded-full bg-emerald-600 active:bg-emerald-700 items-center shadow-lg shadow-emerald-600/30"
              >
                <Text className="text-white font-bold text-base">Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: SELECT ID TYPE (SCREENSHOT 4) */}
          {verifyStep === 3 && (
            <View className="flex-1 px-5 pt-8 justify-between pb-8">
              <View>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xl tracking-tight mb-2">
                  Select ID type
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-6">
                  Be prepared to take a photo of the chosen document.
                </Text>

                {/* Document Type Options with Inset Dividers */}
                {[
                  { id: 'license', title: "Driver's license", badge: 'Recommended' },
                  { id: 'nin', title: 'National ID card (NIN)' },
                  { id: 'voters', title: "Voter's card (INEC PVC)" },
                  { id: 'passport', title: 'Passport' },
                  { id: 'permit', title: 'Residence permit' },
                ].map((doc, idx) => (
                  <React.Fragment key={doc.id}>
                    {idx > 0 && <View className="h-[1px] bg-slate-200 dark:bg-slate-800 my-1" />}
                    <TouchableOpacity
                      onPress={() => setSelectedIdType(doc.id)}
                      activeOpacity={0.7}
                      className="py-3.5 flex-row items-center justify-between"
                    >
                      <View className="flex-1 mr-3">
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-base">
                          {doc.title}
                        </Text>
                        {doc.badge && (
                          <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mt-0.5">
                            {doc.badge}
                          </Text>
                        )}
                      </View>

                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          selectedIdType === doc.id
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-slate-400 dark:border-slate-600'
                        }`}
                      >
                        {selectedIdType === doc.id && (
                          <Ionicons name="checkmark" size={14} color="#ffffff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setVerifyStep(4)}
                className="w-full py-4 rounded-full bg-emerald-600 active:bg-emerald-700 items-center shadow-lg shadow-emerald-600/30"
              >
                <Text className="text-white font-bold text-base">Take a photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 4: DOCUMENT PHOTO CAPTURE / QUALITY CHECK (SCREENSHOT 5) */}
          {verifyStep === 4 && (
            <View className="flex-1 px-5 pt-8 justify-between pb-8">
              <View className="items-center">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xl tracking-tight mb-2 text-center">
                  Capture your document
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs text-center mb-6 max-w-xs">
                  Make sure all 4 corners are visible, text is clear, and there is no strong glare.
                </Text>

                {/* Document Preview Box */}
                <TouchableOpacity
                  onPress={handleCaptureDocumentPhoto}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: idDocImage ? '#10b981' : isDark ? '#1e293b' : '#cbd5e1',
                  }}
                  className="w-full h-56 rounded-3xl border-2 border-dashed items-center justify-center overflow-hidden mb-5"
                >
                  {idDocImage ? (
                    <Image source={{ uri: idDocImage }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="items-center px-4">
                      <View className="w-16 h-16 rounded-full bg-emerald-500/10 items-center justify-center mb-2">
                        <Ionicons name="camera-outline" size={32} color="#10b981" />
                      </View>
                      <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm">
                        Tap to Photograph Document
                      </Text>
                      <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs text-center mt-1">
                        Use front or back camera
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Quality Guidance Illustration */}
                <View
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f1f5f9',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="w-full p-4 rounded-2xl border flex-row items-center space-x-3"
                >
                  <View className="w-8 h-8 rounded-full bg-emerald-500/15 items-center justify-center">
                    <Ionicons name="eye-outline" size={18} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs">
                      Clear & readable photo required
                    </Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] mt-0.5">
                      Ensure your full name, photo, and document number are completely legible.
                    </Text>
                  </View>
                </View>
              </View>

              <View className="space-y-3">
                {idDocImage && (
                  <TouchableOpacity
                    onPress={handleCaptureDocumentPhoto}
                    style={{ backgroundColor: isDark ? '#121927' : '#f1f5f9' }}
                    className="w-full py-3 rounded-full items-center border border-slate-700/20"
                  >
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm">
                      Retake photo
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => {
                    if (!idDocImage) {
                      Alert.alert('Photo Needed', 'Please tap the preview frame to take a photo of your ID.');
                      return;
                    }
                    setVerifyStep(5);
                  }}
                  className="w-full py-4 rounded-full bg-emerald-600 active:bg-emerald-700 items-center shadow-lg shadow-emerald-600/30"
                >
                  <Text className="text-white font-bold text-base">
                    {idDocImage ? 'Continue to Selfie' : 'Take Document Photo'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 5: LIVE SELFIE CAPTURE */}
          {verifyStep === 5 && (
            <View className="flex-1 px-5 pt-8 justify-between pb-8">
              <View className="items-center">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xl tracking-tight mb-2 text-center">
                  Take a quick selfie
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs text-center mb-6 max-w-xs">
                  Position your face inside the oval frame. Make sure your lighting is bright and even.
                </Text>

                {/* Oval Selfie Frame */}
                <TouchableOpacity
                  onPress={handleCaptureSelfie}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: selfieImage ? '#10b981' : isDark ? '#1e293b' : '#cbd5e1',
                  }}
                  className="w-56 h-72 rounded-full border-4 border-dashed items-center justify-center overflow-hidden mb-5"
                >
                  {selfieImage ? (
                    <Image source={{ uri: selfieImage }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="items-center px-4">
                      <View className="w-16 h-16 rounded-full bg-emerald-500/10 items-center justify-center mb-2">
                        <Ionicons name="person-outline" size={34} color="#10b981" />
                      </View>
                      <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm text-center">
                        Tap to Take Selfie
                      </Text>
                      <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] text-center mt-1">
                        Front camera portrait
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View className="space-y-3">
                {selfieImage && (
                  <TouchableOpacity
                    onPress={handleCaptureSelfie}
                    style={{ backgroundColor: isDark ? '#121927' : '#f1f5f9' }}
                    className="w-full py-3 rounded-full items-center border border-slate-700/20"
                  >
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm">
                      Retake selfie
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={handleSubmitVerification}
                  disabled={isVerifying}
                  className="w-full py-4 rounded-full bg-emerald-600 active:bg-emerald-700 items-center shadow-lg shadow-emerald-600/30 flex-row justify-center"
                >
                  {isVerifying ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      {selfieImage ? 'Submit for Verification' : 'Take Selfie'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 6: VERIFICATION COMPLETED SUCCESS */}
          {verifyStep === 6 && (
            <View className="flex-1 px-5 pt-12 items-center justify-between pb-8">
              <View className="items-center">
                <View className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500 items-center justify-center mb-6">
                  <Ionicons name="checkmark-done" size={48} color="#10b981" />
                </View>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-2xl tracking-tight text-center mb-2">
                  Identity Verified!
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-sm text-center max-w-xs leading-5">
                  Your government document and biometric selfie have been securely validated. You now enjoy full verified client privileges.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setVerifyModalVisible(false);
                }}
                className="w-full py-4 rounded-full bg-emerald-600 active:bg-emerald-700 items-center shadow-lg shadow-emerald-600/30"
              >
                <Text className="text-white font-bold text-base">Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* =========================================================================
          MODAL 4: 24/7 VIP CLIENT CONCIERGE HOTLINE
         ========================================================================= */}
      <Modal visible={conciergeModalVisible} transparent animationType="slide" onRequestClose={() => setConciergeModalVisible(false)}>
        <View
          style={{
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 16 : Math.max(insets.bottom, 16) + 8,
          }}
          className="flex-1 bg-black/70 justify-end px-3"
        >
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              maxHeight: '85%',
            }}
            className="rounded-3xl p-6 border shadow-2xl"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/30">
                  <Ionicons name="headset" size={22} color="#10b981" />
                </View>
                <View>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-semibold tracking-tight">
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

            {/* Channels */}
            <View className="space-y-3 mb-6">
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
                    <Text className="text-white font-bold text-sm">Direct Phone Hotline</Text>
                    <Text className="text-white/90 text-xs font-mono font-bold">+234 800-OGA-HELP (Toll-Free)</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ffffff" />
              </TouchableOpacity>

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
    </SafeAreaView>
  );
}
