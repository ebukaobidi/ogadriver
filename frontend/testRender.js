
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import DriverPortal from './src/pages/DriverPortal.jsx';

try {
  console.log(renderToString(React.createElement(DriverPortal)));
} catch (e) {
  console.error('RENDER ERROR:', e);
}
