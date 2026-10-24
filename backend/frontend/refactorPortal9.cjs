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

const blockPattern = /<main className="pb-24 pt-6 px-4 md:px-8 max-w-7xl mx-auto min-h-screen pt-20">\s*<div>([\s\S]*?)<\/div>\s*<\/main>/;
const m = content.match(blockPattern);

if (m) {
    let inner = m[1];
    
    // Replace all conditionals
    inner = inner.replace(/\{activeTab === '([^']+)' && \(\s*([\s\S]+?)\n\s*\)\s*\}/g, (match, tabName, component) => {
        return `<Route path="${tabName}" element={${component}} />`;
    });
    
    // Wrap with Routes
    let newBlock = `<main className="pb-24 pt-6 px-4 md:px-8 max-w-7xl mx-auto min-h-screen pt-20">
        <div>
          <Routes>
            <Route path="/" element={<Navigate to="surge" replace />} />
${inner}
            <Route path="billing" element={<Navigate to="subscriptions" replace />} />
            <Route path="simulator" element={<Navigate to="training" replace />} />
            <Route path="*" element={<Navigate to="surge" replace />} />
          </Routes>
        </div>
      </main>`;
      
    content = content.replace(blockPattern, newBlock);
    fs.writeFileSync('src/pages/DriverPortal.jsx', content);
    console.log("Refactored successfully");
} else {
    console.log("Could not find main div block");
}
