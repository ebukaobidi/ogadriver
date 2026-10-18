import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingService } from '../../api/api';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function ProposalsScreen({ navigation }) {
  const { isDark } = useTheme();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'accepted'

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    itemBg: isDark ? '#090d16' : '#ffffff',
    itemBorder: isDark ? '#1e293b' : '#cbd5e1',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
    headerBtnBg: isDark ? '#0f172a' : '#f1f5f9',
    headerBtnBorder: isDark ? '#1e293b' : '#e2e8f0',
  };

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      const bookingsList = response.data?.data || response.data || response || [];
      const filtered = Array.isArray(bookingsList) 
        ? bookingsList.filter(b => activeTab === 'pending' ? b.status === 'pending' : b.status === 'accepted' || b.status === 'in_progress') 
        : [];
      setProposals(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProposals();
  }, [activeTab]);

  const handleAccept = async (id) => {
    try {
      setProcessingId(id);
      await bookingService.acceptProposal(id);
      Alert.alert('Success', 'Offer accepted! It has moved to your Accepted Runs.');
      fetchProposals();
    } catch (e) {
      Alert.alert('Error', 'Failed to accept offer.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await bookingService.rejectProposal(id);
      Alert.alert('Declined', 'Offer has been declined.');
      fetchProposals();
    } catch (e) {
      Alert.alert('Error', 'Failed to decline offer.');
    } finally {
      setProcessingId(null);
    }
  };

  const renderOfferCard = ({ item }) => {
    const isProcessing = processingId === item.id;
    const isExecutive = item.title?.toLowerCase().includes('executive') || true;

    return (
      <View 
        style={{
          backgroundColor: themeStyles.itemBg,
          borderColor: themeStyles.cardBorder,
          borderWidth: 1
        }}
        className="rounded-3xl p-5 mb-4 shadow-sm"
      >
        <View className="flex-row items-center mb-3">
          {/* Avatar Thumbnail / Icon */}
          {item.avatar ? (
            <View className="relative mr-3">
              <Image source={{ uri: item.avatar }} className="w-12 h-12 rounded-full border border-slate-700" />
              <View className="w-4 h-4 rounded-full bg-blue-500 absolute bottom-0 right-0 items-center justify-center">
                <Ionicons name="checkmark" size={10} color="#ffffff" />
              </View>
            </View>
          ) : (
            <View 
              style={{
                backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                borderColor: themeStyles.brandGreen,
                borderWidth: 1
              }}
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
            >
              <Ionicons name={isExecutive ? "person" : "bus"} size={22} color={themeStyles.brandGreen} />
            </View>
          )}

          <View className="flex-1">
            <Text style={{ color: themeStyles.primaryText }} className="font-bold text-base">
              {item.title || 'Executive Private Chauffeur'}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className="bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 flex-row items-center">
                <Ionicons name="checkmark-circle" size={12} color="#10b981" style={{ marginRight: 3 }} />
                <Text className="text-emerald-500 text-[10px] font-normal">Verified driver</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pay Rate & Location */}
        <View className="mb-2">
          <View className="flex-row items-baseline mb-1">
            <Text style={{ color: themeStyles.primaryText }} className="font-black text-2xl">
              ₦{Number(item.agreed_rate || item.amount || 250000).toLocaleString()}
            </Text>
            <Text style={{ color: themeStyles.subText }} className="text-xs font-semibold ml-1">
              / {item.rate_type || 'mo'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color={themeStyles.subText} style={{ marginRight: 3 }} />
              <Text style={{ color: themeStyles.subText }} className="text-xs">
                {item.pickup_location || 'Maitama, Abuja'}
              </Text>
            </View>
            
            {/* Accept & Decline Action Buttons */}
            <View className="flex-row space-x-2">
              <TouchableOpacity 
                style={{
                  backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                  borderColor: themeStyles.brandGreen,
                  borderWidth: 1
                }}
                className={`px-4 py-2 rounded-xl mr-2 ${isProcessing ? 'opacity-50' : ''}`}
                onPress={() => handleAccept(item.id)}
                disabled={processingId !== null}
              >
                <Text style={{ color: themeStyles.brandGreen }} className="font-bold text-xs">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                  borderColor: '#ef4444',
                  borderWidth: 1
                }}
                className={`px-4 py-2 rounded-xl ${isProcessing ? 'opacity-50' : ''}`}
                onPress={() => handleReject(item.id)}
                disabled={processingId !== null}
              >
                <Text className="text-red-500 font-bold text-xs">Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      <ScrollView 
        className="flex-1 px-4 pt-3 pb-8" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeStyles.brandGreen} />}
      >
        {/* Top App Bar Header */}
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 items-center justify-center mr-2 relative">
              <Ionicons name="person" size={16} color="#10b981" />
              <View className="w-3 h-3 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 items-center justify-center">
                <Ionicons name="checkmark" size={8} color="#ffffff" />
              </View>
            </View>
            <Text style={{ color: themeStyles.primaryText }} className="font-normal text-lg">Oga Driver</Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity 
              style={{ backgroundColor: themeStyles.headerBtnBg, borderColor: themeStyles.headerBtnBorder }}
              className="p-2 rounded-xl border mr-2"
            >
              <Ionicons name="chatbubble-outline" size={18} color={themeStyles.primaryText} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ backgroundColor: themeStyles.headerBtnBg, borderColor: themeStyles.headerBtnBorder }}
              className="p-2 rounded-xl border"
            >
              <Ionicons name="notifications-outline" size={18} color={themeStyles.primaryText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Page Title & Green Briefcase Icon */}
        <View className="flex-row justify-between items-center mb-3">
          <Text style={{ color: themeStyles.titleText }} className="font-black text-xl tracking-wide">
            JOB OFFERS & PROPOSALS
          </Text>
          <View 
            style={{
              backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)',
              borderColor: themeStyles.brandGreen,
              borderWidth: 1
            }}
            className="w-9 h-9 rounded-2xl items-center justify-center"
          >
            <Ionicons name="briefcase" size={18} color={themeStyles.brandGreen} />
          </View>
        </View>

        {/* Counter Badges Row */}
        <View className="flex-row space-x-2 mb-4">
          <View 
            style={{ backgroundColor: themeStyles.cardBg, borderColor: themeStyles.cardBorder }} 
            className="border px-3 py-1.5 rounded-full mr-2"
          >
            <Text style={{ color: themeStyles.subText }} className="font-bold text-[10px]">TOTAL OFFERS</Text>
          </View>
          <View className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full mr-2">
            <Text className="text-amber-500 font-bold text-[10px]">NEW PROPOSALS</Text>
          </View>
        </View>

        {/* Main Container Card */}
        <View 
          style={{
            backgroundColor: themeStyles.cardBg,
            borderColor: themeStyles.cardBorder,
            borderWidth: 1
          }}
          className="rounded-3xl p-5 mb-8 shadow-xl"
        >
          {/* Segmented Control Toggle */}
          <View 
            style={{ backgroundColor: themeStyles.itemBg, borderColor: themeStyles.cardBorder, borderWidth: 1 }} 
            className="p-1.5 rounded-2xl flex-row mb-5"
          >
            <TouchableOpacity 
              style={{
                backgroundColor: activeTab === 'pending' ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
                borderColor: activeTab === 'pending' ? themeStyles.brandGreen : 'transparent',
                borderWidth: activeTab === 'pending' ? 1 : 0
              }}
              className="flex-1 py-2.5 rounded-xl items-center"
              onPress={() => setActiveTab('pending')}
            >
              <Text style={{ color: activeTab === 'pending' ? themeStyles.brandGreen : themeStyles.subText }} className="font-bold text-xs">
                PENDING OFFERS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{
                backgroundColor: activeTab === 'accepted' ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
                borderColor: activeTab === 'accepted' ? themeStyles.brandGreen : 'transparent',
                borderWidth: activeTab === 'accepted' ? 1 : 0
              }}
              className="flex-1 py-2.5 rounded-xl items-center"
              onPress={() => setActiveTab('accepted')}
            >
              <Text style={{ color: activeTab === 'accepted' ? themeStyles.brandGreen : themeStyles.subText }} className="font-bold text-xs">
                ACCEPTED RUNS
              </Text>
            </TouchableOpacity>
          </View>

          {/* Offers List */}
          {loading ? (
            <ActivityIndicator color={themeStyles.brandGreen} size="large" className="py-8" />
          ) : proposals.length > 0 ? (
            <FlatList
              data={proposals}
              renderItem={renderOfferCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View>
              {renderOfferCard({
                item: {
                  id: 1,
                  title: 'Executive Private Chauffeur',
                  amount: 250000,
                  rate_type: 'mo',
                  pickup_location: 'Maitama, Abuja'
                }
              })}
              {renderOfferCard({
                item: {
                  id: 2,
                  title: 'Fleet Delivery Partner (Contract)',
                  amount: 85000,
                  rate_type: 'trip',
                  pickup_location: 'Onitsha to Lagos'
                }
              })}
              {renderOfferCard({
                item: {
                  id: 3,
                  title: 'Corporate Driver - Weekend Pool',
                  amount: 100000,
                  rate_type: 'weekend',
                  pickup_location: 'Victoria Island, Lagos'
                }
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
