const fs = require('fs');
const path = require('path');

const srcDir = 'src';

// Helper to get relative path to api.js
const getApiImportPath = (currentFilePath) => {
  const apiPath = path.resolve('src/services/api'); // without .js
  const dirPath = path.dirname(path.resolve(currentFilePath));
  let relPath = path.relative(dirPath, apiPath).replace(/\\/g, '/');
  if (!relPath.startsWith('.')) {
    relPath = './' + relPath;
  }
  return relPath;
};

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Skip api.js itself
  if (filePath.endsWith('api.js')) return;

  let modified = false;

  // 1. Replace axios imports with api imports
  if (content.includes("import axios from 'axios';")) {
    const apiImportPath = getApiImportPath(filePath);
    content = content.replace("import axios from 'axios';", `import api from '${apiImportPath}';`);
    modified = true;
  }
  // Also handle double quotes
  if (content.includes('import axios from "axios";')) {
    const apiImportPath = getApiImportPath(filePath);
    content = content.replace('import axios from "axios";', `import api from '${apiImportPath}';`);
    modified = true;
  }

  // 2. Replace all http://localhost:5000/api with '' because api.js has baseURL
  // Note: we need to replace `axios.get(...)` with `api.get(...)` first
  
  if (content.includes('axios.')) {
    content = content.replace(/axios\./g, 'api.');
    modified = true;
  }

  // Handle URL replacements
  // E.g. `http://localhost:5000/api/loans` -> `/loans`
  // E.g. 'http://localhost:5000/api/loans' -> '/loans'
  content = content.replace(/['"`]http:\/\/localhost:5000\/api([^'"`]*)['"`]/g, "'$1'");
  
  // Clean up any double quotes replaced with single quotes in templates? No, template literals might have variables.
  // Actually, replace `http://localhost:5000/api` with nothing inside template literals
  content = content.replace(/`http:\/\/localhost:5000\/api([^`]*)`/g, "`$1`");

  // Handle cases where BASE_URL was used
  content = content.replace(/const BASE_URL = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000';\n?/g, '');
  content = content.replace(/const API = `\$\{BASE_URL\}\/api\/([a-zA-Z0-9-]+)`;/g, "const API = '/$1';");

  // Fix authHeader manual configs in services
  // Specifically customerService.js manual auth
  if (content.includes('const authHeader = () => {')) {
    // We will just remove it, but it might be tricky to regex.
    // Instead of complex regex, let's just let api handle auth and we remove configs manually or via simpler regex.
    // Actually, `...authHeader()` is used in `makeConfig`. 
    content = content.replace(/const authHeader = \(\) => \{[\s\S]*?\};\n/g, '');
    content = content.replace(/\.\.\.authHeader\(\), /g, '');
  }

  // Remove `useLoanSearch` custom config token logic
  if (filePath.includes('useLoanSearch')) {
    content = content.replace(/const token = localStorage\.getItem\('token'\);\s*const config = token \? \{ headers: \{ Authorization: `Bearer \$\{token\}` \} \} : \{\};\s*const response = await api\.get\(`\/search\/loan\/\$\{searchValue\.trim\(\)\}`, config\);/g, 
      "const response = await api.get(`/search/loan/${searchValue.trim()}`);");
  }
  
  // Remove CustomerHistory custom config token logic
  if (filePath.includes('CustomerHistory')) {
    content = content.replace(/const token = localStorage\.getItem\('token'\);\s*const config = token \? \{ headers: \{ Authorization: `Bearer \$\{token\}` \} \} : \{\};\s*const response = await api\.get\(`\/customer-history\/\$\{customerId\}`, config\);/g,
      "const response = await api.get(`/customer-history/${customerId}`);");
  }

  // Let's remove the raw config from all Employee components (e.g. EmployeeList, EmployeeForm)
  content = content.replace(/, \{\s*headers:\s*\{\s*Authorization:\s*`Bearer \$\{.*?token.*?\}`\s*\}\s*\}/g, '');
  content = content.replace(/, \{\s*headers:\s*\{\s*Authorization:\s*`Bearer \$\{.*?\}`\s*\}\s*\}/g, '');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored: ${filePath}`);
  }
};

const walkSync = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkSync(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
};

walkSync(srcDir);
console.log('Frontend refactoring script completed');
