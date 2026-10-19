import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/api';
import { Ionicons } from '@expo/vector-icons';

export default function ConversationsListScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      if (res.data.success) {
        setConversations(res.data.data || []);
      }
    } catch (e) {
      console.log('Error fetching conversations:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between"
      onPress={() => navigation.navigate('Chat', {
        conversationId: item.id,
        recipientName: item.other_user?.name || 'User',
      })}
    >
      <View className="flex-row items-center space-x-3 flex-1 mr-3">
        <View className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full items-center justify-center">
          <Ionicons name="person" size={20} color="#10b981" />
        </View>
        <View className="flex-1">
          <Text className="text-slate-900 dark:text-white font-normal text-base">{item.other_user?.name || 'User'}</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1" numberOfLines={1}>
            {item.last_message?.content || 'No messages yet'}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-slate-500 text-[10px]">
          {item.last_message?.created_at ? new Date(item.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
        {item.unread_count > 0 && (
          <View className="bg-emerald-500 w-5 h-5 rounded-full items-center justify-center mt-1">
            <Text className="text-white font-normal text-[10px]">{item.unread_count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-4 py-3.5 flex-row items-center border-b border-slate-800 bg-slate-900/60">
        <Text className="text-white text-lg font-normal">Messages</Text>
      </View>
      <View className="flex-1 px-4 pt-3">
        <FlatList
          data={conversations}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderConversation}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
          ListEmptyComponent={
            <View className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 items-center mt-10">
              <Ionicons name="chatbubbles-outline" size={48} color="#475569" />
              <Text className="text-slate-500 dark:text-slate-400 font-normal mt-4">No conversations yet</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
