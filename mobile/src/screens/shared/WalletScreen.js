import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
  Linking,
  BackHandler
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { walletService, authService, extractArray } from '../../api/api';
import { useTheme } from '../../context/ThemeContext';
import { useCountry } from '../../context/CountryContext';
import { WebView } from 'react-native-webview';

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000, 50000];

export default function WalletScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { country: globalCountry, formatAmount } = useCountry();

  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  // Top-Up / Paystack State
  const [topupModalVisible, setTopupModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState('5000');
  const [submittingTopup, setSubmittingTopup] = useState(false);
  useEffect(() => {
    const onBack = () => {
      if (showPaystackWebView) {
        setShowPaystackWebView(false);
        setPaystackUrl(null);
        return true;
      }
      if (topupModalVisible) {
        setTopupModalVisible(false);
        return true;
      }
      if (transferModalVisible) {
        setTransferModalVisible(false);
        return true;
      }
      if (navigation?.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [showPaystackWebView, topupModalVisible, transferModalVisible, navigation]);

  const [paystackUrl, setPaystackUrl] = useState(null);
  const [paystackRef, setPaystackRef] = useState(null);
  const [showPaystackWebView, setShowPaystackWebView] = useState(false);

  // Transfer / Gift State
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  // Virtual Account Details
  const virtualAccount = {
    bank: 'Wema Bank (OgaDriver Collections)',
    accountNumber: '9920148291',
    accountName: 'OGADRIVER WALLET / ' + (user?.name || 'USER'),
  };

  const loadWallet = async () => {
    try {
      setLoading(true);
      const [u, wRes] = await Promise.allSettled([
        authService.getUser(),
        walletService.getWallet(),
      ]);

      if (u.status === 'fulfilled' && u.value) {
        setUser(u.value);
      }

      if (wRes.status === 'fulfilled' && wRes.value) {
        const data = wRes.value;
        const bal = data.wallet?.balance ?? data.data?.balance ?? data.balance ?? 0;
        setBalance(parseFloat(bal) || 0);
        setWallet(data.wallet || data.data || {});
        const txList = extractArray(data.transactions || data.data?.transactions || []);
        setTransactions(txList);
      }
    } catch (e) {
      console.log('Error loading wallet:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWallet();
  };

  const handleCopyAccount = async () => {
    try {
      if (Clipboard && Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(virtualAccount.accountNumber);
      }
      Alert.alert('Copied!', `Account number ${virtualAccount.accountNumber} copied to clipboard.`);
    } catch (e) {
      Alert.alert('Account Number', virtualAccount.accountNumber);
    }
  };

  // Paystack Checkout Initialization
  const handleInitiateTopup = async (amtValue) => {
    const amt = parseFloat(amtValue || customAmount);
    if (!amt || amt < 500) {
      Alert.alert('Invalid Amount', 'Minimum wallet top-up is ₦500.');
      return;
    }

    try {
      setSubmittingTopup(true);
      const res = await walletService.topUp(amt);
      if (res && res.authorization_url) {
        setPaystackUrl(res.authorization_url);
        setPaystackRef(res.reference);
        setTopupModalVisible(false);
        // On native platforms open webview modal, on web open url
        if (Platform.OS === 'web') {
          Linking.openURL(res.authorization_url);
        } else {
          setShowPaystackWebView(true);
        }
      } else {
        Alert.alert('Payment Notice', res?.message || 'Payment authorization initialized.');
        loadWallet();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not initiate Paystack top-up.';
      Alert.alert('Top-up Error', msg);
    } finally {
      setSubmittingTopup(false);
    }
  };

  const handlePaystackNavigationStateChange = async (navState) => {
    const { url } = navState;
    if (!url) return;

    // Detect callback or success URL
    if (url.includes('/payments/callback') || url.includes('callback') || url.includes('success')) {
      setShowPaystackWebView(false);
      setPaystackUrl(null);
      Alert.alert('Payment Received!', 'Verifying your payment and crediting your wallet...');
      if (paystackRef) {
        try {
          await walletService.verifyPayment(paystackRef);
        } catch (e) {}
      }
      loadWallet();
    } else if (url.includes('cancel') || url.includes('failed')) {
      setShowPaystackWebView(false);
      setPaystackUrl(null);
      Alert.alert('Cancelled', 'Top-up transaction was cancelled.');
    }
  };

  // Transfer / Gift Funds
  const handleTransfer = async () => {
    const amt = parseFloat(transferAmount);
    if (!amt || amt < 100) {
      Alert.alert('Invalid Amount', 'Minimum transfer amount is ₦100.');
      return;
    }
    if (amt > balance) {
      Alert.alert('Insufficient Balance', 'Your wallet balance is less than this transfer amount.');
      return;
    }
    if (!transferRecipient.trim()) {
      Alert.alert('Recipient Required', 'Enter recipient phone number or email.');
      return;
    }

    try {
      setSubmittingTransfer(true);
      const res = await walletService.transfer({
        amount: amt,
        recipient_phone: transferRecipient.trim(),
        recipient_email: transferRecipient.trim(),
        note: 'Transfer via OgaDriver Wallet',
      });
      setTransferModalVisible(false);
      setTransferAmount('');
      setTransferRecipient('');
      Alert.alert('Transfer Successful!', res.message || `₦${amt.toLocaleString()} sent successfully.`);
      loadWallet();
    } catch (err) {
      const msg = err.response?.data?.message || 'Transfer failed. Please check recipient details.';
      Alert.alert('Transfer Error', msg);
    } finally {
      setSubmittingTransfer(false);
    }
  };

  const formatCurrency = (num) => {
    if (formatAmount) return formatAmount(num);
    const sym = globalCountry?.symbol || '₦';
    return `${sym}${Number(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090d16' : '#f8fafc' }}>
      {/* Top Header */}
      <View
        style={{
          backgroundColor: isDark ? '#090d16' : '#ffffff',
          borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
          borderBottomWidth: 1,
        }}
        className="px-4 py-3.5 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          {navigation?.canGoBack && navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: isDark ? '#121927' : '#f1f5f9',
                borderColor: isDark ? '#1e293b' : '#cbd5e1',
              }}
              className="w-9 h-9 rounded-full border items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={18} color={isDark ? '#ffffff' : '#0f172a'} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-extrabold text-lg">
              Wallet & Payments
            </Text>
            <Text style={{ color: '#10b981' }} className="text-[11px] font-semibold uppercase tracking-wider">
              Instant Paystack Checkout
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onRefresh}
          style={{
            backgroundColor: isDark ? '#121927' : '#f1f5f9',
            borderColor: isDark ? '#1e293b' : '#cbd5e1',
          }}
          className="w-9 h-9 rounded-full border items-center justify-center"
        >
          <Ionicons name="refresh" size={16} color={isDark ? '#10b981' : '#059669'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
      >
        {/* HERO BALANCE CARD */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#bbf7d0',
          }}
          className="rounded-3xl p-6 border shadow-lg mb-5 relative overflow-hidden"
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-emerald-500/15 items-center justify-center mr-2 border border-emerald-500/30">
                <Ionicons name="wallet" size={16} color="#10b981" />
              </View>
              <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-xs font-bold uppercase tracking-wider">
                Total Available Balance
              </Text>
            </View>
            <View className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <Text className="text-emerald-500 text-[10px] font-bold uppercase">Active • Verified</Text>
            </View>
          </View>

          {loading && !balance ? (
            <ActivityIndicator size="small" color="#10b981" style={{ marginVertical: 12 }} />
          ) : (
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-4xl font-black tracking-tight mb-4">
              {formatCurrency(balance)}
            </Text>
          )}

          {/* Action Buttons Row */}
          <View className="flex-row gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <TouchableOpacity
              onPress={() => setTopupModalVisible(true)}
              className="flex-1 py-3 rounded-2xl bg-emerald-500 active:bg-emerald-600 items-center justify-center flex-row shadow-md shadow-emerald-500/20"
            >
              <Ionicons name="add-circle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text className="text-white font-bold text-xs uppercase">Top Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTransferModalVisible(true)}
              style={{
                backgroundColor: isDark ? '#1a2333' : '#f1f5f9',
                borderColor: isDark ? '#334155' : '#cbd5e1',
              }}
              className="flex-1 py-3 rounded-2xl border items-center justify-center flex-row"
            >
              <Ionicons name="paper-plane-outline" size={16} color={isDark ? '#ffffff' : '#0f172a'} style={{ marginRight: 6 }} />
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs uppercase">Send</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DEDICATED VIRTUAL ACCOUNT / DIRECT BANK TRANSFER CARD */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="rounded-2xl p-5 border shadow-sm mb-5"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="business-outline" size={18} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm">
                Direct Bank Transfer Top-Up
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCopyAccount}
              className="flex-row items-center px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
            >
              <Ionicons name="copy-outline" size={12} color="#10b981" style={{ marginRight: 4 }} />
              <Text className="text-emerald-500 text-[10px] font-bold uppercase">Copy</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-3">
            Transfer directly from any Nigerian banking app. Your OgaDriver wallet will be credited automatically.
          </Text>

          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#f8fafc',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="p-3.5 rounded-xl border space-y-1.5"
          >
            <View className="flex-row justify-between">
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs">Bank Name:</Text>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-bold">{virtualAccount.bank}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs">Account No:</Text>
              <Text style={{ color: '#10b981' }} className="text-base font-black tracking-widest">{virtualAccount.accountNumber}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs">Account Name:</Text>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-semibold">{virtualAccount.accountName}</Text>
            </View>
          </View>
        </View>

        {/* QUICK PRESET TOP-UP ROW */}
        <View className="mb-5">
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm mb-3">
            Quick Paystack Funding
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {PRESET_AMOUNTS.map((amt) => (
              <TouchableOpacity
                key={amt}
                onPress={() => handleInitiateTopup(amt)}
                disabled={submittingTopup}
                style={{
                  backgroundColor: isDark ? '#121927' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#cbd5e1',
                }}
                className="flex-1 min-w-[30%] py-3 px-2 rounded-xl border items-center active:border-emerald-500 shadow-sm"
              >
                <Text style={{ color: '#10b981' }} className="font-extrabold text-xs">
                  +₦{amt.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* RECENT TRANSACTIONS */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm">
              Transaction History
            </Text>
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-medium">
              {transactions.length} record{transactions.length === 1 ? '' : 's'}
            </Text>
          </View>

          {transactions.length === 0 ? (
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="p-8 rounded-2xl border items-center justify-center text-center shadow-sm"
            >
              <Ionicons name="receipt-outline" size={36} color={isDark ? '#475569' : '#cbd5e1'} style={{ marginBottom: 8 }} />
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-sm font-bold">
                No Transactions Yet
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs text-center mt-1">
                Your wallet top-ups, ride fares, and transfers will appear here.
              </Text>
            </View>
          ) : (
            <View className="space-y-2.5">
              {transactions.map((tx, idx) => {
                const isCredit = tx.type === 'credit' || (parseFloat(tx.amount || 0) > 0 && !tx.type?.includes('debit') && !tx.type?.includes('withdrawal'));
                const amountVal = Math.abs(parseFloat(tx.amount || 0));
                const dateStr = tx.created_at ? new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

                return (
                  <View
                    key={tx.id || idx}
                    style={{
                      backgroundColor: isDark ? '#121927' : '#ffffff',
                      borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    }}
                    className="p-3.5 rounded-2xl border flex-row items-center justify-between shadow-sm mb-2"
                  >
                    <View className="flex-row items-center flex-1 mr-3">
                      <View
                        style={{
                          backgroundColor: isCredit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        }}
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      >
                        <Ionicons
                          name={isCredit ? 'arrow-down-circle' : 'arrow-up-circle'}
                          size={22}
                          color={isCredit ? '#10b981' : '#ef4444'}
                        />
                      </View>
                      <View className="flex-1">
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs" numberOfLines={1}>
                          {tx.description || (isCredit ? 'Wallet Top-Up' : 'Ride Fare Payment')}
                        </Text>
                        <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] mt-0.5">
                          {dateStr} • Ref: {tx.reference ? tx.reference.slice(0, 12) : 'OG-WALLET'}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={{ color: isCredit ? '#10b981' : (isDark ? '#ffffff' : '#0f172a') }}
                      className="font-black text-sm"
                    >
                      {isCredit ? '+' : '-'}{formatCurrency(amountVal)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* TOP-UP MODAL */}
      <Modal visible={topupModalVisible} transparent animationType="slide" onRequestClose={() => setTopupModalVisible(false)}>
        <View className="flex-1 bg-black/60 justify-end px-3 pb-8">
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="rounded-3xl p-6 border shadow-2xl"
          >
            <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-black text-lg">
                Fund Wallet via Paystack
              </Text>
              <TouchableOpacity onPress={() => setTopupModalVisible(false)}>
                <Ionicons name="close" size={20} color={isDark ? '#ffffff' : '#0f172a'} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-3">
              Enter amount to deposit using Bank Card, USSD, OPay, or Bank Transfer:
            </Text>

            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#f8fafc',
                borderColor: isDark ? '#334155' : '#cbd5e1',
              }}
              className="flex-row items-center border rounded-2xl px-4 py-3 mb-4"
            >
              <Text style={{ color: '#10b981' }} className="text-xl font-bold mr-2">₦</Text>
              <TextInput
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="numeric"
                placeholder="5,000"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                className="flex-1 text-lg font-bold"
              />
            </View>

            <View className="flex-row gap-2 mb-5">
              {[2000, 5000, 10000, 20000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setCustomAmount(String(amt))}
                  className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center"
                >
                  <Text className="text-emerald-500 text-xs font-bold">₦{amt.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => handleInitiateTopup(customAmount)}
              disabled={submittingTopup}
              className="w-full bg-emerald-500 py-3.5 rounded-2xl items-center flex-row justify-center shadow-lg shadow-emerald-500/30"
            >
              {submittingTopup ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text className="text-white font-extrabold text-sm uppercase tracking-wider">
                    Proceed to Paystack Checkout
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TRANSFER / GIFT MODAL */}
      <Modal visible={transferModalVisible} transparent animationType="slide" onRequestClose={() => setTransferModalVisible(false)}>
        <View className="flex-1 bg-black/60 justify-end px-3 pb-8">
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="rounded-3xl p-6 border shadow-2xl"
          >
            <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-black text-lg">
                Send Funds to User
              </Text>
              <TouchableOpacity onPress={() => setTransferModalVisible(false)}>
                <Ionicons name="close" size={20} color={isDark ? '#ffffff' : '#0f172a'} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-2">
              Recipient Phone Number or Email:
            </Text>
            <TextInput
              value={transferRecipient}
              onChangeText={setTransferRecipient}
              placeholder="e.g. 08012345678 or user@email.com"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              style={{
                backgroundColor: isDark ? '#121927' : '#f8fafc',
                borderColor: isDark ? '#334155' : '#cbd5e1',
                color: isDark ? '#ffffff' : '#0f172a',
              }}
              className="border rounded-2xl px-4 py-3 mb-3 text-sm font-medium"
            />

            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-2">
              Amount (₦):
            </Text>
            <TextInput
              value={transferAmount}
              onChangeText={setTransferAmount}
              keyboardType="numeric"
              placeholder="e.g. 3000"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              style={{
                backgroundColor: isDark ? '#121927' : '#f8fafc',
                borderColor: isDark ? '#334155' : '#cbd5e1',
                color: isDark ? '#ffffff' : '#0f172a',
              }}
              className="border rounded-2xl px-4 py-3 mb-5 text-sm font-bold"
            />

            <TouchableOpacity
              onPress={handleTransfer}
              disabled={submittingTransfer}
              className="w-full bg-emerald-500 py-3.5 rounded-2xl items-center flex-row justify-center shadow-lg shadow-emerald-500/30"
            >
              {submittingTransfer ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text className="text-white font-extrabold text-sm uppercase tracking-wider">
                    Confirm Transfer
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PAYSTACK WEBVIEW MODAL */}
      <Modal visible={showPaystackWebView} animationType="slide" onRequestClose={() => setShowPaystackWebView(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#090d16' }}>
          <View className="px-4 py-3 flex-row items-center justify-between border-b border-slate-800 bg-slate-900">
            <Text className="text-white font-bold text-sm">Paystack Secure Checkout</Text>
            <TouchableOpacity onPress={() => setShowPaystackWebView(false)} className="p-1">
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          {paystackUrl ? (
            <WebView
              source={{ uri: paystackUrl }}
              onNavigationStateChange={handlePaystackNavigationStateChange}
              startInLoadingState={true}
              renderLoading={() => (
                <View className="flex-1 items-center justify-center bg-slate-950">
                  <ActivityIndicator size="large" color="#10b981" />
                </View>
              )}
            />
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
