import React from 'react';
import { View } from 'react-native';

export default function Skeleton({ className = '', height = 20, width, borderRadius = 4 }) {
  return (
    <View
      className={`bg-slate-800 animate-pulse ${className}`}
      style={{ height, width, borderRadius }}
    />
  );
}

export function CardSkeleton() {
  return (
    <View className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mb-3">
      <View className="flex-row items-center mb-3">
        <Skeleton width={40} height={40} borderRadius={20} className="mr-3" />
        <View className="flex-1">
          <Skeleton width="60%" height={16} className="mb-2" />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <Skeleton width="100%" height={12} className="mb-2" />
      <Skeleton width="80%" height={12} />
    </View>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </>
  );
}

export function StatCardSkeleton() {
  return (
    <View className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex-1">
      <Skeleton width="40%" height={12} className="mb-3" />
      <Skeleton width="60%" height={24} />
    </View>
  );
}
