import React, { useState, useEffect } from 'react';
import { Linking, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { jobService } from '../../api/api';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import VipNdaModal from '../../components/VipNdaModal';
import DeadManSwitchModal from '../../components/DeadManSwitchModal';
import OfflineMeshService from '../../services/OfflineMeshService';


  const handleNavigate = (lat, lng) => {
    if (lat && lng) {
      Linking.openURL(`google.navigation:q=${lat},${lng}`);
    } else {
      Alert.alert('Error', 'Location coordinates are not available.');
    }
  };

export default function JobDetailsScreen({ route, navigation }) {
 const { jobId } = route.params;
 const [job, setJob] = useState(null);
 const [loading, setLoading] = useState(true);
 const [applying, setApplying] = useState(false);
 const [showNdaModal, setShowNdaModal] = useState(false);
 const [showSecurityHalt, setShowSecurityHalt] = useState(false);
 
 // Route Data for Live Map
 const [routeCoordinates, setRouteCoordinates] = useState([]);
 const [routeStats, setRouteStats] = useState(null);

 useEffect(() => {
 loadJobDetails();
 }, [jobId]);

 useEffect(() => {
    // Start Offline Mesh Monitoring when viewing an active job
    if (job?.status === 'active' || job?.status === 'in_progress') {
        OfflineMeshService.startMonitoring(job.id);
    }
    return () => OfflineMeshService.stopMonitoring();
 }, [job?.status]);

 const loadJobDetails = async () => {
 try {
 setLoading(true);
 const response = await jobService.getJob(jobId);
 setJob(response.data);
 
 if (response.data.stealth_mode && !response.data.nda_signed_at) {
 setShowNdaModal(true);
 }
 
 // Fetch Live Route from OSRM
 if (response.data.pickup_latitude && response.data.dropoff_latitude) {
 try {
 const osrmResponse = await axios.get(
 `https://router.project-osrm.org/route/v1/driving/${response.data.pickup_longitude},${response.data.pickup_latitude};${response.data.dropoff_longitude},${response.data.dropoff_latitude}?overview=full&geometries=geojson`
 );
 if (osrmResponse.data.routes && osrmResponse.data.routes[0]) {
 const route = osrmResponse.data.routes[0];
 const coords = route.geometry.coordinates.map(c => ({ latitude: c[1], longitude: c[0] }));
 setRouteCoordinates(coords);
 setRouteStats({
 distance: (route.distance / 1000).toFixed(1),
 duration: Math.ceil(route.duration / 60)
 });
 }
 } catch (e) {
 console.error("OSRM Map Error:", e);
 }
 }
 } catch (error) {
 console.error('Error loading job details:', error);
 Alert.alert('Error', 'Failed to load job details');
 navigation.goBack();
 } finally {
 setLoading(false);
 }
 };

 const handleApply = async () => {
 try {
 setApplying(true);
    await jobService.applyForJob(jobId, {
        proposed_amount: job.amount,
        cover_letter: '',
    });
 Alert.alert('Success', 'Application submitted successfully', [
 { text: 'OK', onPress: () => navigation.goBack() }
 ]);
 } catch (error) {
 Alert.alert('Error', 'Failed to apply for job');
 } finally {
 setApplying(false);
 }
 };

 if (loading) {
 return (
 <SafeAreaView className="flex-1 bg-white dark:bg-corporateNavy items-center justify-center">
 <ActivityIndicator color="#22d3ee" size="large" />
 </SafeAreaView>
 );
 }

 if (!job) return null;

 return (
 <SafeAreaView className="flex-1 bg-white dark:bg-corporateNavy">
 <VipNdaModal 
 visible={showNdaModal}
 jobId={job.id}
 onSigned={() => {
 setShowNdaModal(false);
 loadJobDetails();
 }}
 onCancel={() => {
 setShowNdaModal(false);
 navigation.goBack();
 }}
 />

 <DeadManSwitchModal 
    visible={showSecurityHalt} 
    jobId={job.id} 
    onVerified={() => setShowSecurityHalt(false)} 
 />
 <View className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-row items-center">
 <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
 <Ionicons name="arrow-back" size={24} color="#22d3ee" />
 </TouchableOpacity>
 <View>
 <Text className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Job Details</Text>
 <Text className="text-brandMint font-mono text-[10px]">Job Information</Text>
 </View>
 </View>

 <ScrollView className="flex-1 px-6 pt-6">


 <View className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
 <View className="flex-row justify-between items-start mb-4">
 <View className="flex-1">
 <Text className="text-slate-900 dark:text-white text-2xl font-black uppercase tracking-tight">{job.title}</Text>
 <Text className="text-brandMint font-mono text-xs mt-1">Ref: #JOB-{job.id}</Text>
 </View>
 <View className="bg-brandMint px-4 py-2 rounded-xl">
 <Text className="text-corporateNavy font-black text-lg">₦{job.amount?.toLocaleString()}</Text>
 </View>
 </View>

 <View className="space-y-4 mb-6">
 <View className="flex-row items-start">
 <Ionicons name="location" size={18} color="#64748b" />
 <View className="ml-3">
 <Text className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Pickup</Text>
 <Text className="text-slate-900 dark:text-white font-bold">{job.stealth_mode && !job.nda_signed_at ? 'HIDDEN (Private Route)' : job.pickup_location}</Text>
 </View>
 </View>
 <View className="flex-row items-start">
 <Ionicons name="flag" size={18} color="#64748b" />
 <View className="ml-3">
 <Text className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Dropoff</Text>
 <Text className="text-slate-900 dark:text-white font-bold">{job.stealth_mode && !job.nda_signed_at ? 'HIDDEN (Private Route)' : job.dropoff_location}</Text>
 </View>
 </View>
 <View className="flex-row items-start">
 <Ionicons name="cube" size={18} color="#64748b" />
 <View className="ml-3">
 <Text className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Vehicle Type</Text>
 <Text className="text-slate-900 dark:text-white font-bold uppercase">{job.vehicle_type?.replace(/_/g, ' ')}</Text>
 </View>
 </View>
 <View className="flex-row items-start">
 <Ionicons name="time" size={18} color="#64748b" />
 <View className="ml-3">
 <Text className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Date & Time</Text>
 <Text className="text-slate-900 dark:text-white font-bold">{new Date(job.pickup_time).toLocaleString()}</Text>
 </View>
 </View>
 </View>

 <View className="border-t border-slate-200 dark:border-slate-800 pt-6">
 <Text className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mb-2">Description</Text>
 <Text className="text-slate-600 dark:text-slate-300 leading-6">{job.description}</Text>
 </View>
 </View>

 <View className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-10">
 <Text className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mb-4">Hirer Information</Text>
 <View className="flex-row items-center">
 <View className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-4 border border-brandMint/30">
 <Text className="text-brandMint font-black text-xl">{job.hirer?.user?.name?.charAt(0)}</Text>
 </View>
 <View>
 <Text className="text-slate-900 dark:text-white font-bold text-lg">{job.hirer?.user?.name}</Text>
 <View className="flex-row items-center mt-1">
 <Ionicons name="star" size={12} color="#fbbf24" />
 <Text className="text-slate-500 dark:text-slate-400 text-xs ml-1">{job.hirer?.rating || 'No ratings'}</Text>
 </View>
 </View>
 </View>
 </View>
 </ScrollView>

 <View className="px-6 py-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-corporateNavy">
 {!job.has_applied ? (
 <TouchableOpacity
 className={`bg-brandMint py-4 rounded-xl items-center justify-center ${applying ? 'opacity-70' : ''}`}
 onPress={handleApply}
 disabled={applying}
 >
 {applying ? (
 <ActivityIndicator color="#0f172a" />
 ) : (
 <Text className="text-corporateNavy font-black text-sm uppercase tracking-widest">Apply for Job</Text>
 )}
 </TouchableOpacity>
 ) : (
 <View className="bg-slate-100 dark:bg-slate-800 py-4 rounded-xl items-center border border-slate-300 dark:border-slate-700">
 <Text className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Already Applied</Text>
 </View>
 )}
 </View>
 </SafeAreaView>
 );
}

