const fs = require('fs');

function updateNavigator(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Update export default function
  code = code.replace(/export default function (Driver|Hirer)Navigator\(\) \{/, 'export default function $1Navigator({ route: parentRoute }) {\n  const params = parentRoute?.params || {};');

  // Find the Account tab and add initialParams
  code = code.replace(/<Tab\.Screen name="Account" component=\{AccountStack\} \/>/g, '<Tab.Screen name="Account" component={AccountStack} initialParams={params} />');
  
  // Find AccountStack definition and make it accept route
  code = code.replace(/function AccountStack\(\) \{/g, 'function AccountStack({ route }) {\n  const params = route?.params || {};');

  // Find Profile screen and add initialParams
  code = code.replace(/<Stack\.Screen name="(DriverProfileMain|Profile)" component=\{(.*?)\} \/>/g, '<Stack.Screen name="$1" component={$2} initialParams={params} />');

  fs.writeFileSync(file, code, 'utf8');
}

updateNavigator('src/navigation/DriverNavigator.js');
updateNavigator('src/navigation/HirerNavigator.js');
console.log('Fixed onLogout propagation');
