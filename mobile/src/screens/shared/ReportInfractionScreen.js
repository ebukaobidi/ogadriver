import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';

export default function ReportInfractionScreen({ route, navigation }) {
 const { driverId, driverName } = route.params;
 const [type, setType] = useState('behavioral'); // behavioral, damage, traffic
 const [description, setDescription] = useState('');
 const [loading, setLoading] = useState(false);

 const submitInfraction = async () => {
 if (!description.trim()) {
 Alert.alert('Error', 'Please provide a detailed description.');
 return;
 }

 try {
 setLoading(true);
 await api.post('/hirer/infractions', {
 driver_id: driverId,
 type,
 description
 });
 Alert.alert('Report Logged', 'The incident has been recorded and will affect the driver\'s internal score.', [
 { text: 'OK', onPress: () => navigation.goBack() }
 ]);
 } catch (error) {
 console.error(error);
 Alert.alert('Error', 'Could not log the incident. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <SafeAreaView className="flex-1 bg-white dark:bg-corporateNavy">
 <View className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex-row items-center">
   <TouchableOpacity 
     onPress={() => (navigation?.canGoBack && navigation.canGoBack()) ? navigation.goBack() : navigation.navigate('Home')}
     className="p-2 mr-3 rounded-full bg-slate-100 dark:bg-slate-800"
   >
     <Ionicons name="arrow-back" size={20} color="#1cd188" />
   </TouchableOpacity>
   <View>
     <Text className="text-xl font-bold text-slate-900 dark:text-white">Log Incident</Text>
     <Text className="text-slate-500 dark:text-slate-400 text-xs">Reporting {driverName}</Text>
   </View>
 </View>
 <ScrollView className="p-6">

 <Text className="text-brandMint font-mono text-xs uppercase mb-2">Incident Type</Text>
 <View className="flex-row mb-6 justify-between">
 {['behavioral', 'damage', 'traffic'].map(t => (
 <TouchableOpacity 
 key={t}
 onPress={() => setType(t)}
 className={`flex-1 py-3 items-center rounded-lg mx-1 border ${type === t ? 'bg-brandMint/20 border-brandMint' : 'bg-slate-900 border-slate-700'}`}
 >
 <Text className={type === t ? 'text-brandMint font-bold capitalize' : 'text-slate-400 capitalize'}>{t}</Text>
 </TouchableOpacity>
 ))}
 </View>

 <Text className="text-brandMint font-mono text-xs uppercase mb-2">Detailed Description</Text>
 <TextInput
 className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white min-h-[120px] mb-8 text-base"
 multiline
 textAlignVertical="top"
 placeholder="Describe what happened..."
 placeholderTextColor="#475569"
 value={description}
 onChangeText={setDescription}
 />

 <TouchableOpacity
 className="bg-red-600 py-4 rounded-xl items-center"
 onPress={submitInfraction}
 disabled={loading}
 >
 {loading ? (
 <ActivityIndicator color="#fff" />
 ) : (
 <Text className="text-slate-900 dark:text-white font-black uppercase tracking-widest">Submit Report</Text>
 )}
 </TouchableOpacity>
 </ScrollView>
 </SafeAreaView>
 );
}
