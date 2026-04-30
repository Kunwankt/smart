const https = require('https');
const { MongoClient } = require('mongodb');

async function resolveSrvOverHttps(srvName) {
  return new Promise((resolve, reject) => {
    https.get(`https://dns.google/resolve?name=${srvName}&type=SRV`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.Answer) {
          resolve(json.Answer.map(a => {
            // Answer looks like "priority weight port target"
            const parts = a.data.split(' ');
            return {
              port: parts[2],
              target: parts[3].replace(/\.$/, '')
            };
          }));
        } else {
          reject(new Error('No SRV records found'));
        }
      });
    }).on('error', reject);
  });
}

async function test() {
  const srv = '_mongodb._tcp.cluster0.ddpv7a2.mongodb.net';
  console.log(`Resolving SRV over HTTPS: ${srv}`);
  
  try {
    const shards = await resolveSrvOverHttps(srv);
    console.log('Shards found:', shards);
    
    // Construct standard connection string
    // mongodb://user:pass@host1:port,host2:port/db?ssl=true&authSource=admin
    const hosts = shards.map(s => `${s.target}:${s.port}`).join(',');
    const uri = `mongodb://kunwarn:6g9uoCuXzaHsXMO@${hosts}/app?ssl=true&authSource=admin&retryWrites=true&w=majority`;
    
    console.log('Testing connection with standard URI...');
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    console.log('CONNECTED SUCCESS!');
    const db = client.db('app');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    await client.close();
  } catch (err) {
    console.error('FAILED even with HTTPS DNS resolution:', err.message);
  }
}

test();
