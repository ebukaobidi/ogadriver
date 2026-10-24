const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');
content = content.replace('<Route path=\"/driver\" element={<DriverRoute><DriverPortal /></DriverRoute>} />', '<Route path=\"/driver/*\" element={<DriverRoute><DriverPortalWrapper /></DriverRoute>} />');
content = content.replace('import DriverPortal from', 'import DriverPortalWrapper from');
fs.writeFileSync('src/App.jsx', content);
