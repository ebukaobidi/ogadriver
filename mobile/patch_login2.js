const fs = require('fs');
let code = fs.readFileSync('src/screens/driver/DriverLoginScreen.js', 'utf8');

code = code.replace(/route\.params\?\.onLogin\?\.\(\{ role: 'driver' \}\);/, `if (route.params && route.params.onLogin) {
          route.params.onLogin({ role: 'driver' });
        } else {
          Alert.alert('Routing Error', 'onLogin parameter is missing from route!');
        }`);

fs.writeFileSync('src/screens/driver/DriverLoginScreen.js', code, 'utf8');
console.log('Added check to DriverLoginScreen');
