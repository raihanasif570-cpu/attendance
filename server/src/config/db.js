const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log('Connecting to provided MongoDB URI...');
      await mongoose.connect(uri);
      console.log(`Connected to MongoDB Atlas / Remote at ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.warn(`Failed to connect to provided MONGODB_URI: ${err.message}`);
      console.warn('Falling back to local MongoDB or MongoMemoryServer...');
    }
  }

  // Try local MongoDB on 127.0.0.1:27017 first
  try {
    const localUri = 'mongodb://127.0.0.1:27017/college_attendance';
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to local MongoDB instance on port 27017');
    return;
  } catch (localErr) {
    // If local MongoDB is not running, seamlessly start MongoMemoryServer
    console.log('Local MongoDB not available. Initializing In-Memory MongoDB Server...');
    try {
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log('Connected successfully to MongoMemoryServer (In-Memory Database).');
      console.log('Note: To persist to MongoDB Atlas, add your connection string to server/.env: MONGODB_URI=mongodb+srv://...');
    } catch (memErr) {
      console.error('Failed to initialize MongoDB connection:', memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
