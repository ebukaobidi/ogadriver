import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, SafeAreaView, RefreshControl } from 'react-native';
import { bookingService } from '../api/api';

export default function ContractsScreen() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContracts = async () => {
    try {
      const data = await bookingService.getMyBookings();
      // Filter for accepted or in_progress
      const active = data.filter(b => b.status === 'accepted' || b.status === 'in_progress');
      setContracts(active);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch contracts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContracts();
  }, []);

  const renderItem = ({ item }) => {
    return (
      <View className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-white font-bold text-lg">{item.hirer?.name || 'Unknown Employer'}</Text>
          <View className="bg-brandMint/20 px-2 py-1 rounded">
            <Text className="text-brandMint font-mono text-xs uppercase">{item.status}</Text>
          </View>
        </View>
        <Text className="text-slate-400 text-sm">
          Vehicle Type: {item.vehicle_type || 'N/A'} {'\n'}
          Location: {item.pickup_location || 'N/A'} {'\n'}
          Escrow Status: <Text className="text-emerald-400">{item.escrow_status || 'locked'}</Text>
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-corporateNavy">
      <View className="px-5 pt-4 pb-2 border-b border-slate-800">
        <Text className="text-2xl font-black text-white uppercase tracking-widest">Active Ops</Text>
        <Text className="text-brandMint font-mono text-xs mb-2">Ongoing Deployments</Text>
      </View>
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#1cd188" size="large" />
        </View>
      ) : (
        <FlatList
          data={contracts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1cd188" />}
          ListEmptyComponent={
            <View className="mt-10 items-center justify-center p-10 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <Text className="text-slate-500 text-center font-mono">No active contracts. Check your inbox.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
