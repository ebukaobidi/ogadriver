const fs = require('fs');
let text = fs.readFileSync('src/pages/Register.jsx', 'utf8');

text = text.replace('dY3dYت', '🇳🇬');
text = text.replace('dYتdY-', '🇬🇭');
text = text.replace('dYdYئ', '🇰🇪');
text = text.replace('dYبdY', '🇿🇦');

fs.writeFileSync('src/pages/Register.jsx', text, 'utf8');
