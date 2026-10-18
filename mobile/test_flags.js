const fs = require('fs');
['src/screens/hirer/HirerRegisterScreen.js', 'src/screens/driver/DriverRegisterScreen.js'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let match = content.match(/.*? \+234/);
    if (match) {
        console.log("In " + file + ":", match[0].trim());
        console.log("Bytes:", Array.from(match[0].trim()).map(c => c.charCodeAt(0)));
    }
});
