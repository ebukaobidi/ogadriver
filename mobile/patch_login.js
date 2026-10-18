const fs = require('fs');
let code = fs.readFileSync('src/screens/hirer/HirerLoginScreen.js', 'utf8');

code = code.replace(/route\.params\?\.onLogin\?\.\(\{ role: 'hirer' \}\);/, `if (route.params && route.params.onLogin) {
          route.params.onLogin({ role: 'hirer' });
        } else {
          Alert.alert('Routing Error', 'onLogin parameter is missing from route!');
        }`);

fs.writeFileSync('src/screens/hirer/HirerLoginScreen.js', code, 'utf8');
console.log('Added check to HirerLoginScreen');
