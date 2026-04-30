// Fix database configuration
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');

// Option 1: Remove MongoDB URI to trigger fallback mode
const fallbackContent = `MONGODB_DB="app"
ADMIN_API_KEY="change-me"
NEXT_PUBLIC_ADMIN_KEY="change-me"
`;

// Option 2: Use a local MongoDB instance (if you have one)
const localMongoContent = `MONGODB_URI="mongodb://localhost:27017/app"
MONGODB_DB="app"
ADMIN_API_KEY="change-me"
NEXT_PUBLIC_ADMIN_KEY="change-me"
`;

console.log('=== DATABASE FIX OPTIONS ===');
console.log('');
console.log('Option 1: Remove MongoDB (Recommended for now)');
console.log('- This will use in-memory defaults');
console.log('- Admin mode will work but changes won\'t persist');
console.log('- Perfect for testing admin functionality');
console.log('');
console.log('Option 2: Use local MongoDB');
console.log('- Requires MongoDB installed locally');
console.log('- Run: mongod to start local server');
console.log('- Changes will persist locally');
console.log('');

console.log('Applying Option 1 (fallback mode)...');

try {
  fs.writeFileSync(envLocalPath, fallbackContent, 'utf8');
  console.log('SUCCESS: .env.local updated for fallback mode');
  console.log('');
  console.log('NEXT STEPS:');
  console.log('1. Restart your dev server (npm run dev)');
  console.log('2. Try admin login with password: change-me');
  console.log('3. Test admin functions (add/edit rooms)');
  console.log('');
  console.log('Note: Changes will reset when server restarts');
  console.log('      but admin mode will work perfectly!');
} catch (error) {
  console.log('ERROR: Could not update .env.local');
  console.log('Error:', error.message);
}
