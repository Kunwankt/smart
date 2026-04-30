// Test MongoDB connection
const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = "mongodb://localhost:27017/app";
  const dbName = "app";
  
  console.log('Testing MongoDB connection...');
  console.log('URI:', uri.replace(/:([^@]+)@/, ':***@')); // Hide password
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected successfully to MongoDB!');
    
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test building data collection
    const buildingCol = db.collection('buildingData');
    const existing = await buildingCol.findOne({ _id: "current" });
    console.log('Building data exists:', !!existing);
    
    await client.close();
    console.log('Connection test completed successfully!');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
}

testConnection();
