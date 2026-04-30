// Simple authentication test
const http = require('http');

console.log('=== Admin Authentication Test ===');
console.log('Make sure your dev server is running on localhost:3000\n');

function testAuth(password, description) {
  console.log(`=== Testing ${description} ===`);
  console.log('Password:', `"${password}"`);
  
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

// Test common passwords
testAuth('ankit112', 'Development Default');
testAuth('change-me', 'Example Default');

console.log('\n=== If all tests show 401 Unauthorized ===');
console.log('Your .env.local file is not being read correctly.');
console.log('Check that your .env.local contains:');
console.log('ADMIN_API_KEY="ankit112"');
console.log('NEXT_PUBLIC_ADMIN_KEY="ankit112"');
console.log('\nAnd restart your dev server.');
