import React from 'react';
import { View, Text } from 'react-native';

export default function Card({ 
  children, 
  className = '', 
  padding = 'p-4',
  ...props 
}) {
  return (
    <View className={`bg-slate-900 border border-slate-800 rounded-2xl ${padding} ${className}`} {...props}>
      {children}
    </View>
  );
}

export function StatCard({ label, value, icon, className = '' }) {
  return (
    <Card className={`flex-1 ${className}`}>
      <Text className="text-slate-400 text-xs uppercase tracking-widest mb-1">{label}</Text>
      <View className="flex-row items-center space-x-2">
        {icon && <Text className="text-2xl">{icon}</Text>}
        <Text className="text-white text-2xl font-black">{value}</Text>
      </View>
    </Card>
  );
}

export function InfoCard({ title, subtitle, icon, className = '' }) {
  return (
    <Card className={`flex-row items-center space-x-4 ${className}`}>
      {icon && <Text className="text-3xl">{icon}</Text>}
      <View className="flex-1">
        <Text className="text-white font-bold text-lg">{title}</Text>
        {subtitle && <Text className="text-slate-400 text-sm">{subtitle}</Text>}
      </View>
    </Card>
  );
}
