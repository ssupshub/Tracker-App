const mongoose = require('mongoose');

// Track database connection status globally
let dbConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    dbConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    dbConnected = false;
    console.warn(`⚠ MongoDB unavailable: ${error.message}`);
    console.warn('⚠ Running in IN-MEMORY mode — data will not persist across restarts.');
    console.warn('⚠ Connect MongoDB anytime and restart to switch to persistent storage.\n');
  }
};

const isDBConnected = () => dbConnected;

module.exports = { connectDB, isDBConnected };
