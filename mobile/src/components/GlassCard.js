import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function GlassCard({
  children,
  className = '',
  intensity = 0.1,
  border = true,
  shadow = true,
  ...props
}) {
  return (
    <View
      className={`bg-slate-900/${intensity} backdrop-blur-md ${border ? 'border border-slate-700/50' : ''} ${shadow ? 'shadow-lg shadow-black/20' : ''} rounded-3xl ${className}`}
      style={StyleSheet.absoluteFillObject}
      {...props}
    >
      {children}
    </View>
  );
}
