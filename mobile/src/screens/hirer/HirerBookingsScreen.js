import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookingService } from '../../api/api';
import { useTheme } from '../../context/ThemeContext';

export default function HirerBookingsScreen({ navigation }) {
  const { isDark } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, in_progress, pending, completed

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      let filteredBookings = response.data?.data || [];

      if (filter !== 'all') {
        filteredBookings = filteredBookings.filter((b) => b.status === filter);
      }

      setBookings(filteredBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancel = async (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? If a driver was already assigned, they will be notified immediately.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Trip',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingService.cancelBooking(bookingId, 'Cancelled by hirer');
              Alert.alert('Booking Cancelled', 'The booking was cancelled successfully.');
              loadBookings();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          bg: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5',
          border: isDark ? 'rgba(16,185,129,0.3)' : '#a7f3d0',
          text: '#10b981',
          icon: 'checkmark-circle-outline',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          bg: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff',
          border: isDark ? 'rgba(59,130,246,0.3)' : '#bfdbfe',
          text: '#3b82f6',
          icon: 'navigate-outline',
        };
      case 'accepted':
        return {
          label: 'Confirmed',
          bg: isDark ? 'rgba(168,85,247,0.15)' : '#faf5ff',
          border: isDark ? 'rgba(168,85,247,0.3)' : '#e9d5ff',
          text: '#a855f7',
          icon: 'shield-checkmark-outline',
        };
      case 'pending':
        return {
          label: 'Awaiting Driver',
          bg: isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb',
          border: isDark ? 'rgba(245,158,11,0.3)' : '#fde68a',
          text: '#f59e0b',
          icon: 'time-outline',
        };
      default:
        return {
          label: status ? status.replace('_', ' ') : 'Pending',
          bg: isDark ? '#1e293b' : '#f1f5f9',
          border: isDark ? '#334155' : '#cbd5e1',
          text: isDark ? '#94a3b8' : '#64748b',
          icon: 'information-circle-outline',
        };
    }
  };

  const renderBooking = ({ item }) => {
    const badge = getStatusBadge(item.status);
    const isExpiringSoon =
      item.end_date &&
      (new Date(item.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 14;

    return (
      <View
        style={{
          backgroundColor: isDark ? '#121927' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="border rounded-2xl p-4 mb-3.5 shadow-sm"
      >
        {/* Top Card Row: Title & Status Badge */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              className="font-normal text-sm"
              numberOfLines={1}
            >
              {item.title || 'Point-to-Point Ride'}
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="person-outline" size={12} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text
                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                className="text-xs ml-1 font-normal"
                numberOfLines={1}
              >
                {item.driver?.user?.name ? `Chauffeur: ${item.driver.user.name}` : 'Awaiting verified driver'}
              </Text>
            </View>
          </View>

          {/* Status Pill */}
          <View
            style={{ backgroundColor: badge.bg, borderColor: badge.border }}
            className="flex-row items-center px-2.5 py-1 rounded-full border"
          >
            <Ionicons name={badge.icon} size={11} color={badge.text} style={{ marginRight: 3 }} />
            <Text style={{ color: badge.text }} className="text-[10px] font-normal uppercase tracking-wider">
              {badge.label}
            </Text>
          </View>
        </View>

        {/* Route Details Box */}
        <View
          style={{
            backgroundColor: isDark ? '#0d131f' : '#f8fafc',
            borderColor: isDark ? '#1e293b' : '#f1f5f9',
          }}
          className="border rounded-xl p-3 mb-3"
        >
          {/* Pickup */}
          <View className="flex-row items-start mb-2">
            <View className="w-4 items-center mr-2 mt-0.5">
              <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <View className="w-0.5 h-4 bg-slate-300 dark:bg-slate-700 my-0.5" />
            </View>
            <View className="flex-1">
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase font-normal">
                Pickup Location
              </Text>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal" numberOfLines={1}>
                {item.pickup_location || 'Lagos Central'}
              </Text>
            </View>
          </View>

          {/* Dropoff */}
          <View className="flex-row items-start">
            <View className="w-4 items-center mr-2 mt-0.5">
              <Ionicons name="location" size={13} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase font-normal">
                Destination
              </Text>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal" numberOfLines={1}>
                {item.dropoff_location || 'Victoria Island'}
              </Text>
            </View>
          </View>
        </View>

        {/* Meta Info Row: Vehicle & Date */}
        <View className="flex-row items-center justify-between py-2 border-t border-b border-slate-700/10 dark:border-slate-800 mb-3">
          <View className="flex-row items-center">
            <Ionicons name="car-sport-outline" size={14} color="#10b981" style={{ marginRight: 4 }} />
            <Text style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="text-xs font-normal">
              {item.vehicle_type || 'Standard Sedan'}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color={isDark ? '#94a3b8' : '#64748b'} style={{ marginRight: 4 }} />
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal">
              {item.pickup_time ? new Date(item.pickup_time).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Flexible Date'}
            </Text>
          </View>
        </View>

        {isExpiringSoon && (
          <View className="bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5 rounded-lg mb-3 flex-row items-center">
            <Ionicons name="alert-circle-outline" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
            <Text className="text-amber-500 text-[10px] font-normal uppercase tracking-wider">
              Engagement Expiring Soon • Renew Contract
            </Text>
          </View>
        )}

        {/* Pricing & Actions Row */}
        <View className="flex-row items-center justify-between pt-1">
          <View>
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal">
              Agreed Rate ({item.pricing_type || 'Per Trip'})
            </Text>
            <Text className="text-emerald-500 font-normal text-lg">
              ₦{item.agreed_rate ? Number(item.agreed_rate).toLocaleString() : 'Negotiable'}
            </Text>
          </View>

          <View className="flex-row items-center space-x-2">
            {item.status === 'pending' && (
              <TouchableOpacity
                onPress={() => handleCancel(item.id)}
                className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 items-center justify-center mr-2"
              >
                <Text className="text-red-500 text-xs font-normal">Cancel</Text>
              </TouchableOpacity>
            )}

            {item.status === 'in_progress' && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ReportInfraction', {
                    driverId: item.driver?.id,
                    driverName: item.driver?.user?.name,
                  })
                }
                className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 items-center justify-center mr-2"
              >
                <Text className="text-amber-500 text-xs font-normal">Log Report</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('JobDetails', { jobId: item.id, bookingId: item.id })
              }
              style={{
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                borderColor: isDark ? '#334155' : '#cbd5e1',
              }}
              className="px-3.5 py-2 rounded-xl border items-center justify-center"
            >
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal">
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const filterTabs = [
    { id: 'all', label: 'All Trips' },
    { id: 'in_progress', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090d16' : '#ffffff' }}>
      {/* Top Header Bar */}
      <View
        style={{
          backgroundColor: isDark ? '#090d16' : '#ffffff',
          borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="flex-row items-center justify-between px-4 py-3 border-b"
      >
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Ride');
            }
          }}
          className="w-10 h-10 rounded-xl items-center justify-center bg-slate-100 dark:bg-slate-800"
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? '#ffffff' : '#0f172a'} />
        </TouchableOpacity>

        <View className="items-center">
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-base">
            My Bookings
          </Text>
          <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px]">
            Active rides, scheduled trips & chauffeur hires
          </Text>
        </View>

        <TouchableOpacity
          onPress={onRefresh}
          className="w-10 h-10 rounded-xl items-center justify-center bg-slate-100 dark:bg-slate-800"
        >
          <Ionicons name="refresh-outline" size={18} color="#10b981" />
        </TouchableOpacity>
      </View>

      {/* Segmented Filter Pills */}
      <View className="px-4 py-3">
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#f1f5f9',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="flex-row p-1 rounded-xl border"
        >
          {filterTabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setFilter(tab.id)}
                style={{
                  backgroundColor: isActive
                    ? isDark ? '#10b981' : '#008751'
                    : 'transparent',
                }}
                className="flex-1 py-2 rounded-lg items-center justify-center"
              >
                <Text
                  style={{
                    color: isActive ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
                  }}
                  className="font-normal text-xs"
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#10b981" size="large" />
          <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mt-3 font-normal">
            Loading your bookings...
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
          }
          ListEmptyComponent={
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#f8fafc',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="border rounded-2xl p-8 items-center mt-6 shadow-sm"
            >
              <View className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-4">
                <Ionicons name="car-outline" size={28} color="#10b981" />
              </View>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-base mb-1">
                No Bookings Found
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs text-center mb-5 px-4 font-normal">
                {filter === 'all'
                  ? 'You currently have no active or completed rides. Book an on-demand trip or hire a dedicated verified chauffeur.'
                  : `You have no ${filter.replace('_', ' ')} trips in this view.`}
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('Ride')}
                className="bg-emerald-500 active:bg-emerald-600 px-5 py-2.5 rounded-xl flex-row items-center shadow-sm"
              >
                <Ionicons name="add-circle-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text className="text-white font-normal text-xs uppercase tracking-wider">
                  Book a Ride Now
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
