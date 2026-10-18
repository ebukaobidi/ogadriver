import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, Platform } from 'react-native';

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // primary, secondary, danger, outline, gradient
  className = '',
  icon,
  size = 'medium', // small, medium, large
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brandMint shadow-lg shadow-emerald-500/30';
      case 'secondary':
        return 'bg-slate-700 shadow-lg shadow-slate-900/50';
      case 'danger':
        return 'bg-red-500 shadow-lg shadow-red-500/30';
      case 'outline':
        return 'border-2 border-brandMint bg-transparent';
      case 'gradient':
        return 'bg-gradient-to-r from-brandMint to-emerald-500';
      default:
        return 'bg-brandMint shadow-lg shadow-emerald-500/30';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
      case 'gradient':
        return 'text-slate-950';
      case 'secondary':
        return 'text-white';
      case 'danger':
        return 'text-white';
      case 'outline':
        return 'text-brandMint';
      default:
        return 'text-slate-950';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'py-2.5 px-4';
      case 'medium':
        return 'py-3.5 px-6';
      case 'large':
        return 'py-4 px-8';
      default:
        return 'py-3.5 px-6';
    }
  };

  const handlePress = async () => {
    if (!disabled && !loading) {
      // Haptic feedback (will be enhanced after expo-haptics is installed)
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        try {
          const Haptics = require('expo-haptics');
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
          // Haptics not available, continue without
        }
      }
      onPress();
    }
  };

  return (
    <TouchableOpacity
      className={`${getVariantStyles()} ${getSizeStyles()} rounded-2xl items-center justify-center ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#1cd188' : '#0f172a'} size="small" />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`${getTextStyles()} font-black text-xs uppercase tracking-widest`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
