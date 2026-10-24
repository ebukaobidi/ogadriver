const fs = require('fs');

let content = fs.readFileSync('temp_portal.txt', 'utf8');

content = content.replace(/import { useNavigate, useSearchParams } from 'react-router-dom';/, "import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';");

const statePattern = /const \[activeTab, setActiveTabState\] = useState\(\(\) => \{[\s\S]*?return 'surge';\s*\}\);\s*const setActiveTab = \(tab\) => \{\s*setActiveTabState\(tab\);\s*try \{\s*localStorage\.setItem\('ogadriver_driver_active_tab', tab\);\s*\} catch \{\}\s*\};/;

const routeState = `const location = useLocation();
  const getActiveTab = () => {
    const path = location.pathname.replace('/driver', '').replace('/', '');
    return path || 'surge';
  };
  const activeTab = getActiveTab();
  const setActiveTab = (tab) => navigate(\`/driver/\${tab}\`);`;

content = content.replace(statePattern, routeState);

// Instead of multiple replacements, let's just find the start and end of the conditional renderings
// They start right after `<main ...> <div>` and end before `</div> </main>`
// Let's find that block and replace the conditionals inside it.
const startMarker = '<main className="flex-1 w-full h-screen overflow-y-auto custom-scrollbar pb-32 pt-16 relative z-10">\n        <div>';
const endMarker = '</div>\n      </main>';

let startIndex = content.indexOf(startMarker);
let endIndex = content.indexOf(endMarker, startIndex);

if(startIndex !== -1 && endIndex !== -1) {
    let block = content.substring(startIndex + startMarker.length, endIndex);
    
    // Replace the conditions with Routes
    block = block.replace(/\{activeTab === '([^']+)' && \(\s*([\s\S]+?)\s*\)\s*\}/g, (match, tabName, component) => {
        return `<Route path="${tabName}" element={${component}} />`;
    });
    
    // Wrap the whole block in Routes
    block = `\n          <Routes>\n            <Route path="/" element={<Navigate to="surge" replace />} />\n${block}\n            <Route path="billing" element={<Navigate to="subscriptions" replace />} />\n            <Route path="simulator" element={<Navigate to="training" replace />} />\n            <Route path="*" element={<Navigate to="surge" replace />} />\n          </Routes>\n        `;
    
    content = content.substring(0, startIndex + startMarker.length) + block + content.substring(endIndex);
}

fs.writeFileSync('src/pages/DriverPortal.jsx', content);
console.log("Refactored successfully");
