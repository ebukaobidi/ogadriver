const fs = require('fs');
let content = fs.readFileSync('src/screens/hirer/HireBookingScreen.js', 'utf8');
let match = content.match(/Suggested .*?\{hireSuggestedPrice/);
if (match) {
    console.log("Found:", match[0]);
    console.log("Char codes:", Array.from(match[0]).map(c => c.charCodeAt(0)));
}
