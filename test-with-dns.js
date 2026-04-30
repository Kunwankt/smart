const dns = require('dns');
const { MongoClient } = require('mongodb');

// Try setting public DNS servers
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function test() {
  const uri = "mongodb+srv://kunwarnkt_db_user:6g9uoCuXzaHsXMO@cluster0.0lv7zp.mongodb.net/app?retryWrites=true&w=majority";
  console.log('Testing connection with public DNS (8.8.8.8)...');
  
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log('CONNECTED SUCCESS!');
    const db = client.db('app');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    await client.close();
  } catch (err) {
    console.error('FAILED even with public DNS:', err.message);
  }
}

test();
