const fs = require('fs');
let content = fs.readFileSync('src/screens/shared/ProfileScreen.js', 'utf8');
content = content.replace(/🚨/g, 's');
content = content.replace('s SOS EMERGENCY', '🚨 SOS EMERGENCY'); // or just '🚨 SOS EMERGENCY' if it was fully replaced
fs.writeFileSync('src/screens/shared/ProfileScreen.js', content, 'utf8');
console.log('Restored s');
