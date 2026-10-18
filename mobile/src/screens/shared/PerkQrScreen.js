import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';

export default function PerkQrScreen({ navigation }) {
 const [perks, setPerks] = useState([]);
 const [selectedPerk, setSelectedPerk] = useState(null);
 const [qrToken, setQrToken] = useState(null);
 const [loading, setLoading] = useState(false);

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
 <ScrollView className="flex-1 px-4 py-6">
 <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4 flex-row items-center">
 <Ionicons name="arrow-back" size={24} color="#1cd188" />
 <Text className="text-brandMint font-bold ml-2">Back</Text>
 </TouchableOpacity>

 <Text className="text-slate-900 dark:text-white text-2xl font-black mb-1 uppercase">⛽ OgaDriver Perk QR</Text>
 <Text className="text-slate-500 dark:text-slate-400 text-xs mb-6 font-mono">5% - 15% Fuel & Servicing Discount QR Card</Text>

 {qrToken ? (
 <View className="bg-slate-50 dark:bg-slate-900 border border-brandMint p-6 rounded-2xl items-center">
 <Text className="text-slate-900 dark:text-white text-lg font-black mb-1">{selectedPerk?.partner_name}</Text>
 <Text className="text-brandMint font-mono text-xs mb-6">{selectedPerk?.title}</Text>

 <View className="bg-white p-6 rounded-2xl mb-6 items-center justify-center border-4 border-brandMint">
 <Ionicons name="qr-code" size={160} color="#020617" />
 </View>

 <Text className="text-slate-600 dark:text-slate-300 font-mono text-xs bg-slate-950 px-4 py-2 rounded-xl mb-4">
 Token: <Text className="text-brandMint font-bold">{qrToken}</Text>
 </Text>

 <Text className="text-slate-500 dark:text-slate-400 text-[11px] text-center mb-4">Show this QR code at partner cashier to claim your instant discount.</Text>

 <TouchableOpacity onPress={() => setQrToken(null)}>
 <Text className="text-brandMint font-bold text-xs">← Back to All Perks</Text>
 </TouchableOpacity>
 </View>
 ) : (
 <View className="space-y-3">
 {perks.map(p => (
 <View key={p.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl mb-3 flex-row justify-between items-center">
 <View className="flex-1 mr-3">
 <Text className="text-slate-900 dark:text-white font-bold text-sm">{p.partner_name}</Text>
 <Text className="text-brandMint text-xs font-mono font-bold mt-0.5">-{p.discount_percentage}% OFF</Text>
 <Text className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">{p.description}</Text>
 </View>
 <TouchableOpacity
 onPress={() => handleGenerateQr(p)}
 className="bg-brandMint px-3 py-2 rounded-xl"
 >
 <Text className="text-corporateNavy font-black text-xs uppercase">Show QR</Text>
 </TouchableOpacity>
 </View>
 ))}
 </View>
 )}
 </ScrollView>
 </SafeAreaView>
 );
}
