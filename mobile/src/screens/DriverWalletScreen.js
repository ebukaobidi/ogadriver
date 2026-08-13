import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Alert, TextInput, SafeAreaView } from 'react-native';
import { walletService } from '../api/api';

export default function DriverWalletScreen({ navigation }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const walletData = await walletService.getWallet();
      setWallet(walletData.data);

      const transactionsData = await walletService.getTransactions();
      setTransactions(transactionsData.data?.data || []);
    } catch (error) {
      console.error('Error loading wallet:', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < 100) {
      Alert.alert('Error', 'Minimum deposit is ₦100');
      return;
    }

    try {
      await walletService.deposit({
        amount: parseFloat(depositAmount),
        payment_method: 'card',
        payment_reference: `DEP-${Date.now()}`,
      });
      Alert.alert('Success', 'Deposit successful');
      setDepositAmount('');
      loadWalletData();
    } catch (error) {
      Alert.alert('Error', 'Failed to process deposit');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 100) {
      Alert.alert('Error', 'Minimum withdrawal is ₦100');
      return;
    }

    if (!bankAccount) {
      Alert.alert('Error', 'Please enter bank account');
      return;
    }

    try {
      await walletService.withdraw({
        amount: parseFloat(withdrawAmount),
        bank_account: bankAccount,
      });
      Alert.alert('Success', 'Withdrawal request submitted');
      setWithdrawAmount('');
      setBankAccount('');
      loadWalletData();
    } catch (error) {
      Alert.alert('Error', 'Failed to process withdrawal');
    }
  };

  const renderTransaction = ({ item }) => (
    <View className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-white font-bold">{item.description}</Text>
          <Text className="text-slate-400 text-xs">{new Date(item.created_at).toLocaleString()}</Text>
        </View>
        <View>
          <Text className={`font-bold ${item.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
            {item.type === 'credit' ? '+' : '-'}₦{item.amount?.toLocaleString()}
          </Text>
          <View className={`px-2 py-1 rounded-full mt-1 ${item.status === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
            <Text className={`text-xs font-bold uppercase ${item.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
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
          <Text className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Wallet</Text>
          <Text className="text-brandMint font-mono text-sm mb-6">Manage your funds</Text>

          <View className="bg-gradient-to-r from-brandMint to-cyan-400 rounded-2xl p-6 mb-6">
            <Text className="text-corporateNavy text-sm font-bold uppercase tracking-widest mb-1">Available Balance</Text>
            <Text className="text-corporateNavy text-4xl font-black">₦{wallet?.available_balance?.toLocaleString() || '0.00'}</Text>
            <View className="mt-4 flex-row space-x-4">
              <View>
                <Text className="text-corporateNavy/70 text-xs">Total</Text>
                <Text className="text-corporateNavy font-bold">₦{wallet?.balance?.toLocaleString() || '0.00'}</Text>
              </View>
            </View>
          </View>

          <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
            <Text className="text-brandMint font-mono text-xs uppercase tracking-widest mb-3">Quick Deposit</Text>
            <TextInput
              className="bg-slate-800 text-white rounded-xl px-4 py-3 mb-3"
              placeholder="Amount (₦)"
              placeholderTextColor="#475569"
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
            />
            <TouchableOpacity
              className="bg-brandMint py-3 rounded-xl items-center"
              onPress={handleDeposit}
            >
              <Text className="text-corporateNavy font-bold uppercase tracking-widest">Deposit</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
            <Text className="text-brandMint font-mono text-xs uppercase tracking-widest mb-3">Withdraw</Text>
            <TextInput
              className="bg-slate-800 text-white rounded-xl px-4 py-3 mb-3"
              placeholder="Amount (₦)"
              placeholderTextColor="#475569"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
            />
            <TextInput
              className="bg-slate-800 text-white rounded-xl px-4 py-3 mb-3"
              placeholder="Bank Account Number"
              placeholderTextColor="#475569"
              value={bankAccount}
              onChangeText={setBankAccount}
              keyboardType="numeric"
            />
            <TouchableOpacity
              className="bg-slate-700 py-3 rounded-xl items-center"
              onPress={handleWithdraw}
            >
              <Text className="text-white font-bold uppercase tracking-widest">Withdraw</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-brandMint font-mono text-xs uppercase tracking-widest mb-3">Transaction History</Text>
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Text className="text-slate-400">No transactions yet</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
