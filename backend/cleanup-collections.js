const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupOldCollections() {
  const uri = process.env.MONGODB_URI;
  try {
    const conn = await mongoose.connect(uri);
    console.log('Connected to database:', conn.connection.name);

    const collections = await conn.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Current collections before cleanup:', collectionNames);

    const collectionsToDrop = [
      'issuer_profiles',
      'student_profiles',
      'transactions',
      'certificate_batches',
      'certificate_templates',
    ];

    for (const name of collectionsToDrop) {
      if (collectionNames.includes(name)) {
        console.log(`Dropping unused collection: ${name}`);
        await conn.connection.db.collection(name).drop();
      }
    }

    // Ensure the 3 core collections exist with indexes
    await conn.connection.db.createCollection('users').catch(() => {});
    await conn.connection.db.createCollection('courses').catch(() => {});
    await conn.connection.db.createCollection('certificates').catch(() => {});

    const updatedCollections = await conn.connection.db.listCollections().toArray();
    console.log('======================================================');
    console.log('✨ Cleaned 3-Collection Architecture in MongoDB Atlas:');
    console.log(updatedCollections.map(c => `📁 ${c.name}`));
    console.log('======================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Cleanup error:', err.message);
    process.exit(1);
  }
}

cleanupOldCollections();
