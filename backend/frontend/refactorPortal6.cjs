const fs = require('fs');
let content = fs.readFileSync('temp_portal_utf8.txt', 'utf8');

if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
}

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

const startMarker = '<div className="p-4 lg:p-8">';
let startIndex = content.indexOf(startMarker);
let mainEndIndex = content.indexOf('</main>');

if(startIndex !== -1 && mainEndIndex !== -1) {
    let block = content.substring(startIndex + startMarker.length, mainEndIndex);
    let lastDivEnd = block.lastIndexOf('</div>');
    let innerBlock = block.substring(0, lastDivEnd);
    
    innerBlock = innerBlock.replace(/\{activeTab === '([^']+)' && \(\s*([\s\S]+?)\n\s*\)\s*\}/g, (match, tabName, component) => {
        return `<Route path="${tabName}" element={${component}} />`;
    });

    innerBlock = `\n          <Routes>\n            <Route path="/" element={<Navigate to="surge" replace />} />\n${innerBlock}\n            <Route path="billing" element={<Navigate to="subscriptions" replace />} />\n            <Route path="simulator" element={<Navigate to="training" replace />} />\n            <Route path="*" element={<Navigate to="surge" replace />} />\n          </Routes>\n        `;
    
    content = content.substring(0, startIndex + startMarker.length) + innerBlock + block.substring(lastDivEnd) + content.substring(mainEndIndex);
} else {
    console.log("Markers not found");
}

fs.writeFileSync('src/pages/DriverPortal.jsx', content);
console.log("Refactored successfully");
