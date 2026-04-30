// Simple debug script to test admin authentication
// Run this with: node debug-admin.js

const http = require('http');

function testAdminAuth(password) {
  console.log(`Testing with password: "${password}"`);
  
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
    console.log(`Headers:`, res.headers);
    
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
console.log('Testing admin authentication...\n');
console.log('Make sure your dev server is running on localhost:3000\n');

testAdminAuth('ankit112');
testAdminAuth('change-me');
testAdminAuth('');
