import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { authService, bookingService, jobService } from '../api/api';

export default function HirerDashboardScreen({ navigation, route }) {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const onLogout = route.params?.onLogout;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getUser();
      setUser(userData);

      const bookingsData = await bookingService.getMyBookings();
      setBookings(bookingsData.data?.data || []);

      const jobsData = await jobService.getJobs({ hirer_id: userData?.hirer?.id });
      setJobs(jobsData.data?.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    if (onLogout) onLogout();
  };

  const renderBooking = ({ item }) => (
    <View className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-white font-bold">{item.title}</Text>
          <Text className="text-slate-400 text-sm">{item.driver?.user?.name || 'No driver assigned'}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${
          item.status === 'completed' ? 'bg-green-500/20' :
          item.status === 'in_progress' ? 'bg-blue-500/20' :
          item.status === 'pending' ? 'bg-yellow-500/20' : 'bg-slate-700'
        }`}>
          <Text className={`text-xs font-bold.toUpperCase ${
            item.status === 'completed' ? 'text-green-500' :
            item.status === 'in_progress' ? 'text-blue-500' :
            item.status === 'pending' ? 'text-yellow-500' : 'text-slate-400'
          }`}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text className="text-slate-400 text-sm">📅 {new Date(item.pickup_time).toLocaleDateString()}</Text>
      <Text className="text-brandMint font-bold mt-1">₦{item.agreed_rate?.toLocaleString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-corporateNavy items-center justify-center">
        <ActivityIndicator color="#22d3ee" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-corporateNavy">
      <ScrollView className="flex-1">
        <View className="p-6">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-2xl font-bold text-white">Welcome, {user?.name?.split(' ')[0]}</Text>
              <Text className="text-brandMint font-mono text-sm">Employer Dashboard</Text>
            </View>
            <TouchableOpacity onPress={handleLogout}>
              <Text className="text-red-500 font-bold text-sm uppercase">Logout</Text>
            </TouchableOpacity>
          </View>

          <View className="grid grid-cols-2 gap-4 mb-6">
            <View className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <Text className="text-slate-400 text-xs uppercase tracking-widest">Active Bookings</Text>
              <Text className="text-white text-3xl font-black">{bookings.filter(b => b.status === 'in_progress').length}</Text>
            </View>
            <View className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <Text className="text-slate-400 text-xs uppercase tracking-widest">Total Jobs</Text>
              <Text className="text-white text-3xl font-black">{jobs.length}</Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-brandMint py-4 rounded-xl items-center mb-6"
            onPress={() => navigation.navigate('PostJob')}
          >
            <Text className="text-corporateNavy font-black uppercase tracking-widest">Post New Job</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-slate-900 border border-slate-800 py-4 rounded-xl items-center mb-6"
            onPress={() => navigation.navigate('SearchDrivers')}
          >
            <Text className="text-white font-bold uppercase tracking-widest">Search Drivers</Text>
          </TouchableOpacity>

          <Text className="text-brandMint font-mono text-xs uppercase tracking-widest mb-3">Recent Bookings</Text>
          <FlatList
            data={bookings.slice(0, 5)}
            renderItem={renderBooking}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Text className="text-slate-400">No bookings yet</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
