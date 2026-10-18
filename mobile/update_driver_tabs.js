const fs = require('fs');
let code = fs.readFileSync('src/navigation/DriverNavigator.js', 'utf8');

code = code.replace(/else if \(route\.name === 'Hire'\) \{[\s\S]*?else if \(route\.name === 'VIP Fleet'\) \{[\s\S]*?else if \(route\.name === 'Account'\) \{/, `else if (route.name === 'Jobs') {
                iconName = focused ? 'briefcase' : 'briefcase-outline';
              } else if (route.name === 'Earnings') {
                iconName = focused ? 'cash' : 'cash-outline';
              } else if (route.name === 'Account') {`);

code = code.replace(/<Tab\.Screen name="Hire" component=\{DriverJobsScreen\} \/>\s*<Tab\.Screen name="VIP Fleet" component=\{DriverJobsScreen\} \/>/, `<Tab.Screen name="Jobs" component={DriverJobsScreen} />\n        <Tab.Screen name="Earnings" component={EarningsScreen} />`);

fs.writeFileSync('src/navigation/DriverNavigator.js', code, 'utf8');
console.log('Driver tabs updated');
