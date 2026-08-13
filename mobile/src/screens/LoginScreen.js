import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { authService } from '../api/api';

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // We get setIsAuthenticated from AppNavigator via props or context in a real app,
  // but for simplicity we'll pass it through screen props if possible,
  // or use a Context. Let's assume route.params.onLogin exists.
  const onLogin = route.params?.onLogin;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login({ email, password });
      if (res.success && onLogin) {
        onLogin(res.user);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Login Failed', 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-corporateNavy justify-center">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-8"
      >
        <View className="items-center mb-10">
          <Text className="text-4xl font-black text-white tracking-widest uppercase">OgaDriver</Text>
          <Text className="text-brandMint mt-2 font-mono uppercase tracking-widest text-xs">Trust Layer Access</Text>
        </View>

        <View className="space-y-4">
          <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 mb-4">
            <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Email Address</Text>
            <TextInput
              className="text-white text-base font-bold"
              placeholder="employer@ogadriver.com"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 mb-8">
            <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Passcode</Text>
            <TextInput
              className="text-white text-base font-bold"
              placeholder="••••••••"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className={`bg-brandMint py-4 rounded-xl items-center justify-center ${loading ? 'opacity-70' : ''}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text className="text-corporateNavy font-black text-sm uppercase tracking-widest">Authenticate</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
