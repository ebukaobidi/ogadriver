const fs = require('fs');

const fixColors = () => {
    const bookingFiles = ['src/screens/hirer/RideBookingScreen.js', 'src/screens/hirer/HireBookingScreen.js'];
    bookingFiles.forEach(file => {
        let code = fs.readFileSync(file, 'utf8');
        // Fix hex colors
        code = code.replace(/₦([0-9a-fA-F]{3,6})/g, '#$1');
        // Fix other things that might have been hit if any
        fs.writeFileSync(file, code, 'utf8');
    });
};

fixColors();
console.log("Fixed hex colors.");
