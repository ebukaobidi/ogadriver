import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../api/api';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen({ navigation, route }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('driver'); // 'driver' or 'hirer'
  const [serviceMode, setServiceMode] = useState('driver_only');
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleCompleteOnboarding = async () => {
    if (!phone) {
      Alert.alert('Phone Required', 'Please enter your phone number to complete onboarding.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.completeOnboarding({
        role,
        service_mode: serviceMode,
        country_id: 1, // Default Nigeria
        phone,
        nickname: nickname || undefined,
      });

      if (res.success) {
        Alert.alert('Welcome to OgaDriver!', 'Your profile has been setup successfully.', [
          {
            text: 'Get Started',
            onPress: () => {
              if (role === 'driver') {
                navigation.replace('DriverMain');
              } else {
                navigation.replace('HirerMain');
              }
            }
          }
        ]);
      } else {
        Alert.alert('Onboarding Failed', res.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || 'An error occurred during onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#090d16]">
      <ScrollView className="flex-1 px-6 pt-8">
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-2xl bg-brandMint/10 border border-brandMint/30 items-center justify-center mb-3">
            <Ionicons name="person-add" size={28} color="#1cd188" />
          </View>
          <Text className="text-3xl font-black text-white tracking-wider uppercase">Welcome to OgaDriver</Text>
          <Text className="text-slate-400 text-xs font-mono mt-1 text-center">
            Complete your account details to start using the platform.
          </Text>
        </View>

        {/* Step Indicator */}
        <View className="flex-row justify-center items-center mb-8 space-x-4">
          <View className={`w-8 h-8 rounded-full items-center justify-center ${step >= 1 ? 'bg-brandMint' : 'bg-slate-800'}`}>
            <Text className={`font-bold text-xs ${step >= 1 ? 'text-corporateNavy' : 'text-slate-500'}`}>1</Text>
          </View>
          <View className="w-12 h-0.5 bg-slate-800" />
          <View className={`w-8 h-8 rounded-full items-center justify-center ${step >= 2 ? 'bg-brandMint' : 'bg-slate-800'}`}>
            <Text className={`font-bold text-xs ${step >= 2 ? 'text-corporateNavy' : 'text-slate-500'}`}>2</Text>
          </View>
        </View>

        {step === 1 ? (
          <View className="space-y-4">
            <Text className="text-brandMint font-mono text-xs uppercase tracking-widest mb-2">Select Your Role</Text>
            
            <TouchableOpacity
              className={`p-5 rounded-2xl border ${role === 'driver' ? 'bg-slate-900 border-brandMint' : 'bg-slate-900/60 border-slate-800'} mb-4`}
              onPress={() => handleRoleSelect('driver')}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="car" size={24} color="#1cd188" className="mr-3" />
                <Text className="text-white font-black text-lg ml-2">Professional Driver</Text>
              </View>
              <Text className="text-slate-400 text-xs">
                Offer your driving services, receive hiring offers from verified employers, or bid for private trip requests.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-5 rounded-2xl border ${role === 'hirer' ? 'bg-slate-900 border-brandMint' : 'bg-slate-900/60 border-slate-800'}`}
              onPress={() => handleRoleSelect('hirer')}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="briefcase" size={24} color="#1cd188" className="mr-3" />
                <Text className="text-white font-black text-lg ml-2">Hirer / Employer</Text>
              </View>
              <Text className="text-slate-400 text-xs">
                Hire verified professional drivers, manage contracts, or broadcast trip bids for immediate driver dispatch.
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            <Text className="text-brandMint font-mono text-xs uppercase tracking-widest mb-2">Contact & Account Details</Text>

            <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 mb-4">
              <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Phone Number (Required)</Text>
              <TextInput
                className="text-white text-base font-bold"
                placeholder="+234 800 000 0000"
                placeholderTextColor="#475569"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 mb-6">
              <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Nickname / Handle (Optional)</Text>
              <TextInput
                className="text-white text-base font-bold"
                placeholder="e.g. Captain / ProDriver"
                placeholderTextColor="#475569"
                value={nickname}
                onChangeText={setNickname}
              />
            </View>

            <TouchableOpacity
              className={`bg-brandMint py-4 rounded-xl items-center justify-center mb-4 ${loading ? 'opacity-70' : ''}`}
              onPress={handleCompleteOnboarding}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text className="text-corporateNavy font-black text-sm uppercase tracking-widest">Complete Onboarding</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep(1)} disabled={loading}>
              <Text className="text-center text-slate-400 text-xs">Back to Role Selection</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
