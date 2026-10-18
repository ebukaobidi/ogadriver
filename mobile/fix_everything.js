const fs = require('fs');

const fixFiles = () => {
    // 1. Fix Register Screens (Flags)
    const registerFiles = ['src/screens/hirer/HirerRegisterScreen.js', 'src/screens/driver/DriverRegisterScreen.js'];
    registerFiles.forEach(file => {
        let code = fs.readFileSync(file, 'utf8');
        code = code.replace(/{ code: '\+234', flag: '[^']+', name: 'Nigeria' }/g, "{ code: '+234', flag: '🇳🇬', name: 'Nigeria' }");
        code = code.replace(/{ code: '\+233', flag: '[^']+', name: 'Ghana' }/g, "{ code: '+233', flag: '🇬🇭', name: 'Ghana' }");
        code = code.replace(/useState\(\{ code: '\+234', flag: '[^']+', name: 'Nigeria' \}\)/g, "useState({ code: '+234', flag: '🇳🇬', name: 'Nigeria' })");
        fs.writeFileSync(file, code, 'utf8');
    });

    // 2. Fix Booking Screens (Naira)
    const bookingFiles = ['src/screens/hirer/RideBookingScreen.js', 'src/screens/hirer/HireBookingScreen.js'];
    bookingFiles.forEach(file => {
        let code = fs.readFileSync(file, 'utf8');
        // Match weird characters before numbers like ,3,900 or ?3,900
        code = code.replace(/[^\w\s\{\}\(\)\<\>\/\\=\'\"\-\+\*\&\|\!\:\;\,\.]+(?=\d{1,3}(,\d{3})*)/g, '₦');
        code = code.replace(/[^\w\s\{\}\(\)\<\>\/\\=\'\"\-\+\*\&\|\!\:\;\,\.]+(?=\{suggestedPrice)/g, '₦');
        code = code.replace(/[^\w\s\{\}\(\)\<\>\/\\=\'\"\-\+\*\&\|\!\:\;\,\.]+(?=\{offerPrice)/g, '₦');
        code = code.replace(/[^\w\s\{\}\(\)\<\>\/\\=\'\"\-\+\*\&\|\!\:\;\,\.]+(?=\{hireSuggestedPrice)/g, '₦');
        code = code.replace(/[^\w\s\{\}\(\)\<\>\/\\=\'\"\-\+\*\&\|\!\:\;\,\.]+(?=\{hireOfferPrice)/g, '₦');
        fs.writeFileSync(file, code, 'utf8');
    });
};

fixFiles();
console.log("Fixed currencies and flags.");
