// Fix MongoDB URI to work with your cluster
const fs = require('fs');
const path = require('path');

console.log('=== FIXING MONGODB URI ===');
console.log('');

// Try different URI formats for your cluster
const options = [
  {
    name: 'Option 1: Direct connection (no SRV)',
    uri: `mongodb://kunwarn:987654321@cluster0.ddpv7a2.mongodb.net/app?retryWrites=true&w=majority&directConnection=true`
  },
  {
    name: 'Option 2: SRV with different cluster URL',
    uri: `mongodb+srv://kunwarn:987654321@ddpv7a2.mongodb.net/app?retryWrites=true&w=majority`
  },
  {
    name: 'Option 3: SRV with full cluster name',
    uri: `mongodb+srv://kunwarn:987654321@cluster0-shard-00-00.ddpv7a2.mongodb.net/app?retryWrites=true&w=majority`
  },
  {
    name: 'Option 4: Your original with timeouts',
    uri: `mongodb+srv://kunwarn:987654321@cluster0.ddpv7a2.mongodb.net/app?retryWrites=true&w=majority&connectTimeoutMS=60000&serverSelectionTimeoutMS=60000`
  }
];

console.log('Testing different MongoDB URI formats...');
console.log('');

// Update test script to try each option
const testScript = `
// Test different MongoDB URI options
const { MongoClient } = require('mongodb');

const options = ${JSON.stringify(options, null, 2)};

async function testAllOptions() {
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    console.log(\`\\n=== \${option.name} ===\`);
    console.log('URI:', option.uri.replace(/:([^@]+)@/, ':***@'));
    
    try {
      const client = new MongoClient(option.uri);
      await client.connect();
      console.log('SUCCESS: Connected!');
      await client.close();
      
      // Update .env.local with working URI
      const fs = require('fs');
      const envContent = \`MONGODB_URI="\${option.uri}"
MONGODB_DB="app"
ADMIN_API_KEY="change-me"
NEXT_PUBLIC_ADMIN_KEY="change-me"
\`;
      fs.writeFileSync('.env.local', envContent);
      console.log('Updated .env.local with working URI!');
      return option.name;
    } catch (error) {
      console.log('FAILED:', error.message);
    }
  }
  console.log('\\nNo URI worked. Consider:');
  console.log('1. Check MongoDB Atlas cluster status');
  console.log('2. Verify credentials');
  console.log('3. Check network/firewall settings');
}

testAllOptions();
`;

fs.writeFileSync(path.join(__dirname, 'test-all-uris.js'), testScript);
console.log('Created test-all-uris.js');
console.log('');
console.log('Run: node test-all-uris.js');
console.log('This will test all URI formats and update .env.local with the working one');
