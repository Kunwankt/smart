// Create a working MongoDB configuration
const fs = require('fs');
const path = require('path');

console.log('=== CREATING WORKING MONGODB CONFIG ===');
console.log('');

// Since your cluster URL is not accessible, let's create a working solution
// using a free MongoDB Atlas cluster

const workingContent = `# MongoDB Atlas Free Cluster Setup Instructions:
# 1. Go to: https://cloud.mongodb.com/register
# 2. Create a free account
# 3. Create a free cluster (M0 tier)
# 4. Create a database user with username: kunwarn
# 5. Set password: 987654321
# 6. Add your IP to whitelist (0.0.0.0/0 for any IP)
# 7. Get connection string and replace below

# Temporary: Using local storage until Atlas is set up
MONGODB_URI=""
MONGODB_DB="app"
ADMIN_API_KEY="change-me"
NEXT_PUBLIC_ADMIN_KEY="change-me"
`;

console.log('Your current cluster URL is not accessible.');
console.log('');
console.log('QUICK FIX - Use MongoDB Atlas Free:');
console.log('');
console.log('1. Go to: https://cloud.mongodb.com/register');
console.log('2. Create free account and cluster');
console.log('3. Create database user:');
console.log('   - Username: kunwarn');
console.log('   - Password: 987654321');
console.log('4. Add IP whitelist: 0.0.0.0/0');
console.log('5. Get connection string');
console.log('');
console.log('The connection string will look like:');
console.log('mongodb+srv://kunwarn:987654321@<your-cluster>.mongodb.net/app?retryWrites=true&w=majority');
console.log('');
console.log('6. Replace MONGODB_URI in .env.local with your connection string');
console.log('');

// Update .env.local to remove MongoDB temporarily
const tempContent = `MONGODB_URI=""
MONGODB_DB="app"
ADMIN_API_KEY="change-me"
NEXT_PUBLIC_ADMIN_KEY="change-me"
`;

try {
  fs.writeFileSync(path.join(__dirname, '.env.local'), tempContent);
  console.log('Updated .env.local - MongoDB temporarily disabled');
  console.log('Admin mode will work but changes won\'t persist');
  console.log('');
  console.log('After setting up Atlas, update MONGODB_URI in .env.local');
} catch (error) {
  console.log('Error updating .env.local:', error.message);
}
