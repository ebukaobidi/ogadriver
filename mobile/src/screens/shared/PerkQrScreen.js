import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';

export default function PerkQrScreen({ navigation }) {
  const [perks, setPerks] = useState([]);
  const [selectedPerk, setSelectedPerk] = useState(null);
  const [qrToken, setQrToken] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const onBack = () => {
      if (qrToken) {
        setQrToken(null);
        setSelectedPerk(null);
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
  }, [qrToken, navigation]);


  useEffect(() => {
    api.get('/drivers/perks')
      .then(res => {
        if (res.data?.success) setPerks(res.data.data);
      })
      .catch(e => console.log('Perk error:', e));
  }, []);

  const handleGenerateQr = async (perk) => {
    setSelectedPerk(perk);
    setLoading(true);
    try {
      const res = await api.post('/drivers/perks/qr', { perk_id: perk.id });
      if (res.data?.success) {
        setQrToken(res.data.data.qr_token);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not generate perk QR code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-4 py-3.5 border-b border-slate-800 bg-slate-900/60 flex-row items-center">
        {navigation?.canGoBack && navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            className="mr-3 p-1 rounded-xl"
          >
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
          </TouchableOpacity>
        )}
        <Text className="text-white text-lg font-normal">Perks & Fuel Discount</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {qrToken ? (
          <View className="bg-slate-50 dark:bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl items-center">
            <Text className="text-slate-900 dark:text-white text-lg font-normal mb-1">{selectedPerk?.partner_name}</Text>
            <Text className="text-emerald-500 font-normal text-xs mb-6">{selectedPerk?.title}</Text>

            <View className="bg-white p-6 rounded-2xl mb-6 items-center justify-center border-4 border-emerald-500">
              <Ionicons name="qr-code" size={160} color="#020617" />
            </View>

            <Text className="text-slate-600 dark:text-slate-300 font-mono text-xs bg-slate-950 px-4 py-2 rounded-xl mb-4">
              Token: <Text className="text-emerald-500 font-bold">{qrToken}</Text>
            </Text>

            <TouchableOpacity onPress={() => setQrToken(null)} className="py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <Text className="text-emerald-500 font-normal text-xs">Back to All Perks</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-3">
            {perks.map(p => (
              <View key={p.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl mb-3 flex-row justify-between items-center">
                <View className="flex-1 mr-3">
                  <Text className="text-slate-900 dark:text-white font-normal text-sm">{p.partner_name}</Text>
                  <Text className="text-emerald-500 text-xs font-normal mt-0.5">-{p.discount_percentage}% OFF</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleGenerateQr(p)}
                  className="bg-emerald-500 px-3 py-2 rounded-xl"
                >
                  <Text className="text-white font-normal text-xs uppercase">Show QR</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
