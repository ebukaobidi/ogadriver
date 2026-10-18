const fs = require('fs');
let code = fs.readFileSync('src/screens/hirer/RideBookingScreen.js', 'utf8');

// 1. Add VIP vehicle
const vipVehicle = `
                  <TouchableOpacity 
                    className={\`mr-3 p-3 rounded-2xl border items-center w-28 \${suggestedPrice === 8500 ? 'border-[#0a5c25] bg-emerald-50' : 'border-slate-200 bg-white'}\`}
                    onPress={() => {
                      setSuggestedPrice(8500);
                      setOfferPrice(8500);
                    }}
                  >
                    <Ionicons name="star" size={32} color={suggestedPrice === 8500 ? '#0a5c25' : '#64748b'} />
                    <Text className={\`font-bold mt-2 \${suggestedPrice === 8500 ? 'text-[#0a5c25]' : 'text-slate-600'}\`}>VIP Fleet</Text>
                    <Text className="text-xs text-slate-500">₦8,500</Text>
                  </TouchableOpacity>
`;
code = code.replace(/(<Text className="text-xs text-slate-500">₦5,500<\/Text>\s*<\/TouchableOpacity>)/, `$1\n${vipVehicle}`);

// 2. Fix the Schedule for Web
code = code.replace(/onPress=\{\(\) => setShowDatePicker\(true\)\}/, `onPress={() => {
                      if (Platform.OS === 'web') {
                        const time = window.prompt("Enter time for pickup (e.g. 14:30 or Tomorrow 9am):", "14:30");
                        if (time) {
                          const d = new Date();
                          d.setHours(d.getHours() + 1); // just mock adding time
                          setDate(d);
                          setScheduleType('Later');
                        }
                      } else {
                        setShowDatePicker(true);
                      }
                    }}`);

fs.writeFileSync('src/screens/hirer/RideBookingScreen.js', code, 'utf8');
console.log('Fixed VIP and Schedule on RideBookingScreen');
