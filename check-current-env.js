// Check current .env.local content
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');

console.log('=== CHECKING CURRENT .env.local ===');
console.log('');

try {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  console.log('Current .env.local content:');
  console.log(content);
  console.log('');
  
  // Parse environment variables
  const lines = content.split('\n');
  const envVars = {};
  
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/"/g, '');
      }
    }
  });
  
  console.log('Parsed environment variables:');
  Object.entries(envVars).forEach(([key, value]) => {
    if (key.includes('MONGODB')) {
      console.log(`${key}: ${value || '(empty)'}`);
    }
  });
  
  console.log('');
  console.log('Issue Analysis:');
  if (!envVars.MONGODB_URI || envVars.MONGODB_URI === '') {
    console.log('MONGODB_URI is empty - this should prevent connection attempts');
  } else {
    console.log('MONGODB_URI is set - this is causing the 30-second timeouts');
    console.log('The application is trying to connect to:', envVars.MONGODB_URI);
  }
  
} catch (error) {
  console.log('Error reading .env.local:', error.message);
}
