import React, { useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function PlacementPaymentScreen({ route, navigation }) {
  const { paymentUrl } = route.params || {};
  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    if (!url) return;

    if (url.includes('payment/success') || url.includes('payment-callback?status=success')) {
      navigation.navigate('HirerDashboard', { paymentSuccess: true });
    } else if (url.includes('payment/cancel')) {
      navigation.navigate('HirerDashboard', { paymentSuccess: false });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-corporateNavy">
      <View className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex-row items-center bg-slate-900">
        <Text className="text-white font-normal text-base">Secure Payment</Text>
      </View>
      {loading && (
        <View className="absolute inset-0 justify-center items-center z-10 bg-white dark:bg-corporateNavy mt-12">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      )}
      <WebView
        source={{ uri: paymentUrl }}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        className="flex-1"
      />
    </SafeAreaView>
  );
}
