// Check environment variables and test authentication
const http = require('http');

console.log('=== Environment Variables Check ===');

// Simulate what Next.js loads
require('dotenv').config({ path: '.env.local' });

console.log('ADMIN_API_KEY:', process.env.ADMIN_API_KEY ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_ADMIN_KEY:', process.env.NEXT_PUBLIC_ADMIN_KEY ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test authentication with different passwords
function testAuth(password, description) {
  console.log(`\n=== Testing ${description} ===`);
  console.log('Password:', password);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/building',
    method: 'GET',
    headers: {
      'x-admin-key': password,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('Response:', parsed);
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.log(`Request error: ${e.message}`);
  });

  req.end();
}

// Test common scenarios
testAuth('ankit112', 'Development Default');
testAuth('change-me', 'Example Default');
testAuth('', 'Empty Password');

console.log('\n=== Recommendations ===');
console.log('1. Make sure your .env.local contains:');
console.log('   ADMIN_API_KEY="ankit112"');
console.log('   NEXT_PUBLIC_ADMIN_KEY="ankit112"');
console.log('2. Restart your dev server after changing .env.local');
console.log('3. Try password: ankit112');
