const fs = require('fs');
let code = fs.readFileSync('src/navigation/DriverNavigator.js', 'utf8');

// Fix the Hire icon
code = code.replace(/iconName = focused \? 'time' : 'time-outline';/g, "iconName = focused ? 'briefcase' : 'briefcase-outline';");

// Add missing screens to AccountStack
const missingScreens = `
      <Stack.Screen name="PerkQr" component={PerkQrScreen} />
      <Stack.Screen name="DriverWallet" component={DriverWalletScreen} />
      <Stack.Screen name="VehicleInspection" component={VehicleInspectionScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="Conversations" component={ConversationsListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
`;

// Insert them before </Stack.Navigator> in AccountStack
code = code.replace(/(<Stack\.Screen name="Referrals" component=\{ReferralScreen\} \/>\s*)(<\/Stack\.Navigator>)/g, `$1${missingScreens}    $2`);

fs.writeFileSync('src/navigation/DriverNavigator.js', code, 'utf8');
console.log('Fixed DriverNavigator routes and icons');
