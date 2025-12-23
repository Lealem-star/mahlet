const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mernapp';
    console.log(`Attempting to connect with MONGODB_URI: ${MONGODB_URI}`);
    
    // Validate URI is a string
    if (typeof MONGODB_URI !== 'string' || !MONGODB_URI.trim()) {
      throw new Error('MONGODB_URI is not a valid string. Please check your .env file.');
    }
    
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return;
    }
    
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error(`⚠️  MongoDB Connection Error: ${error.message}`);
    console.log('ℹ️  Server will continue running, but database operations will fail.');
    console.log('💡 To fix: Make sure MongoDB is running or update MONGODB_URI in .env file');
    console.log('   Default URI: mongodb://localhost:27017/mernapp\n');
    // Don't exit - let server run without DB for development
  }
};

// Check connection status
const checkConnection = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, checkConnection };

