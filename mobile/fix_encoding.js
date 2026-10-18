const fs = require('fs');

const fixFile = (path, rules) => {
    let content = fs.readFileSync(path, 'utf8');
    rules.forEach(r => {
        content = content.replace(r.search, r.replace);
    });
    fs.writeFileSync(path, content, 'utf8');
}

// 1. Fix RideBookingScreen
fixFile('src/screens/hirer/RideBookingScreen.js', [
    { search: /\?3,900/g, replace: '₦3,900' },
    { search: /\?5,500/g, replace: '₦5,500' },
    { search: /\?\{suggestedPrice/g, replace: '₦{suggestedPrice' },
    { search: /\?\{offerPrice/g, replace: '₦{offerPrice' },
    { search: /\?([0-9,]+)/g, replace: '₦$1' }
]);

// 2. Fix HireBookingScreen
fixFile('src/screens/hirer/HireBookingScreen.js', [
    { search: /\?\{hireSuggestedPrice/g, replace: '₦{hireSuggestedPrice' },
    { search: /\?\{hireOfferPrice/g, replace: '₦{hireOfferPrice' },
    { search: /\?([0-9,]+)/g, replace: '₦$1' }
]);

// 3. Fix ProfileScreen
fixFile('src/screens/shared/ProfileScreen.js', [
    { search: /s/g, replace: '🚨' }
]);

console.log('Fixed encoding issues');
