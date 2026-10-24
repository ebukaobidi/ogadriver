const fs = require('fs');
let c = fs.readFileSync('src/pages/DriverPortal.jsx', 'utf8');

c = c.replace(/<Route path="dashboard"[\s\S]*?\/>\} \/>/g, '');
c = c.replace(/<Route path="vehicle-rates"[\s\S]*?\/>/g, '');
c = c.replace(/<Route path="status"[\s\S]*?\/>/g, '');
c = c.replace(/<Route path="availability"[\s\S]*?\/>/g, '');
c = c.replace(/<Route path="notifications"[\s\S]*?\/>/g, '');

fs.writeFileSync('src/pages/DriverPortal.jsx', c);
console.log('Routes removed');
