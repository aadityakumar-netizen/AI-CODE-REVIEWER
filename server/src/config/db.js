const mongoose = require('mongoose');
const env = require('./env');

let connectionPromise = null;

async function connectDB() {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is not set. Check your .env file.');
  }

  // Already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Connection already in progress
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(env.mongodbUri)
    .then(() => {
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
}

module.exports = connectDB;