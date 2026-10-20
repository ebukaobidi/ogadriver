import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../api/api';
import { useCountry } from '../../context/CountryContext';

export default function HirerRegisterScreen({ navigation }) {
  const { updateCountry } = useCountry();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: '+234', flag: '🇳🇬', name: 'Nigeria', id: 'nigeria' });

  const countries = [
    { code: '+234', flag: '🇳🇬', name: 'Nigeria', id: 'nigeria' },
    { code: '+233', flag: '🇬🇭', name: 'Ghana', id: 'ghana' },
    { code: '+254', flag: '🇰🇪', name: 'Kenya', id: 'kenya' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa', id: 'south_africa' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom', id: 'united_kingdom' },
    { code: '+1', flag: '🇺🇸', name: 'United States', id: 'united_states' },
  ];

  const handleRegister = async () => {
    if (!name || !email || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      if (updateCountry) {
        await updateCountry(selectedCountry.id || selectedCountry.name);
      }
      await new Promise(r => setTimeout(r, 500)); // bypass for dev
      navigation.navigate('MainApp');
    } catch (error) {
      console.error(error);
      Alert.alert('Registration Failed', error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#090d16]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pb-10 pt-12">
            
            {/* Logo Section */}
            <View className="items-center mb-8">
              <Image 
                source={require('../../../assets/logo.png')} 
                style={{ width: 220, height: 70, resizeMode: 'contain' }}
                className="mb-2"
              />
              <Text className="text-3xl font-black text-white mt-4 tracking-widest">OgaDriver</Text>
              <Text className="text-brandMint font-bold text-xs tracking-[0.3em] uppercase mt-1">Rider</Text>
            </View>

            {/* Welcome Text */}
            <View className="mb-8">
              <Text className="text-2xl font-bold text-white mb-2 tracking-tight">Create account</Text>
              <Text className="text-slate-400 text-sm">Book a ride and move with OgaDriver.</Text>
            </View>

            {/* Input Forms */}
            <View className="space-y-5 mb-6 z-10">
              <View>
                <Text className="text-white text-sm mb-2 font-medium">Full Name</Text>
                <TextInput
                  className="bg-[#12192b] border border-slate-700/80 rounded-xl px-4 py-4 text-white text-base focus:border-brandMint"
                  placeholder="Chukwuemeka Obi"
                  placeholderTextColor="#64748B"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-white text-sm mb-2 font-medium">Email Address</Text>
                <TextInput
                  className="bg-[#12192b] border border-slate-700/80 rounded-xl px-4 py-4 text-white text-base focus:border-brandMint"
                  placeholder="rider@example.com"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Phone Input with Country Dropdown */}
              <View className="relative z-50">
                <Text className="text-white text-sm mb-2 font-medium">Phone Number</Text>
                <View className="flex-row bg-[#12192b] border border-slate-700/80 rounded-xl p-1.5 items-center focus:border-brandMint">
                  <TouchableOpacity 
                    className="flex-row items-center bg-slate-800/80 px-3 py-3 rounded-lg border border-slate-700/50"
                    onPress={() => setShowCountryPicker(!showCountryPicker)}
                  >
                    <Text className="text-lg mr-2">{selectedCountry.flag}</Text>
                    <Text className="text-white font-bold text-sm">{selectedCountry.code}</Text>
                    <Ionicons name="chevron-down" size={14} color="#94a3b8" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>

                  <TextInput
                    className="flex-1 text-white text-base py-3 px-3"
                    placeholder="800 000 0000"
                    placeholderTextColor="#64748B"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Dropdown Menu */}
                {showCountryPicker && (
                  <View className="absolute top-[85px] left-0 w-56 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden z-50">
                    {countries.map((country, index) => (
                      <TouchableOpacity 
                        key={country.code}
                        className={`flex-row items-center px-4 py-3 ${index !== countries.length - 1 ? 'border-b border-slate-700/50' : ''}`}
                        onPress={() => {
                          setSelectedCountry(country);
                          setShowCountryPicker(false);
                        }}
                      >
                        <Text className="text-xl mr-3">{country.flag}</Text>
                        <Text className="text-white font-medium flex-1">{country.name}</Text>
                        <Text className="text-slate-400 text-xs font-bold">{country.code}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Referral Code */}
              <View className="z-0">
                <Text className="text-white text-sm mb-2 font-medium mt-1">Referral Code (Optional)</Text>
                <TextInput
                  className="bg-[#12192b] border border-slate-700/80 rounded-xl px-4 py-4 text-white text-base focus:border-brandMint"
                  placeholder="e.g. OGA-1234"
                  placeholderTextColor="#64748B"
                  value={referralCode}
                  onChangeText={setReferralCode}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Buttons Container */}
            <View className="items-center w-full mt-2">
              <TouchableOpacity
                className={`bg-brandMint py-4 rounded-xl items-center justify-center w-full ${loading ? 'opacity-70' : ''}`}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#090d16" />
                ) : (
                  <Text className="text-[#090d16] font-bold text-lg">Create account</Text>
                )}
              </TouchableOpacity>

              {/* Google Sign Up Button */}
              <TouchableOpacity
                className="bg-transparent border border-slate-600 py-4 rounded-xl items-center justify-center w-full mt-4 flex-row active:bg-slate-800/50"
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={20} color="#ffffff" />
                <Text className="text-white font-bold text-base ml-3">Continue with Google</Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center mt-10">
              <Text className="text-slate-400 text-sm">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-brandMint font-bold text-sm underline">Sign in</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

