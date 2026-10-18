const fs = require('fs');

function checkTags(file) {
    const code = fs.readFileSync(file, 'utf8');
    let openCount = 0;
    let lines = code.split('\n');
    let issues = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let openMatch = line.match(/<View\b/g);
        let closeMatch = line.match(/<\/View>/g);
        
        if (openMatch) openCount += openMatch.length;
        if (closeMatch) openCount -= closeMatch.length;
    }
    console.log(file + " final open count: " + openCount);
}

checkTags('src/screens/hirer/HireBookingScreen.js');
checkTags('src/screens/hirer/RideBookingScreen.js');
