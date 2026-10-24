const fs = require('fs');

let content = fs.readFileSync('src/pages/DriverPortal.jsx', 'utf8');

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

content = content.replace(/\{activeTab === '([^']+)' && \(\s*([\s\S]+?)\s*\)\s*\}/g, (match, tabName, component) => {
    return `<Route path="${tabName}" element={${component}} />`;
});

content = content.replace(/(<Route path="[\s\S]+? \/>\s*)+/g, (match) => {
    return `<Routes>
       <Route path="/" element={<Navigate to="surge" replace />} />
       ${match}
       <Route path="billing" element={<Navigate to="subscriptions" replace />} />
       <Route path="simulator" element={<Navigate to="training" replace />} />
       <Route path="*" element={<Navigate to="surge" replace />} />
     </Routes>`;
});

fs.writeFileSync('src/pages/DriverPortal.jsx', content);
console.log("Refactored successfully");
