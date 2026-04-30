// Diagnose MongoDB connection issues
const dns = require('dns');
const https = require('https');

console.log('=== MONGODB CONNECTION DIAGNOSTICS ===');
console.log('');

async function diagnoseConnection() {
  const clusterHost = 'cluster0.ddpv7a2.mongodb.net';
  
  console.log('1. Testing DNS resolution...');
  try {
    const addresses = await new Promise((resolve, reject) => {
      dns.resolve4(clusterHost, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    console.log('DNS Resolution: SUCCESS');
    console.log('IP Addresses:', addresses);
  } catch (error) {
    console.log('DNS Resolution: FAILED');
    console.log('Error:', error.message);
    console.log('');
    console.log('POSSIBLE CAUSES:');
    console.log('- Cluster URL is incorrect');
    console.log('- Network/firewall blocking DNS');
    console.log('- Cluster is not active');
    return;
  }
  
  console.log('');
  console.log('2. Testing network connectivity...');
  try {
    await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: clusterHost,
        port: 443,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log('Network Test: SUCCESS');
        console.log('HTTP Status:', res.statusCode);
        resolve();
      });
      
      req.on('error', (err) => {
        console.log('Network Test: FAILED');
        console.log('Error:', err.message);
        reject(err);
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Connection timeout'));
      });
      
      req.end();
    });
  } catch (error) {
    console.log('');
    console.log('POSSIBLE CAUSES:');
    console.log('- Firewall blocking MongoDB Atlas');
    console.log('- Proxy settings interfering');
    console.log('- Internet connectivity issues');
  }
  
  console.log('');
  console.log('=== SOLUTIONS ===');
  console.log('');
  console.log('1. Check MongoDB Atlas Dashboard:');
  console.log('   - Login to https://cloud.mongodb.com');
  console.log('   - Verify cluster is active');
  console.log('   - Check cluster URL: cluster0.ddpv7a2.mongodb.net');
  console.log('   - Verify username: kunwarn');
  console.log('');
  console.log('2. Try alternative connection:');
  console.log('   - Use VPN if network is restricted');
  console.log('   - Check if corporate firewall blocks MongoDB');
  console.log('');
  console.log('3. Update cluster settings:');
  console.log('   - Add your IP to whitelist in Atlas');
  console.log('   - Allow access from anywhere (0.0.0.0/0)');
}

diagnoseConnection().catch(console.error);
