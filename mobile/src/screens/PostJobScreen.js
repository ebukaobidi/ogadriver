import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { jobService } from '../api/api';

export default function PostJobScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vehicle_type: 'van',
    pickup_location: '',
    pickup_latitude: 0,
    pickup_longitude: 0,
    dropoff_location: '',
    dropoff_latitude: 0,
    dropoff_longitude: 0,
    pickup_time: '',
    estimated_delivery_time: '',
    distance_km: '',
    amount: '',
    search_radius_km: '50',
  });

  const vehicleTypes = ['heavy_duty', 'light_truck', 'van', 'bus', 'tanker'];

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.pickup_location || !formData.dropoff_location || !formData.pickup_time || !formData.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await jobService.createJob({
        ...formData,
        amount: parseFloat(formData.amount),
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
        search_radius_km: parseInt(formData.search_radius_km),
        publish_now: true,
      });
      Alert.alert('Success', 'Job posted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-corporateNavy">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          <View className="p-6">
            <Text className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Post Job</Text>
            <Text className="text-brandMint font-mono text-sm mb-6">Create a new job posting</Text>

            <View className="space-y-4">
              <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Job Title</Text>
                <TextInput
                  className="text-white text-base font-bold"
                  placeholder="Enter job title"
                  placeholderTextColor="#475569"
                  value={formData.title}
                  onChangeText={(text) => setFormData({...formData, title: text})}
                />
              </View>

              <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Description</Text>
                <TextInput
                  className="text-white text-base"
                  placeholder="Job description"
                  placeholderTextColor="#475569"
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Vehicle Type</Text>
                <View className="flex flex-wrap gap-2">
                  {vehicleTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      className={`px-3 py-2 rounded-lg border ${formData.vehicle_type === type ? 'bg-brandMint border-brandMint' : 'border-slate-700'}`}
                      onPress={() => setFormData({...formData, vehicle_type: type})}
                    >
                      <Text className={`text-xs font-bold uppercase ${formData.vehicle_type === type ? 'text-corporateNavy' : 'text-slate-400'}`}>
                        {type.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Pickup Location</Text>
                <TextInput
                  className="text-white text-base font-bold"
                  placeholder="Enter pickup address"
                  placeholderTextColor="#475569"
                  value={formData.pickup_location}
                  onChangeText={(text) => setFormData({...formData, pickup_location: text})}
                />
              </View>

              <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Dropoff Location</Text>
                <TextInput
                  className="text-white text-base font-bold"
                  placeholder="Enter dropoff address"
                  placeholderTextColor="#475569"
                  value={formData.dropoff_location}
                  onChangeText={(text) => setFormData({...formData, dropoff_location: text})}
                />
              </View>

              <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Pickup Date & Time</Text>
                <TextInput
                  className="text-white text-base font-bold"
                  placeholder="YYYY-MM-DD HH:MM"
                  placeholderTextColor="#475569"
                  value={formData.pickup_time}
                  onChangeText={(text) => setFormData({...formData, pickup_time: text})}
                />
              </View>

              <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Amount (₦)</Text>
                <TextInput
                  className="text-white text-base font-bold"
                  placeholder="Enter amount"
                  placeholderTextColor="#475569"
                  value={formData.amount}
                  onChangeText={(text) => setFormData({...formData, amount: text})}
                  keyboardType="numeric"
                />
              </View>

              <View className="grid grid-cols-2 gap-4">
                <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                  <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Distance (km)</Text>
                  <TextInput
                    className="text-white text-base font-bold"
                    placeholder="Optional"
                    placeholderTextColor="#475569"
                    value={formData.distance_km}
                    onChangeText={(text) => setFormData({...formData, distance_km: text})}
                    keyboardType="numeric"
                  />
                </View>
                <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                  <Text className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Search Radius (km)</Text>
                  <TextInput
                    className="text-white text-base font-bold"
                    placeholder="50"
                    placeholderTextColor="#475569"
                    value={formData.search_radius_km}
                    onChangeText={(text) => setFormData({...formData, search_radius_km: text})}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                className={`bg-brandMint py-4 rounded-xl items-center mt-6 ${loading ? 'opacity-70' : ''}`}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <Text className="text-corporateNavy font-black uppercase tracking-widest">Post Job</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
