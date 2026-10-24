const fs = require('fs');
let text = fs.readFileSync('src/pages/Register.jsx', 'utf8');

text = text.replace(/<option value="\+234">.*?<\/option>/g, '<option value="+234">🇳🇬 +234</option>');
text = text.replace(/<option value="\+233">.*?<\/option>/g, '<option value="+233">🇬🇭 +233</option>');
text = text.replace(/<option value="\+254">.*?<\/option>/g, '<option value="+254">🇰🇪 +254</option>');
text = text.replace(/<option value="\+27">.*?<\/option>/g, '<option value="+27">🇿🇦 +27</option>');

fs.writeFileSync('src/pages/Register.jsx', text, 'utf8');
