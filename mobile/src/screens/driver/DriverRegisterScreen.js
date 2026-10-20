import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCountry } from '../../context/CountryContext';
import { authService } from '../../api/api';

export default function DriverRegisterScreen({ navigation }) {
  const { isDark } = useTheme();
  const { updateCountry } = useCountry();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: '+234', flag: '🇳🇬', name: 'Nigeria' });
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const countries = [
    { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
    { code: '+233', flag: '🇬🇭', name: 'Ghana' },
    { code: '+254', flag: '🇰🇪', name: 'Kenya' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+1', flag: '🇺🇸', name: 'United States' },
  ];

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
    inputBg: isDark ? '#12192b' : '#f8fafc',
    inputBorder: isDark ? '#1e293b' : '#cbd5e1',
    headerBtnBg: isDark ? '#0f172a' : '#f1f5f9',
    headerBtnBorder: isDark ? '#1e293b' : '#e2e8f0',
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your full legal name as it appears on your ID.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please provide a valid email address.');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      Alert.alert('Invalid Phone', 'Please provide a valid phone number.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Security Notice', 'Please create a secure password (at least 6 characters).');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match.');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please accept the Driver Partner Code of Conduct to proceed.');
      return;
    }

    try {
      setLoading(true);
      if (updateCountry) {
        await updateCountry(selectedCountry.name || selectedCountry.code);
      }
      // Construct registration payload
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: `${selectedCountry.code}${phone.replace(/^0+/, '')}`,
        password,
        role: 'driver',
        referral_code: referralCode.trim() || null,
      };

      // Call API register endpoint (with graceful fallback for demo/offline preview)
      const res = await authService.register(payload).catch(() => null);
      
      // Navigate to Step 2 (Vehicle & Work Profile Status)
      navigation.navigate('DriverStatus', {
        registeredUser: payload
      });
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert('Registration Notice', error.response?.data?.message || 'Proceeding to driver vehicle & credentials setup.');
      navigation.navigate('DriverStatus', {
        registeredUser: { name, email, phone }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pb-12 pt-8">
            
            {/* Top Navigation Row */}
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                style={{ backgroundColor: themeStyles.headerBtnBg, borderColor: themeStyles.headerBtnBorder }}
                className="px-3 py-1.5 rounded-xl border flex-row items-center"
              >
                <Text style={{ color: themeStyles.primaryText }} className="text-xs font-normal">Sign In</Text>
              </TouchableOpacity>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                <Text style={{ color: themeStyles.brandGreen }} className="text-xs font-black uppercase tracking-wider">
                  Driver Partner Sign Up
                </Text>
              </View>
            </View>

            {/* Logo Section */}
            <View className="items-center mb-6">
              <Image 
                source={require('../../../assets/logo.png')} 
                style={{ width: 180, height: 55, resizeMode: 'contain' }}
                className="mb-1"
              />
              <Text style={{ color: themeStyles.primaryText }} className="text-2xl font-black mt-2 tracking-widest">
                OgaDriver
              </Text>
              <Text style={{ color: themeStyles.brandGreen }} className="font-extrabold text-[11px] tracking-[0.3em] uppercase">
                PARTNER OPERATIVE
              </Text>
            </View>

            {/* Step 1 Progress Pill */}
            <View 
              style={{ backgroundColor: themeStyles.cardBg, borderColor: themeStyles.cardBorder, borderWidth: 1 }}
              className="rounded-2xl p-3.5 mb-6 flex-row items-center justify-between shadow-sm"
            >
              <View className="flex-row items-center">
                <View 
                  style={{ backgroundColor: themeStyles.brandGreen }}
                  className="w-7 h-7 rounded-full items-center justify-center mr-3"
                >
                  <Text className="text-slate-950 font-black text-xs">1</Text>
                </View>
                <View>
                  <Text style={{ color: themeStyles.primaryText }} className="font-bold text-xs">
                    Step 1 of 3: Personal Information
                  </Text>
                  <Text style={{ color: themeStyles.subText }} className="text-[10px]">
                    Step 2: Vehicle Placement • Step 3: FRSC & Guarantor Vetting
                  </Text>
                </View>
              </View>
              <Text style={{ color: themeStyles.brandGreen }} className="font-mono text-xs font-bold">33%</Text>
            </View>

            {/* Welcome Text */}
            <View className="mb-6">
              <Text style={{ color: themeStyles.titleText }} className="text-2xl font-black tracking-tight">
                Create Partner Account
              </Text>
              <Text style={{ color: themeStyles.subText }} className="text-xs mt-1">
                Drive, earn on scheduled hires, and keep 100% of your earnings with 0% platform commission.
              </Text>
            </View>

            {/* Input Forms Card */}
            <View 
              style={{
                backgroundColor: themeStyles.cardBg,
                borderColor: themeStyles.cardBorder,
                borderWidth: 1
              }}
              className="rounded-3xl p-5 mb-6 shadow-sm space-y-4"
            >
              {/* Full Legal Name */}
              <View>
                <Text style={{ color: themeStyles.primaryText }} className="text-xs mb-1.5 font-bold uppercase">
                  Full Legal Name (as on Driver's License)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: themeStyles.inputBg,
                    borderColor: themeStyles.inputBorder,
                    color: themeStyles.primaryText,
                    borderWidth: 1
                  }}
                  className="rounded-xl px-4 py-3.5 text-sm font-semibold"
                  placeholder="e.g. Chukwuemeka Babatunde Obi"
                  placeholderTextColor={themeStyles.subText}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              {/* Email Address */}
              <View>
                <Text style={{ color: themeStyles.primaryText }} className="text-xs mb-1.5 font-bold uppercase">
                  Email Address
                </Text>
                <TextInput
                  style={{
                    backgroundColor: themeStyles.inputBg,
                    borderColor: themeStyles.inputBorder,
                    color: themeStyles.primaryText,
                    borderWidth: 1
                  }}
                  className="rounded-xl px-4 py-3.5 text-sm font-semibold"
                  placeholder="driver@ogadriver.ng"
                  placeholderTextColor={themeStyles.subText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Phone Input with Country Code Dropdown */}
              <View className="relative z-50">
                <Text style={{ color: themeStyles.primaryText }} className="text-xs mb-1.5 font-bold uppercase">
                  Phone Number
                </Text>
                <View 
                  style={{
                    backgroundColor: themeStyles.inputBg,
                    borderColor: themeStyles.inputBorder,
                    borderWidth: 1
                  }}
                  className="flex-row rounded-xl p-1 items-center"
                >
                  <TouchableOpacity 
                    style={{
                      backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                      borderColor: themeStyles.inputBorder
                    }}
                    className="flex-row items-center px-3 py-2.5 rounded-lg border"
                    onPress={() => setShowCountryPicker(!showCountryPicker)}
                  >
                    <Text className="text-base mr-1">{selectedCountry.flag}</Text>
                    <Text style={{ color: themeStyles.primaryText }} className="font-bold text-xs">{selectedCountry.code}</Text>
                    <Ionicons name="chevron-down" size={12} color={themeStyles.subText} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>

                  <TextInput
                    style={{ color: themeStyles.primaryText }}
                    className="flex-1 text-sm py-2.5 px-3 font-semibold"
                    placeholder="800 000 0000"
                    placeholderTextColor={themeStyles.subText}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Country Picker Dropdown */}
                {showCountryPicker && (
                  <View 
                    style={{
                      backgroundColor: themeStyles.cardBg,
                      borderColor: themeStyles.cardBorder,
                      borderWidth: 1
                    }}
                    className="absolute top-[75px] left-0 w-60 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    {countries.map((country, index) => (
                      <TouchableOpacity 
                        key={country.code}
                        style={{ borderBottomColor: themeStyles.cardBorder, borderBottomWidth: index !== countries.length - 1 ? 1 : 0 }}
                        className="flex-row items-center px-4 py-3"
                        onPress={() => {
                          setSelectedCountry(country);
                          setShowCountryPicker(false);
                        }}
                      >
                        <Text className="text-lg mr-2.5">{country.flag}</Text>
                        <Text style={{ color: themeStyles.primaryText }} className="font-medium text-xs flex-1">{country.name}</Text>
                        <Text style={{ color: themeStyles.subText }} className="text-xs font-bold font-mono">{country.code}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Password */}
              <View>
                <Text style={{ color: themeStyles.primaryText }} className="text-xs mb-1.5 font-bold uppercase">
                  Password
                </Text>
                <View 
                  style={{
                    backgroundColor: themeStyles.inputBg,
                    borderColor: themeStyles.inputBorder,
                    borderWidth: 1
                  }}
                  className="flex-row items-center rounded-xl px-4"
                >
                  <TextInput
                    style={{ color: themeStyles.primaryText }}
                    className="flex-1 py-3.5 text-sm font-semibold"
                    placeholder="Min. 6 characters"
                    placeholderTextColor={themeStyles.subText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={themeStyles.subText} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View>
                <Text style={{ color: themeStyles.primaryText }} className="text-xs mb-1.5 font-bold uppercase">
                  Confirm Password
                </Text>
                <TextInput
                  style={{
                    backgroundColor: themeStyles.inputBg,
                    borderColor: themeStyles.inputBorder,
                    color: themeStyles.primaryText,
                    borderWidth: 1
                  }}
                  className="rounded-xl px-4 py-3.5 text-sm font-semibold"
                  placeholder="Re-enter your password"
                  placeholderTextColor={themeStyles.subText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>

              {/* Referral Code (Optional) */}
              <View>
                <Text style={{ color: themeStyles.primaryText }} className="text-xs mb-1.5 font-bold uppercase">
                  Referral Code (Optional)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: themeStyles.inputBg,
                    borderColor: themeStyles.inputBorder,
                    color: themeStyles.primaryText,
                    borderWidth: 1
                  }}
                  className="rounded-xl px-4 py-3.5 text-sm font-semibold uppercase"
                  placeholder="e.g. OGA-1234"
                  placeholderTextColor={themeStyles.subText}
                  value={referralCode}
                  onChangeText={setReferralCode}
                  autoCapitalize="characters"
                />
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity 
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                className="flex-row items-center pt-2"
              >
                <View 
                  style={{
                    backgroundColor: agreedToTerms ? themeStyles.brandGreen : 'transparent',
                    borderColor: agreedToTerms ? themeStyles.brandGreen : themeStyles.cardBorder,
                    borderWidth: 1
                  }}
                  className="w-5 h-5 rounded-md items-center justify-center mr-2.5"
                >
                  {agreedToTerms && <Ionicons name="checkmark" size={14} color="#090d16" />}
                </View>
                <Text style={{ color: themeStyles.subText }} className="text-xs flex-1">
                  I agree to the <Text style={{ color: themeStyles.brandGreen }} className="font-bold">OgaDriver Partner Terms</Text> & Code of Conduct.
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View className="items-center w-full">
              <TouchableOpacity
                style={{ backgroundColor: themeStyles.brandGreen }}
                className={`py-4 rounded-2xl items-center justify-center w-full shadow-lg ${loading ? 'opacity-70' : ''}`}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#090d16" />
                ) : (
                  <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">
                    Continue to Vehicle & Profile Setup →
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Already have an account */}
            <View className="flex-row justify-center mt-6">
              <Text style={{ color: themeStyles.subText }} className="text-sm">Already a verified driver? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{ color: themeStyles.brandGreen }} className="font-black text-sm underline">
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
