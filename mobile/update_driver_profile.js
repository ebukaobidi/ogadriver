const fs = require('fs');
let code = fs.readFileSync('src/screens/driver/DriverProfileScreen.js', 'utf8');

// Replace the list with a 2x2 grid and add vehicle class selector
// We will replace the "3. Main Details & Preferences Menu Group" section

const gridReplacement = `
        <View className="mb-6">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 ml-1">PARTNER TOOLS</Text>
          <View className="flex-row flex-wrap">
            <TouchableOpacity className="w-1/2 p-1.5 mb-1" onPress={() => navigation.navigate('DriverDocuments')}>
              <View className="bg-[#121927] border border-slate-800/80 rounded-2xl p-4 flex-row items-center space-x-3">
                <View className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 items-center justify-center">
                  <Ionicons name="document-text" size={20} color="#3b82f6" />
                </View>
                <View className="flex-1 ml-1">
                  <Text className="text-white font-bold text-xs leading-tight">Documents</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="w-1/2 p-1.5 mb-1" onPress={() => navigation.navigate('VehicleInspection')}>
              <View className="bg-[#121927] border border-slate-800/80 rounded-2xl p-4 flex-row items-center space-x-3">
                <View className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center">
                  <Ionicons name="car" size={20} color="#10b981" />
                </View>
                <View className="flex-1 ml-1">
                  <Text className="text-white font-bold text-xs leading-tight">Vehicle</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="w-1/2 p-1.5 mb-1" onPress={() => navigation.navigate('Schedule')}>
              <View className="bg-[#121927] border border-slate-800/80 rounded-2xl p-4 flex-row items-center space-x-3">
                <View className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 items-center justify-center">
                  <Ionicons name="calendar" size={20} color="#a855f7" />
                </View>
                <View className="flex-1 ml-1">
                  <Text className="text-white font-bold text-xs leading-tight">Schedule</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="w-1/2 p-1.5 mb-1" onPress={() => navigation.navigate('DriverWallet')}>
              <View className="bg-[#121927] border border-slate-800/80 rounded-2xl p-4 flex-row items-center space-x-3">
                <View className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 items-center justify-center">
                  <Ionicons name="wallet" size={20} color="#f59e0b" />
                </View>
                <View className="flex-1 ml-1">
                  <Text className="text-white font-bold text-xs leading-tight">Bank</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 ml-1">VEHICLE CLASS</Text>
          <View className="bg-[#121927] border border-slate-800/80 rounded-3xl p-4">
            <Text className="text-slate-400 text-xs mb-3">Select the vehicle class you are driving for OgaDriver.</Text>
            <View className="flex-row justify-between space-x-2">
              <TouchableOpacity className="flex-1 py-3 rounded-xl items-center border border-[#0a5c25] bg-emerald-900/30">
                <Ionicons name="car-sport" size={20} color="#10b981" />
                <Text className="text-emerald-400 font-bold text-xs mt-1">Economy</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3 rounded-xl items-center border border-slate-700 bg-slate-800/50">
                <Ionicons name="car" size={20} color="#94a3b8" />
                <Text className="text-slate-400 font-bold text-xs mt-1">Comfort</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3 rounded-xl items-center border border-slate-700 bg-slate-800/50">
                <Ionicons name="star" size={20} color="#94a3b8" />
                <Text className="text-slate-400 font-bold text-xs mt-1">VIP Fleet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
`;

code = code.replace(/\{\/\* 3\. Main Details & Preferences Menu Group \*\/\}[\s\S]*?(?=\{\/\* 4\. Partner Support Button \*\/)/, gridReplacement);

fs.writeFileSync('src/screens/driver/DriverProfileScreen.js', code, 'utf8');
console.log('DriverProfileScreen updated successfully');
