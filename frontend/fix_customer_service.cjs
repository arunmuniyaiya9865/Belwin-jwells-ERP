const fs = require('fs');
const filepath = 'src/services/customerService.js';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/,\s*\{\s*headers:\s*authHeader\(\)\s*\}/g, '');
content = content.replace(/\{\s*headers:\s*authHeader\(\)\s*\}/g, '');

fs.writeFileSync(filepath, content, 'utf8');
console.log('Fixed customerService.js authHeader usages');
