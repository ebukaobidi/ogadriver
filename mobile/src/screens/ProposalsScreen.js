import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, RefreshControl } from 'react-native';
import { bookingService } from '../api/api';

export default function ProposalsScreen() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchProposals = async () => {
    try {
      const data = await bookingService.getMyBookings();
      // Filter for only 'pending'
      const pending = data.filter(b => b.status === 'pending');
      setProposals(pending);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch proposals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProposals();
  }, []);

  const handleAccept = async (id) => {
    try {
      setProcessingId(id);
      await bookingService.acceptProposal(id);
      Alert.alert('Success', 'Proposal accepted. It has moved to Active Contracts.');
      fetchProposals();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to accept proposal.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await bookingService.rejectProposal(id);
      Alert.alert('Declined', 'Proposal has been rejected.');
      fetchProposals();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to reject proposal.');
    } finally {
      setProcessingId(null);
    }
  };

  const renderItem = ({ item }) => {
    const isProcessing = processingId === item.id;
    return (
      <View className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-white font-bold text-lg">{item.hirer?.name || 'Unknown Employer'}</Text>
          <Text className="text-brandMint font-mono font-bold">₦{Number(item.agreed_rate).toLocaleString()}</Text>
        </View>
        <Text className="text-slate-400 text-sm mb-4">
          Vehicle Type: {item.vehicle_type || 'N/A'} {'\n'}
          Location: {item.pickup_location || 'N/A'} {'\n'}
          Escrow Status: {item.escrow_status || 'pending'}
        </Text>
        
        <View className="flex-row gap-4">
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-lg items-center ${isProcessing ? 'bg-emerald-900' : 'bg-brandMint'}`}
            onPress={() => handleAccept(item.id)}
            disabled={processingId !== null}
          >
            {isProcessing ? <ActivityIndicator color="#0f172a" /> : <Text className="text-corporateNavy font-black uppercase text-xs tracking-wider">Accept</Text>}
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-lg items-center border ${isProcessing ? 'border-red-900' : 'border-red-500/50'}`}
            onPress={() => handleReject(item.id)}
            disabled={processingId !== null}
          >
            <Text className="text-red-500 font-bold uppercase text-xs tracking-wider">Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-corporateNavy">
      <View className="px-5 pt-4 pb-2 border-b border-slate-800">
        <Text className="text-2xl font-black text-white uppercase tracking-widest">Inbox</Text>
        <Text className="text-brandMint font-mono text-xs mb-2">Awaiting Your Approval</Text>
      </View>
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#1cd188" size="large" />
        </View>
      ) : (
        <FlatList
          data={proposals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1cd188" />}
          ListEmptyComponent={
            <View className="mt-10 items-center justify-center p-10 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <Text className="text-slate-500 text-center font-mono">No pending job offers at this time.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
