// Script to create proper .env.local file
const fs = require('fs');

const envLocalContent = `MONGODB_URI="mongodb+srv://kunwarn:987654321@cluster0.ddpv7a2.mongodb.net/"
MONGODB_DB="app"
ADMIN_API_KEY="change-me"
NEXT_PUBLIC_ADMIN_KEY="change-me"
`;

console.log('=== CREATE .env.local FILE ===');
console.log('Your .env.local file should contain exactly this:');
console.log('');
console.log(envLocalContent);
console.log('');

// Check if .env.local exists
if (fs.existsSync('.env.local')) {
  console.log('WARNING: .env.local already exists!');
  console.log('Please replace its contents with the above.');
} else {
  console.log('Create a new file named .env.local with the above content.');
}

console.log('');
console.log('IMPORTANT STEPS:');
console.log('1. Create/update .env.local with the content above');
console.log('2. Restart your dev server (npm run dev)');
console.log('3. Try admin login with password: change-me');
console.log('');
console.log('This will fix the authorization issue because:');
console.log('- Next.js prioritizes .env.local over .env');
console.log('- Both frontend and backend will use the same key');
console.log('- No hardcoded fallbacks will interfere');
