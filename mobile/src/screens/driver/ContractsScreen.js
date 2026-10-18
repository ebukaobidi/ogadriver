import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingService } from '../../api/api';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function ContractsScreen({ navigation }) {
  const { isDark } = useTheme();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
    headerBtnBg: isDark ? '#0f172a' : '#f1f5f9',
    headerBtnBorder: isDark ? '#1e293b' : '#e2e8f0',
  };

  const fetchContracts = async () => {
    try {
      const data = await bookingService.getMyBookings();
      // Filter for accepted or in_progress
      const active = (Array.isArray(data) ? data : data?.data || []).filter(
        b => b.status === 'accepted' || b.status === 'in_progress'
      );
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
      <View 
        style={{
          backgroundColor: themeStyles.cardBg,
          borderColor: themeStyles.cardBorder,
          borderWidth: 1
        }}
        className="rounded-2xl p-5 mb-4 shadow-sm"
      >
        <View className="flex-row justify-between items-start mb-2">
          <Text style={{ color: themeStyles.primaryText }} className="font-bold text-lg">
            {item.hirer?.name || 'Unknown Employer'}
          </Text>
          <View 
            style={{
              backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)',
              borderColor: themeStyles.brandGreen,
              borderWidth: 1
            }}
            className="px-2.5 py-1 rounded-full"
          >
            <Text style={{ color: themeStyles.brandGreen }} className="font-mono text-xs uppercase font-bold">
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={{ color: themeStyles.subText }} className="text-sm leading-relaxed">
          Vehicle Type: <Text style={{ color: themeStyles.primaryText }} className="font-semibold">{item.vehicle_type || 'N/A'}</Text>{'\n'}
          Location: <Text style={{ color: themeStyles.primaryText }} className="font-semibold">{item.pickup_location || 'N/A'}</Text>{'\n'}
          Escrow Status: <Text style={{ color: themeStyles.brandGreen }} className="font-bold">{item.escrow_status || 'Secured'}</Text>
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Header Bar */}
      <View 
        style={{ borderBottomColor: themeStyles.cardBorder, borderBottomWidth: 1 }} 
        className="px-5 pt-4 pb-3 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <View>
            <Text style={{ color: themeStyles.titleText }} className="text-xl font-normal tracking-wide">
              Active Ops
            </Text>
          </View>
        </View>
      </View>
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={themeStyles.brandGreen} size="large" />
        </View>
      ) : (
        <FlatList
          data={contracts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeStyles.brandGreen} />}
          ListEmptyComponent={
            <View 
              style={{
                backgroundColor: themeStyles.cardBg,
                borderColor: themeStyles.cardBorder,
                borderWidth: 1
              }}
              className="mt-10 items-center justify-center p-8 rounded-3xl"
            >
              <Ionicons name="briefcase-outline" size={32} color={themeStyles.subText} style={{ marginBottom: 8 }} />
              <Text style={{ color: themeStyles.subText }} className="text-center font-bold text-xs">
                No active contracts at the moment. Check your job offers.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
