const fs = require('fs');
let code = fs.readFileSync('src/screens/hirer/RideBookingScreen.js', 'utf8');

// The corrupted Naira symbol in utf8 is usually read as 'ï¿½,ï¿½' or similar if mis-encoded
code = code.replace(/[^\x20-\x7E\n\r\t]+,[^\x20-\x7E\n\r\t]+/g, '\u20A6');
// And also fix any standalone corruptions before numbers
code = code.replace(/[^\x20-\x7E\n\r\t]+(?=\d)/g, '\u20A6');

fs.writeFileSync('src/screens/hirer/RideBookingScreen.js', code, 'utf8');
console.log('Fixed Naira symbols via regex');
