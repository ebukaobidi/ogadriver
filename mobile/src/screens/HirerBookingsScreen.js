import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { bookingService } from '../api/api';

export default function HirerBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, in_progress, completed

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      let filteredBookings = response.data?.data || [];
      
      if (filter !== 'all') {
        filteredBookings = filteredBookings.filter(b => b.status === filter);
      }
      
      setBookings(filteredBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: async () => {
            try {
              await bookingService.cancelBooking(bookingId, 'Cancelled by hirer');
              Alert.alert('Success', 'Booking cancelled');
              loadBookings();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const renderBooking = ({ item }) => (
    <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">{item.title}</Text>
          <Text className="text-slate-400 text-sm">{item.driver?.user?.name || 'No driver assigned'}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${
          item.status === 'completed' ? 'bg-green-500/20' :
          item.status === 'in_progress' ? 'bg-blue-500/20' :
          item.status === 'pending' ? 'bg-yellow-500/20' :
          item.status === 'accepted' ? 'bg-purple-500/20' : 'bg-slate-700'
        }`}>
          <Text className={`text-xs font-bold uppercase ${
            item.status === 'completed' ? 'text-green-500' :
            item.status === 'in_progress' ? 'text-blue-500' :
            item.status === 'pending' ? 'text-yellow-500' :
            item.status === 'accepted' ? 'text-purple-500' : 'text-slate-400'
          }`}>
            {item.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View className="space-y-1 mb-3">
        <Text className="text-slate-400 text-sm">📍 {item.pickup_location}</Text>
        <Text className="text-slate-400 text-sm">🏁 {item.dropoff_location}</Text>
        <Text className="text-slate-400 text-sm">🚛 {item.vehicle_type}</Text>
        <Text className="text-slate-400 text-sm">📅 {new Date(item.pickup_time).toLocaleString()}</Text>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-brandMint font-bold text-xl">₦{item.agreed_rate?.toLocaleString()}</Text>
        <Text className="text-slate-400 text-xs">{item.pricing_type}</Text>
      </View>

      <View className="flex-row space-x-2">
        <TouchableOpacity
          className="flex-1 bg-slate-800 py-3 rounded-xl items-center"
          onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
        >
          <Text className="text-white font-bold text-sm uppercase">Details</Text>
        </TouchableOpacity>
        {item.status === 'pending' && (
          <TouchableOpacity
            className="flex-1 bg-red-500/20 border border-red-500 py-3 rounded-xl items-center"
            onPress={() => handleCancel(item.id)}
          >
            <Text className="text-red-500 font-bold text-sm uppercase">Cancel</Text>
          </TouchableOpacity>
        )}
        {item.status === 'accepted' && (
          <TouchableOpacity
            className="flex-1 bg-brandMint py-3 rounded-xl items-center"
            onPress={() => navigation.navigate('SecurityPin', { bookingId: item.id })}
          >
            <Text className="text-corporateNavy font-bold text-sm uppercase">Generate PIN</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-corporateNavy">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-black text-white mb-2 uppercase tracking-widest">My Bookings</Text>
        <Text className="text-brandMint font-mono text-sm">Manage your bookings</Text>
      </View>

      <View className="px-6 mb-4 flex-row space-x-2">
        {['all', 'pending', 'in_progress', 'completed'].map((f) => (
          <TouchableOpacity
            key={f}
            className={`flex-1 py-2 rounded-lg border ${filter === f ? 'bg-brandMint border-brandMint' : 'border-slate-700'}`}
            onPress={() => setFilter(f)}
          >
            <Text className={`text-center font-bold text-xs uppercase ${filter === f ? 'text-corporateNavy' : 'text-slate-400'}`}>
              {f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#22d3ee" size="large" />
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="px-6 pb-6"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-slate-400 text-center">No bookings found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
