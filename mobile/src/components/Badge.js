import React from 'react';
import { View, Text } from 'react-native';

export default function Badge({ 
  text, 
  variant = 'default', // default, success, warning, danger, info
  className = '' 
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500/20 border-green-500';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500';
      case 'danger':
        return 'bg-red-500/20 border-red-500';
      case 'info':
        return 'bg-blue-500/20 border-blue-500';
      case 'brand':
        return 'bg-brandMint/20 border-brandMint';
      default:
        return 'bg-slate-700 border-slate-600';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'danger':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
      case 'brand':
        return 'text-brandMint';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <View className={`px-3 py-1 rounded-full border ${getVariantStyles()} ${className}`}>
      <Text className={`text-xs font-bold uppercase ${getTextStyles()}`}>{text}</Text>
    </View>
  );
}
