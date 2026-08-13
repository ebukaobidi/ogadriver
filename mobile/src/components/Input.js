import React from 'react';
import { View, TextInput, Text } from 'react-native';

export default function Input({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false, 
  keyboardType = 'default', 
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  error = null,
  className = '',
  ...props 
}) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
          {label}
        </Text>
      )}
      <View className={`bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-800'} rounded-xl px-4 py-3`}>
        <TextInput
          className="text-white text-base font-bold"
          placeholder={placeholder}
          placeholderTextColor="#475569"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...props}
        />
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}
