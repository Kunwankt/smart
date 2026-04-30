// Force clear MongoDB connection and test
const fs = require('fs');
const path = require('path');

console.log('=== FORCE CLEARING MONGODB ===');
console.log('');

// Create a completely clean .env.local without any MongoDB
const cleanContent = `# Database disabled - using in-memory defaults
MONGODB_DB="app"
ADMIN_API_KEY="change-me"
NEXT_PUBLIC_ADMIN_KEY="change-me"
`;

const envLocalPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envLocalPath, cleanContent);
  console.log('SUCCESS: .env.local cleared of MongoDB URI');
  console.log('');
  console.log('NEW .env.local CONTENT:');
  console.log(cleanContent);
  console.log('');
  console.log('NEXT STEPS:');
  console.log('1. Stop the current dev server (Ctrl+C)');
  console.log('2. Clear Next.js cache: rm -rf .next');
  console.log('3. Restart: npm run dev');
  console.log('');
  console.log('This should eliminate all MongoDB connection attempts');
} catch (error) {
  console.log('Error updating .env.local:', error.message);
}
