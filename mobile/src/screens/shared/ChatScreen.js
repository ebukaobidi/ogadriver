import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/api';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen({ route, navigation }) {
  const { conversationId, recipientName } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  const fetchMessages = async () => {
    if (!conversationId) return;
    try {
      const res = await api.get(`/messages/conversations/${conversationId}`);
      if (res.data.success) {
        setMessages(res.data.data || []);
      }
    } catch (e) {
      console.log('Error fetching messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Auto-poll every 5s
    return () => clearInterval(interval);
  }, [conversationId]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);

    try {
      const res = await api.post(`/messages/conversations/${conversationId}`, {
        message: content,
      });

      if (res.data.success) {
        fetchMessages();
      }
    } catch (e) {
      console.log('Error sending message:', e);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.is_mine;
    return (
      <View className={`mb-3 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        <View className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMe ? 'bg-brandMint rounded-br-none' : 'bg-slate-900 border border-slate-800 rounded-bl-none'}`}>
          <Text className={`text-sm ${isMe ? 'text-corporateNavy font-semibold' : 'text-white'}`}>
            {item.content || item.message}
          </Text>
          <Text className={`text-[10px] mt-1 text-right ${isMe ? 'text-corporateNavy/70' : 'text-slate-500'}`}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-slate-900 dark:text-white font-normal text-base">{recipientName || 'Chat'}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-4 pt-4"
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#1cd188" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderMessage}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-slate-500 text-sm">No messages yet. Send a message to start!</Text>
              </View>
            }
          />
        )}

        {/* Quick Chat Chips Bar */}
        <View className="py-2">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              "📍 I'm at the pickup point",
              "⏱ In traffic, 5 mins away",
              "📞 Please call when outside",
              "✅ Confirming pickup location",
              "🎙 Voice Note (5s)"
            ]}
            keyExtractor={(chip, idx) => idx.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (item.includes("Voice Note")) {
                    setText("🎙 [Voice Memo Attached - 0:05]");
                  } else {
                    setText(item);
                  }
                }}
                className="bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 mr-2"
              >
                <Text className="text-brandMint text-xs font-semibold">{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input Bar */}
        <View className="py-3 flex-row items-center space-x-2">
          <View className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 flex-row items-center">
            <TextInput
              className="flex-1 text-slate-900 dark:text-white text-sm py-1"
              placeholder="Type a message..."
              placeholderTextColor="#475569"
              value={text}
              onChangeText={setText}
              multiline
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            className={`w-12 h-12 rounded-2xl items-center justify-center ${text.trim() ? 'bg-brandMint' : 'bg-slate-800'}`}
          >
            {sending ? (
              <ActivityIndicator color="#0f172a" size="small" />
            ) : (
              <Ionicons name="send" size={20} color={text.trim() ? '#0f172a' : '#475569'} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
