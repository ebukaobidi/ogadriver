const fs = require('fs');
['src/screens/hirer/HireBookingScreen.js', 'src/screens/hirer/RideBookingScreen.js'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let matches = content.match(/₦[\d\{]/g) || [];
    console.log(file + " has " + matches.length + " Naira symbols.");
});

['src/screens/hirer/HirerRegisterScreen.js', 'src/screens/driver/DriverRegisterScreen.js'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let flags = content.match(/🇳🇬|🇬🇭/g) || [];
    console.log(file + " has " + flags.length + " flags.");
});
