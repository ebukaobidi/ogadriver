import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function Loading({ message = 'Loading...' }) {
  return (
    <View className="flex-1 bg-corporateNavy items-center justify-center">
      <ActivityIndicator color="#22d3ee" size="large" />
      <Text className="text-slate-400 mt-4">{message}</Text>
    </View>
  );
}

export function LoadingOverlay({ visible, message = 'Loading...' }) {
  if (!visible) return null;
  
  return (
    <View className="absolute inset-0 bg-corporateNavy/90 items-center justify-center z-50">
      <ActivityIndicator color="#22d3ee" size="large" />
      <Text className="text-slate-400 mt-4">{message}</Text>
    </View>
  );
}
