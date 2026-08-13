import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

export default function Button({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false, 
  variant = 'primary', // primary, secondary, danger, outline
  className = '',
  ...props 
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brandMint';
      case 'secondary':
        return 'bg-slate-700';
      case 'danger':
        return 'bg-red-500';
      case 'outline':
        return 'border border-brandMint bg-transparent';
      default:
        return 'bg-brandMint';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return 'text-corporateNavy';
      case 'secondary':
        return 'text-white';
      case 'danger':
        return 'text-white';
      case 'outline':
        return 'text-brandMint';
      default:
        return 'text-corporateNavy';
    }
  };

  return (
    <TouchableOpacity
      className={`${getVariantStyles()} py-4 rounded-xl items-center justify-center ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#22d3ee' : '#0f172a'} />
      ) : (
        <Text className={`${getTextStyles()} font-black text-sm uppercase tracking-widest`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
