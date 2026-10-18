import React from 'react';
import { View, Text } from 'react-native';

export default function DashboardGauge({ value, max, label, color, unit }) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View className="items-center">
      <View className="relative w-[140px] h-[140px] items-center justify-center">
        {/* Background Circle */}
        <View
          className="absolute w-[120px] h-[120px] rounded-full border-4"
          style={{ borderColor: '#1e293b' }}
        />

        {/* Progress Circle - Using View with rotation for compatibility */}
        <View
          className="absolute w-[120px] h-[120px] rounded-full border-4 border-t-transparent border-l-transparent"
          style={{
            borderColor: color,
            transform: [{ rotate: `${(percentage / 100) * 360}deg` }],
          }}
        />

        {/* Center Text */}
        <View className="absolute items-center justify-center">
          <Text className="text-white font-black text-2xl">{value}</Text>
          <Text className="text-slate-500 text-xs">{unit}</Text>
        </View>
      </View>

      {/* Label */}
      <Text className="text-slate-400 text-xs uppercase tracking-wider mt-2">{label}</Text>
    </View>
  );
}

export function SpeedometerGauge({ value, max, label, color }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <View className="items-center">
      <View className="relative w-[140px] h-[80px] items-center justify-center">
        {/* Background Arc */}
        <View
          className="absolute w-[100px] h-[50px] rounded-t-full border-4"
          style={{ borderColor: '#1e293b' }}
        />

        {/* Progress Arc */}
        <View
          className="absolute w-[100px] h-[50px] rounded-t-full border-4 border-l-transparent border-r-transparent"
          style={{
            borderColor: color,
            transform: [{ rotate: `${(percentage / 100) * 180}deg` }],
          }}
        />

        {/* Value */}
        <Text className="text-white font-black text-2xl">{value}</Text>
      </View>

      <Text className="text-slate-400 text-xs uppercase tracking-wider mt-1">{label}</Text>
    </View>
  );
}

export function HorizontalBarGauge({ value, max, label, color }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <View className="w-full">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-slate-400 text-xs uppercase tracking-wider">{label}</Text>
        <Text className="text-white font-bold text-sm">{value}/{max}</Text>
      </View>

      <View className="h-3 bg-slate-800 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </View>

      <Text className="text-slate-500 text-[10px] mt-1 text-right">{percentage.toFixed(0)}%</Text>
    </View>
  );
}
