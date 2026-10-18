const fs = require('fs');
let code = fs.readFileSync('src/screens/hirer/RideBookingScreen.js', 'utf8');

// Replace corrupted Naira symbol or direct Naira symbol with Unicode escape
code = code.replace(/,/g, '\u20A6');
code = code.replace(/₦/g, '\u20A6');

fs.writeFileSync('src/screens/hirer/RideBookingScreen.js', code, 'utf8');
console.log('Fixed Naira symbols');
