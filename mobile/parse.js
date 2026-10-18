const fs = require('fs');

const code = fs.readFileSync('src/screens/hirer/HireBookingScreen.js', 'utf8');
const lines = code.split('\n');

let depth = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<([A-Z]\w+)/g) || []).filter(t => !line.includes('/>') || line.indexOf(t) > line.indexOf('/>')); // rough
    
    // Better parser for tags
    let temp = line;
    let match;
    const tagRegex = /<\/?([A-Z]\w+)[^>]*>/g;
    
    while ((match = tagRegex.exec(line)) !== null) {
        const fullTag = match[0];
        const tagName = match[1];
        if (fullTag.startsWith('</')) {
            depth--;
            console.log(`${i+1}: ${'  '.repeat(Math.max(0, depth))}</${tagName}>`);
        } else if (fullTag.endsWith('/>')) {
            console.log(`${i+1}: ${'  '.repeat(Math.max(0, depth))}<${tagName} />`);
        } else {
            console.log(`${i+1}: ${'  '.repeat(Math.max(0, depth))}<${tagName}>`);
            depth++;
        }
    }
}
console.log("Final depth: " + depth);
