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

const startMarker = '<div className="p-4 lg:p-8">';
let startIndex = content.indexOf(startMarker);

// Find the last closing div before </main>
let mainEndIndex = content.indexOf('</main>');

if(startIndex !== -1 && mainEndIndex !== -1) {
    // we want to find the </div> that closes the <div className="p-4 lg:p-8">
    // since it's the last child before </main> maybe?
    // Let's just slice it until mainEndIndex, and then find the last </div>
    let block = content.substring(startIndex + startMarker.length, mainEndIndex);
    let lastDivEnd = block.lastIndexOf('</div>');
    let innerBlock = block.substring(0, lastDivEnd);
    
    // Replace all {activeTab === 'X' && ( ... )} with <Route path="X" element={ ... } />
    innerBlock = innerBlock.replace(/\{activeTab === '([^']+)' && \(\s*([\s\S]+?)\s*\)\s*\}/g, (match, tabName, component) => {
        return `<Route path="${tabName}" element={${component}} />`;
    });
    
    innerBlock = `\n          <Routes>\n            <Route path="/" element={<Navigate to="surge" replace />} />\n${innerBlock}\n            <Route path="subscriptions" element={<Navigate to="billing" replace />} />\n            <Route path="training" element={<Navigate to="simulator" replace />} />\n            <Route path="*" element={<Navigate to="surge" replace />} />\n          </Routes>\n        `;
    
    content = content.substring(0, startIndex + startMarker.length) + innerBlock + block.substring(lastDivEnd) + content.substring(mainEndIndex);
} else {
    console.log("Markers not found!");
}

fs.writeFileSync('src/pages/DriverPortal.jsx', content);
console.log("Refactored successfully");
