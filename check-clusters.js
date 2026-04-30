const dns = require('dns');

const clusters = [
  'cluster0.0lv7zp.mongodb.net',
  'cluster0.ddpv7a2.mongodb.net'
];

async function check() {
  for (const cluster of clusters) {
    console.log(`\nChecking: ${cluster}`);
    try {
      const addresses = await new Promise((resolve, reject) => {
        dns.resolve4(cluster, (err, addr) => {
          if (err) reject(err);
          else resolve(addr);
        });
      });
      console.log('SUCCESS:', addresses);
    } catch (err) {
      console.log('FAILED:', err.code);
    }
  }
}

check();
