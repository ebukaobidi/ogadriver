import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { authService } from '../api/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('driver'); // 'driver' or 'hirer'
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register({
        name,
        email,
        phone_number: phone,
        password,
        password_confirmation: confirmPassword,
        role: userType,
      });

      if (res.success) {
        Alert.alert('Success', 'Registration successful. Please login.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Registration Failed', error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-corporateNavy">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-8 pt-12">
          <View className="items-center mb-8">
            <Text className="text-4xl font-black text-white tracking-widest uppercase">OgaDriver</Text>
            <Text className="text-brandMint mt-2 font-mono uppercase tracking-widest text-xs">Identity Registration</Text>
          </View>

          <View className="space-y-4 mb-6">
            <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
              <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Full Name</Text>
              <TextInput
                className="text-white text-base font-bold"
                placeholder="John Doe"
                placeholderTextColor="#475569"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
              <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Email Address</Text>
              <TextInput
                className="text-white text-base font-bold"
                placeholder="john@example.com"
                placeholderTextColor="#475569"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
              <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Phone Number</Text>
              <TextInput
                className="text-white text-base font-bold"
                placeholder="+234 800 000 0000"
                placeholderTextColor="#475569"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
              <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Password</Text>
              <TextInput
                className="text-white text-base font-bold"
                placeholder="••••••••"
                placeholderTextColor="#475569"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
              <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Confirm Password</Text>
              <TextInput
                className="text-white text-base font-bold"
                placeholder="••••••••"
                placeholderTextColor="#475569"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
              <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Account Type</Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg border ${userType === 'driver' ? 'bg-brandMint border-brandMint' : 'border-slate-700'}`}
                  onPress={() => setUserType('driver')}
                >
                  <Text className={`text-center font-bold text-sm uppercase ${userType === 'driver' ? 'text-corporateNavy' : 'text-slate-400'}`}>Driver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg border ${userType === 'hirer' ? 'bg-brandMint border-brandMint' : 'border-slate-700'}`}
                  onPress={() => setUserType('hirer')}
                >
                  <Text className={`text-center font-bold text-sm uppercase ${userType === 'hirer' ? 'text-corporateNavy' : 'text-slate-400'}`}>Hirer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className={`bg-brandMint py-4 rounded-xl items-center justify-center mb-6 ${loading ? 'opacity-70' : ''}`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text className="text-corporateNavy font-black text-sm uppercase tracking-widest">Initialize Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-center text-slate-400 text-sm">Already have an account? <Text className="text-brandMint font-bold">Authenticate</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
