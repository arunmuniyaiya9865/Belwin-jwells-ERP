const fs = require('fs');
const path = require('path');

const routesDir = 'routes';
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Don't auto-protect authRoutes, we handle that manually or we already know login should be public
  if (file === 'authRoutes.js') return;
  if (file === 'searchRoutes.js') return; // already protected

  // 1. Add protect import if missing
  if (!content.includes('const { protect } = require(') && !content.includes('const { protect, admin } = require(')) {
      // Find where express is required
      content = content.replace(
        /const router = express\.Router\(\);/,
        "const router = express.Router();\nconst { protect } = require('../middleware/authMiddleware');"
      );
  }

  // 2. Remove guestUser definition completely
  content = content.replace(/const guestUser = \([^)]*\) => {[\s\S]*?next\(\);\n};\n?/g, '');

  // 3. Replace `guestUser` usage with `protect`
  content = content.replace(/guestUser,/g, 'protect,');

  // 4. Inject `protect` into all router.get/post/put/delete that don't have it
  // We need to be careful with chained routes like `.route('/').get(...)`
  // The safest way is to match `router.(get|post|put|delete)('/path', handler)`
  // Regex: router\.(get|post|put|delete)\(\s*(['`"].*?['`"])\s*,/g
  // We replace it with: router.$1($2, protect,
  // But we only want to do this if `protect` isn't already the next argument
  content = content.replace(/router\.(get|post|put|delete)\(\s*(['`"][^'"`]+['`"])\s*,\s*(?!protect\b)(?!admin\b)(?!guestUser\b)/g, 
    "router.$1($2, protect, "
  );
  
  // What if it is `.get(handler)` in a chained route?
  // e.g. `.get(getCustomers)`
  content = content.replace(/\.(get|post|put|delete)\(\s*(?!protect\b)(?!admin\b)(?!guestUser\b)(?!['`"])/g,
    ".$1(protect, "
  );

  // If there are duplicate `protect, protect,` due to multiple runs, fix them:
  content = content.replace(/protect,\s*protect,/g, 'protect,');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Protected routes in ${file}`);
  }
});
console.log('Backend routes protection script completed');
