import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function Header({ 
  title, 
  subtitle, 
  onBack, 
  onRightAction, 
  rightActionText,
  className = '' 
}) {
  return (
    <View className={`px-6 pt-6 pb-4 ${className}`}>
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          {onBack && (
            <TouchableOpacity onPress={onBack} className="mb-2">
              <Text className="text-brandMint text-sm">← Back</Text>
            </TouchableOpacity>
          )}
          <Text className="text-3xl font-black text-white mb-1 uppercase tracking-widest">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-brandMint font-mono text-sm">{subtitle}</Text>
          )}
        </View>
        {onRightAction && (
          <TouchableOpacity onPress={onRightAction}>
            <Text className="text-brandMint font-bold text-sm uppercase">
              {rightActionText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
