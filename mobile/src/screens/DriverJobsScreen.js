import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { jobService } from '../api/api';

export default function DriverJobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, nearby, my_applications

  useEffect(() => {
    loadJobs();
  }, [filter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters = filter === 'my_applications' ? { my_applications: true } : {};
      const response = await jobService.getJobs(filters);
      setJobs(response.data?.data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await jobService.applyForJob(jobId, {
        proposed_amount: null,
        cover_letter: 'I am interested in this job.',
      });
      Alert.alert('Success', 'Application submitted successfully');
      loadJobs();
    } catch (error) {
      Alert.alert('Error', 'Failed to apply for job');
    }
  };

  const renderJob = ({ item }) => (
    <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">{item.title}</Text>
          <Text className="text-slate-400 text-sm">{item.hirer?.user?.name || 'Unknown Hirer'}</Text>
        </View>
        <View className="bg-brandMint px-3 py-1 rounded-full">
          <Text className="text-corporateNavy font-bold text-sm">₦{item.amount?.toLocaleString()}</Text>
        </View>
      </View>

      <View className="space-y-1 mb-3">
        <Text className="text-slate-400 text-sm">📍 {item.pickup_location}</Text>
        <Text className="text-slate-400 text-sm">🏁 {item.dropoff_location}</Text>
        <Text className="text-slate-400 text-sm">🚛 {item.vehicle_type}</Text>
        <Text className="text-slate-400 text-sm">📅 {new Date(item.pickup_time).toLocaleDateString()}</Text>
      </View>

      <View className="flex-row space-x-2">
        <TouchableOpacity
          className="flex-1 bg-slate-800 py-3 rounded-xl items-center"
          onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
        >
          <Text className="text-white font-bold text-sm uppercase">Details</Text>
        </TouchableOpacity>
        {!item.has_applied && (
          <TouchableOpacity
            className="flex-1 bg-brandMint py-3 rounded-xl items-center"
            onPress={() => handleApply(item.id)}
          >
            <Text className="text-corporateNavy font-bold text-sm uppercase">Apply</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-corporateNavy">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Available Jobs</Text>
        <Text className="text-brandMint font-mono text-sm">Find your next opportunity</Text>
      </View>

      <View className="px-6 mb-4 flex-row space-x-2">
        {['all', 'nearby', 'my_applications'].map((f) => (
          <TouchableOpacity
            key={f}
            className={`flex-1 py-2 rounded-lg border ${filter === f ? 'bg-brandMint border-brandMint' : 'border-slate-700'}`}
            onPress={() => setFilter(f)}
          >
            <Text className={`text-center font-bold text-xs uppercase ${filter === f ? 'text-corporateNavy' : 'text-slate-400'}`}>
              {f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#22d3ee" size="large" />
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="px-6 pb-6"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-slate-400 text-center">No jobs found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
