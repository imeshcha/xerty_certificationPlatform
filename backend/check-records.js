const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabaseRecords() {
  const uri = process.env.MONGODB_URI;
  try {
    const conn = await mongoose.connect(uri);
    console.log('Connected to database:', conn.connection.name);

    const users = await conn.connection.db.collection('users').find({}).toArray();
    const issuers = await conn.connection.db.collection('issuer_profiles').find({}).toArray();
    const students = await conn.connection.db.collection('student_profiles').find({}).toArray();
    const courses = await conn.connection.db.collection('courses').find({}).toArray();
    const certificates = await conn.connection.db.collection('certificates').find({}).toArray();

    console.log('======================================================');
    console.log(`📊 Users count: ${users.length}`);
    if (users.length > 0) {
      console.log('Users:', JSON.stringify(users, null, 2));
    }

    console.log(`🏛️ Issuer Profiles count: ${issuers.length}`);
    if (issuers.length > 0) {
      console.log('Issuers:', JSON.stringify(issuers, null, 2));
    }

    console.log(`🎓 Student Profiles count: ${students.length}`);
    if (students.length > 0) {
      console.log('Students:', JSON.stringify(students, null, 2));
    }

    console.log(`📚 Courses count: ${courses.length}`);
    console.log(`📜 Certificates count: ${certificates.length}`);
    console.log('======================================================');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error querying MongoDB:', err.message);
  }
}

checkDatabaseRecords();
