const fs = require('fs');
let code = fs.readFileSync('src/navigation/DriverNavigator.js', 'utf8');

// Update icon mapping
code = code.replace(/if \(route\.name === 'Ride'\) \{[\s\S]*?else if \(route\.name === 'Account'\) \{/, `if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Jobs') {
                iconName = focused ? 'briefcase' : 'briefcase-outline';
              } else if (route.name === 'Earnings') {
                iconName = focused ? 'wallet' : 'wallet-outline';
              } else if (route.name === 'Profile') {`);

// Update screens
code = code.replace(/<Tab\.Screen name="Ride" component=\{HomeStack\} \/>[\s\S]*?<Tab\.Screen name="Account" component=\{AccountStack\} initialParams=\{params\} \/>/, `<Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Jobs" component={DriverJobsScreen} />
        <Tab.Screen name="Earnings" component={EarningsScreen} />
        <Tab.Screen name="Profile" component={AccountStack} initialParams={params} />`);

fs.writeFileSync('src/navigation/DriverNavigator.js', code, 'utf8');
console.log('Driver tabs fully synced with screenshot');
