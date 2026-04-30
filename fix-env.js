// Script to fix the .env.local file
const fs = require('fs');

const correctEnv = `MONGODB_URI="mongodb+srv://kunwarnkt_db_user:6g9uoCuXzaHsXMO@cluster0.0lv7zp.mongodb.net/app?retryWrites=true&w=majority"
MONGODB_DB="app"
ADMIN_API_KEY="ankit112"
NEXT_PUBLIC_ADMIN_KEY="ankit112"
`;

console.log('Your .env.local should contain:');
console.log(correctEnv);

console.log('\nCurrent issues in your .env.local:');
console.log('1. MongoDB URI missing /app database name');
console.log('2. Duplicate ADMIN_API_KEY line');
console.log('3. Network connectivity to MongoDB cluster');

console.log('\nTo fix:');
console.log('1. Update your .env.local with the content above');
console.log('2. Restart your dev server');
console.log('3. Try admin login with password: ankit112');
