const fs = require('fs');
let code = fs.readFileSync('src/navigation/HirerNavigator.js', 'utf8');

// Remove all occurrences of HirerBookings and Loyalty first
code = code.replace(/<Stack\.Screen name="HirerBookings" component=\{HirerBookingsScreen\} \/>/g, '');
code = code.replace(/<Stack\.Screen name="Loyalty" component=\{LoyaltyScreen\} \/>/g, '');

// Clean up any weird empty lines left by the replacement
code = code.replace(/\n\s*\n/g, '\n');

// Re-add them correctly under Referrals
code = code.replace(
  /<Stack\.Screen name="Referrals" component=\{ReferralScreen\} \/>/g,
  `<Stack.Screen name="Referrals" component={ReferralScreen} />\n      <Stack.Screen name="HirerBookings" component={HirerBookingsScreen} />\n      <Stack.Screen name="Loyalty" component={LoyaltyScreen} />`
);

fs.writeFileSync('src/navigation/HirerNavigator.js', code, 'utf8');
console.log('Fixed duplicates in HirerNavigator');
