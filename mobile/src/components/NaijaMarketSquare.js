import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NaijaMarketSquare({ navigation }) {
  const [activeTab, setActiveTab] = useState('market');

  const tabs = [
    { id: 'market', label: 'Market Square', icon: 'storefront', color: '#1cd188' },
    { id: 'area', label: 'My Area', icon: 'map', color: '#f59e0b' },
    { id: 'connect', label: 'Connect', icon: 'people', color: '#3b82f6' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet', color: '#a855f7' },
  ];

  const drivers = [
    { id: 1, name: 'Chinedu Okafor', aka: 'China Boy', rating: 4.9, price: '₦3,500', trips: 1234, area: 'Victoria Island', verified: true },
    { id: 2, name: 'Emeka Nnamdi', aka: 'Emeka Fine', rating: 4.8, price: '₦3,200', trips: 987, area: 'Lekki', verified: true },
    { id: 3, name: 'Adaeze Onwudiwe', aka: 'Ada Taxi', rating: 4.7, price: '₦3,800', trips: 756, area: 'Ikoyi', verified: true },
    { id: 4, name: 'Oluwaseun Adebayo', aka: 'Seun Driver', rating: 4.6, price: '₦3,000', trips: 543, area: 'Yaba', verified: false },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#052e16] via-[#0a5c25] to-[#1a7a37]">
      {/* Nigerian Header with Ankara Pattern Background */}
      <View className="px-4 pt-6 pb-4 bg-emerald-900/30 backdrop-blur-sm border-b border-emerald-500/30">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              🇳🇬 Naija Driver Market
            </Text>
            <Text className="text-white font-black text-2xl">
              Oga, Welcome!
            </Text>
            <Text className="text-emerald-200 text-sm">
              Wetin you wan do today?
            </Text>
          </View>
          <TouchableOpacity className="w-12 h-12 rounded-full bg-emerald-500 border-2 border-emerald-300 items-center justify-center shadow-lg">
            <Ionicons name="person" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Nigerian Cultural Greeting */}
        <View className="bg-emerald-800/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-400/30">
          <Text className="text-emerald-100 text-sm italic">
            "Na who you know, no be who you be" - Find trusted drivers from your area
          </Text>
        </View>
      </View>

      {/* Tab Navigation - Nigerian Style */}
      <View className="flex-row px-4 py-3 bg-emerald-900/50 border-b border-emerald-500/20">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-xl mr-2 ${
              activeTab === tab.id
                ? 'bg-emerald-500 border-2 border-emerald-300'
                : 'bg-emerald-800/50 border border-emerald-700'
            }`}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.id ? '#ffffff' : '#6ee7b7'}
            />
            <Text
              className={`text-[10px] font-bold mt-1 text-center ${
                activeTab === tab.id ? 'text-white' : 'text-emerald-300'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {activeTab === 'market' && (
          <>
            {/* Quick Action Cards - Nigerian Market Style */}
            <View className="grid grid-cols-2 gap-3 mb-6">
              <TouchableOpacity
                className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-4 items-center shadow-lg"
                onPress={() => navigation.navigate('QuickRide')}
              >
                <Ionicons name="flash" size={32} color="#00e588" />
                <Text className="text-white font-bold text-sm mt-2">Oya Now!</Text>
                <Text className="text-emerald-400/70 text-[10px]">Quick ride, sharp sharp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-4 items-center shadow-lg"
                onPress={() => navigation.navigate('Negotiate')}
              >
                <Ionicons name="handshake" size={32} color="#00e588" />
                <Text className="text-white font-bold text-sm mt-2">Price Drop</Text>
                <Text className="text-emerald-400/70 text-[10px]">Talk price, make we see</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-4 items-center shadow-lg"
                onPress={() => navigation.navigate('MyArea')}
              >
                <Ionicons name="location" size={32} color="#00e588" />
                <Text className="text-white font-bold text-sm mt-2">My Area</Text>
                <Text className="text-emerald-400/70 text-[10px]">Drivers wey dey your side</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-4 items-center shadow-lg"
                onPress={() => navigation.navigate('Wallet')}
              >
                <Ionicons name="cash" size={32} color="#00e588" />
                <Text className="text-white font-bold text-sm mt-2">Cash Out</Text>
                <Text className="text-emerald-400/70 text-[10px]">Collect your money</Text>
              </TouchableOpacity>
            </View>

            {/* Driver Marketplace - Nigerian Style */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white font-black text-lg">Top Drivers for Market</Text>
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-emerald-300 text-xs font-bold mr-1">See All</Text>
                  <Ionicons name="chevron-forward" size={16} color="#34d399" />
                </TouchableOpacity>
              </View>

              {drivers.map((driver) => (
                <TouchableOpacity
                  key={driver.id}
                  className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-4 mb-3 flex-row items-center shadow-lg"
                  onPress={() => navigation.navigate('DriverProfile', { driver })}
                >
                  <View className="w-16 h-16 rounded-full bg-emerald-500/30 border-2 border-emerald-400 items-center justify-center mr-4">
                    <Text className="text-white font-black text-xl">{driver.name.charAt(0)}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-white font-bold text-base">{driver.name}</Text>
                      {driver.verified && (
                        <Ionicons name="checkmark-circle" size={16} color="#34d399" className="ml-2" />
                      )}
                    </View>
                    <Text className="text-emerald-300 text-sm italic">"{driver.aka}"</Text>
                    <View className="flex-row items-center mt-1 space-x-3">
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={14} color="#00e588" />
                        <Text className="text-emerald-200 text-xs ml-1">{driver.rating}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="car" size={14} color="#6ee7b7" />
                        <Text className="text-emerald-200 text-xs ml-1">{driver.trips} trips</Text>
                      </View>
                    </View>
                  </View>
                  <View className="items-center">
                    <Text className="text-emerald-300 font-black text-lg">{driver.price}</Text>
                    <Text className="text-emerald-400 text-[10px]">per trip</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {activeTab === 'area' && (
          <View className="items-center justify-center py-12">
            <Ionicons name="map" size={64} color="#6ee7b7" />
            <Text className="text-white font-black text-xl mt-4">My Area Drivers</Text>
            <Text className="text-emerald-300 text-sm">Drivers wey dey your side</Text>
          </View>
        )}

        {activeTab === 'connect' && (
          <View className="items-center justify-center py-12">
            <Ionicons name="people" size={64} color="#6ee7b7" />
            <Text className="text-white font-black text-xl mt-4">Connect</Text>
            <Text className="text-emerald-300 text-sm">Connect with drivers and hirers</Text>
          </View>
        )}

        {activeTab === 'wallet' && (
          <View className="items-center justify-center py-12">
            <Ionicons name="wallet" size={64} color="#6ee7b7" />
            <Text className="text-white font-black text-xl mt-4">Your Wallet</Text>
            <Text className="text-emerald-300 text-sm">Check your balance and cash out</Text>
          </View>
        )}
      </ScrollView>

      {/* Nigerian-style Bottom Action */}
      <View className="bg-emerald-900/90 backdrop-blur-sm border-t border-emerald-500/30 px-4 py-4">
        <TouchableOpacity
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 rounded-2xl items-center flex-row justify-center shadow-xl shadow-emerald-500/30"
          onPress={() => navigation.navigate('PostJob')}
        >
          <Ionicons name="add-circle" size={24} color="#ffffff" className="mr-2" />
          <Text className="text-white font-black text-base uppercase tracking-wider">
            Post Job - Na Oga You Be!
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
