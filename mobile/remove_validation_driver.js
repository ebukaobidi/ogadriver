const fs = require('fs');
let code = fs.readFileSync('src/screens/driver/DriverLoginScreen.js', 'utf8');
code = code.replace(/if \(!email \|\| !password\) \{[\s\S]*?return;\s*\}/, '');
fs.writeFileSync('src/screens/driver/DriverLoginScreen.js', code, 'utf8');
