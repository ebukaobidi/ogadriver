const fs = require('fs');

let code = fs.readFileSync('src/screens/hirer/RideBookingScreen.js', 'utf8');

const hireTabStart = "{activeTab === 'Hire a driver' && (";
const commonStart = "{/* Common */}";

let startIndex = code.indexOf(hireTabStart);
if (startIndex !== -1) {
    // Find the end of the hire tab section. It ends right before {/* Common */}
    let commonIndex = code.indexOf(commonStart, startIndex);
    if (commonIndex !== -1) {
        // Since we want to remove the wrapping, we just delete everything from startIndex to commonIndex
        code = code.substring(0, startIndex) + code.substring(commonIndex);
    }
}
fs.writeFileSync('src/screens/hirer/RideBookingScreen.js', code);


let code2 = fs.readFileSync('src/screens/hirer/HireBookingScreen.js', 'utf8');
// Fix the top header where it says "OgaDriver Ride/Hire"
code = code.replace("OgaDriver Ride/Hire", "OgaDriver Ride");
code2 = code2.replace("OgaDriver Ride/Hire", "OgaDriver Hire");
code2 = code2.replace("OgaDriver Ride", "OgaDriver Hire"); // just in case

fs.writeFileSync('src/screens/hirer/HireBookingScreen.js', code2);
