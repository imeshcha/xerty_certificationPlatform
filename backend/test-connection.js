const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log('Testing connection to MongoDB Atlas URI...');
  console.log('Target host:', uri ? uri.split('@')[1] : 'Undefined');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log('==============================================');
    console.log('✅ SUCCESS: Successfully connected to MongoDB Atlas!');
    console.log('Database Name:', conn.connection.name);
    console.log('Host:', conn.connection.host);
    console.log('ReadyState:', conn.connection.readyState === 1 ? 'Connected (1)' : conn.connection.readyState);

    // List collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Existing Collections:', collections.map(c => c.name));
    console.log('==============================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('==============================================');
    console.error('❌ FAILED: MongoDB Atlas connection error:');
    console.error(error.message);
    console.error('==============================================');
    process.exit(1);
  }
}

testConnection();
