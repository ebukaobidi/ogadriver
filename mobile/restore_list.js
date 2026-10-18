const fs = require('fs');
let code = fs.readFileSync('src/screens/driver/DriverProfileScreen.js', 'utf8');

const listReplacement = `
          {/* 3. Main Details & Preferences Menu Group */}
          <View className="bg-[#121927] border border-slate-800/80 rounded-3xl mb-5 overflow-hidden shadow-lg">
            {/* Documents & licence */}
            <TouchableOpacity
              className="p-4 flex-row justify-between items-center border-b border-slate-800/60"
              onPress={() => navigation.navigate('DriverDocuments')}
            >
              <Text className="text-white font-bold text-sm">Documents & licence</Text>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </TouchableOpacity>
  
            {/* Vehicle Details */}
            <TouchableOpacity
              className="p-4 flex-row justify-between items-center border-b border-slate-800/60"
              onPress={() => navigation.navigate('VehicleInspection')}
            >
              <Text className="text-white font-bold text-sm">Vehicle details</Text>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </TouchableOpacity>

            {/* Hire Availability */}
            <TouchableOpacity
              className="p-4 flex-row justify-between items-center border-b border-slate-800/60"
              onPress={() => navigation.navigate('Schedule')}
            >
              <Text className="text-white font-bold text-sm">Hire availability</Text>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </TouchableOpacity>

            {/* Bank account */}
            <TouchableOpacity
              className="p-4 flex-row justify-between items-center border-b border-slate-800/60"
              onPress={() => navigation.navigate('DriverWallet')}
            >
              <Text className="text-white font-bold text-sm">Bank account</Text>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </TouchableOpacity>
  
            {/* Country */}
            <TouchableOpacity className="p-4 flex-row justify-between items-center">
              <Text className="text-white font-bold text-sm">Country: Nigeria NG</Text>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
`;

code = code.replace(/<View className="mb-6">[\s\S]*?(?=\{\/\* 4\. Partner Support Button \*\/)/, listReplacement);

fs.writeFileSync('src/screens/driver/DriverProfileScreen.js', code, 'utf8');
console.log('Restored list layout');
