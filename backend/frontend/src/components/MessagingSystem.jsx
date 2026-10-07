import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Search, 
  MoreVertical, 
  Clock, 
  CheckCheck,
  User,
  Briefcase,
  Filter
} from 'lucide-react';

import api from '../api/axios';

const MessagingContext = createContext();

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within MessagingProvider');
  }
  return context;
};

export const MessagingProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchConversations = async () => {
    // Only attempt to fetch conversations if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'null' || userStr === 'undefined') {
      return;
    }

    try {
      const res = await api.get('/messages/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations || []);
        
        let count = 0;
        (res.data.conversations || []).forEach(c => {
          count += c.unread || 0;
        });
        setUnreadCount(count);
      }
    } catch (err) {
      // Ignore 401 silently for background messaging polling
      if (err.response?.status !== 401) {
        console.error('Failed to fetch conversations', err);
      }
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async (conversationId) => {
    try {
      const res = await api.get(`/messages/conversations/${conversationId}`);
      if (res.data.success) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: res.data.messages
        }));
        
        // Refresh unread count after viewing
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation]);

  const sendMessage = async (conversationId, text) => {
    if (!text.trim()) return;

    // Optimistic UI update
    const tempId = Date.now();
    const newMessage = {
      id: tempId,
      text: text.trim(),
      sender: 'driver', // Or current user role
      timestamp: new Date().toISOString(),
      read: false
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));

    try {
      const res = await api.post(`/messages/conversations/${conversationId}`, { text });
      if (res.data.success) {
        // Replace optimistic message with real message from server
        setMessages(prev => ({
          ...prev,
          [conversationId]: prev[conversationId].map(m => m.id === tempId ? res.data.message : m)
        }));
        fetchConversations(); // Update last message on sidebar
      }
    } catch (err) {
      console.error('Failed to send message', err);
      // Remove optimistic message on failure
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].filter(m => m.id !== tempId)
      }));
    }
  };

  const markAsRead = (conversationId) => {
    // API will automatically mark as read when fetching, this is just for UI optimistics
    setMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map(m => ({ ...m, read: true }))
    }));
  };

  const startConversation = async (employer) => {
    try {
      const res = await api.post('/messages/start', { hirer_id: employer.id });
      if (res.data.success) {
        await fetchConversations();
        const conv = conversations.find(c => c.id === res.data.conversation_id);
        if (conv) {
          setActiveConversation(conv);
          setIsMessagingOpen(true);
        } else {
          // If the state hasn't updated yet, refetch and find
          const freshRes = await api.get('/messages/conversations');
          if (freshRes.data.success) {
            setConversations(freshRes.data.conversations);
            const freshConv = freshRes.data.conversations.find(c => c.id === res.data.conversation_id);
            if (freshConv) {
              setActiveConversation(freshConv);
              setIsMessagingOpen(true);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to start conversation', err);
    }
  };

  const value = {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    markAsRead,
    isMessagingOpen,
    setIsMessagingOpen,
    unreadCount,
    startConversation
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

export const MessagingButton = () => {
  const { isMessagingOpen, setIsMessagingOpen, unreadCount } = useMessaging();

  return (
    <button
      onClick={() => setIsMessagingOpen(!isMessagingOpen)}
      className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
    >
      <MessageSquare className="w-6 h-6 text-slate-400" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-brandMint text-corporateNavy text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export const MessagingPanel = () => {
  const { 
    isMessagingOpen, 
    setIsMessagingOpen, 
    conversations, 
    activeConversation, 
    setActiveConversation,
    messages,
    sendMessage,
    markAsRead
  } = useMessaging();
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeConversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  if (!isMessagingOpen) return null;

  const filteredConversations = conversations.filter(conv =>
    conv.employerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.employerCompany?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (activeConversation && messageText.trim()) {
      sendMessage(activeConversation.id, messageText);
      setMessageText('');
    }
  };

  const getUnreadCount = (conversationId) => {
    const convMessages = messages[conversationId] || [];
    return convMessages.filter(m => !m.read && m.sender !== 'driver').length;
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
        onClick={() => setIsMessagingOpen(false)}
      />
      <div className="fixed right-4 top-4 bottom-4 w-[600px] max-w-[90vw] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 flex overflow-hidden">
        
        {/* Sidebar - Conversations List */}
        <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/50">
          <div className="p-4 border-b border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white">Messages</h3>
              <button
                onClick={() => setIsMessagingOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-brandMint"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv);
                    markAsRead(conv.id);
                  }}
                  className={`p-4 border-b border-slate-800 cursor-pointer transition-colors ${
                    activeConversation?.id === conv.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                      {conv.avatar ? (
                        <img src={conv.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="font-bold text-slate-400">{conv.employerName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-sm truncate">{conv.employerName}</h4>
                        <span className="text-[10px] text-slate-500 ml-2">{formatTime(conv.lastMessageTime)}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{conv.employerCompany}</p>
                      <p className="text-xs text-slate-500 truncate mt-1">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    {getUnreadCount(conv.id) > 0 && (
                      <span className="bg-brandMint text-corporateNavy text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {getUnreadCount(conv.id)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    {activeConversation.avatar ? (
                      <img src={activeConversation.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="font-bold text-slate-400">{activeConversation.employerName.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{activeConversation.employerName}</h4>
                    <p className="text-xs text-slate-400">{activeConversation.employerCompany}</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-white">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {(messages[activeConversation.id] || []).map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.sender === 'driver'
                          ? 'bg-brandMint text-corporateNavy'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 text-[10px] ${
                        msg.sender === 'driver' ? 'text-corporateNavy/70' : 'text-slate-500'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {formatTime(msg.timestamp)}
                        {msg.sender === 'driver' && (
                          <CheckCheck className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-brandMint text-corporateNavy px-4 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
