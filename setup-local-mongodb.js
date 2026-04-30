// Setup local MongoDB for persistent storage
const fs = require('fs');
const path = require('path');

console.log('=== LOCAL MONGODB SETUP ===');
console.log('');

const localMongoContent = `MONGODB_URI="mongodb://localhost:27017/app"
MONGODB_DB="app"
ADMIN_API_KEY="change-me"
NEXT_PUBLIC_ADMIN_KEY="change-me"
`;

const envLocalPath = path.join(__dirname, '.env.local');

console.log('Setting up local MongoDB connection...');
console.log('');

try {
  fs.writeFileSync(envLocalPath, localMongoContent, 'utf8');
  console.log('SUCCESS: .env.local updated for local MongoDB');
  console.log('');
  console.log('=== SETUP INSTRUCTIONS ===');
  console.log('');
  console.log('Option A: Install MongoDB Community Server');
  console.log('1. Download: https://www.mongodb.com/try/download/community');
  console.log('2. Install MongoDB Community Server');
  console.log('3. Start MongoDB service');
  console.log('   - Windows: Run as service or use mongod command');
  console.log('   - Mac: brew services start mongodb-community');
  console.log('4. Restart your dev server');
  console.log('');
  console.log('Option B: Use Docker (Recommended)');
  console.log('1. Install Docker Desktop');
  console.log('2. Run: docker run --name mongodb -p 27017:27017 -d mongo');
  console.log('3. Restart your dev server');
  console.log('');
  console.log('Option C: Use MongoDB Atlas (Cloud)');
  console.log('1. Sign up: https://www.mongodb.com/cloud/atlas/register');
  console.log('2. Create free cluster');
  console.log('3. Get connection string');
  console.log('4. Update .env.local with your Atlas URI');
  console.log('');
  console.log('=== TESTING ===');
  console.log('After setup, test with: node test-mongodb.js');
  console.log('');
  console.log('=== CURRENT STATUS ===');
  console.log('Local MongoDB connection configured in .env.local');
  console.log('Ready to connect once MongoDB is running');
} catch (error) {
  console.log('ERROR: Could not update .env.local');
  console.log('Error:', error.message);
}
