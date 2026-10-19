import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Linking, Modal, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService, driverService } from '../../api/api';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import HeaderBar from '../../components/HeaderBar';
import { useTheme } from '../../context/ThemeContext';
import { useCountry } from '../../context/CountryContext';
import { 
  FLEET_TIERS, 
  FLEET_TYPES_LIST, 
  VEHICLE_BRANDS, 
  POPULAR_BRANDS,
  MODELS_BY_BRAND, 
  POPULAR_COLORS, 
  COLOR_SWATCHES,
  POPULAR_YEARS, 
  detectFleetTier 
} from '../../utils/vehicleFleetData';

export default function DriverProfileScreen({ navigation, route }) {
  const { isDark, themeMode, updateThemeMode } = useTheme();
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Personal Information Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const getAvatarUri = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http') || avatar.startsWith('file:') || avatar.startsWith('data:') || avatar.startsWith('content:')) {
      return avatar;
    }
    return `https://ogadriver.ng/storage/${avatar}`;
  };

  const handleOpenEditPersonalInfo = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditEmail(user?.email || '');
    setEditAvatar(user?.avatar || null);
    setEditModalVisible(true);
  };

  const handlePickAvatar = async (useCamera = false) => {
    try {
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Denied', 'Please allow camera access to take a profile picture.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          setEditAvatar(result.assets[0].uri);
        }
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Denied', 'Please allow gallery access to choose a profile picture.');
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
      }
    } catch (err) {
      console.log('Error picking avatar:', err);
      Alert.alert('Avatar Error', 'Could not open photo selector.');
    }
  };

  const promptAvatarSource = () => {
    Alert.alert(
      'Profile Photo',
      'Choose a photo from your gallery or take a new picture',
      [
        { text: 'Take Photo', onPress: () => handlePickAvatar(true) },
        { text: 'Choose from Gallery', onPress: () => handlePickAvatar(false) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Vehicle Registration & Management Modal State (Comprehensive Luxury & Executive)
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [vehicleTier, setVehicleTier] = useState('executive'); // 'luxury' | 'executive' | 'standard' | 'armored_vip'
  const [isArmored, setIsArmored] = useState(false);
  const [vehicleMake, setVehicleMake] = useState('Mercedes-Benz');
  const [vehicleModel, setVehicleModel] = useState('E-Class (E300 / E350)');
  const [vehicleYear, setVehicleYear] = useState('2023');
  const [vehicleColor, setVehicleColor] = useState('Jet Black');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleOwnership, setVehicleOwnership] = useState('personal'); // 'personal' | 'employer' | 'rental_hp'
  const [savingVehicle, setSavingVehicle] = useState(false);

  // List Modal Pickers for Vehicle Brand and Model & Tier Override
  const [profileBrandModalVisible, setProfileBrandModalVisible] = useState(false);
  const [profileModelModalVisible, setProfileModelModalVisible] = useState(false);
  const [tierOverrideModalVisible, setTierOverrideModalVisible] = useState(false);
  const [profileBrandSearch, setProfileBrandSearch] = useState('');
  const [profileModelSearch, setProfileModelSearch] = useState('');

  // Country Selection Modal State (Global Country System)
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const { country: selectedCountry, updateCountry, supportedCountries } = useCountry();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userData = await authService.getUser();
      setUser(userData);
      setEditName(userData?.name || '');
      setEditPhone(userData?.phone || '');
      setEditEmail(userData?.email || '');
      setEditAvatar(userData?.avatar || null);

      if (userData?.driver?.id || userData?.driver_id) {
        const driverId = userData?.driver?.id || userData?.driver_id;
        const driverData = await driverService.getProfile(driverId);
        const d = driverData.data;
        setDriver(d);
        if (d) {
          const makeVal = d.vehicle?.make || d.vehicle_make || '';
          const modelVal = d.vehicle?.model || d.vehicle_model || '';
          const yearVal = d.vehicle?.year ? String(d.vehicle.year) : '2023';
          const isArm = Boolean(d.vehicle?.is_armored || d.vehicle?.vehicle_type === 'armored_vip');
          const tierVal = d.vehicle?.vehicle_type || detectFleetTier(makeVal, modelVal, yearVal, isArm);

          setVehicleMake(makeVal || 'Mercedes-Benz');
          setVehicleModel(modelVal || 'E-Class (E300 / E350)');
          setVehicleYear(yearVal);
          setVehicleColor(d.vehicle?.color || 'Jet Black');
          setVehiclePlate(d.vehicle?.plate_number || d.license_plate || '');
          setVehicleOwnership(d.vehicle?.ownership_type || 'personal');
          setVehicleTier(tierVal);
          setIsArmored(isArm);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    if (!editName.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }
    setSavingEdit(true);
    try {
      const updatedUser = {
        ...user,
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
        avatar: editAvatar || user?.avatar || null,
      };

      setUser(updatedUser);
      await authService.updateUser(updatedUser).catch(() => {});
      setEditModalVisible(false);
      Alert.alert('Profile Updated', 'Personal information and picture avatar have been updated successfully.');
    } catch (e) {
      Alert.alert('Error', 'Could not update profile information.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSaveVehicle = async () => {
    if (!vehicleMake.trim() || !vehiclePlate.trim()) {
      Alert.alert('Required', 'Please enter at least the vehicle make and license plate number.');
      return;
    }
    setSavingVehicle(true);
    try {
      const effectiveTier = isArmored ? 'armored_vip' : (vehicleTier || detectFleetTier(vehicleMake, vehicleModel, vehicleYear, isArmored));
      const payload = {
        make: vehicleMake.trim(),
        model: vehicleModel.trim() || 'Executive',
        year: vehicleYear.trim() || new Date().getFullYear().toString(),
        color: vehicleColor.trim() || 'Jet Black',
        plate_number: vehiclePlate.trim().toUpperCase(),
        vehicle_type: effectiveTier,
        is_armored: isArmored,
        ownership_type: vehicleOwnership,
        service_mode: 'driver_with_vehicle',
      };
      await driverService.updateVehicleProfile(payload);
      setDriver(prev => ({
        ...prev,
        has_vehicle: true,
        vehicle_make: payload.make,
        vehicle_model: payload.model,
        license_plate: payload.plate_number,
        vehicle: {
          ...(prev?.vehicle || {}),
          ...payload
        }
      }));
      setVehicleModalVisible(false);
      Alert.alert(
        'Vehicle Registered',
        vehicleOwnership === 'employer'
          ? 'Employer vehicle saved. Street hailing is locked to protect your employer vehicle.'
          : 'Personal vehicle saved successfully! On-demand street hailing and executive dispatch are enabled.'
      );
    } catch (e) {
      console.log('Error saving vehicle:', e);
      Alert.alert('Registration Failed', e?.response?.data?.message || 'Could not save vehicle details.');
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of OGADRIVERS PARTNERS?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          if (route.params?.onLogout) route.params.onLogout();
        }
      }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Partner Account',
      'Are you sure you want to delete your driver partner account? This action is permanent and cannot be undone. All your driver verification records, license documents, ratings, and wallet links will be permanently erased.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await authService.deleteAccount();
              Alert.alert('Account Deleted', res?.message || 'Your partner account has been deleted successfully.');
              if (route.params?.onLogout) route.params.onLogout();
            } catch (err) {
              const msg = err.response?.data?.message || err.message || 'Failed to delete partner account. Please ensure all active bookings are resolved first.';
              Alert.alert('Unable to Delete Account', msg);
            }
          }
        }
      ]
    );
  };

  const handlePartnerSupport = () => {
    Alert.alert(
      'Partner Support',
      'Need help with your account, payouts, or bookings? Reach out to OgaDriver Safety & Partner Support.',
      [
        { text: 'Call Support', onPress: () => Linking.openURL('tel:08000000000') },
        { text: 'Open Chat', onPress: () => navigation.navigate('Conversations') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView 
        style={{
          flex: 1, 
          backgroundColor: isDark ? '#090d16' : '#ffffff', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}
      >
        <ActivityIndicator color="#10b981" size="large" />
      </SafeAreaView>
    );
  }

  // Initials for avatar fallback
  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'DR';

  // Check if driver owns a vehicle or needs vehicle placement
  const hasVehicle = Boolean(
    driver?.has_vehicle || driver?.vehicle_make || driver?.license_plate
  );

  const vehicleSubtitle = hasVehicle
    ? ([driver?.vehicle_make, driver?.vehicle_model].filter(Boolean).join(' ') || 'Vehicle Verified') + (driver?.license_plate ? ` · ${driver.license_plate}` : '')
    : 'Fleet Operative · Seeking Car Placement';

  // Theme-adaptive color scheme
  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    borderDivider: isDark ? '#1e293b' : '#e2e8f0',
    accentGreen: isDark ? '#00e588' : '#059669',
    brandGreen: isDark ? '#00e588' : '#059669',
    tagBg: isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.1)',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Top Header Bar with exclusive color theme change icon */}
      <HeaderBar navigation={navigation} showThemeToggle={true} />

      <ScrollView 
        className="flex-1 px-4 pt-3" 
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Title */}
        <View className="mb-4">
          <Text style={{ color: themeStyles.titleText, fontWeight: 'normal', fontSize: 28 }}>
            Driver Profile
          </Text>
        </View>

        {/* 1. Main Profile Header Card */}
        <View 
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: themeStyles.cardBorder, 
            borderWidth: 1 
          }} 
          className="rounded-3xl p-5 mb-4 shadow-xl flex-row items-center"
        >
          {/* Avatar Circle */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleOpenEditPersonalInfo}
            style={{ 
              backgroundColor: themeStyles.accentGreen, 
              borderColor: isDark ? '#00e588' : '#047857' 
            }} 
            className="w-16 h-16 rounded-full items-center justify-center mr-4 overflow-hidden border-2 shadow-md"
          >
            {user?.avatar ? (
              <Image
                source={{
                  uri: getAvatarUri(user.avatar)
                }}
                className="w-full h-full"
              />
            ) : (
              <Text className="text-slate-950 text-xl font-normal">{initials}</Text>
            )}
          </TouchableOpacity>

          {/* User Info */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xl mb-0.5 flex-1 mr-2" numberOfLines={1}>
                {user?.name || 'Partner Driver'}
              </Text>
              {/* Allow/Arrow button to edit personal info */}
              <TouchableOpacity 
                onPress={handleOpenEditPersonalInfo}
                style={{ 
                  backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                  borderColor: isDark ? '#334155' : '#cbd5e1'
                }}
                className="p-1.5 rounded-full border flex-row items-center"
              >
                <Ionicons name="pencil" size={13} color={themeStyles.accentGreen} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: themeStyles.subText }} className="text-xs font-normal mb-1" numberOfLines={1}>
              {vehicleSubtitle}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={14} color={themeStyles.accentGreen} />
              <Text style={{ color: themeStyles.accentGreen }} className="text-xs font-normal ml-1">
                Verified Partner
              </Text>
            </View>
          </View>
        </View>

        {/* Operative Vehicle & Fixtures Status Card (Differentiated for with-car vs without-car) */}
        <View 
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: hasVehicle 
              ? (driver?.vehicle?.ownership_type === 'employer' ? '#f59e0b' : themeStyles.accentGreen) 
              : themeStyles.cardBorder, 
            borderWidth: 1 
          }} 
          className="rounded-3xl p-5 mb-4 shadow-md"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1 mr-2">
              <View 
                style={{ 
                  backgroundColor: hasVehicle ? 'rgba(0, 229, 136, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  padding: 8,
                  borderRadius: 12,
                  marginRight: 10
                }}
              >
                <Ionicons 
                  name={hasVehicle ? "car-sport" : "person"} 
                  size={20} 
                  color={themeStyles.accentGreen} 
                />
              </View>
              <View className="flex-1">
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base" numberOfLines={1}>
                  {hasVehicle ? 'Operative Mode: Driver + Vehicle' : 'Operative Mode: Chauffeur Only'}
                </Text>
                <Text style={{ color: themeStyles.subText }} className="text-xs font-normal">
                  {hasVehicle 
                    ? (driver?.vehicle?.ownership_type === 'employer' 
                        ? 'Company / Employer Vehicle Registered' 
                        : 'Personal Vehicle Attached')
                    : 'Registered without personal vehicle'}
                </Text>
              </View>
            </View>
            <View 
              style={{
                backgroundColor: hasVehicle ? 'rgba(0, 229, 136, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                borderColor: hasVehicle ? themeStyles.accentGreen : '#3b82f6',
                borderWidth: 1,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8
              }}
            >
              <Text style={{ color: hasVehicle ? themeStyles.accentGreen : '#3b82f6', fontSize: 10, fontWeight: 'normal' }}>
                {hasVehicle ? 'CAR ATTACHED' : 'NO CAR'}
              </Text>
            </View>
          </View>

          {/* Differentiated Info Box */}
          {hasVehicle ? (
            <View 
              style={{ 
                backgroundColor: isDark ? '#090d16' : '#ffffff',
                borderColor: themeStyles.cardBorder,
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
                marginBottom: 12
              }}
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-1 mr-2">
                  <View 
                    style={{
                      backgroundColor: driver?.vehicle?.is_armored ? 'rgba(239, 68, 68, 0.15)' : driver?.vehicle?.vehicle_type === 'luxury' ? 'rgba(245, 158, 11, 0.15)' : driver?.vehicle?.vehicle_type === 'executive' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      borderColor: driver?.vehicle?.is_armored ? '#ef4444' : driver?.vehicle?.vehicle_type === 'luxury' ? '#f59e0b' : driver?.vehicle?.vehicle_type === 'executive' ? '#3b82f6' : '#10b981',
                      borderWidth: 1,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                      alignSelf: 'flex-start',
                      marginBottom: 4
                    }}
                  >
                    <Text style={{ color: driver?.vehicle?.is_armored ? '#ef4444' : driver?.vehicle?.vehicle_type === 'luxury' ? '#f59e0b' : driver?.vehicle?.vehicle_type === 'executive' ? '#3b82f6' : '#10b981', fontSize: 10, fontWeight: 'bold' }}>
                      {driver?.vehicle?.is_armored ? '🛡️ ARMORED VIP' : driver?.vehicle?.vehicle_type === 'luxury' ? '🌟 VIP LUXURY' : driver?.vehicle?.vehicle_type === 'executive' ? '👔 EXECUTIVE' : '🚗 STANDARD'}
                    </Text>
                  </View>
                  <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm" numberOfLines={1}>
                    {[driver?.vehicle?.make || driver?.vehicle_make, driver?.vehicle?.model || driver?.vehicle_model, driver?.vehicle?.year].filter(Boolean).join(' ')}
                  </Text>
                </View>
                <View 
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                    borderColor: themeStyles.cardBorder,
                    borderWidth: 1
                  }}
                >
                  <Text style={{ color: themeStyles.accentGreen }} className="text-xs font-normal">
                    {driver?.vehicle?.plate_number || driver?.license_plate || 'PLATE REG'}
                  </Text>
                </View>
              </View>

              {/* Ownership Type & Anti-Moonlighting Status */}
              <View className="mt-2 pt-2 border-t border-slate-700/30 flex-row items-center">
                <Ionicons 
                  name={driver?.vehicle?.ownership_type === 'employer' ? "shield-checkmark" : "checkmark-circle"} 
                  size={14} 
                  color={themeStyles.accentGreen} 
                  style={{ marginRight: 5 }} 
                />
                <Text 
                  style={{ 
                    color: themeStyles.accentGreen, 
                    fontSize: 11,
                    fontWeight: 'normal',
                    flex: 1
                  }}
                >
                  {driver?.vehicle?.ownership_type === 'employer' 
                    ? '🔒 Employer Vehicle: Protected against unauthorized street hailing'
                    : 'Personal Vehicle: Hailing Dispatches & Private Chauffeur Enabled'}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Action Trigger to Add/Update Vehicle */}
          <TouchableOpacity
            onPress={() => setVehicleModalVisible(true)}
            activeOpacity={0.85}
            style={{
              backgroundColor: hasVehicle ? (isDark ? '#1e293b' : '#e2e8f0') : themeStyles.accentGreen,
              borderColor: hasVehicle ? themeStyles.cardBorder : themeStyles.accentGreen,
              borderWidth: 1,
              borderRadius: 14,
              paddingVertical: 10,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons 
              name={hasVehicle ? "settings-outline" : "car"} 
              size={16} 
              color={hasVehicle ? themeStyles.primaryText : (isDark ? '#090d16' : '#ffffff')} 
              style={{ marginRight: 6 }} 
            />
            <Text 
              style={{ 
                color: hasVehicle ? themeStyles.primaryText : (isDark ? '#090d16' : '#ffffff'), 
                fontWeight: 'normal', 
                fontSize: 13 
              }}
            >
              {hasVehicle ? 'Update / Switch Vehicle Profile' : '🚗 Got a Car Later? Register Your Vehicle'}
            </Text>
          </TouchableOpacity>
        </View>


        {/* 3. Top Action Card Menu Group (Boost & Referrals & Simulation) */}
        <View 
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: themeStyles.cardBorder, 
            borderWidth: 1 
          }} 
          className="rounded-3xl mb-4 overflow-hidden shadow-lg"
        >
          {/* Driver Membership & Subscription Pass (300 NGN Daily) */}
          <TouchableOpacity
            style={{ borderBottomColor: themeStyles.borderDivider, borderBottomWidth: 1 }}
            className="p-4 flex-row justify-between items-center"
            onPress={() => navigation.navigate('DriverSubscription')}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <Ionicons name="card-outline" size={18} color={themeStyles.accentGreen} className="mr-3" />
              <View>
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm ml-2">
                  Driver Subscription Pass
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 mr-1.5">
                <Text className="text-emerald-500 font-normal text-[10px]">Active</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={themeStyles.subText} />
            </View>
          </TouchableOpacity>

          {/* Boost My Profile */}
          <TouchableOpacity
            style={{ borderBottomColor: themeStyles.borderDivider, borderBottomWidth: 1 }}
            className="p-4 flex-row justify-between items-center"
            onPress={() => navigation.navigate('BoostProfile')}
          >
            <View className="flex-row items-center">
              <Ionicons name="flash" size={18} color={themeStyles.accentGreen} className="mr-3" />
              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm ml-2">
                Boost my profile
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={themeStyles.subText} />
          </TouchableOpacity>

          {/* Road Safety & Driving Simulator Game Menu */}
          <TouchableOpacity
            style={{ borderBottomColor: themeStyles.borderDivider, borderBottomWidth: 1 }}
            className="p-4 flex-row justify-between items-center"
            onPress={() => navigation.navigate('DriverAssessment')}
          >
            <View className="flex-row items-center">
              <Ionicons name="game-controller" size={18} color={themeStyles.accentGreen} className="mr-3" />
              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm ml-2">
                Driver Simulator Game
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={themeStyles.subText} />
          </TouchableOpacity>

          {/* Referral Earnings */}
          <TouchableOpacity
            className="p-4 flex-row justify-between items-center"
            onPress={() => navigation.navigate('Referrals')}
          >
            <View className="flex-row items-center">
              <Ionicons name="gift" size={18} color={themeStyles.accentGreen} className="mr-3" />
              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm ml-2">
                Referral earnings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={themeStyles.subText} />
          </TouchableOpacity>
        </View>

        {/* 4. Main Details & Preferences Menu Group */}
        <View 
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: themeStyles.cardBorder, 
            borderWidth: 1 
          }} 
          className="rounded-3xl mb-5 overflow-hidden shadow-lg"
        >
          {/* Instant Fuel Loan Menu */}
          <TouchableOpacity
            style={{ borderBottomColor: themeStyles.borderDivider, borderBottomWidth: 1 }}
            className="p-4 flex-row justify-between items-center"
            onPress={() => navigation.navigate('InstantFuelLoan')}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <Ionicons name="speedometer-outline" size={18} color={themeStyles.accentGreen} style={{ marginRight: 8 }} />
              <View>
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm">
                  Instant Fuel Loan (0% Advance)
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 mr-1.5">
                <Text className="text-emerald-500 font-normal text-[10px]">★ Performance</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={themeStyles.subText} />
            </View>
          </TouchableOpacity>

          {/* My Destination Menu */}
          <TouchableOpacity
            style={{ borderBottomColor: themeStyles.borderDivider, borderBottomWidth: 1 }}
            className="p-4 flex-row justify-between items-center"
            onPress={() => navigation.navigate('MyDestination')}
          >
            <View className="flex-row items-center">
              <Ionicons name="compass-outline" size={18} color={themeStyles.accentGreen} style={{ marginRight: 8 }} />
              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm">
                My Destination (Commute Filter)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={themeStyles.subText} />
          </TouchableOpacity>

          {/* Documents & licence */}
          <TouchableOpacity
            style={{ borderBottomColor: themeStyles.borderDivider, borderBottomWidth: 1 }}
            className="p-4 flex-row justify-between items-center"
            onPress={() => navigation.navigate('DriverDocuments')}
          >
            <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm">
              Documents & licence
            </Text>
            <Ionicons name="chevron-forward" size={18} color={themeStyles.subText} />
          </TouchableOpacity>

          {/* Vehicle & Rates */}
          <TouchableOpacity
            style={{ borderBottomColor: themeStyles.borderDivider, borderBottomWidth: 1 }}
            className="p-4 flex-row justify-between items-center"
            onPress={() => navigation.navigate('VehicleInspection')}
          >
            <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm">
              Vehicle & Rates
            </Text>
            <Ionicons name="chevron-forward" size={18} color={themeStyles.subText} />
          </TouchableOpacity>

          {/* Hire Availability */}
          <TouchableOpacity
            style={{ borderBottomColor: themeStyles.borderDivider, borderBottomWidth: 1 }}
            className="p-4 flex-row justify-between items-center"
            onPress={() => navigation.navigate('Schedule')}
          >
            <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm">
              Hire availability
            </Text>
            <Ionicons name="chevron-forward" size={18} color={themeStyles.subText} />
          </TouchableOpacity>

          {/* Driver Wallet & Bank Account */}
          <TouchableOpacity
            style={{ borderBottomColor: themeStyles.borderDivider, borderBottomWidth: 1 }}
            className="p-4 flex-row justify-between items-center"
            onPress={() => navigation.navigate('DriverWallet')}
          >
            <View>
              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm">
                Driver Wallet & Bank Account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={themeStyles.subText} />
          </TouchableOpacity>

          {/* Country Selection Menu */}
          <TouchableOpacity 
            className="p-4 flex-row justify-between items-center"
            onPress={() => setCountryModalVisible(true)}
          >
            <View className="flex-row items-center">
              <Text className="text-base mr-2.5">{selectedCountry.flag}</Text>
              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm">
                Country: {selectedCountry.name} ({selectedCountry.code})
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text style={{ color: themeStyles.accentGreen }} className="text-xs font-normal mr-1.5">{selectedCountry.currency}</Text>
              <Ionicons name="chevron-forward" size={18} color={themeStyles.subText} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. Partner Support Button */}
        <TouchableOpacity
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: themeStyles.cardBorder, 
            borderWidth: 1 
          }} 
          className="rounded-3xl p-4 flex-row justify-center items-center mb-4 shadow-lg"
          onPress={handlePartnerSupport}
        >
          <Ionicons name="call-outline" size={18} color={themeStyles.accentGreen} className="mr-2" />
          <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base ml-2">
            Partner support
          </Text>
        </TouchableOpacity>

        {/* 6. Log Out Trigger */}
        <TouchableOpacity
          className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-4 flex-row justify-center items-center mb-4"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#f43f5e" className="mr-2" />
          <Text className="text-rose-500 font-normal text-sm ml-2">Sign Out</Text>
        </TouchableOpacity>

        {/* 7. Delete Partner Account (Apple App Store & Google Play Compliance) */}
        <TouchableOpacity
          style={{ borderColor: themeStyles.cardBorder }}
          className="border rounded-3xl p-3 flex-row justify-center items-center mb-8"
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={16} color={themeStyles.subText} className="mr-2" />
          <Text style={{ color: themeStyles.subText }} className="font-normal text-xs ml-2 uppercase tracking-wider">
            Delete Partner Account
          </Text>
        </TouchableOpacity>

        {/* Modal: Edit Personal Information */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/70">
            <View 
              style={{ 
                backgroundColor: themeStyles.cardBg, 
                borderColor: themeStyles.cardBorder, 
                borderWidth: 1,
                maxHeight: '90%'
              }}
              className="rounded-t-[2.5rem] p-6 pb-10 shadow-2xl"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xl">
                  Edit Personal Information
                </Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color={themeStyles.subText} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={{ color: themeStyles.subText }} className="text-xs mb-4 font-normal">
                  Update your picture avatar and personal credentials for passenger verification.
                </Text>

                {/* Picture Avatar Editor */}
                <View className="items-center mb-5">
                  <TouchableOpacity
                    onPress={promptAvatarSource}
                    activeOpacity={0.8}
                    className="relative"
                  >
                    <View 
                      style={{ 
                        borderColor: themeStyles.accentGreen,
                        backgroundColor: isDark ? '#121927' : '#f1f5f9',
                        borderWidth: 2
                      }} 
                      className="w-24 h-24 rounded-full items-center justify-center overflow-hidden shadow-md"
                    >
                      {editAvatar || user?.avatar ? (
                        <Image
                          source={{ uri: getAvatarUri(editAvatar || user?.avatar) }}
                          className="w-full h-full"
                        />
                      ) : (
                        <Text style={{ color: themeStyles.primaryText }} className="text-2xl font-normal">
                          {initials}
                        </Text>
                      )}
                    </View>
                    <View 
                      style={{ backgroundColor: themeStyles.brandGreen }}
                      className="absolute bottom-0 right-0 p-2 rounded-full border-2 border-white shadow-md items-center justify-center"
                    >
                      <Ionicons name="camera" size={14} color="#090d16" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={promptAvatarSource}
                    className="mt-2.5 flex-row items-center"
                  >
                    <Ionicons name="camera-outline" size={15} color={themeStyles.accentGreen} />
                    <Text style={{ color: themeStyles.accentGreen }} className="text-xs font-normal ml-1.5">
                      {editAvatar || user?.avatar ? 'Change Picture Avatar' : 'Add Picture Avatar'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Full Name */}
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs mb-1.5 uppercase">
                  Full Name
                </Text>
                <TextInput 
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Full Name"
                  placeholderTextColor={themeStyles.subText}
                  style={{
                    backgroundColor: isDark ? '#090d16' : '#ffffff',
                    borderColor: themeStyles.cardBorder,
                    color: themeStyles.primaryText,
                    borderWidth: 1
                  }}
                  className="rounded-2xl px-4 py-3 mb-3 text-sm font-normal"
                />

                {/* Phone Number */}
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs mb-1.5 uppercase">
                  Phone Number
                </Text>
                <TextInput 
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                  placeholder="e.g. 08012345678"
                  placeholderTextColor={themeStyles.subText}
                  style={{
                    backgroundColor: isDark ? '#090d16' : '#ffffff',
                    borderColor: themeStyles.cardBorder,
                    color: themeStyles.primaryText,
                    borderWidth: 1
                  }}
                  className="rounded-2xl px-4 py-3 mb-3 text-sm font-normal"
                />

                {/* Email */}
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs mb-1.5 uppercase">
                  Email Address
                </Text>
                <TextInput 
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  placeholder="e.g. driver@ogadriver.ng"
                  placeholderTextColor={themeStyles.subText}
                  style={{
                    backgroundColor: isDark ? '#090d16' : '#ffffff',
                    borderColor: themeStyles.cardBorder,
                    color: themeStyles.primaryText,
                    borderWidth: 1
                  }}
                  className="rounded-2xl px-4 py-3 mb-5 text-sm font-normal"
                />

                {/* Save Button */}
                <TouchableOpacity
                  onPress={handleSavePersonalInfo}
                  disabled={savingEdit}
                  style={{ backgroundColor: themeStyles.brandGreen }}
                  className="py-4 rounded-2xl items-center justify-center shadow-lg mb-2"
                >
                  {savingEdit ? (
                    <ActivityIndicator color="#090d16" />
                  ) : (
                    <Text className="text-slate-950 font-normal text-sm uppercase tracking-wider">
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal: Select Country */}
        <Modal
          visible={countryModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCountryModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/70">
            <View 
              style={{
                backgroundColor: themeStyles.cardBg,
                borderColor: themeStyles.cardBorder,
                borderTopWidth: 1
              }}
              className="rounded-t-3xl p-6"
            >
              <View className="flex-row justify-between items-center mb-5">
                <View>
                  <Text style={{ color: themeStyles.primaryText }} className="text-xl font-normal">
                    Select Operating Country
                  </Text>
                  <Text style={{ color: themeStyles.subText }} className="text-xs font-normal">
                    Switches regional dispatch currency and road rules
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                  <Ionicons name="close-circle" size={26} color={themeStyles.subText} />
                </TouchableOpacity>
              </View>

              <View className="space-y-2 mb-6">
                {(supportedCountries || []).map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    onPress={() => {
                      updateCountry(item);
                      setCountryModalVisible(false);
                      Alert.alert("Operating Country Updated", `Your global dispatch & wallet country has been set to ${item.name} (${item.currency}).`);
                    }}
                    style={{
                      backgroundColor: selectedCountry.code === item.code 
                        ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)') 
                        : (isDark ? '#090d16' : '#ffffff'),
                      borderColor: selectedCountry.code === item.code ? themeStyles.brandGreen : themeStyles.cardBorder,
                      borderWidth: 1
                    }}
                    className="p-3.5 rounded-2xl flex-row items-center justify-between mb-2"
                  >
                    <View className="flex-row items-center">
                      <Text className="text-xl mr-3">{item.flag}</Text>
                      <View>
                        <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm">
                          {item.name}
                        </Text>
                        <Text style={{ color: themeStyles.subText }} className="text-[11px] font-normal">
                          Dial Code: {item.dialCode} • Currency: {item.currency}
                        </Text>
                      </View>
                    </View>
                    {selectedCountry.code === item.code && (
                      <Ionicons name="checkmark-circle" size={20} color={themeStyles.brandGreen} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: Register / Update Vehicle Profile */}
        <Modal
          visible={vehicleModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setVehicleModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/75">
            <View 
              style={{ 
                backgroundColor: themeStyles.cardBg, 
                borderColor: themeStyles.cardBorder, 
                borderWidth: 1,
                maxHeight: '88%'
              }}
              className="rounded-t-[2.5rem] p-6 pb-10 shadow-2xl"
            >
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-1 mr-2">
                  <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xl">
                    Register Vehicle Profile
                  </Text>
                  <Text style={{ color: themeStyles.subText }} className="text-xs font-normal">
                    Got a car later? Register details to upgrade your operative mode
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setVehicleModalVisible(false)}>
                  <Ionicons name="close-circle" size={26} color={themeStyles.subText} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="mt-2">
                {/* 1. SMART LIVE VEHICLE PREVIEW CARD (HERO) */}
                <View
                  style={{
                    backgroundColor: isDark ? '#0c121f' : '#f1f5f9',
                    borderColor: isArmored 
                      ? '#ef4444' 
                      : vehicleTier === 'luxury' 
                        ? '#f59e0b' 
                        : vehicleTier === 'executive' 
                          ? '#3b82f6' 
                          : '#10b981',
                    borderWidth: 1.5,
                    borderRadius: 20,
                    padding: 14,
                    marginBottom: 16
                  }}
                  className="shadow-sm"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        style={{
                          backgroundColor: isArmored 
                            ? 'rgba(239, 68, 68, 0.18)' 
                            : vehicleTier === 'luxury' 
                              ? 'rgba(245, 158, 11, 0.18)' 
                              : vehicleTier === 'executive' 
                                ? 'rgba(59, 130, 246, 0.18)' 
                                : 'rgba(16, 185, 129, 0.18)',
                          borderRadius: 12,
                          padding: 7,
                          marginRight: 9
                        }}
                      >
                        <Ionicons
                          name={isArmored ? "shield-checkmark" : vehicleTier === 'luxury' ? "diamond" : "car-sport"}
                          size={20}
                          color={themeStyles.accentGreen}
                        />
                      </View>
                      <View className="flex-1">
                        <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm" numberOfLines={1}>
                          {vehicleMake || 'Select Brand'} {vehicleModel || 'Select Model'}
                        </Text>
                        <Text style={{ color: themeStyles.subText }} className="text-[11px] font-normal">
                          Live Fleet Classification Preview
                        </Text>
                      </View>
                    </View>

                    {/* Dynamic Tier Badge */}
                    <View
                      style={{
                        backgroundColor: isArmored 
                          ? 'rgba(239, 68, 68, 0.15)' 
                          : vehicleTier === 'luxury' 
                            ? 'rgba(245, 158, 11, 0.15)' 
                            : vehicleTier === 'executive' 
                              ? 'rgba(59, 130, 246, 0.15)' 
                              : 'rgba(16, 185, 129, 0.15)',
                        borderColor: isArmored 
                          ? '#ef4444' 
                          : vehicleTier === 'luxury' 
                            ? '#f59e0b' 
                            : vehicleTier === 'executive' 
                              ? '#3b82f6' 
                              : '#10b981',
                        borderWidth: 1,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8
                      }}
                    >
                      <Text
                        style={{
                          color: isArmored ? '#ef4444' : vehicleTier === 'luxury' ? '#f59e0b' : vehicleTier === 'executive' ? '#3b82f6' : '#10b981',
                          fontSize: 10,
                          fontWeight: 'normal'
                        }}
                      >
                        {isArmored ? '🛡️ ARMORED VIP' : vehicleTier === 'luxury' ? '🌟 VIP LUXURY' : vehicleTier === 'executive' ? '👔 EXECUTIVE' : '🚗 STANDARD'}
                      </Text>
                    </View>
                  </View>

                  {/* Badges Row: Year, Color swatch, FRSC Plate */}
                  <View className="flex-row items-center flex-wrap pt-1 border-t border-slate-700/20">
                    <View
                      style={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        borderColor: themeStyles.cardBorder,
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 7,
                        paddingVertical: 2.5,
                        marginRight: 6,
                        marginBottom: 4,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                    >
                      <Ionicons name="calendar-outline" size={11} color={themeStyles.subText} style={{ marginRight: 3 }} />
                      <Text style={{ color: themeStyles.primaryText, fontSize: 10, fontWeight: 'normal' }}>
                        {vehicleYear || '2023'}
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        borderColor: themeStyles.cardBorder,
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 7,
                        paddingVertical: 2.5,
                        marginRight: 6,
                        marginBottom: 4,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                    >
                      <View 
                        style={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: 4, 
                          backgroundColor: COLOR_SWATCHES.find(c => (vehicleColor || '').toLowerCase().includes(c.name.toLowerCase().split(' ')[0]))?.hex || '#10b981',
                          marginRight: 4 
                        }} 
                      />
                      <Text style={{ color: themeStyles.primaryText, fontSize: 10, fontWeight: 'normal' }}>
                        {vehicleColor || 'Jet Black'}
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        borderColor: vehiclePlate ? themeStyles.accentGreen : themeStyles.cardBorder,
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 7,
                        paddingVertical: 2.5,
                        marginRight: 6,
                        marginBottom: 4,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ fontSize: 9, marginRight: 3 }}>🇳🇬</Text>
                      <Text style={{ color: vehiclePlate ? themeStyles.accentGreen : themeStyles.subText, fontSize: 10, fontWeight: 'normal' }}>
                        {vehiclePlate ? vehiclePlate.toUpperCase() : 'NO PLATE YET'}
                      </Text>
                    </View>

                    {/* Ownership Status Pill */}
                    <View
                      style={{
                        backgroundColor: vehicleOwnership === 'employer' 
                          ? (isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7') 
                          : (isDark ? 'rgba(0, 229, 136, 0.12)' : '#ecfdf5'),
                        borderColor: vehicleOwnership === 'employer' ? '#f59e0b' : themeStyles.accentGreen,
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 7,
                        paddingVertical: 2.5,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: vehicleOwnership === 'employer' ? '#d97706' : themeStyles.accentGreen,
                          fontSize: 10,
                          fontWeight: 'normal'
                        }}
                      >
                        {vehicleOwnership === 'employer' ? '🔒 Employer (Hailing Locked)' : vehicleOwnership === 'rental_hp' ? '📋 Hire-Purchase' : '🚗 Personal'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 2. SMART 1-TAP BRAND (MAKE) SELECTOR */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs uppercase">
                      1. Vehicle Brand (Make) *
                    </Text>
                    <TouchableOpacity 
                      onPress={() => setProfileBrandModalVisible(true)}
                      className="flex-row items-center"
                    >
                      <Text style={{ color: themeStyles.accentGreen }} className="text-xs font-normal mr-0.5">
                        All Brands
                      </Text>
                      <Ionicons name="chevron-forward" size={14} color={themeStyles.accentGreen} />
                    </TouchableOpacity>
                  </View>

                  {/* 1-Tap Popular Brand Chips */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    {POPULAR_BRANDS.map((brandName) => {
                      const isSelected = vehicleMake === brandName;
                      return (
                        <TouchableOpacity
                          key={brandName}
                          onPress={() => {
                            setVehicleMake(brandName);
                            const defaults = MODELS_BY_BRAND[brandName];
                            if (defaults && defaults.length > 0) {
                              setVehicleModel(defaults[0].name);
                              const autoTier = detectFleetTier(brandName, defaults[0].name, vehicleYear, isArmored);
                              setVehicleTier(isArmored ? 'armored_vip' : autoTier);
                            } else {
                              const autoTier = detectFleetTier(brandName, vehicleModel, vehicleYear, isArmored);
                              setVehicleTier(isArmored ? 'armored_vip' : autoTier);
                            }
                          }}
                          style={{
                            backgroundColor: isSelected 
                              ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.1)') 
                              : (isDark ? '#090d16' : '#ffffff'),
                            borderColor: isSelected ? themeStyles.accentGreen : themeStyles.cardBorder,
                            borderWidth: isSelected ? 1.5 : 1,
                            paddingHorizontal: 11,
                            paddingVertical: 7,
                            borderRadius: 12,
                            marginRight: 7,
                            flexDirection: 'row',
                            alignItems: 'center'
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons 
                            name="car-outline" 
                            size={12} 
                            color={isSelected ? themeStyles.accentGreen : themeStyles.subText} 
                            style={{ marginRight: 4 }} 
                          />
                          <Text 
                            style={{ 
                              color: isSelected ? themeStyles.accentGreen : themeStyles.primaryText, 
                              fontSize: 12, 
                              fontWeight: 'normal' 
                            }}
                          >
                            {brandName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Selected Brand Field with Search Modal Trigger */}
                  <TouchableOpacity
                    onPress={() => setProfileBrandModalVisible(true)}
                    style={{
                      backgroundColor: isDark ? '#090d16' : '#ffffff',
                      borderColor: themeStyles.cardBorder,
                      borderWidth: 1
                    }}
                    className="rounded-xl p-3 flex-row items-center justify-between"
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <Ionicons name="checkmark-circle" size={16} color={themeStyles.accentGreen} style={{ marginRight: 8 }} />
                      <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs">
                        Selected Brand: <Text style={{ color: themeStyles.accentGreen }}>{vehicleMake}</Text>
                      </Text>
                    </View>
                    <Text style={{ color: themeStyles.subText }} className="text-xs font-normal">
                      Tap to Search List ▾
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 3. SMART 1-TAP MODEL SELECTOR */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs uppercase">
                      2. Vehicle Model *
                    </Text>
                    <TouchableOpacity 
                      onPress={() => setProfileModelModalVisible(true)}
                      className="flex-row items-center"
                    >
                      <Text style={{ color: themeStyles.accentGreen }} className="text-xs font-normal mr-0.5">
                        More Models
                      </Text>
                      <Ionicons name="chevron-forward" size={14} color={themeStyles.accentGreen} />
                    </TouchableOpacity>
                  </View>

                  {/* 1-Tap Popular Models for Selected Brand */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    {(MODELS_BY_BRAND[vehicleMake] || []).slice(0, 6).map((mItem) => {
                      const isSelected = vehicleModel === mItem.name;
                      return (
                        <TouchableOpacity
                          key={mItem.name}
                          onPress={() => {
                            setVehicleModel(mItem.name);
                            const autoTier = isArmored ? 'armored_vip' : (mItem.tier || detectFleetTier(vehicleMake, mItem.name, vehicleYear, false));
                            setVehicleTier(autoTier);
                          }}
                          style={{
                            backgroundColor: isSelected 
                              ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.1)') 
                              : (isDark ? '#090d16' : '#ffffff'),
                            borderColor: isSelected ? themeStyles.accentGreen : themeStyles.cardBorder,
                            borderWidth: isSelected ? 1.5 : 1,
                            paddingHorizontal: 10,
                            paddingVertical: 7,
                            borderRadius: 12,
                            marginRight: 7,
                          }}
                          activeOpacity={0.8}
                        >
                          <Text 
                            style={{ 
                              color: isSelected ? themeStyles.accentGreen : themeStyles.primaryText, 
                              fontSize: 11, 
                              fontWeight: 'normal' 
                            }}
                          >
                            {mItem.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Custom Model Toggle / Active Model Box */}
                  <View 
                    style={{
                      backgroundColor: isDark ? '#090d16' : '#ffffff',
                      borderColor: themeStyles.cardBorder,
                      borderWidth: 1
                    }}
                    className="rounded-xl p-3 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <Ionicons name="speedometer-outline" size={16} color={themeStyles.accentGreen} style={{ marginRight: 8 }} />
                      <TextInput
                        value={vehicleModel}
                        onChangeText={(text) => {
                          setVehicleModel(text);
                          if (!isArmored) {
                            setVehicleTier(detectFleetTier(vehicleMake, text, vehicleYear, false));
                          }
                        }}
                        placeholder="Type model if unlisted (e.g. S-Class, Prado)..."
                        placeholderTextColor={themeStyles.subText}
                        style={{ color: themeStyles.primaryText, flex: 1, padding: 0 }}
                        className="text-xs font-normal"
                      />
                    </View>
                    <TouchableOpacity onPress={() => setProfileModelModalVisible(true)}>
                      <Ionicons name="list" size={16} color={themeStyles.accentGreen} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 4. SMART AUTO-CLASSIFICATION & ARMORED VIP TOGGLE */}
                <View
                  style={{
                    backgroundColor: isDark ? '#090d16' : '#f8fafc',
                    borderColor: themeStyles.cardBorder,
                    borderWidth: 1,
                    borderRadius: 16,
                    padding: 12,
                    marginBottom: 16
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1 mr-2">
                      <Ionicons name="sparkles" size={14} color={themeStyles.accentGreen} style={{ marginRight: 6 }} />
                      <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs">
                        Auto-Classified Fleet Tier:
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setTierOverrideModalVisible(true)}
                      style={{
                        backgroundColor: isArmored 
                          ? 'rgba(239, 68, 68, 0.15)' 
                          : vehicleTier === 'luxury' 
                            ? 'rgba(245, 158, 11, 0.15)' 
                            : vehicleTier === 'executive' 
                              ? 'rgba(59, 130, 246, 0.15)' 
                              : 'rgba(16, 185, 129, 0.15)',
                        borderColor: isArmored ? '#ef4444' : vehicleTier === 'luxury' ? '#f59e0b' : vehicleTier === 'executive' ? '#3b82f6' : '#10b981',
                        borderWidth: 1,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                    >
                      <Text
                        style={{
                          color: isArmored ? '#ef4444' : vehicleTier === 'luxury' ? '#f59e0b' : vehicleTier === 'executive' ? '#3b82f6' : '#10b981',
                          fontSize: 10,
                          fontWeight: 'normal',
                          marginRight: 4
                        }}
                      >
                        {isArmored ? '🛡️ Armored VIP' : vehicleTier === 'luxury' ? '🌟 VIP Luxury' : vehicleTier === 'executive' ? '👔 Executive' : '🚗 Standard'}
                      </Text>
                      <Ionicons name="chevron-down" size={10} color={themeStyles.subText} />
                    </TouchableOpacity>
                  </View>

                  {/* Bulletproof Armored Toggle */}
                  <View className="flex-row items-center justify-between pt-2 border-t border-slate-700/20">
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center">
                        <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs">
                          🛡️ Ballistic Armored (B6 / B7 Spec)
                        </Text>
                      </View>
                      <Text style={{ color: themeStyles.subText }} className="text-[10px] font-normal mt-0.5">
                        High-threat protection escort & diplomatic convoy rate
                      </Text>
                    </View>
                    <Switch
                      value={isArmored}
                      onValueChange={(val) => {
                        setIsArmored(val);
                        if (val) {
                          setVehicleTier('armored_vip');
                        } else {
                          setVehicleTier(detectFleetTier(vehicleMake, vehicleModel, vehicleYear, false));
                        }
                      }}
                      trackColor={{ false: isDark ? '#1e293b' : '#cbd5e1', true: '#ef4444' }}
                      thumbColor={isArmored ? '#ffffff' : '#f4f3f4'}
                    />
                  </View>
                </View>

                {/* 5. VEHICLE SPECS: YEAR, COLOR SWATCHES & FRSC PLATE */}
                <View className="mb-4">
                  <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs uppercase mb-2">
                    3. Vehicle Specifications *
                  </Text>

                  {/* Year Quick Chips */}
                  <View className="mb-3">
                    <Text style={{ color: themeStyles.subText }} className="text-[11px] font-normal mb-1.5">
                      Model Year
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-1.5">
                      {POPULAR_YEARS.slice(0, 6).map((yr) => {
                        const isSelected = vehicleYear === yr;
                        return (
                          <TouchableOpacity
                            key={yr}
                            onPress={() => {
                              setVehicleYear(yr);
                              if (!isArmored) {
                                setVehicleTier(detectFleetTier(vehicleMake, vehicleModel, yr, false));
                              }
                            }}
                            style={{
                              backgroundColor: isSelected 
                                ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.1)') 
                                : (isDark ? '#090d16' : '#ffffff'),
                              borderColor: isSelected ? themeStyles.accentGreen : themeStyles.cardBorder,
                              borderWidth: isSelected ? 1.5 : 1,
                              paddingHorizontal: 12,
                              paddingVertical: 5,
                              borderRadius: 10,
                              marginRight: 6
                            }}
                          >
                            <Text style={{ color: isSelected ? themeStyles.accentGreen : themeStyles.primaryText, fontSize: 11, fontWeight: 'normal' }}>
                              {yr}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Color Swatches */}
                  <View className="mb-3">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text style={{ color: themeStyles.subText }} className="text-[11px] font-normal">
                        Vehicle Color
                      </Text>
                      <Text style={{ color: themeStyles.accentGreen }} className="text-[11px] font-normal">
                        Selected: {vehicleColor}
                      </Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
                      {COLOR_SWATCHES.map((swatch) => {
                        const isSelected = (vehicleColor || '').toLowerCase().includes(swatch.name.toLowerCase().split(' ')[0]);
                        return (
                          <TouchableOpacity
                            key={swatch.name}
                            onPress={() => setVehicleColor(swatch.name)}
                            style={{
                              backgroundColor: isDark ? '#090d16' : '#ffffff',
                              borderColor: isSelected ? themeStyles.accentGreen : themeStyles.cardBorder,
                              borderWidth: isSelected ? 1.5 : 1,
                              borderRadius: 12,
                              paddingHorizontal: 9,
                              paddingVertical: 5,
                              marginRight: 7,
                              flexDirection: 'row',
                              alignItems: 'center'
                            }}
                            activeOpacity={0.8}
                          >
                            <View
                              style={{
                                width: 14,
                                height: 14,
                                borderRadius: 7,
                                backgroundColor: swatch.hex,
                                borderColor: swatch.border || 'transparent',
                                borderWidth: swatch.border ? 1 : 0,
                                marginRight: 5
                              }}
                            />
                            <Text style={{ color: isSelected ? themeStyles.accentGreen : themeStyles.primaryText, fontSize: 11, fontWeight: 'normal' }}>
                              {swatch.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* FRSC Plate Number */}
                  <View>
                    <Text style={{ color: themeStyles.subText }} className="text-[11px] font-normal mb-1">
                      FRSC Plate Number *
                    </Text>
                    <View
                      style={{
                        backgroundColor: isDark ? '#090d16' : '#ffffff',
                        borderColor: themeStyles.cardBorder,
                        borderWidth: 1
                      }}
                      className="rounded-xl px-3 py-2 flex-row items-center"
                    >
                      <View 
                        style={{ 
                          backgroundColor: isDark ? '#1e293b' : '#f1f5f9', 
                          paddingHorizontal: 6, 
                          paddingVertical: 2, 
                          borderRadius: 6, 
                          marginRight: 8 
                        }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: 'normal', color: themeStyles.accentGreen }}>
                          🇳🇬 FRSC
                        </Text>
                      </View>
                      <TextInput 
                        value={vehiclePlate}
                        onChangeText={setVehiclePlate}
                        placeholder="e.g. KSF-849-AA"
                        autoCapitalize="characters"
                        placeholderTextColor={themeStyles.subText}
                        style={{ color: themeStyles.primaryText, flex: 1, padding: 0 }}
                        className="text-xs font-normal uppercase"
                      />
                    </View>
                  </View>
                </View>

                {/* 6. OWNERSHIP CLASSIFICATION (3 SIMPLE OPTIONS) */}
                <View className="mb-5">
                  <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs uppercase mb-2">
                    4. Vehicle Ownership Classification *
                  </Text>

                  {[
                    {
                      id: 'personal',
                      icon: 'car',
                      title: 'Personally Owned (My Car)',
                      desc: 'Full freedom: Approved for on-demand hailing, airport transfers & scheduled hire',
                    },
                    {
                      id: 'employer',
                      icon: 'shield-checkmark',
                      title: 'Employer / Company Car (Boss Car)',
                      desc: '🔒 Anti-Moonlighting Lock: Commercial street hailing locked to protect employer vehicle',
                    },
                    {
                      id: 'rental_hp',
                      icon: 'briefcase',
                      title: 'Hire-Purchase / Fleet Rental',
                      desc: 'Commercial financing / lease-to-own with partner fleet terms',
                    }
                  ].map((own) => {
                    const isSelected = vehicleOwnership === own.id;
                    return (
                      <TouchableOpacity
                        key={own.id}
                        onPress={() => setVehicleOwnership(own.id)}
                        style={{
                          backgroundColor: isSelected 
                            ? (isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)') 
                            : (isDark ? '#090d16' : '#ffffff'),
                          borderColor: isSelected ? themeStyles.accentGreen : themeStyles.cardBorder,
                          borderWidth: isSelected ? 1.5 : 1,
                          padding: 12,
                          borderRadius: 16,
                          marginBottom: 8
                        }}
                        activeOpacity={0.8}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1 mr-2">
                            <Ionicons name={own.icon} size={16} color={isSelected ? themeStyles.accentGreen : themeStyles.subText} style={{ marginRight: 8 }} />
                            <View className="flex-1">
                              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs">
                                {own.title}
                              </Text>
                              <Text style={{ color: isSelected && own.id === 'employer' ? themeStyles.accentGreen : themeStyles.subText }} className="text-[10px] font-normal mt-0.5">
                                {own.desc}
                              </Text>
                            </View>
                          </View>
                          <View 
                            style={{
                              backgroundColor: isSelected ? themeStyles.accentGreen : 'transparent',
                              borderColor: isSelected ? themeStyles.accentGreen : themeStyles.subText,
                              borderWidth: 1.5
                            }}
                            className="w-4 h-4 rounded-full items-center justify-center"
                          >
                            {isSelected && (
                              <Ionicons name="checkmark" size={10} color="#090d16" />
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 7. SAVE VEHICLE PROFILE CTA */}
                <TouchableOpacity
                  onPress={handleSaveVehicle}
                  disabled={savingVehicle}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: themeStyles.accentGreen,
                    paddingVertical: 14,
                    borderRadius: 16,
                    alignItems: 'center',
                    marginBottom: 24
                  }}
                  className="shadow-lg"
                >
                  {savingVehicle ? (
                    <ActivityIndicator color={isDark ? "#090d16" : "#ffffff"} />
                  ) : (
                    <Text 
                      style={{ 
                        color: isDark ? '#090d16' : '#ffffff', 
                        fontSize: 14, 
                        fontWeight: 'normal' 
                      }}
                    >
                      Save & Register Vehicle Profile
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* TIER OVERRIDE MODAL */}
        <Modal
          visible={tierOverrideModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setTierOverrideModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 }}>
            <View 
              style={{ 
                backgroundColor: isDark ? '#121927' : '#ffffff', 
                borderColor: themeStyles.cardBorder, 
                borderWidth: 1 
              }}
              className="rounded-3xl p-5"
            >
              <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-slate-700/20">
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
                  Choose Fleet Classification Tier
                </Text>
                <TouchableOpacity onPress={() => setTierOverrideModalVisible(false)} className="p-1">
                  <Ionicons name="close" size={20} color={themeStyles.subText} />
                </TouchableOpacity>
              </View>

              {FLEET_TYPES_LIST.map((tItem) => {
                const isSelected = tItem.id === 'armored_vip' ? isArmored : (vehicleTier === tItem.id && !isArmored);
                return (
                  <TouchableOpacity
                    key={tItem.id}
                    onPress={() => {
                      if (tItem.id === 'armored_vip') {
                        setIsArmored(true);
                        setVehicleTier('armored_vip');
                      } else {
                        setIsArmored(false);
                        setVehicleTier(tItem.id);
                      }
                      setTierOverrideModalVisible(false);
                    }}
                    style={{
                      backgroundColor: isSelected ? (isDark ? 'rgba(0, 229, 136, 0.12)' : '#ecfdf5') : (isDark ? '#090d16' : '#ffffff'),
                      borderColor: isSelected ? themeStyles.accentGreen : themeStyles.cardBorder,
                      borderWidth: 1,
                      padding: 12,
                      borderRadius: 14,
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <Ionicons name={tItem.icon} size={18} color={isSelected ? themeStyles.accentGreen : themeStyles.subText} style={{ marginRight: 8 }} />
                      <View className="flex-1">
                        <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs">
                          {tItem.name}
                        </Text>
                        <Text style={{ color: themeStyles.subText }} className="text-[10px] font-normal">
                          {tItem.desc}
                        </Text>
                      </View>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={18} color={themeStyles.accentGreen} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Modal>

        {/* BRAND SELECTION MODAL LIST */}
        <Modal
          visible={profileBrandModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setProfileBrandModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
            <View 
              style={{ 
                backgroundColor: isDark ? '#121927' : '#ffffff', 
                borderTopColor: themeStyles.cardBorder, 
                borderTopWidth: 1,
                maxHeight: '80%'
              }}
              className="rounded-t-3xl p-5"
            >
              <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-slate-700/20">
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
                  Select Vehicle Brand (Make)
                </Text>
                <TouchableOpacity onPress={() => setProfileBrandModalVisible(false)} className="p-1">
                  <Ionicons name="close" size={22} color={themeStyles.subText} />
                </TouchableOpacity>
              </View>

              <TextInput 
                style={{
                  backgroundColor: isDark ? '#090d16' : '#f8fafc',
                  borderColor: themeStyles.cardBorder,
                  color: themeStyles.primaryText,
                  borderWidth: 1
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-normal mb-3"
                placeholder="Search brand (e.g. Mercedes, Lexus, Toyota)..."
                placeholderTextColor={themeStyles.subText}
                value={profileBrandSearch}
                onChangeText={setProfileBrandSearch}
              />

              <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                {VEHICLE_BRANDS.filter(b => b.toLowerCase().includes(profileBrandSearch.toLowerCase().trim())).map((b) => {
                  const isSelected = vehicleMake === b;
                  return (
                    <TouchableOpacity
                      key={b}
                      onPress={() => {
                        setVehicleMake(b);
                        const defaults = MODELS_BY_BRAND[b];
                        if (defaults && defaults.length > 0) {
                          setVehicleModel(defaults[0].name);
                          setVehicleTier(defaults[0].tier);
                        }
                        setProfileBrandModalVisible(false);
                        setProfileBrandSearch('');
                      }}
                      style={{
                        backgroundColor: isSelected ? (isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)') : (isDark ? '#090d16' : '#ffffff'),
                        borderColor: isSelected ? themeStyles.accentGreen : themeStyles.cardBorder,
                        borderWidth: 1
                      }}
                      className="p-3.5 rounded-2xl mb-2 flex-row items-center justify-between"
                    >
                      <Text style={{ color: isSelected ? themeStyles.accentGreen : themeStyles.primaryText }} className="font-normal text-sm">
                        {b}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color={themeStyles.accentGreen} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* MODEL SELECTION MODAL LIST */}
        <Modal
          visible={profileModelModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setProfileModelModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
            <View 
              style={{ 
                backgroundColor: isDark ? '#121927' : '#ffffff', 
                borderTopColor: themeStyles.cardBorder, 
                borderTopWidth: 1,
                maxHeight: '80%'
              }}
              className="rounded-t-3xl p-5"
            >
              <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-slate-700/20">
                <View>
                  <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
                    Select {vehicleMake} Model
                  </Text>
                  <Text style={{ color: themeStyles.subText }} className="text-xs font-normal">
                    Includes verified platform tier classification
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setProfileModelModalVisible(false)} className="p-1">
                  <Ionicons name="close" size={22} color={themeStyles.subText} />
                </TouchableOpacity>
              </View>

              <TextInput 
                style={{
                  backgroundColor: isDark ? '#090d16' : '#f8fafc',
                  borderColor: themeStyles.cardBorder,
                  color: themeStyles.primaryText,
                  borderWidth: 1
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-normal mb-3"
                placeholder={`Search ${vehicleMake} model...`}
                placeholderTextColor={themeStyles.subText}
                value={profileModelSearch}
                onChangeText={setProfileModelSearch}
              />

              <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                {(MODELS_BY_BRAND[vehicleMake] || [])
                  .filter(m => m.name.toLowerCase().includes(profileModelSearch.toLowerCase().trim()))
                  .map((mItem) => {
                    const isSelected = vehicleModel === mItem.name;
                    const tierColor = mItem.tier === 'luxury' ? '#f59e0b' : mItem.tier === 'executive' ? '#3b82f6' : '#10b981';
                    const tierLabel = mItem.tier === 'luxury' ? 'VIP Luxury' : mItem.tier === 'executive' ? 'Executive' : 'Standard';
                    return (
                      <TouchableOpacity
                        key={mItem.name}
                        onPress={() => {
                          setVehicleModel(mItem.name);
                          setVehicleTier(mItem.tier);
                          setProfileModelModalVisible(false);
                          setProfileModelSearch('');
                        }}
                        style={{
                          backgroundColor: isSelected ? (isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)') : (isDark ? '#090d16' : '#ffffff'),
                          borderColor: isSelected ? themeStyles.accentGreen : themeStyles.cardBorder,
                          borderWidth: 1
                        }}
                        className="p-3.5 rounded-2xl mb-2 flex-row items-center justify-between"
                      >
                        <View className="flex-1 mr-2">
                          <Text style={{ color: isSelected ? themeStyles.accentGreen : themeStyles.primaryText }} className="font-normal text-sm">
                            {mItem.name}
                          </Text>
                          <View 
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', alignSelf: 'flex-start' }}
                            className="px-2 py-0.5 rounded-md mt-1"
                          >
                            <Text style={{ color: tierColor, fontSize: 10, fontWeight: 'normal' }}>
                              {tierLabel} Tier
                            </Text>
                          </View>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={18} color={themeStyles.accentGreen} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
