# -*- coding: utf-8 -*-
import re
import io

path = 'mobile/src/screens/DriverProfileScreen.js'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'\{\/\* NEW UI: Profile Completion Bar \*\/\}.*?<\/View>\s*<\/View>\s*<\/View>', re.DOTALL)

new_ui = """{/* NEW UI: Profile Completion Bar */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-slate-400 text-[11px]">Profile strength</Text>
            <Text className="text-[#1cd188] text-[11px] font-bold">
              {profileCompletion}% <Text className="text-slate-500 font-normal mx-1"> </Text>
              <Text className="underline">Add introduction video</Text>
            </Text>
          </View>
          <View className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <View className="h-full bg-[#1cd188] rounded-full" style={{ width: `${profileCompletion}%` }} />
          </View>
        </View>

        {/* NEW UI: Employment Status Track Selection */}
        <View className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-6 shadow-sm overflow-hidden">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <View className="flex-row items-center mb-1">
                <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest ml-1">Employment Track</Text>
              </View>
              <Text className="text-white font-black text-lg">Driver Status</Text>
            </View>
          </View>

          <View className="flex-col space-y-3">
            {/* Track A: Independent Operator */}
            <TouchableOpacity 
              onPress={() => setOwnsVehicle(true)}
              className={`p-4 rounded-xl border mb-3 flex-col ${
                ownsVehicle 
                ? 'bg-emerald-500/10 border-emerald-500' 
                : 'bg-slate-900 border-slate-800'
              }`}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-row flex-1 mr-2">
                  <View className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${ownsVehicle ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                    <Ionicons name="car" size={18} color={ownsVehicle ? '#0f172a' : '#94a3b8'} />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-black text-sm ${ownsVehicle ? 'text-white' : 'text-slate-300'}`}>Independent Operator (Has Car)</Text>
                    <Text className="text-slate-500 text-[10px] mt-0.5">I have my own vehicle. I want to access the Surge Map, Ride Bids, and Corporate Hires.</Text>
                  </View>
                </View>
                {ownsVehicle && <Ionicons name="checkmark-circle" size={20} color="#10b981" />}
              </View>

              {ownsVehicle && (
                <View className="mt-4 pt-3 border-t border-emerald-500/20">
                  <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-2">Required Documents for Approval:</Text>
                  <View className="flex-row items-center mb-1"><Ionicons name="checkmark-circle" size={12} color="#475569" className="mr-1"/><Text className="text-slate-300 text-xs">Vehicle License & Registration</Text></View>
                  <View className="flex-row items-center mb-1"><Ionicons name="checkmark-circle" size={12} color="#475569" className="mr-1"/><Text className="text-slate-300 text-xs">Comprehensive Insurance</Text></View>
                  <View className="flex-row items-center mb-2"><Ionicons name="checkmark-circle" size={12} color="#475569" className="mr-1"/><Text className="text-slate-300 text-xs">MOT / Road Worthiness</Text></View>
                  
                  <View className="bg-amber-500/10 p-2 rounded-lg flex-row items-center mt-1">
                    <Ionicons name="warning" size={12} color="#fbbf24" className="mr-1" />
                    <Text className="text-amber-400 text-[10px] font-bold">Pending Admin Verification. Surge Map Disabled.</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Track B: Fleet Operative */}
            <TouchableOpacity 
              onPress={() => setOwnsVehicle(false)}
              className={`p-4 rounded-xl border flex-col ${
                !ownsVehicle 
                ? 'bg-blue-500/10 border-blue-500' 
                : 'bg-slate-900 border-slate-800'
              }`}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-row flex-1 mr-2">
                  <View className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${!ownsVehicle ? 'bg-blue-500' : 'bg-slate-800'}`}>
                    <Ionicons name="shield" size={18} color={!ownsVehicle ? '#0f172a' : '#94a3b8'} />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-black text-sm ${!ownsVehicle ? 'text-white' : 'text-slate-300'}`}>Fleet Operative (Needs Car)</Text>
                    <Text className="text-slate-500 text-[10px] mt-0.5">I do not have a car. I am looking for employment from a Fleet Owner.</Text>
                  </View>
                </View>
                {!ownsVehicle && <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />}
              </View>

              {!ownsVehicle && (
                <View className="mt-4 pt-3 border-t border-blue-500/20">
                  <Text className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">Required Documents for Job Board:</Text>
                  <View className="flex-row items-center mb-1"><Ionicons name="checkmark-circle" size={12} color="#475569" className="mr-1"/><Text className="text-slate-300 text-xs">Police Clearance Certificate</Text></View>
                  <View className="flex-row items-center mb-2"><Ionicons name="checkmark-circle" size={12} color="#475569" className="mr-1"/><Text className="text-slate-300 text-xs">2 Verified Digital Guarantors</Text></View>
                  
                  <View className="bg-amber-500/10 p-2 rounded-lg flex-row items-center mt-1">
                    <Ionicons name="warning" size={12} color="#fbbf24" className="mr-1" />
                    <Text className="text-amber-400 text-[10px] font-bold">Pending Guarantor Verification. Profile Hidden.</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>"""

text = pattern.sub(new_ui, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
