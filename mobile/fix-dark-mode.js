const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
const componentsDir = path.join(__dirname, 'src', 'components');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Replace backgrounds
            content = content.replace(/className="([^"]*)bg-corporateNavy([^"]*)"/g, 'className="$1bg-white dark:bg-corporateNavy$2"');
            content = content.replace(/className="([^"]*)bg-slate-900([^"]*)"/g, 'className="$1bg-slate-50 dark:bg-slate-900$2"');
            content = content.replace(/className="([^"]*)bg-slate-800([^"]*)"/g, 'className="$1bg-slate-100 dark:bg-slate-800$2"');
            
            // Replace text
            content = content.replace(/className="([^"]*)text-white([^"]*)"/g, 'className="$1text-slate-900 dark:text-white$2"');
            content = content.replace(/className="([^"]*)text-slate-400([^"]*)"/g, 'className="$1text-slate-500 dark:text-slate-400$2"');
            content = content.replace(/className="([^"]*)text-slate-300([^"]*)"/g, 'className="$1text-slate-600 dark:text-slate-300$2"');
            
            // Replace borders
            content = content.replace(/className="([^"]*)border-slate-800([^"]*)"/g, 'className="$1border-slate-200 dark:border-slate-800$2"');
            content = content.replace(/className="([^"]*)border-slate-700([^"]*)"/g, 'className="$1border-slate-300 dark:border-slate-700$2"');
            
            // Clean up double spaces if any
            content = content.replace(/  +/g, ' ');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${file}`);
            }
        }
    }
}

processDir(screensDir);
processDir(componentsDir);
console.log('Done mapping dark mode classes.');
