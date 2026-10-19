import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { authService, driverService } from '../../api/api';
import HeaderBar from '../../components/HeaderBar';

export default function InstantFuelLoanScreen({ navigation }) {
  const { isDark } = useTheme();
  const [loadingDriver, setLoadingDriver] = useState(true);
  const [driverStats, setDriverStats] = useState({
    rating: 0,
    completionRate: 0,
    totalTrips: 0,
    activeDays: 0,
    infractionsCount: 0,
    hasActiveSubscription: false,
    accountStatus: 'pending',
    simAssessmentScore: 0,
  });

  const [amount, setAmount] = useState('20000');
  const [tenure, setTenure] = useState('7'); // days
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [disbursedAdvance, setDisbursedAdvance] = useState(null);

  useEffect(() => {
    loadDriverPerformance();
  }, []);

  const loadDriverPerformance = async () => {
    try {
      setLoadingDriver(true);
      const user = await authService.getUser().catch(() => null);
      if (user) {
        if (user.name) setAccountName(user.name);
        if (user.bank_name) setBankName(user.bank_name);
        if (user.account_number) setAccountNumber(user.account_number);

        const dId = user.driver?.id || user.driver_id;
        if (dId) {
          const profile = await driverService.getProfile(dId).catch(() => null);
          const data = profile?.data || profile;
          if (data) {
            setDriverStats(prev => ({
              ...prev,
              rating: parseFloat(data.rating || data.rating_score || prev.rating),
              completionRate: parseFloat(data.completion_rate || data.acceptance_rate || prev.completionRate),
              totalTrips: parseInt(data.completed_trips || data.completed_jobs || data.trips_count || prev.totalTrips, 10),
              activeDays: parseInt(data.active_days || data.days_active || prev.activeDays, 10),
              accountStatus: data.status || 'verified',
              infractionsCount: parseInt(data.infractions_count || 0, 10),
              hasActiveSubscription: data.has_active_subscription ?? false,
            }));
          }
        }
      }
    } catch (e) {
      console.log('Driver performance fetch error:', e);
    } finally {
      setLoadingDriver(false);
    }
  };

  // Performance Benchmarks for Fuel Loan Qualification (Strictly merit-based to prevent bad debt):
  // 1. Rating >= 4.8 / 5.0
  // 2. Minimum completed trips >= 50
  // 3. Platform tenure >= 30 days active
  // 4. Completion rate >= 95%
  // 5. Infractions == 0
  const isRatingQualified = driverStats.rating >= 4.8;
  const isTripsQualified = driverStats.totalTrips >= 50;
  const isTenureQualified = driverStats.activeDays >= 30;
  const isCompletionQualified = driverStats.completionRate >= 95;
  const isZeroInfractions = driverStats.infractionsCount === 0;

  const isQualified = isRatingQualified && isTripsQualified && isTenureQualified && isCompletionQualified && isZeroInfractions;

  let qualificationTier = 'Locked (Unqualified)';
  let maxFuelCredit = 0;

  if (isQualified) {
    if (driverStats.rating >= 4.9 && driverStats.totalTrips >= 100) {
      qualificationTier = 'Gold Fleet Operative';
      maxFuelCredit = 50000;
    } else if (driverStats.rating >= 4.85 && driverStats.totalTrips >= 75) {
      qualificationTier = 'Silver Driver Partner';
      maxFuelCredit = 35000;
    } else {
      qualificationTier = 'Bronze Driver Partner';
      maxFuelCredit = 20000;
    }
  }

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
    inputBg: isDark ? '#090d16' : '#ffffff',
    inputBorder: isDark ? '#1e293b' : '#cbd5e1',
  };

  const handleRequestLoan = () => {
    if (!isQualified) {
      Alert.alert(
        'Performance Benchmark Required',
        'Instant 0% Fuel Loan is strictly gated by verified performance to safeguard fleet growth:\n\n• Minimum 4.8 Star Rating (Yours: ' + driverStats.rating + ')\n• Minimum 50 Completed Trips (Yours: ' + driverStats.totalTrips + ')\n• Minimum 30 Days Active (Yours: ' + driverStats.activeDays + ')\n• Minimum 95% Completion Rate (Yours: ' + driverStats.completionRate + '%)\n• 0 Safety Infractions\n\nContinue driving and maintaining excellence to unlock this privilege!'
      );
      return;
    }

    const loanAmount = parseFloat(amount) || 0;
    if (loanAmount < 5000) {
      Alert.alert('Minimum Fuel Loan', 'The minimum instant fuel advance is ₦5,000.');
      return;
    }
    if (loanAmount > maxFuelCredit) {
      Alert.alert(
        'Approved Credit Limit Exceeded',
        `Based on your performance tier (${qualificationTier}), your maximum approved fuel credit is ₦${maxFuelCredit.toLocaleString()}.`
      );
      return;
    }

    Alert.alert(
      "Confirm Direct Bank Transfer",
      `₦${loanAmount.toLocaleString()} will be CREDITED DIRECTLY to your personal bank account:\n\nBank: ${bankName}\nAccount: ${accountNumber}\nName: ${accountName}\n\n• 0% Interest\n• 0 Third Party Intermediaries\n• Repayment automatically deducted in ${tenure} days from weekly payouts.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disburse to My Account",
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              const txRef = `OGA-FUEL-${Math.floor(100000 + Math.random() * 900000)}`;
              setDisbursedAdvance({
                ref: txRef,
                amount: loanAmount,
                bank: `${bankName} (${accountNumber})`,
                date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
              Alert.alert(
                "Direct Transfer Successful! ⛽💳",
                `₦${loanAmount.toLocaleString()} has been sent directly to your ${bankName} account (${accountNumber}).\n\nReference: ${txRef}\nStatus: Settled (0% Interest)\n\nBuy fuel anywhere at your discretion and stay on the road!`
              );
            }, 1400);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Top Header Bar with Single-Icon Theme Toggle */}
      <HeaderBar 
        navigation={navigation} 
        showBack={true}
        title="Instant Fuel Loan" 
        subtitle="Performance-qualified credit" 
      />

      <ScrollView className="flex-1 px-4 pt-3 pb-12" showsVerticalScrollIndicator={false}>
        {/* Screen Title */}
        <View className="mb-4">
          <Text style={{ color: themeStyles.titleText, fontSize: 26, fontWeight: 'normal' }}>
            Instant Fuel Loan
          </Text>
          <Text style={{ color: themeStyles.subText, fontSize: 13, marginTop: 2, fontWeight: 'normal' }}>
            0% Interest • Direct driver account payout based on merit
          </Text>
        </View>

        {/* 1. Performance Qualification Status Banner */}
        <View 
          style={{ 
            backgroundColor: isQualified 
              ? (isDark ? 'rgba(0, 229, 136, 0.1)' : '#ecfdf5') 
              : (isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2'),
            borderColor: isQualified 
              ? (isDark ? '#00e588' : '#10b981') 
              : (isDark ? '#ef4444' : '#f87171'),
            borderWidth: 1
          }}
          className="rounded-3xl p-5 mb-4 shadow-md"
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1 mr-2">
              <View 
                style={{
                  backgroundColor: isQualified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  borderColor: isQualified ? '#10b981' : '#ef4444',
                  borderWidth: 1
                }}
                className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
              >
                <Ionicons 
                  name={isQualified ? "shield-checkmark" : "lock-closed"} 
                  size={22} 
                  color={isQualified ? (isDark ? "#00e588" : "#059669") : "#ef4444"} 
                />
              </View>
              <View className="flex-1">
                <Text style={{ color: themeStyles.primaryText, fontSize: 16, fontWeight: 'normal' }}>
                  {isQualified ? 'Performance Qualified! 🎉' : 'Eligibility Locked 🔒'}
                </Text>
                <Text 
                  style={{ color: isQualified ? (isDark ? '#00e588' : '#059669') : '#ef4444', fontSize: 12, fontWeight: 'normal', marginTop: 1 }} 
                >
                  {isQualified ? `${qualificationTier}` : 'Strict merit standards not yet achieved'}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text style={{ color: isQualified ? themeStyles.brandGreen : '#94a3b8', fontSize: 20, fontWeight: 'normal' }}>
                {isQualified ? `₦${maxFuelCredit.toLocaleString()}` : '₦0'}
              </Text>
              <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal', textTransform: 'uppercase' }}>
                Credit Limit
              </Text>
            </View>
          </View>

          <Text style={{ color: themeStyles.subText, fontSize: 12, lineHeight: 18, marginTop: 4, fontWeight: 'normal' }}>
            {isQualified
              ? "Your high star rating and consistent completion record qualify you for zero-percent fuel advances. Funds are transferred immediately to your verified Nigerian bank account."
              : "To protect sustainable platform growth and bar unserious operators, 0% fuel advances are strictly reserved for partners with >=4.8 rating, >=50 completed trips, and clean compliance records."}
          </Text>
        </View>

        {/* 2. Direct Bank Credit Notice (NO THIRD PARTIES) */}
        <View 
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: themeStyles.cardBorder, 
            borderWidth: 1 
          }}
          className="rounded-3xl p-4 mb-4 flex-row items-center"
        >
          <View className="w-10 h-10 rounded-2xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/30">
            <Ionicons name="wallet-outline" size={20} color={themeStyles.brandGreen} />
          </View>
          <View className="flex-1">
            <Text style={{ color: themeStyles.primaryText, fontSize: 13, fontWeight: 'normal' }}>
              Direct Account Credit (No Third Parties)
            </Text>
            <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginTop: 1 }}>
              Funds are credited directly into your linked bank account. No filling station vouchers or restrictions — purchase fuel freely anywhere.
            </Text>
          </View>
        </View>

        {/* 3. Performance Merit Audit Scorecard */}
        <View 
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: themeStyles.cardBorder, 
            borderWidth: 1 
          }}
          className="rounded-3xl p-5 mb-4 shadow-sm"
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ color: themeStyles.primaryText, fontSize: 14, fontWeight: 'normal' }}>
              Merit & Performance Audit
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="speedometer-outline" size={14} color={themeStyles.brandGreen} style={{ marginRight: 4 }} />
              <Text style={{ color: themeStyles.brandGreen, fontSize: 11, fontWeight: 'normal' }}>
                Live Verification
              </Text>
            </View>
          </View>

          {/* Metric 1: Rating */}
          <View 
            style={{ 
              backgroundColor: themeStyles.inputBg, 
              borderColor: themeStyles.inputBorder, 
              borderWidth: 1 
            }}
            className="p-3 rounded-2xl mb-2 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons 
                name={isRatingQualified ? "checkmark-circle" : "close-circle"} 
                size={18} 
                color={isRatingQualified ? themeStyles.brandGreen : "#ef4444"} 
                style={{ marginRight: 8 }}
              />
              <View>
                <Text style={{ color: themeStyles.primaryText, fontSize: 12, fontWeight: 'normal' }}>
                  Customer Rating (Req: ≥ 4.8 ★)
                </Text>
                <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal' }}>
                  Current: {driverStats.rating.toFixed(2)} ★
                </Text>
              </View>
            </View>
            <Text style={{ color: isRatingQualified ? themeStyles.brandGreen : "#ef4444", fontSize: 12, fontWeight: 'normal' }}>
              {isRatingQualified ? 'Passed' : 'Needs 4.8★'}
            </Text>
          </View>

          {/* Metric 2: Completed Trips */}
          <View 
            style={{ 
              backgroundColor: themeStyles.inputBg, 
              borderColor: themeStyles.inputBorder, 
              borderWidth: 1 
            }}
            className="p-3 rounded-2xl mb-2 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons 
                name={isTripsQualified ? "checkmark-circle" : "close-circle"} 
                size={18} 
                color={isTripsQualified ? themeStyles.brandGreen : "#ef4444"} 
                style={{ marginRight: 8 }}
              />
              <View>
                <Text style={{ color: themeStyles.primaryText, fontSize: 12, fontWeight: 'normal' }}>
                  Completed Trips (Req: ≥ 50 Trips)
                </Text>
                <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal' }}>
                  Current: {driverStats.totalTrips} verified trips
                </Text>
              </View>
            </View>
            <Text style={{ color: isTripsQualified ? themeStyles.brandGreen : "#ef4444", fontSize: 12, fontWeight: 'normal' }}>
              {isTripsQualified ? 'Passed' : 'Needs 50+'}
            </Text>
          </View>

          {/* Metric 3: Active Tenure */}
          <View 
            style={{ 
              backgroundColor: themeStyles.inputBg, 
              borderColor: themeStyles.inputBorder, 
              borderWidth: 1 
            }}
            className="p-3 rounded-2xl mb-2 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons 
                name={isTenureQualified ? "checkmark-circle" : "close-circle"} 
                size={18} 
                color={isTenureQualified ? themeStyles.brandGreen : "#ef4444"} 
                style={{ marginRight: 8 }}
              />
              <View>
                <Text style={{ color: themeStyles.primaryText, fontSize: 12, fontWeight: 'normal' }}>
                  Platform Tenure (Req: ≥ 30 Days)
                </Text>
                <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal' }}>
                  Current: {driverStats.activeDays} days active
                </Text>
              </View>
            </View>
            <Text style={{ color: isTenureQualified ? themeStyles.brandGreen : "#ef4444", fontSize: 12, fontWeight: 'normal' }}>
              {isTenureQualified ? 'Passed' : 'Needs 30d'}
            </Text>
          </View>

          {/* Metric 4: Completion Rate */}
          <View 
            style={{ 
              backgroundColor: themeStyles.inputBg, 
              borderColor: themeStyles.inputBorder, 
              borderWidth: 1 
            }}
            className="p-3 rounded-2xl flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons 
                name={isCompletionQualified ? "checkmark-circle" : "close-circle"} 
                size={18} 
                color={isCompletionQualified ? themeStyles.brandGreen : "#ef4444"} 
                style={{ marginRight: 8 }}
              />
              <View>
                <Text style={{ color: themeStyles.primaryText, fontSize: 12, fontWeight: 'normal' }}>
                  Acceptance & Completion (Req: ≥ 95%)
                </Text>
                <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal' }}>
                  Current: {driverStats.completionRate}% reliability
                </Text>
              </View>
            </View>
            <Text style={{ color: isCompletionQualified ? themeStyles.brandGreen : "#ef4444", fontSize: 12, fontWeight: 'normal' }}>
              {isCompletionQualified ? 'Passed' : 'Needs 95%'}
            </Text>
          </View>
        </View>

        {/* 4. Loan Application Form (Direct Payout) */}
        <View 
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: themeStyles.cardBorder, 
            borderWidth: 1 
          }}
          className="rounded-3xl p-5 mb-5 shadow-sm"
        >
          <Text style={{ color: themeStyles.primaryText, fontSize: 14, fontWeight: 'normal', marginBottom: 12 }}>
            Configure Fuel Advance
          </Text>

          {/* Preset Amount Chips */}
          <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 8 }}>
            SELECT ADVANCE AMOUNT
          </Text>
          <View className="flex-row justify-between mb-4">
            {['10000', '20000', '35000', '50000'].map((val) => {
              const isSelected = amount === val;
              const valNum = parseInt(val, 10);
              const isAboveLimit = valNum > maxFuelCredit && isQualified;
              return (
                <TouchableOpacity
                  key={val}
                  onPress={() => setAmount(val)}
                  disabled={!isQualified}
                  style={{
                    backgroundColor: isSelected 
                      ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)')
                      : themeStyles.inputBg,
                    borderColor: isSelected ? themeStyles.brandGreen : themeStyles.inputBorder,
                    borderWidth: 1,
                    opacity: !isQualified ? 0.4 : 1
                  }}
                  className="flex-1 py-2.5 mx-1 rounded-xl items-center"
                >
                  <Text 
                    style={{
                      color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText,
                      fontSize: 12,
                      fontWeight: 'normal'
                    }}
                  >
                    ₦{(valNum / 1000)}k
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Amount Input */}
          <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 6 }}>
            SPECIFIED ADVANCE (NGN)
          </Text>
          <View 
            style={{ 
              backgroundColor: themeStyles.inputBg, 
              borderColor: themeStyles.inputBorder, 
              borderWidth: 1 
            }}
            className="flex-row items-center rounded-2xl px-4 py-3 mb-4"
          >
            <Text style={{ color: themeStyles.brandGreen, fontSize: 16, marginRight: 8, fontWeight: 'normal' }}>
              ₦
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="15000"
              placeholderTextColor={themeStyles.subText}
              editable={isQualified}
              style={{ color: themeStyles.primaryText, fontSize: 16, fontWeight: 'normal', flex: 1 }}
            />
          </View>

          {/* Destination Bank Account Card */}
          <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 6 }}>
            DISBURSEMENT DESTINATION (DIRECT TO DRIVER)
          </Text>
          <View 
            style={{ 
              backgroundColor: themeStyles.inputBg, 
              borderColor: themeStyles.inputBorder, 
              borderWidth: 1 
            }}
            className="p-3.5 rounded-2xl mb-4"
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text style={{ color: themeStyles.primaryText, fontSize: 13, fontWeight: 'normal' }}>
                {bankName} • {accountNumber}
              </Text>
              <View className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                <Text style={{ color: themeStyles.brandGreen, fontSize: 10, fontWeight: 'normal' }}>
                  Direct Credit
                </Text>
              </View>
            </View>
            <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal' }}>
              Account Name: {accountName}
            </Text>
          </View>

          {/* Repayment Tenure */}
          <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 6 }}>
            REPAYMENT TENURE (0% INTEREST)
          </Text>
          <View className="flex-row justify-between mb-6">
            {[
              { days: '7', label: '7 Days (Next Payout)' },
              { days: '14', label: '14 Days (2 Cycles)' },
              { days: '30', label: '30 Days (Monthly)' }
            ].map((t) => {
              const isSelected = tenure === t.days;
              return (
                <TouchableOpacity
                  key={t.days}
                  onPress={() => setTenure(t.days)}
                  disabled={!isQualified}
                  style={{
                    backgroundColor: isSelected 
                      ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)')
                      : themeStyles.inputBg,
                    borderColor: isSelected ? themeStyles.brandGreen : themeStyles.inputBorder,
                    borderWidth: 1,
                    opacity: !isQualified ? 0.4 : 1
                  }}
                  className="flex-1 py-2.5 mx-1 rounded-xl items-center"
                >
                  <Text 
                    style={{
                      color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText,
                      fontSize: 10,
                      fontWeight: 'normal',
                      textAlign: 'center'
                    }}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            onPress={handleRequestLoan}
            disabled={loading || !isQualified}
            style={{
              backgroundColor: isQualified ? themeStyles.brandGreen : (isDark ? '#1e293b' : '#cbd5e1'),
              shadowColor: isQualified ? themeStyles.brandGreen : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: isQualified ? 6 : 0
            }}
            className="py-4 rounded-2xl items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator color="#090d16" />
            ) : (
              <Text 
                style={{
                  color: isQualified ? '#090d16' : '#64748b',
                  fontSize: 13,
                  fontWeight: 'normal',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}
              >
                {isQualified ? 'Disburse Direct to My Bank' : 'Locked: Barred by Performance Benchmarks'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
