const fs = require('fs');
let content = fs.readFileSync('src/pages/DriverPortal.jsx', 'utf8');

// 1. imports
content = content.replace(/import { useNavigate, useSearchParams } from 'react-router-dom';/, "import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';");

// 2. state replace
const statePattern = /const \[activeTab, setActiveTabState\] = useState\(\(\) => \{[\s\S]*?return 'surge';\s*\}\);\s*const setActiveTab = \(tab\) => \{\s*setActiveTabState\(tab\);\s*try \{\s*localStorage\.setItem\('ogadriver_driver_active_tab', tab\);\s*\} catch \{\}\s*\};/;

const routeState = `const location = useLocation();
  const getActiveTab = () => {
    const path = location.pathname.replace('/driver', '').replace('/', '');
    return path || 'surge';
  };
  const activeTab = getActiveTab();
  const setActiveTab = (tab) => navigate(\`/driver/\${tab}\`);`;

content = content.replace(statePattern, routeState);

const startMarker = '<main className="flex-1 w-full h-screen overflow-y-auto custom-scrollbar pb-32 pt-16 relative z-10">\n        <div>';
const endMarker = '</div>\n      </main>';
let startIndex = content.indexOf(startMarker);
let endIndex = content.indexOf(endMarker, startIndex);

if(startIndex !== -1 && endIndex !== -1) {
    let block = content.substring(startIndex + startMarker.length, endIndex);
    
    block = block.replace(/\{activeTab === '([^']+)' && \(\s*([\s\S]+?)\s*\)\s*\}/g, (match, tabName, component) => {
        return `<Route path="${tabName}" element={${component}} />`;
    });
    
    block = `\n          <Routes>\n            <Route path="/" element={<Navigate to="surge" replace />} />\n${block}\n            <Route path="billing" element={<Navigate to="subscriptions" replace />} />\n            <Route path="simulator" element={<Navigate to="training" replace />} />\n            <Route path="*" element={<Navigate to="surge" replace />} />\n          </Routes>\n        `;
    
    content = content.substring(0, startIndex + startMarker.length) + block + content.substring(endIndex);
} else {
    console.log("Markers not found");
}

fs.writeFileSync('src/pages/DriverPortal.jsx', content);
console.log("Refactored successfully");
