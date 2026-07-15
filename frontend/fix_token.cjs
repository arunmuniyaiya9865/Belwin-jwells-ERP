const fs = require('fs');

const fixFile = (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  // In useLoanSearch.js
  content = content.replace(
    "const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');\n            const config = userInfo?.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};",
    "const token = localStorage.getItem('token');\n            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};"
  );
  // In CustomerHistory.jsx
  content = content.replace(
    "const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');\n      const config = userInfo?.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};",
    "const token = localStorage.getItem('token');\n      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};"
  );
  fs.writeFileSync(filepath, content, 'utf8');
};

fixFile('src/hooks/useLoanSearch.js');
fixFile('src/pages/employee/loan/CustomerHistory.jsx');
console.log('Fixed token bugs');
