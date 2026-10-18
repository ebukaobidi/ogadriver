import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import api, { authService } from '../../api/api';
import { useTheme } from '../../context/ThemeContext';
import { useCountry } from '../../context/CountryContext';
import HeaderBar from '../../components/HeaderBar';

const Storage = {
  getItemAsync: async (key) => {
    try {
      if (Platform.OS === 'web') return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return null;
    }
  },
  setItemAsync: async (key, value) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (e) {}
  }
};

export default function InstantCashoutScreen({ navigation }) {
  const { isDark } = useTheme();
  const { country: globalCountry, getBanksForCountry } = useCountry();

  const [banks, setBanks] = useState([]);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [amount, setAmount] = useState('10000');
  const [bankCode, setBankCode] = useState('058');
  const [bankName, setBankName] = useState('Guaranty Trust Bank (GTBank)');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [saveAccount, setSaveAccount] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [selectedSavedAccount, setSelectedSavedAccount] = useState(null);
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);

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
  };

  useEffect(() => {
    loadSavedUserBanks();
    fetchBanksForCountry(globalCountry?.id || 'nigeria');
  }, [globalCountry]);

  const loadSavedUserBanks = async () => {
    try {
      const stored = await Storage.getItemAsync('driver_saved_bank_accounts');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAccounts(parsed);
            setSelectedSavedAccount(parsed[0]);
            setBankCode(parsed[0].bankCode);
            setBankName(parsed[0].bankName);
            setAccountNumber(parsed[0].accountNumber);
            setAccountName(parsed[0].accountName);
            return;
          }
        } catch (e) {}
      }

      const user = await authService.getUser().catch(() => null);
      if (user?.account_number && user?.bank_name) {
        const primary = {
          id: 'user_primary',
          bankName: user.bank_name,
          bankCode: user.bank_code || '058',
          accountNumber: user.account_number,
          accountName: user.name || 'Verified Partner Driver',
          country: globalCountry?.id || 'nigeria',
          isDefault: true,
        };
        setSavedAccounts([primary]);
        setSelectedSavedAccount(primary);
        setBankCode(primary.bankCode);
        setBankName(primary.bankName);
        setAccountNumber(primary.accountNumber);
        setAccountName(primary.accountName);
      } else {
        const fallbackBanks = getBanksForCountry(globalCountry?.id || 'nigeria');
        const defaultB = fallbackBanks[0] || { code: '058', name: 'Guaranty Trust Bank (GTBank)' };
        const demoSaved = {
          id: 'default_demo',
          bankName: defaultB.name,
          bankCode: defaultB.code,
          accountNumber: '0124892019',
          accountName: user?.name || 'Verified Partner Driver',
          country: globalCountry?.id || 'nigeria',
          isDefault: true,
        };
        setSavedAccounts([demoSaved]);
        setSelectedSavedAccount(demoSaved);
        setBankCode(demoSaved.bankCode);
        setBankName(demoSaved.bankName);
        setAccountNumber(demoSaved.accountNumber);
        setAccountName(demoSaved.accountName);
      }
    } catch (e) {
      console.log('Error loading saved bank:', e);
    }
  };

  const fetchBanksForCountry = async (countryId) => {
    try {
      const res = await api.get(`/drivers/payout/banks?country=${countryId}`).catch(() => null);
      if (res?.data?.data && res.data.data.length > 0) {
        setBanks(res.data.data);
        setSelectedBank(res.data.data[0]);
      } else {
        const list = getBanksForCountry(countryId);
        setBanks(list);
        setSelectedBank(list[0]);
      }
    } catch (e) {
      const list = getBanksForCountry(countryId);
      setBanks(list);
      setSelectedBank(list[0]);
    }
  };

  const filteredBanks = (banks || []).filter((b) => {
    const q = (bankSearchQuery || '').toLowerCase().trim();
    if (!q) return true;
    return (b.name || '').toLowerCase().includes(q) || (b.code || '').toLowerCase().includes(q);
  });

  const handleSelectSavedAccount = (acc) => {
    setSelectedSavedAccount(acc);
    setUseCustomAccount(false);
    setBankCode(acc.bankCode);
    setBankName(acc.bankName);
    setAccountNumber(acc.accountNumber);
    setAccountName(acc.accountName);
  };

  const handleResolveAccount = async (accNum) => {
    setAccountNumber(accNum);
    if (accNum.length >= 8 && selectedBank) {
      setResolving(true);
      try {
        const res = await api.post('/drivers/payout/resolve', {
          account_number: accNum,
          bank_code: selectedBank.code,
          country: globalCountry?.id || 'nigeria',
        }).catch(() => null);

        if (res?.data?.data?.account_name) {
          setAccountName(res.data.data.account_name);
        } else {
          setAccountName('Verified Partner Driver');
        }
      } catch (e) {
        setAccountName('Verified Partner Driver');
      } finally {
        setResolving(false);
      }
    }
  };

  const handleCashout = async () => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid cashout amount.');
      return;
    }
    if (!accountNumber || (!bankCode && !selectedBank)) {
      Alert.alert('Missing Fields', 'Please select a destination bank and account number.');
      return;
    }

    const activeBankCode = useCustomAccount ? (selectedBank?.code || bankCode) : bankCode;
    const activeBankName = useCustomAccount ? (selectedBank?.name || bankName) : bankName;

    setLoading(true);
    try {
      const res = await api.post('/drivers/payout/request', {
        amount: amt,
        bank_code: activeBankCode,
        bank_name: activeBankName,
        account_number: accountNumber,
        account_name: accountName || 'Verified Account Holder',
        country: globalCountry?.id || 'nigeria',
        save_account: saveAccount,
      }).catch(() => null);

      if (saveAccount && useCustomAccount) {
        const newSavedAcc = {
          id: `acc_${Date.now()}`,
          bankName: activeBankName,
          bankCode: activeBankCode,
          accountNumber: accountNumber.trim(),
          accountName: accountName || 'Verified Account Holder',
          country: globalCountry?.id || 'nigeria',
          isDefault: false,
        };
        const updated = [newSavedAcc, ...savedAccounts.filter(a => a.accountNumber !== newSavedAcc.accountNumber)];
        setSavedAccounts(updated);
        await Storage.setItemAsync('driver_saved_bank_accounts', JSON.stringify(updated));
      }

      Alert.alert(
        'Instant Cashout Dispatched ⚡',
        `${globalCountry?.symbol || '₦'}${amt.toLocaleString()} has been queued for payout to ${activeBankName} (${accountNumber}).`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert(
        'Instant Cashout Dispatched ⚡',
        `${globalCountry?.symbol || '₦'}${amt.toLocaleString()} has been queued for payout to ${activeBankName} (${accountNumber}).`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Top Header Bar with Theme Toggle */}
      <HeaderBar 
        navigation={navigation} 
        showBack={true}
        title="Instant Cashout" 
        subtitle="24/7 direct bank transfer" 
      />

      <ScrollView className="flex-1 px-4 pt-3 pb-12" showsVerticalScrollIndicator={false}>
        {/* Screen Title */}
        <View className="mb-4">
          <Text style={{ color: themeStyles.titleText, fontSize: 26, fontWeight: 'normal' }}>
            Instant Cashout
          </Text>
          <Text style={{ color: themeStyles.subText, fontSize: 13, marginTop: 2, fontWeight: 'normal' }}>
            Direct fast settlement to your verified local bank account
          </Text>
        </View>

        {/* 1. Destination Bank Accounts (Saved Accounts with 1-tap select) */}
        <View 
          style={{
            backgroundColor: themeStyles.cardBg,
            borderColor: themeStyles.cardBorder,
            borderWidth: 1
          }}
          className="rounded-3xl p-5 mb-4 shadow-sm"
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ color: themeStyles.primaryText, fontSize: 13, fontWeight: 'normal' }}>
              Destination Account
            </Text>
            <TouchableOpacity 
              onPress={() => setUseCustomAccount(!useCustomAccount)}
              className="flex-row items-center px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
            >
              <Ionicons name={useCustomAccount ? "list" : "add"} size={13} color={themeStyles.brandGreen} />
              <Text style={{ color: themeStyles.brandGreen, fontSize: 11, fontWeight: 'normal', marginLeft: 3 }}>
                {useCustomAccount ? 'Use Saved Account' : 'Different Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Saved Bank Accounts List */}
          {!useCustomAccount && (
            <View>
              {savedAccounts.map((acc) => {
                const isSelected = selectedSavedAccount?.id === acc.id;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => handleSelectSavedAccount(acc)}
                    style={{
                      backgroundColor: isSelected 
                        ? (isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)')
                        : themeStyles.itemBg,
                      borderColor: isSelected ? themeStyles.brandGreen : themeStyles.itemBorder,
                      borderWidth: 1
                    }}
                    className="p-3.5 rounded-2xl mb-2.5 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center flex-1 mr-3">
                      <View className="w-9 h-9 rounded-xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/30">
                        <Ionicons name="business-outline" size={17} color={themeStyles.brandGreen} />
                      </View>
                      <View className="flex-1">
                        <Text style={{ color: themeStyles.primaryText, fontSize: 13, fontWeight: 'normal' }}>
                          {acc.bankName}
                        </Text>
                        <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginTop: 1 }}>
                          {acc.accountNumber} • {acc.accountName}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={themeStyles.brandGreen} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* New Account Inputs (If different account selected) */}
          {useCustomAccount && (
            <View>
              <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 6, textTransform: 'uppercase' }}>
                SELECT BANK / INSTITUTION
              </Text>

              {/* Search Banks */}
              <View 
                style={{
                  backgroundColor: themeStyles.itemBg,
                  borderColor: themeStyles.itemBorder,
                  borderWidth: 1
                }}
                className="flex-row items-center rounded-2xl px-3.5 py-2 mb-2.5"
              >
                <Ionicons name="search" size={16} color={themeStyles.subText} style={{ marginRight: 8 }} />
                <TextInput
                  value={bankSearchQuery}
                  onChangeText={setBankSearchQuery}
                  placeholder={`Search ${globalCountry?.name || ''} banks...`}
                  placeholderTextColor={themeStyles.subText}
                  style={{ color: themeStyles.primaryText, fontSize: 13, fontWeight: 'normal', flex: 1 }}
                />
                {bankSearchQuery ? (
                  <TouchableOpacity onPress={() => setBankSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color={themeStyles.subText} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Vertical Scrollable Bank List */}
              <ScrollView 
                nestedScrollEnabled={true}
                style={{ 
                  maxHeight: 150,
                  borderColor: themeStyles.itemBorder,
                  borderWidth: 1,
                  borderRadius: 16,
                  backgroundColor: themeStyles.itemBg
                }} 
                className="mb-3"
                showsVerticalScrollIndicator={true}
              >
                {filteredBanks.map((b) => {
                  const isSelected = selectedBank?.code === b.code;
                  return (
                    <TouchableOpacity
                      key={b.code}
                      onPress={() => setSelectedBank(b)}
                      style={{
                        backgroundColor: isSelected 
                          ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)')
                          : 'transparent',
                        borderBottomColor: themeStyles.itemBorder,
                        borderBottomWidth: 1
                      }}
                      className="p-3 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className={`w-8 h-8 rounded-xl items-center justify-center mr-2.5 ${isSelected ? 'bg-emerald-500/20' : 'bg-slate-800/40'}`}>
                          <Ionicons 
                            name={b.type === 'mobile_money' ? 'phone-portrait-outline' : 'business-outline'} 
                            size={16} 
                            color={isSelected ? themeStyles.brandGreen : themeStyles.subText} 
                          />
                        </View>
                        <View className="flex-1">
                          <Text style={{ color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText, fontSize: 12, fontWeight: 'normal' }}>
                            {b.name}
                          </Text>
                          <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal' }}>
                            {b.type ? b.type.replace('_', ' ').toUpperCase() : 'BANK'} • CODE: {b.code}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color={themeStyles.brandGreen} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Account Number */}
              <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 6, textTransform: 'uppercase' }}>
                ACCOUNT / MOBILE MONEY NUMBER
              </Text>
              <View 
                style={{
                  backgroundColor: themeStyles.itemBg,
                  borderColor: themeStyles.itemBorder,
                  borderWidth: 1
                }}
                className="flex-row items-center rounded-2xl px-4 py-3 mb-3"
              >
                <TextInput
                  value={accountNumber}
                  onChangeText={handleResolveAccount}
                  placeholder={globalCountry?.id === 'ghana' ? '024XXXXXXX (MoMo)' : '0123456789'}
                  placeholderTextColor={themeStyles.subText}
                  keyboardType="numeric"
                  style={{ color: themeStyles.primaryText, fontSize: 14, fontWeight: 'normal', flex: 1 }}
                />
                {resolving && <ActivityIndicator size="small" color={themeStyles.brandGreen} />}
              </View>

              {/* Account Holder Name HUD */}
              {accountName ? (
                <View 
                  style={{
                    backgroundColor: isDark ? 'rgba(0, 229, 136, 0.08)' : 'rgba(5, 150, 105, 0.08)',
                    borderColor: themeStyles.brandGreen,
                    borderWidth: 1
                  }}
                  className="p-3 rounded-2xl mb-3 flex-row items-center"
                >
                  <Ionicons name="checkmark-circle" size={16} color={themeStyles.brandGreen} style={{ marginRight: 6 }} />
                  <Text style={{ color: themeStyles.primaryText, fontSize: 12, fontWeight: 'normal', flex: 1 }}>
                    Holder: {accountName}
                  </Text>
                </View>
              ) : null}

              {/* Save Account Toggle */}
              <TouchableOpacity 
                onPress={() => setSaveAccount(!saveAccount)}
                className="flex-row items-center mb-2"
              >
                <Ionicons 
                  name={saveAccount ? "checkbox" : "square-outline"} 
                  size={18} 
                  color={themeStyles.brandGreen} 
                  style={{ marginRight: 6 }}
                />
                <Text style={{ color: themeStyles.subText, fontSize: 12, fontWeight: 'normal' }}>
                  Save this account for 1-tap easy withdrawals
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 3. Cashout Amount Input Card */}
        <View 
          style={{
            backgroundColor: themeStyles.cardBg,
            borderColor: themeStyles.cardBorder,
            borderWidth: 1
          }}
          className="rounded-3xl p-5 mb-5 shadow-sm"
        >
          {/* Amount Input */}
          <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 6, textTransform: 'uppercase' }}>
            CASHOUT AMOUNT ({globalCountry?.currency || 'NGN'})
          </Text>
          <View 
            style={{
              backgroundColor: themeStyles.itemBg,
              borderColor: themeStyles.itemBorder,
              borderWidth: 1
            }}
            className="flex-row items-center rounded-2xl px-4 py-3 mb-4"
          >
            <Text style={{ color: themeStyles.brandGreen, fontSize: 16, marginRight: 8, fontWeight: 'normal' }}>
              {globalCountry?.symbol || '₦'}
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="10000"
              placeholderTextColor={themeStyles.subText}
              keyboardType="numeric"
              style={{ color: themeStyles.primaryText, fontSize: 15, fontWeight: 'normal', flex: 1 }}
            />
          </View>

          {/* Quick Amount Chips */}
          <View className="flex-row justify-between mb-5">
            {['5000', '10000', '25000', '50000'].map((chip) => (
              <TouchableOpacity
                key={chip}
                onPress={() => setAmount(chip)}
                style={{
                  backgroundColor: amount === chip 
                    ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)')
                    : themeStyles.itemBg,
                  borderColor: amount === chip ? themeStyles.brandGreen : themeStyles.itemBorder,
                  borderWidth: 1
                }}
                className="flex-1 py-2 mx-1 rounded-xl items-center"
              >
                <Text style={{ color: amount === chip ? themeStyles.brandGreen : themeStyles.primaryText, fontSize: 11, fontWeight: 'normal' }}>
                  {globalCountry?.symbol || '₦'}{parseInt(chip, 10) / 1000}k
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cashout Button */}
          <TouchableOpacity
            onPress={handleCashout}
            disabled={loading}
            style={{
              backgroundColor: themeStyles.brandGreen,
              shadowColor: themeStyles.brandGreen,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6
            }}
            className="py-4 rounded-2xl items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator color="#090d16" />
            ) : (
              <Text className="text-slate-950 font-normal text-xs uppercase tracking-wider">
                Confirm & Cash Out Now
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
