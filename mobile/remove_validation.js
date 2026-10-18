const fs = require('fs');
let code = fs.readFileSync('src/screens/hirer/HirerLoginScreen.js', 'utf8');
code = code.replace(/if \(!email \|\| !password\) \{[\s\S]*?return;\s*\}/, '');
fs.writeFileSync('src/screens/hirer/HirerLoginScreen.js', code, 'utf8');
