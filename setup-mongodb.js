// Setup MongoDB for persistent storage
const fs = require('fs');
const path = require('path');

console.log('=== MONGODB SETUP OPTIONS ===');
console.log('');

// Option 1: Try fixing the current MongoDB URI
const fixedMongoContent = `MONGODB_URI="mongodb+srv://kunwarn:987654321@cluster0.ddpv7a2.mongodb.net/app?retryWrites=true&w=majority&connectTimeoutMS=30000&serverSelectionTimeoutMS=30000"
MONGODB_DB="app"
ADMIN_API_KEY="change-me"
NEXT_PUBLIC_ADMIN_KEY="change-me"
`;

// Option 2: Use MongoDB Atlas free tier (you'll need to create an account)
const atlasContent = `MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/app?retryWrites=true&w=majority"
MONGODB_DB="app"
ADMIN_API_KEY="change-me"
NEXT_PUBLIC_ADMIN_KEY="change-me"
`;

// Option 3: Use local MongoDB (install MongoDB Community Server)
const localMongoContent = `MONGODB_URI="mongodb://localhost:27017/app"
MONGODB_DB="app"
ADMIN_API_KEY="change-me"
NEXT_PUBLIC_ADMIN_KEY="change-me"
`;

console.log('Option 1: Fix current MongoDB URI');
console.log('- Adds timeout settings to your existing cluster');
console.log('- May work if the cluster is accessible');
console.log('');
console.log('Option 2: Use MongoDB Atlas (Recommended)');
console.log('- Free tier available');
console.log('- Reliable cloud hosting');
console.log('- Need to create account and cluster');
console.log('');
console.log('Option 3: Use local MongoDB');
console.log('- Install MongoDB Community Server');
console.log('- Run: mongod to start server');
console.log('- Changes persist locally only');
console.log('');

// Try Option 1 first
console.log('Trying Option 1: Fix current MongoDB URI...');

const envLocalPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envLocalPath, fixedMongoContent, 'utf8');
  console.log('SUCCESS: Updated .env.local with fixed MongoDB URI');
  console.log('');
  console.log('NEXT STEPS:');
  console.log('1. Restart your dev server (npm run dev)');
  console.log('2. Try admin login with password: change-me');
  console.log('3. Try saving changes');
  console.log('');
  console.log('If this doesn\'t work, consider:');
  console.log('- Setting up MongoDB Atlas (Option 2)');
  console.log('- Installing local MongoDB (Option 3)');
} catch (error) {
  console.log('ERROR: Could not update .env.local');
  console.log('Error:', error.message);
}
