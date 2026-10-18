const fs = require('fs');
let content = fs.readFileSync('src/screens/hirer/HireBookingScreen.js', 'utf8');
let match = content.match(/.*?20000/);
if (match) console.log(match[0].slice(-10));
