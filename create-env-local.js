const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');
const content = `MONGODB_URI="mongodb+srv://kunwarn:987654321@cluster0.ddpv7a2.mongodb.net/"
MONGODB_DB="app"
ADMIN_API_KEY="change-me"
NEXT_PUBLIC_ADMIN_KEY="change-me"
`;

console.log('Creating .env.local file...');
console.log('Path:', envLocalPath);
console.log('Content:');
console.log(content);

try {
  fs.writeFileSync(envLocalPath, content, 'utf8');
  console.log('SUCCESS: .env.local file created/updated!');
  console.log('');
  console.log('NEXT STEPS:');
  console.log('1. Stop your current dev server (Ctrl+C)');
  console.log('2. Run: npm run dev');
  console.log('3. Try admin login with password: change-me');
} catch (error) {
  console.log('ERROR: Could not create .env.local file');
  console.log('Error:', error.message);
  console.log('');
  console.log('MANUAL STEPS:');
  console.log('1. Create a file named .env.local in your project root');
  console.log('2. Add this content:');
  console.log(content);
  console.log('3. Restart your dev server');
}
