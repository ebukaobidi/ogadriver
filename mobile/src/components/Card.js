import React from 'react';
import { View, Text } from 'react-native';

export default function Card({
  children,
  className = '',
  padding = 'p-4',
  glass = false,
  ...props
}) {
  return (
    <View
      className={`${glass ? 'bg-slate-900/50 backdrop-blur-md' : 'bg-slate-900/50'} border border-slate-800 rounded-2xl shadow-lg ${padding} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

export function StatCard({ label, value, icon, className = '', color = 'brandMint' }) {
  const colorClasses = {
    brandMint: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
  };

  return (
    <Card className={`flex-1 ${className}`}>
      <Text className="text-slate-500 text-xs uppercase tracking-widest mb-1">{label}</Text>
      <View className="flex-row items-center space-x-2">
        {icon && <Text className="text-2xl">{icon}</Text>}
        <Text className={`text-white text-2xl font-black ${colorClasses[color] || colorClasses.brandMint}`}>{value}</Text>
      </View>
    </Card>
  );
}

export function InfoCard({ title, subtitle, icon, className = '', status }) {
  return (
    <Card className={`flex-row items-center space-x-4 ${className}`}>
      {icon && <Text className="text-3xl">{icon}</Text>}
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-white font-bold text-lg">{title}</Text>
          {status && (
            <View className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <Text className="text-emerald-400 text-[10px] font-bold uppercase">{status}</Text>
            </View>
          )}
        </View>
        {subtitle && <Text className="text-slate-400 text-sm">{subtitle}</Text>}
      </View>
    </Card>
  );
}
