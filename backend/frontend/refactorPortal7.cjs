const fs = require('fs');
let content = fs.readFileSync('temp_portal_utf8.txt', 'utf8');
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

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

content = content.replace(/\{activeTab === '([^']+)' && \(\s*([\s\S]+?)\n\s*\)\s*\}/g, (match, tabName, component) => {
    return `<Route path="${tabName}" element={${component}} />`;
});

let firstRouteIndex = content.indexOf('<Route path="dashboard"');
let lastRouteIndex = content.lastIndexOf('<Route path="settings"');
if (lastRouteIndex === -1) {
    lastRouteIndex = content.lastIndexOf('<Route path="profile"');
}
if (lastRouteIndex === -1) {
    lastRouteIndex = content.lastIndexOf('<Route path="surge"');
}

let endOfLastRoute = content.indexOf('/>', lastRouteIndex) + 2;

if(firstRouteIndex !== -1 && lastRouteIndex !== -1) {
    let block = content.substring(firstRouteIndex, endOfLastRoute);
    
    block = `<Routes>
            <Route path="/" element={<Navigate to="surge" replace />} />
${block}
            <Route path="billing" element={<Navigate to="subscriptions" replace />} />
            <Route path="simulator" element={<Navigate to="training" replace />} />
            <Route path="*" element={<Navigate to="surge" replace />} />
          </Routes>`;
          
    content = content.substring(0, firstRouteIndex) + block + content.substring(endOfLastRoute);
} else {
    console.log("Could not wrap in Routes");
}

fs.writeFileSync('src/pages/DriverPortal.jsx', content);
console.log("Refactored successfully");
