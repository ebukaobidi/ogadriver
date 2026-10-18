import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../../api/api';
export default function HirerLoginScreen({ navigation, route }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('active_user_mode', 'hirer');
      } else {
        await SecureStore.setItemAsync('active_user_mode', 'hirer');
      }
      const data = await authService.login({ email: email.trim(), password });
      if (route.params && route.params.onLogin) {
        route.params.onLogin(data.user);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Invalid credentials';
      Alert.alert('Login Failed', msg);
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
          <View className="flex-1 px-6 justify-center pb-10 pt-12">

            {/* Logo Section */}
            <View className="items-center mb-8">
              <Image
                source={require('../../../assets/logo.png')}
                style={{ width: 220, height: 70 }}
                resizeMode="contain"
                className="mb-2"
              />
              <Text className="text-3xl font-black text-white mt-4 tracking-widest">OgaDriver</Text>
              <Text className="text-brandMint font-bold text-xs tracking-[0.3em] uppercase mt-1">Rider</Text>
            </View>

            {/* Welcome Text */}
            <View className="mb-8">
              <Text className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome back</Text>
              <Text className="text-slate-400 text-sm">Book a ride and move with OgaDriver.</Text>
            </View>

            {/* Input Forms */}
            <View className="space-y-5 mb-2">
              <View>
                <Text className="text-white text-sm mb-2 font-medium">Email</Text>
                <TextInput
                  className="bg-[#12192b] border border-slate-700/80 rounded-xl px-4 py-4 text-white text-base focus:border-brandMint"
                  placeholder="Enter your email"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-white text-sm mb-2 font-medium">Password</Text>
                <TextInput
                  className="bg-[#12192b] border border-slate-700/80 rounded-xl px-4 py-4 text-white text-base focus:border-brandMint"
                  placeholder="Enter your password"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity className="items-end mt-2 mb-4">
                <Text className="text-brandMint text-sm font-medium">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Buttons Container */}
            <View className="items-center w-full">
              {/* Login Button */}
              <TouchableOpacity
                className={`bg-brandMint py-4 rounded-xl items-center justify-center w-[85%] mt-2 ${loading ? 'opacity-70' : ''}`}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#090d16" />
                ) : (
                  <Text className="text-[#090d16] font-bold text-lg">Sign in</Text>
                )}
              </TouchableOpacity>

              {/* Google Sign In Button */}
              <TouchableOpacity
                className="bg-transparent border border-slate-600 py-4 rounded-xl items-center justify-center w-[85%] mt-4 flex-row active:bg-slate-800/50"
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={20} color="#ffffff" />
                <Text className="text-white font-bold text-base ml-3">Continue with Google</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center mt-10">
              <Text className="text-slate-400 text-sm">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-brandMint font-bold text-sm underline">Create an account</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

}
