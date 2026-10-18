const fs = require('fs');
let content = fs.readFileSync('src/screens/hirer/RideBookingScreen.js', 'utf8');
let match = content.match(/.*?3,900/);
if (match) console.log(Array.from(match[0]).map(c => c.charCodeAt(0)));
