import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal, FlatList, Switch, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { 
  FLEET_TYPES_LIST, 
  DRIVER_OPERATIONAL_MODES, 
  VEHICLE_BRANDS, 
  POPULAR_BRANDS,
  MODELS_BY_BRAND, 
  POPULAR_COLORS, 
  COLOR_SWATCHES,
  POPULAR_YEARS, 
  detectFleetTier 
} from '../../utils/vehicleFleetData';

export default function DriverStatusScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const registeredUser = route.params?.registeredUser || {};
  const [driverStatus, setDriverStatus] = useState('no_car'); // 'with_car' | 'no_car'
  
  // Text inputs
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsExperience, setYearsExperience] = useState('5');

  // Vehicle credentials (Comprehensive Nigerian Luxury & Executive coverage)
  const [vehicleTier, setVehicleTier] = useState('executive'); // 'luxury' | 'executive' | 'standard' | 'armored_vip'
  const [isArmored, setIsArmored] = useState(false);
  const [make, setMake] = useState('Mercedes-Benz');
  const [model, setModel] = useState('E-Class (E300 / E350)');
  const [year, setYear] = useState('2023');
  const [colour, setColour] = useState('Jet Black');
  const [plateNumber, setPlateNumber] = useState('');
  const [ownershipType, setOwnershipType] = useState('personal'); // 'personal' | 'employer' | 'rental_hp'

  // Modal pickers for Brand and Model lists & Tier Override
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [tierModalVisible, setTierModalVisible] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  // Work preferences (multi-select)
  const [workPreferences, setWorkPreferences] = useState({
    rideTrips: true,
    hourlyHire: true,
    dailyHire: true,
    weeklyHire: true,
    monthly: false
  });

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
    inputBg: isDark ? '#12192b' : '#ffffff',
    inputBorder: isDark ? '#1e293b' : '#cbd5e1',
    headerBtnBg: isDark ? '#0f172a' : '#f1f5f9',
    headerBtnBorder: isDark ? '#1e293b' : '#e2e8f0',
    itemBg: isDark ? '#090d16' : '#ffffff',
  };

  const toggleWork = (key) => {
    setWorkPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const CheckboxRow = ({ label, subtitle, isChecked, onPress }) => (
    <TouchableOpacity 
      style={{
        backgroundColor: isChecked 
          ? (isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.1)') 
          : themeStyles.cardBg,
        borderColor: isChecked ? themeStyles.brandGreen : themeStyles.cardBorder,
        borderWidth: 1
      }}
      className="flex-row items-center p-3.5 rounded-2xl mb-2.5 justify-between" 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-1 mr-3">
        <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm">{label}</Text>
        {subtitle && <Text style={{ color: themeStyles.subText }} className="text-[11px] font-normal mt-0.5">{subtitle}</Text>}
      </View>
      <View 
        style={{
          backgroundColor: isChecked ? themeStyles.brandGreen : 'transparent',
          borderColor: isChecked ? themeStyles.brandGreen : themeStyles.subText,
          borderWidth: 1.5
        }}
        className="w-6 h-6 rounded-lg items-center justify-center"
      >
        {isChecked && <Ionicons name="checkmark" size={16} color="#090d16" />}
      </View>
    </TouchableOpacity>
  );

  const handleSelectVehicleType = (tier) => {
    if (tier.id === 'armored_vip') {
      setIsArmored(true);
      setVehicleTier('luxury');
    } else {
      setIsArmored(false);
      setVehicleTier(tier.id);
    }
  };

  const isTierActive = (tier) => {
    if (tier.id === 'armored_vip') {
      return isArmored;
    }
    return vehicleTier === tier.id && !isArmored;
  };

  const filteredBrands = VEHICLE_BRANDS.filter(b => 
    b.toLowerCase().includes(brandSearch.toLowerCase().trim())
  );

  const availableModels = MODELS_BY_BRAND[make] || [];
  const filteredModels = availableModels.filter(m => 
    m.name.toLowerCase().includes(modelSearch.toLowerCase().trim())
  );

  const handleProceed = () => {
    if (!licenseNumber.trim()) {
      Alert.alert('Required', "Please provide your FRSC Driver's Licence Number to continue.");
      return;
    }
    if (driverStatus === 'with_car' && (!make || !plateNumber)) {
      Alert.alert('Vehicle Details', 'Please provide your vehicle make and registration plate number.');
      return;
    }

    const effectiveTier = isArmored ? 'armored_vip' : (vehicleTier || detectFleetTier(make, model, year, isArmored));

    navigation.navigate('DriverApplicationReview', {
      driverStatus,
      registeredUser,
      licenseNumber,
      yearsExperience,
      vehicleDetails: driverStatus === 'with_car' ? { 
        make, 
        model, 
        year, 
        colour, 
        plateNumber: plateNumber.trim().toUpperCase(), 
        vehicleTier: effectiveTier, 
        isArmored, 
        ownershipType 
      } : null,
      workPreferences
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      <ScrollView className="flex-1 px-5 pt-6 pb-12" showsVerticalScrollIndicator={false}>
        {/* Header Navigation */}
        <View className="flex-row items-center mb-4">
          <View>
            <Text style={{ color: themeStyles.titleText }} className="font-normal text-xl">
              Vehicle & Work Profile
            </Text>
          </View>
        </View>

        {/* Progress Pill */}
        <View 
          style={{ backgroundColor: themeStyles.cardBg, borderColor: themeStyles.cardBorder, borderWidth: 1 }}
          className="rounded-2xl p-3 mb-5 flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-row items-center">
            <View 
              style={{ backgroundColor: themeStyles.brandGreen }}
              className="w-7 h-7 rounded-full items-center justify-center mr-3"
            >
              <Text className="text-slate-950 font-normal text-xs">2</Text>
            </View>
            <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs">
              Step 2 of 3: Operational Status
            </Text>
          </View>
          <Text style={{ color: themeStyles.brandGreen }} className="font-mono text-xs font-normal">66%</Text>
        </View>

        {/* 1. CAR MODE / OPERATIONAL STATUS (LIST PRESENTATION) */}
        <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs uppercase mb-2">
          Select Driver Mode & Operational Category *
        </Text>
        <View className="space-y-3 mb-6">
          {DRIVER_OPERATIONAL_MODES.map((modeItem) => {
            const isSelected = driverStatus === modeItem.id;
            return (
              <TouchableOpacity 
                key={modeItem.id}
                style={{
                  backgroundColor: isSelected 
                    ? (isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)') 
                    : themeStyles.cardBg,
                  borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
                  borderWidth: isSelected ? 2 : 1
                }}
                className="p-4 rounded-3xl mb-3 shadow-sm"
                onPress={() => setDriverStatus(modeItem.id)}
                activeOpacity={0.85}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1 mr-2">
                    <View 
                      style={{
                        backgroundColor: isSelected ? themeStyles.brandGreen : (isDark ? '#1e293b' : '#e2e8f0')
                      }}
                      className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                    >
                      <Ionicons 
                        name={modeItem.icon} 
                        size={20} 
                        color={isSelected ? "#090d16" : themeStyles.primaryText} 
                      />
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
                        {modeItem.title}
                      </Text>
                      <Text style={{ color: themeStyles.subText }} className="text-xs font-normal mt-0.5">
                        {modeItem.subtitle}
                      </Text>
                    </View>
                  </View>

                  {/* Radio Indicator */}
                  <View 
                    style={{
                      backgroundColor: isSelected ? themeStyles.brandGreen : 'transparent',
                      borderColor: isSelected ? themeStyles.brandGreen : themeStyles.subText,
                      borderWidth: 1.5
                    }}
                    className="w-6 h-6 rounded-full items-center justify-center"
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color="#090d16" />
                    )}
                  </View>
                </View>

                <Text style={{ color: themeStyles.subText }} className="text-xs font-normal leading-relaxed mb-3">
                  {modeItem.description}
                </Text>

                <View className="flex-row flex-wrap items-center">
                  {modeItem.tags.map((tag, tagIdx) => (
                    <View 
                      key={tagIdx}
                      style={{ 
                        backgroundColor: isDark ? 'rgba(0, 229, 136, 0.12)' : '#ecfdf5', 
                        borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder, 
                        borderWidth: 1 
                      }}
                      className="px-2.5 py-1 rounded-full mr-2 mb-1"
                    >
                      <Text style={{ color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText }} className="text-[10px] font-normal">
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* License Credentials Form Card */}
        <View 
          style={{
            backgroundColor: themeStyles.cardBg,
            borderColor: themeStyles.cardBorder,
            borderWidth: 1
          }}
          className="rounded-3xl p-5 mb-5 shadow-sm"
        >
          <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm uppercase mb-3">
            Driver's License Details
          </Text>

          {/* License Number */}
          <View className="mb-3">
            <Text style={{ color: themeStyles.subText }} className="text-xs mb-1 font-normal">
              FRSC Driver's Licence Number *
            </Text>
            <TextInput 
              style={{
                backgroundColor: themeStyles.inputBg,
                borderColor: themeStyles.inputBorder,
                color: themeStyles.primaryText,
                borderWidth: 1
              }}
              className="rounded-xl px-4 py-3 text-sm font-normal uppercase"
              placeholder="e.g. AAA-01928-AA"
              placeholderTextColor={themeStyles.subText}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              autoCapitalize="characters"
            />
          </View>

          {/* Years of Experience */}
          <View>
            <Text style={{ color: themeStyles.subText }} className="text-xs mb-1 font-normal">
              Years of Professional Driving Experience
            </Text>
            <TextInput 
              style={{
                backgroundColor: themeStyles.inputBg,
                borderColor: themeStyles.inputBorder,
                color: themeStyles.primaryText,
                borderWidth: 1
              }}
              className="rounded-xl px-4 py-3 text-sm font-normal"
              placeholder="e.g. 5"
              placeholderTextColor={themeStyles.subText}
              value={yearsExperience}
              onChangeText={setYearsExperience}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* 2. COMPREHENSIVE VEHICLE REGISTRATION (IF DRIVER HAS CAR) */}
        {driverStatus === 'with_car' && (
          <View 
            style={{
              backgroundColor: themeStyles.cardBg,
              borderColor: themeStyles.cardBorder,
              borderWidth: 1
            }}
            className="rounded-3xl p-5 mb-5 shadow-sm"
          >
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
                      color={isArmored ? '#ef4444' : vehicleTier === 'luxury' ? '#f59e0b' : vehicleTier === 'executive' ? '#3b82f6' : '#10b981'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm" numberOfLines={1}>
                      {make || 'Select Brand'} {model || 'Select Model'}
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

              {/* Badges Row: Year, Colour swatch, FRSC Plate */}
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
                    {year || '2023'}
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
                      backgroundColor: COLOR_SWATCHES.find(c => (colour || '').toLowerCase().includes(c.name.toLowerCase().split(' ')[0]))?.hex || '#10b981',
                      marginRight: 4 
                    }} 
                  />
                  <Text style={{ color: themeStyles.primaryText, fontSize: 10, fontWeight: 'normal' }}>
                    {colour || 'Jet Black'}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: plateNumber ? themeStyles.brandGreen : themeStyles.cardBorder,
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
                  <Text style={{ color: plateNumber ? themeStyles.brandGreen : themeStyles.subText, fontSize: 10, fontWeight: 'normal' }}>
                    {plateNumber ? plateNumber.toUpperCase() : 'NO PLATE YET'}
                  </Text>
                </View>

                {/* Ownership Status Pill */}
                <View
                  style={{
                    backgroundColor: ownershipType === 'employer' 
                      ? (isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7') 
                      : (isDark ? 'rgba(0, 229, 136, 0.12)' : '#ecfdf5'),
                    borderColor: ownershipType === 'employer' ? '#f59e0b' : themeStyles.brandGreen,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 7,
                    paddingVertical: 2.5,
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      color: ownershipType === 'employer' ? '#d97706' : themeStyles.brandGreen,
                      fontSize: 10,
                      fontWeight: 'normal'
                    }}
                  >
                    {ownershipType === 'employer' ? '🔒 Employer (Hailing Locked)' : ownershipType === 'rental_hp' ? '📋 Hire-Purchase' : '🚗 Personal'}
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
                  onPress={() => setBrandModalVisible(true)}
                  className="flex-row items-center"
                >
                  <Text style={{ color: themeStyles.brandGreen }} className="text-xs font-normal mr-0.5">
                    All Brands
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={themeStyles.brandGreen} />
                </TouchableOpacity>
              </View>

              {/* 1-Tap Popular Brand Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {POPULAR_BRANDS.map((brandName) => {
                  const isSelected = make === brandName;
                  return (
                    <TouchableOpacity
                      key={brandName}
                      onPress={() => {
                        setMake(brandName);
                        const defaults = MODELS_BY_BRAND[brandName];
                        if (defaults && defaults.length > 0) {
                          setModel(defaults[0].name);
                          const autoTier = detectFleetTier(brandName, defaults[0].name, year, isArmored);
                          setVehicleTier(isArmored ? 'armored_vip' : autoTier);
                        } else {
                          const autoTier = detectFleetTier(brandName, model, year, isArmored);
                          setVehicleTier(isArmored ? 'armored_vip' : autoTier);
                        }
                      }}
                      style={{
                        backgroundColor: isSelected 
                          ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.1)') 
                          : themeStyles.itemBg,
                        borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
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
                        color={isSelected ? themeStyles.brandGreen : themeStyles.subText} 
                        style={{ marginRight: 4 }} 
                      />
                      <Text 
                        style={{ 
                          color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText, 
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
                onPress={() => setBrandModalVisible(true)}
                style={{
                  backgroundColor: themeStyles.inputBg,
                  borderColor: themeStyles.cardBorder,
                  borderWidth: 1
                }}
                className="rounded-xl p-3 flex-row items-center justify-between"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <Ionicons name="checkmark-circle" size={16} color={themeStyles.brandGreen} style={{ marginRight: 8 }} />
                  <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs">
                    Selected Brand: <Text style={{ color: themeStyles.brandGreen }}>{make}</Text>
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
                  onPress={() => setModelModalVisible(true)}
                  className="flex-row items-center"
                >
                  <Text style={{ color: themeStyles.brandGreen }} className="text-xs font-normal mr-0.5">
                    More Models
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={themeStyles.brandGreen} />
                </TouchableOpacity>
              </View>

              {/* 1-Tap Popular Models for Selected Brand */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {(MODELS_BY_BRAND[make] || []).slice(0, 6).map((mItem) => {
                  const isSelected = model === mItem.name;
                  return (
                    <TouchableOpacity
                      key={mItem.name}
                      onPress={() => {
                        setModel(mItem.name);
                        const autoTier = isArmored ? 'armored_vip' : (mItem.tier || detectFleetTier(make, mItem.name, year, false));
                        setVehicleTier(autoTier);
                      }}
                      style={{
                        backgroundColor: isSelected 
                          ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.1)') 
                          : themeStyles.itemBg,
                        borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
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
                          color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText, 
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
                  backgroundColor: themeStyles.inputBg,
                  borderColor: themeStyles.cardBorder,
                  borderWidth: 1
                }}
                className="rounded-xl p-3 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <Ionicons name="speedometer-outline" size={16} color={themeStyles.brandGreen} style={{ marginRight: 8 }} />
                  <TextInput
                    value={model}
                    onChangeText={(text) => {
                      setModel(text);
                      if (!isArmored) {
                        setVehicleTier(detectFleetTier(make, text, year, false));
                      }
                    }}
                    placeholder="Type model if unlisted (e.g. S-Class, Prado)..."
                    placeholderTextColor={themeStyles.subText}
                    style={{ color: themeStyles.primaryText, flex: 1, padding: 0 }}
                    className="text-xs font-normal"
                  />
                </View>
                <TouchableOpacity onPress={() => setModelModalVisible(true)}>
                  <Ionicons name="list" size={16} color={themeStyles.brandGreen} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. SMART AUTO-CLASSIFICATION & ARMORED VIP TOGGLE */}
            <View
              style={{
                backgroundColor: themeStyles.itemBg,
                borderColor: themeStyles.cardBorder,
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
                marginBottom: 16
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1 mr-2">
                  <Ionicons name="sparkles" size={14} color="#10b981" style={{ marginRight: 6 }} />
                  <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs">
                    Auto-Classified Fleet Tier:
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setTierModalVisible(true)}
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
                  <Ionicons name="chevron-down" size={10} color={isArmored ? '#ef4444' : vehicleTier === 'luxury' ? '#f59e0b' : vehicleTier === 'executive' ? '#3b82f6' : '#10b981'} />
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
                      setVehicleTier(detectFleetTier(make, model, year, false));
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
                    const isSelected = year === yr;
                    return (
                      <TouchableOpacity
                        key={yr}
                        onPress={() => {
                          setYear(yr);
                          if (!isArmored) {
                            setVehicleTier(detectFleetTier(make, model, yr, false));
                          }
                        }}
                        style={{
                          backgroundColor: isSelected 
                            ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.1)') 
                            : themeStyles.itemBg,
                          borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
                          borderWidth: isSelected ? 1.5 : 1,
                          paddingHorizontal: 12,
                          paddingVertical: 5,
                          borderRadius: 10,
                          marginRight: 6
                        }}
                      >
                        <Text style={{ color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText, fontSize: 11, fontWeight: 'normal' }}>
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
                    Vehicle Colour
                  </Text>
                  <Text style={{ color: themeStyles.brandGreen }} className="text-[11px] font-normal">
                    Selected: {colour}
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
                  {COLOR_SWATCHES.map((swatch) => {
                    const isSelected = (colour || '').toLowerCase().includes(swatch.name.toLowerCase().split(' ')[0]);
                    return (
                      <TouchableOpacity
                        key={swatch.name}
                        onPress={() => setColour(swatch.name)}
                        style={{
                          backgroundColor: themeStyles.itemBg,
                          borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
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
                        <Text style={{ color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText, fontSize: 11, fontWeight: 'normal' }}>
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
                    backgroundColor: themeStyles.inputBg,
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
                    <Text style={{ fontSize: 10, fontWeight: 'normal', color: themeStyles.brandGreen }}>
                      🇳🇬 FRSC
                    </Text>
                  </View>
                  <TextInput 
                    value={plateNumber}
                    onChangeText={setPlateNumber}
                    placeholder="e.g. KSF-123-AB"
                    autoCapitalize="characters"
                    placeholderTextColor={themeStyles.subText}
                    style={{ color: themeStyles.primaryText, flex: 1, padding: 0 }}
                    className="text-xs font-normal uppercase"
                  />
                </View>
              </View>
            </View>

            {/* 6. OWNERSHIP CLASSIFICATION (3 SIMPLE OPTIONS) */}
            <View className="mb-2">
              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs uppercase mb-2">
                4. Vehicle Ownership Status *
              </Text>

              {[
                {
                  id: 'personal',
                  icon: 'car',
                  color: themeStyles.brandGreen,
                  title: 'Personal Vehicle',
                  desc: 'Registered in your name or private ownership (On-Demand & Hires active)',
                },
                {
                  id: 'employer',
                  icon: 'shield-checkmark',
                  color: '#f59e0b',
                  title: 'Employer / Company Car (Boss Car)',
                  desc: '🔒 Anti-Moonlighting Lock: Commercial street hailing locked to protect employer',
                },
                {
                  id: 'rental_hp',
                  icon: 'briefcase',
                  color: '#3b82f6',
                  title: 'Hire Purchase / Rental',
                  desc: 'Commercial financing, lease-to-own or fleet rental agreement',
                }
              ].map((own) => {
                const isSelected = ownershipType === own.id;
                return (
                  <TouchableOpacity
                    key={own.id}
                    onPress={() => setOwnershipType(own.id)}
                    style={{
                      backgroundColor: isSelected 
                        ? (isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)') 
                        : themeStyles.itemBg,
                      borderColor: isSelected ? own.color : themeStyles.cardBorder,
                      borderWidth: isSelected ? 1.5 : 1,
                      padding: 12,
                      borderRadius: 16,
                      marginBottom: 8
                    }}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 mr-2">
                        <Ionicons name={own.icon} size={16} color={own.color} style={{ marginRight: 8 }} />
                        <View className="flex-1">
                          <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs">
                            {own.title}
                          </Text>
                          <Text style={{ color: isSelected && own.id === 'employer' ? '#d97706' : themeStyles.subText }} className="text-[10px] font-normal mt-0.5">
                            {own.desc}
                          </Text>
                        </View>
                      </View>
                      <View 
                        style={{
                          backgroundColor: isSelected ? own.color : 'transparent',
                          borderColor: isSelected ? own.color : themeStyles.subText,
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
          </View>
        )}

        {/* Work you want Section */}
        <View 
          style={{
            backgroundColor: themeStyles.cardBg,
            borderColor: themeStyles.cardBorder,
            borderWidth: 1
          }}
          className="rounded-3xl p-5 mb-8 shadow-sm"
        >
          <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm uppercase mb-3">
            Jobs & Hires You Want to Receive
          </Text>
          
          {driverStatus === 'with_car' && (
            <CheckboxRow 
              label="On-Demand Ride Trips" 
              subtitle="Instant point-to-point passenger trips in your city"
              isChecked={workPreferences.rideTrips} 
              onPress={() => toggleWork('rideTrips')} 
            />
          )}
          
          <CheckboxRow 
            label="Hourly Chauffeur Hire" 
            subtitle="Short errands, meetings & executive airport runs (₦3,500 - ₦10,000/hr)"
            isChecked={workPreferences.hourlyHire} 
            onPress={() => toggleWork('hourlyHire')} 
          />
          <CheckboxRow 
            label="Daily Hire / Day Shift" 
            subtitle="Full day corporate hire (₦25,000 - ₦75,000/day)"
            isChecked={workPreferences.dailyHire} 
            onPress={() => toggleWork('dailyHire')} 
          />
          <CheckboxRow 
            label="Weekly Hire" 
            subtitle="Extended 5 to 7 days assignments for business travelers"
            isChecked={workPreferences.weeklyHire} 
            onPress={() => toggleWork('weeklyHire')} 
          />
          <CheckboxRow 
            label="Monthly / Full-Time Employment" 
            subtitle="Long-term salary employment with vetted families & corporations"
            isChecked={workPreferences.monthly} 
            onPress={() => toggleWork('monthly')} 
          />
        </View>

        {/* Next Step CTA */}
        <TouchableOpacity 
          style={{ backgroundColor: themeStyles.brandGreen }}
          className="py-4 rounded-2xl items-center shadow-lg mb-10"
          onPress={handleProceed}
        >
          <Text className="text-slate-950 font-normal text-sm uppercase tracking-wider">
            Proceed to Vetting & Documents (Step 3) →
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* TIER OVERRIDE MODAL */}
      <Modal
        visible={tierModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTierModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 }}>
          <View 
            style={{ 
              backgroundColor: themeStyles.cardBg, 
              borderColor: themeStyles.cardBorder, 
              borderWidth: 1 
            }}
            className="rounded-3xl p-5"
          >
            <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-slate-700/20">
              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
                Choose Fleet Classification Tier
              </Text>
              <TouchableOpacity onPress={() => setTierModalVisible(false)} className="p-1">
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
                    setTierModalVisible(false);
                  }}
                  style={{
                    backgroundColor: isSelected ? (isDark ? 'rgba(0, 229, 136, 0.12)' : '#ecfdf5') : themeStyles.itemBg,
                    borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
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
                    <Ionicons name={tItem.icon} size={18} color={tItem.color} style={{ marginRight: 8 }} />
                    <View className="flex-1">
                      <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs">
                        {tItem.name}
                      </Text>
                      <Text style={{ color: themeStyles.subText }} className="text-[10px] font-normal">
                        {tItem.desc}
                      </Text>
                    </View>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color={themeStyles.brandGreen} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* BRAND SELECTION MODAL LIST */}
      <Modal
        visible={brandModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBrandModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 16 : Math.max(insets.bottom, 16) + 8,
            paddingHorizontal: 12,
          }}
        >
          <View 
            style={{ 
              backgroundColor: themeStyles.cardBg, 
              borderColor: themeStyles.cardBorder, 
              borderWidth: 1,
              maxHeight: '80%'
            }}
            className="rounded-3xl p-5 shadow-2xl"
          >
            <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-slate-700/20">
              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
                Select Vehicle Brand (Make)
              </Text>
              <TouchableOpacity onPress={() => setBrandModalVisible(false)} className="p-1">
                <Ionicons name="close" size={22} color={themeStyles.subText} />
              </TouchableOpacity>
            </View>

            <TextInput 
              style={{
                backgroundColor: themeStyles.inputBg,
                borderColor: themeStyles.cardBorder,
                color: themeStyles.primaryText,
                borderWidth: 1
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-normal mb-3"
              placeholder="Search brand (e.g. Mercedes, Lexus, Toyota)..."
              placeholderTextColor={themeStyles.subText}
              value={brandSearch}
              onChangeText={setBrandSearch}
            />

            <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
              {filteredBrands.map((b) => {
                const isSelected = make === b;
                return (
                  <TouchableOpacity
                    key={b}
                    onPress={() => {
                      setMake(b);
                      const defaults = MODELS_BY_BRAND[b];
                      if (defaults && defaults.length > 0) {
                        setModel(defaults[0].name);
                        setVehicleTier(defaults[0].tier);
                      }
                      setBrandModalVisible(false);
                      setBrandSearch('');
                    }}
                    style={{
                      backgroundColor: isSelected ? (isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)') : themeStyles.itemBg,
                      borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
                      borderWidth: 1
                    }}
                    className="p-3.5 rounded-2xl mb-2 flex-row items-center justify-between"
                  >
                    <Text style={{ color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText }} className="font-normal text-sm">
                      {b}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={themeStyles.brandGreen} />
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
        visible={modelModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModelModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 16 : Math.max(insets.bottom, 16) + 8,
            paddingHorizontal: 12,
          }}
        >
          <View 
            style={{ 
              backgroundColor: themeStyles.cardBg, 
              borderColor: themeStyles.cardBorder, 
              borderWidth: 1,
              maxHeight: '80%'
            }}
            className="rounded-3xl p-5 shadow-2xl"
          >
            <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-slate-700/20">
              <View>
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
                  Select {make} Model
                </Text>
                <Text style={{ color: themeStyles.subText }} className="text-xs font-normal">
                  Models include auto-detected tier classification
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModelModalVisible(false)} className="p-1">
                <Ionicons name="close" size={22} color={themeStyles.subText} />
              </TouchableOpacity>
            </View>

            <TextInput 
              style={{
                backgroundColor: themeStyles.inputBg,
                borderColor: themeStyles.cardBorder,
                color: themeStyles.primaryText,
                borderWidth: 1
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-normal mb-3"
              placeholder={`Search ${make} model...`}
              placeholderTextColor={themeStyles.subText}
              value={modelSearch}
              onChangeText={setModelSearch}
            />

            <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
              {filteredModels.length > 0 ? (
                filteredModels.map((mItem) => {
                  const isSelected = model === mItem.name;
                  const tierColor = mItem.tier === 'luxury' ? '#f59e0b' : mItem.tier === 'executive' ? '#3b82f6' : '#10b981';
                  const tierLabel = mItem.tier === 'luxury' ? 'VIP Luxury' : mItem.tier === 'executive' ? 'Executive' : 'Standard';
                  return (
                    <TouchableOpacity
                      key={mItem.name}
                      onPress={() => {
                        setModel(mItem.name);
                        setVehicleTier(mItem.tier);
                        setModelModalVisible(false);
                        setModelSearch('');
                      }}
                      style={{
                        backgroundColor: isSelected ? (isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)') : themeStyles.itemBg,
                        borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
                        borderWidth: 1
                      }}
                      className="p-3.5 rounded-2xl mb-2 flex-row items-center justify-between"
                    >
                      <View className="flex-1 mr-2">
                        <Text style={{ color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText }} className="font-normal text-sm">
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
                        <Ionicons name="checkmark-circle" size={18} color={themeStyles.brandGreen} />
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View className="py-6 items-center">
                  <Text style={{ color: themeStyles.subText }} className="text-xs font-normal">
                    No models found matching "{modelSearch}". You can type it directly in the custom model field.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
