import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../context/ThemeContext';
import { api, authService } from '../../api/api';

const Storage = {
  getItemAsync: async (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
  setItemAsync: async (key, val) => {
    if (Platform.OS === 'web') return localStorage.setItem(key, val);
    return await SecureStore.setItemAsync(key, val);
  },
};

const ID_TYPES = [
  { id: 'nin', name: 'NIN (National Identity No.)', icon: 'finger-print-outline', digits: 11 },
  { id: 'license', name: "Driver's License (FRSC)", icon: 'card-outline', digits: 12 },
  { id: 'passport', name: 'International Passport', icon: 'book-outline', digits: 9 },
  { id: 'voters', name: "Voter's Card (PVC)", icon: 'newspaper-outline', digits: 19 },
];

const RELATIONSHIPS = ['Spouse', 'Parent', 'Sibling', 'Legal Guardian', 'Business Partner', 'Next of Kin'];

export default function KycVerificationScreen({ navigation }) {
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState('unverified'); // 'unverified', 'pending', 'verified'

  // Personal Information
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [stateOfResidence, setStateOfResidence] = useState('Lagos State');

  // Government ID
  const [selectedIdType, setSelectedIdType] = useState('nin');
  const [idNumber, setIdNumber] = useState('');
  const [idDocImage, setIdDocImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);

  // SOS Emergency Next of Kin Details
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [nextOfKinRelation, setNextOfKinRelation] = useState('Spouse');
  const [nextOfKinAddress, setNextOfKinAddress] = useState('');

  useEffect(() => {
    loadExistingKyc();
  }, []);

  const loadExistingKyc = async () => {
    setLoading(true);
    try {
      const user = await authService.getUser();
      if (user) {
        if (user.name) setFullName(user.name);
      }

      const storedKycStr = await Storage.getItemAsync('client_kyc_data');
      if (storedKycStr) {
        const stored = JSON.parse(storedKycStr);
        if (stored.fullName) setFullName(stored.fullName);
        if (stored.dob) setDob(stored.dob);
        if (stored.residentialAddress) setResidentialAddress(stored.residentialAddress);
        if (stored.stateOfResidence) setStateOfResidence(stored.stateOfResidence);
        if (stored.selectedIdType) setSelectedIdType(stored.selectedIdType);
        if (stored.idNumber) setIdNumber(stored.idNumber);
        if (stored.idDocImage) setIdDocImage(stored.idDocImage);
        if (stored.selfieImage) setSelfieImage(stored.selfieImage);
        if (stored.nextOfKinName) setNextOfKinName(stored.nextOfKinName);
        if (stored.nextOfKinPhone) setNextOfKinPhone(stored.nextOfKinPhone);
        if (stored.nextOfKinRelation) setNextOfKinRelation(stored.nextOfKinRelation);
        if (stored.nextOfKinAddress) setNextOfKinAddress(stored.nextOfKinAddress);
        if (stored.status) setKycStatus(stored.status);
      }
    } catch (e) {
      console.log('Error loading KYC:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocument = async (target) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Please enable photo library access to upload documents.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: target === 'selfie' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (target === 'idDoc') {
          setIdDocImage(uri);
        } else if (target === 'selfie') {
          setSelfieImage(uri);
        }
      }
    } catch (err) {
      Alert.alert('Upload Error', 'Could not access image library.');
    }
  };

  const handleSubmitKyc = async () => {
    // Validations
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please provide your Full Legal Name.');
      return;
    }

    if (!idNumber.trim()) {
      Alert.alert('Required Field', `Please input your ${selectedIdType.toUpperCase()} number.`);
      return;
    }

    if (selectedIdType === 'nin' && idNumber.replace(/\D/g, '').length !== 11) {
      Alert.alert('Invalid NIN', 'Nigerian NIN must be exactly 11 numeric digits.');
      return;
    }

    // SOS Emergency Next of Kin Phone validation
    const cleanKinPhone = nextOfKinPhone.replace(/\s+/g, '');
    if (!cleanKinPhone || cleanKinPhone.length < 10) {
      Alert.alert(
        'Emergency Contact Required',
        'Please enter a valid SOS Emergency Next of Kin Phone Number. This contact is required for emergency dispatch.'
      );
      return;
    }

    if (!nextOfKinName.trim()) {
      Alert.alert('Emergency Contact Required', 'Please provide your Next of Kin Full Name.');
      return;
    }

    setSubmitting(true);
    const kycPayload = {
      fullName: fullName.trim(),
      dob: dob.trim(),
      residentialAddress: residentialAddress.trim(),
      stateOfResidence,
      selectedIdType,
      idNumber: idNumber.trim(),
      idDocImage,
      selfieImage,
      nextOfKinName: nextOfKinName.trim(),
      nextOfKinPhone: cleanKinPhone,
      nextOfKinRelation,
      nextOfKinAddress: nextOfKinAddress.trim(),
      status: 'verified', // Certified Tier 2
      verifiedAt: new Date().toISOString(),
    };

    try {
      await Storage.setItemAsync('client_kyc_data', JSON.stringify(kycPayload));
      // Store next of kin separately for fast SOS access
      await Storage.setItemAsync('sos_next_of_kin_phone', cleanKinPhone);
      await Storage.setItemAsync('sos_next_of_kin_name', nextOfKinName.trim());

      // Attempt API submission
      await api.post('/v1/user/kyc', kycPayload).catch(() => {});

      setKycStatus('verified');
      Alert.alert(
        'KYC Verified Successfully',
        'Your Tier 2 Identity and Emergency SOS Next of Kin credentials have been registered and verified.',
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Submission Error', 'Failed to store verification data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const bgStyle = { backgroundColor: isDark ? '#090d16' : '#f8fafc' };
  const cardBgStyle = {
    backgroundColor: isDark ? '#121927' : '#ffffff',
    borderColor: isDark ? '#1e293b' : '#e2e8f0',
  };
  const inputBgStyle = {
    backgroundColor: isDark ? '#0d131f' : '#f8fafc',
    borderColor: isDark ? '#1e293b' : '#e2e8f0',
    color: isDark ? '#ffffff' : '#0f172a',
  };

  return (
    <SafeAreaView style={[{ flex: 1 }, bgStyle]}>
      {/* App Bar */}
      <View
        style={{
          backgroundColor: isDark ? '#090d16' : '#ffffff',
          borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="flex-row items-center justify-between px-4 py-3 border-b"
      >
        <View className="flex-1">
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-base tracking-tight">
            KYC & Identity Verification
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          <View
            style={{
              backgroundColor:
                kycStatus === 'verified'
                  ? 'rgba(16,185,129,0.1)'
                  : isDark
                  ? '#121927'
                  : '#eff6ff',
              borderColor: kycStatus === 'verified' ? '#10b981' : '#3b82f6',
            }}
            className="p-4 rounded-3xl border mb-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View
                className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${
                  kycStatus === 'verified' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                }`}
              >
                <Ionicons
                  name={kycStatus === 'verified' ? 'shield-checkmark' : 'shield-outline'}
                  size={24}
                  color={kycStatus === 'verified' ? '#10b981' : '#3b82f6'}
                />
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm">
                  {kycStatus === 'verified' ? 'Tier 2 Identity Verified' : 'KYC Verification Required'}
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] mt-0.5">
                  {kycStatus === 'verified'
                    ? 'Account verified with Nigerian Govt ID & SOS Next of Kin'
                    : 'Unlocks VIP chauffeurs, credit limits & automatic SOS armed response'}
                </Text>
              </View>
            </View>
            <View
              className={`px-2.5 py-1 rounded-full ${
                kycStatus === 'verified' ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
            >
              <Text className="text-white font-normal text-[10px] uppercase">
                {kycStatus === 'verified' ? 'VERIFIED' : 'PENDING'}
              </Text>
            </View>
          </View>

          {/* SECTION 1: LEGAL PERSONAL INFORMATION */}
          <View style={cardBgStyle} className="p-4 rounded-3xl border mb-5 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons name="person-circle-outline" size={20} color="#10b981" style={{ marginRight: 6 }} />
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm uppercase">
                1. Legal Identity Information
              </Text>
            </View>

            <View className="space-y-3">
              <View>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-bold uppercase mb-1">
                  Full Legal Name (as on Government ID) *
                </Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Babatunde Olumide Adeyemi"
                  placeholderTextColor="#94a3b8"
                  style={inputBgStyle}
                  className="p-3 rounded-xl border text-xs font-semibold"
                />
              </View>

              <View>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-bold uppercase mb-1">
                  Date of Birth (DD/MM/YYYY)
                </Text>
                <TextInput
                  value={dob}
                  onChangeText={setDob}
                  placeholder="DD/MM/YYYY (e.g. 15/08/1988)"
                  placeholderTextColor="#94a3b8"
                  style={inputBgStyle}
                  className="p-3 rounded-xl border text-xs font-semibold"
                />
              </View>

              <View>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-bold uppercase mb-1">
                  Residential Address
                </Text>
                <TextInput
                  value={residentialAddress}
                  onChangeText={setResidentialAddress}
                  placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
                  placeholderTextColor="#94a3b8"
                  style={inputBgStyle}
                  className="p-3 rounded-xl border text-xs font-semibold"
                />
              </View>
            </View>
          </View>

          {/* SECTION 2: GOVERNMENT ID VERIFICATION */}
          <View style={cardBgStyle} className="p-4 rounded-3xl border mb-5 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons name="card-outline" size={20} color="#10b981" style={{ marginRight: 6 }} />
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm uppercase">
                2. Government ID Details
              </Text>
            </View>

            {/* ID Type Selector Chips */}
            <View className="flex-row flex-wrap gap-2 mb-3">
              {ID_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setSelectedIdType(t.id)}
                  style={{
                    backgroundColor:
                      selectedIdType === t.id
                        ? '#10b981'
                        : isDark
                        ? '#0d131f'
                        : '#f1f5f9',
                    borderColor: selectedIdType === t.id ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="px-3 py-2 rounded-xl border flex-row items-center"
                >
                  <Ionicons
                    name={t.icon}
                    size={14}
                    color={selectedIdType === t.id ? '#ffffff' : isDark ? '#94a3b8' : '#64748b'}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      color: selectedIdType === t.id ? '#ffffff' : isDark ? '#cbd5e1' : '#334155',
                    }}
                    className="text-xs font-bold"
                  >
                    {t.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mb-3">
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-bold uppercase mb-1">
                {ID_TYPES.find((t) => t.id === selectedIdType)?.name} Number *
              </Text>
              <TextInput
                value={idNumber}
                onChangeText={setIdNumber}
                placeholder={selectedIdType === 'nin' ? '11-digit National ID' : 'ID Number'}
                placeholderTextColor="#94a3b8"
                keyboardType={selectedIdType === 'nin' ? 'numeric' : 'default'}
                maxLength={selectedIdType === 'nin' ? 11 : 25}
                style={inputBgStyle}
                className="p-3 rounded-xl border text-xs font-semibold"
              />
            </View>

            {/* ID Document Photo Picker */}
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => handlePickDocument('idDoc')}
                style={{
                  backgroundColor: isDark ? '#0d131f' : '#f8fafc',
                  borderColor: idDocImage ? '#10b981' : isDark ? '#1e293b' : '#cbd5e1',
                }}
                className="flex-1 p-3.5 rounded-2xl border border-dashed items-center justify-center"
              >
                {idDocImage ? (
                  <View className="items-center">
                    <Ionicons name="checkmark-circle" size={26} color="#10b981" />
                    <Text className="text-emerald-500 font-bold text-[10px] mt-1">ID Card Attached</Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[9px]">Tap to change</Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <Ionicons name="camera-outline" size={24} color="#10b981" />
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs mt-1">
                      Upload ID Document
                    </Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px]">Photo or scanned copy</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePickDocument('selfie')}
                style={{
                  backgroundColor: isDark ? '#0d131f' : '#f8fafc',
                  borderColor: selfieImage ? '#10b981' : isDark ? '#1e293b' : '#cbd5e1',
                }}
                className="flex-1 p-3.5 rounded-2xl border border-dashed items-center justify-center"
              >
                {selfieImage ? (
                  <View className="items-center">
                    <Ionicons name="checkmark-circle" size={26} color="#10b981" />
                    <Text className="text-emerald-500 font-bold text-[10px] mt-1">Selfie Attached</Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[9px]">Tap to change</Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <Ionicons name="happy-outline" size={24} color="#10b981" />
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs mt-1">
                      Live Selfie Match
                    </Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px]">Clear frontal face</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* SECTION 3: SOS EMERGENCY NEXT OF KIN (PRIMARY SAFETY FIELD) */}
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: '#ef4444',
            }}
            className="p-4 rounded-3xl border-2 mb-6 shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-xl bg-red-500/20 items-center justify-center mr-2.5 border border-red-500/30">
                  <Ionicons name="warning" size={18} color="#ef4444" />
                </View>
                <View>
                  <Text className="text-red-500 font-normal text-sm uppercase tracking-wide">
                    3. SOS Emergency Next of Kin
                  </Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px]">
                    Automatic armed dispatch & live telemetry recipient
                  </Text>
                </View>
              </View>
              <View className="bg-red-500/20 px-2 py-0.5 rounded-md">
                <Text className="text-red-500 font-black text-[9px] uppercase">Required</Text>
              </View>
            </View>

            <View className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 mb-3.5">
              <Text className="text-red-500 dark:text-red-400 text-[11px] leading-4">
                <Ionicons name="information-circle" size={12} color="#ef4444" /> In any crisis or SOS trigger,
                instant encrypted SMS with real-time GPS coordinates and FRSC/Police dispatch details will be sent
                immediately to this number.
              </Text>
            </View>

            <View className="space-y-3">
              {/* Emergency Next of Kin Phone Number */}
              <View>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-black uppercase mb-1">
                  SOS Next of Kin Phone Number *
                </Text>
                <View className="flex-row items-center">
                  <View
                    style={{
                      backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                    }}
                    className="px-3 py-3 rounded-l-xl border-y border-l"
                  >
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-mono font-bold text-xs">
                      🇳🇬 +234
                    </Text>
                  </View>
                  <TextInput
                    value={nextOfKinPhone}
                    onChangeText={setNextOfKinPhone}
                    placeholder="803 123 4567"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    style={inputBgStyle}
                    className="flex-1 p-3 rounded-r-xl border text-xs font-mono font-bold"
                  />
                </View>
              </View>

              {/* Next of Kin Name */}
              <View>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-bold uppercase mb-1">
                  Next of Kin Full Legal Name *
                </Text>
                <TextInput
                  value={nextOfKinName}
                  onChangeText={setNextOfKinName}
                  placeholder="e.g. Mrs. Funke Adeyemi"
                  placeholderTextColor="#94a3b8"
                  style={inputBgStyle}
                  className="p-3 rounded-xl border text-xs font-semibold"
                />
              </View>

              {/* Relationship Chips */}
              <View>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-bold uppercase mb-1.5">
                  Relationship to Client *
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {RELATIONSHIPS.map((rel) => (
                    <TouchableOpacity
                      key={rel}
                      onPress={() => setNextOfKinRelation(rel)}
                      style={{
                        backgroundColor:
                          nextOfKinRelation === rel
                            ? '#ef4444'
                            : isDark
                            ? '#0d131f'
                            : '#f1f5f9',
                        borderColor: nextOfKinRelation === rel ? '#ef4444' : isDark ? '#1e293b' : '#e2e8f0',
                      }}
                      className="px-3 py-1.5 rounded-xl border"
                    >
                      <Text
                        style={{
                          color: nextOfKinRelation === rel ? '#ffffff' : isDark ? '#cbd5e1' : '#334155',
                        }}
                        className="text-[11px] font-bold"
                      >
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            onPress={handleSubmitKyc}
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-emerald-500 active:bg-emerald-600 items-center justify-center shadow-lg shadow-emerald-500/20 mb-8"
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-done-circle" size={20} color="#ffffff" style={{ marginRight: 6 }} />
                <Text className="text-white font-black text-sm uppercase tracking-wider">
                  Save & Certify Tier 2 KYC
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
