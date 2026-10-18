import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CommunityConnections({ navigation }) {
  const connections = [
    { id: 1, name: 'Emeka O.', type: 'Driver', area: 'Victoria Island', mutual: 12, status: 'online' },
    { id: 2, name: 'Chinedu K.', type: 'Hirer', area: 'Lekki', mutual: 8, status: 'online' },
    { id: 3, name: 'Adaeze N.', type: 'Driver', area: 'Ikoyi', mutual: 5, status: 'offline' },
    { id: 4, name: 'Oluwaseun A.', type: 'Hirer', area: 'Yaba', mutual: 3, status: 'online' },
  ];

  const communities = [
    { id: 1, name: 'Victoria Island Drivers', members: 156, icon: 'car' },
    { id: 2, name: 'Lekki Hirers Club', members: 89, icon: 'people' },
    { id: 3, name: 'Ikoyi Elite Drivers', members: 67, icon: 'star' },
    { id: 4, name: 'Yaba Market Runs', members: 234, icon: 'basket' },
  ];

  return (
    <View className="bg-emerald-900/30 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Ionicons name="people" size={20} color="#34d399" className="mr-2" />
          <Text className="text-white font-bold text-base">Community Connections</Text>
        </View>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-emerald-300 text-xs font-bold mr-1">See All</Text>
          <Ionicons name="chevron-forward" size={16} color="#34d399" />
        </TouchableOpacity>
      </View>

      {/* Mutual Connections */}
      <View className="mb-4">
        <Text className="text-emerald-300 text-xs uppercase tracking-wider mb-2">People You Know</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
          {connections.map((connection) => (
            <TouchableOpacity
              key={connection.id}
              className="bg-emerald-800/50 border border-emerald-500/30 rounded-xl p-3 min-w-[140px]"
              onPress={() => navigation.navigate('Profile', { id: connection.id })}
            >
              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 rounded-full bg-emerald-500/30 border border-emerald-400 items-center justify-center mr-2">
                  <Text className="text-white font-bold">{connection.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-xs">{connection.name}</Text>
                  <Text className="text-emerald-300 text-[10px]">{connection.type}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-emerald-400 text-[10px]">{connection.area}</Text>
                <View className={`w-2 h-2 rounded-full ${connection.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Communities */}
      <View>
        <Text className="text-emerald-300 text-xs uppercase tracking-wider mb-2">Your Communities</Text>
        <View className="space-y-2">
          {communities.map((community) => (
            <TouchableOpacity
              key={community.id}
              className="bg-emerald-800/30 border border-emerald-500/20 rounded-xl p-3 flex-row items-center"
              onPress={() => navigation.navigate('Community', { id: community.id })}
            >
              <View className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 items-center justify-center mr-3">
                <Ionicons name={community.icon} size={20} color="#34d399" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-sm">{community.name}</Text>
                <Text className="text-emerald-300 text-xs">{community.members} members</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6ee7b7" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
