const mongoose = require('mongoose');
const env = require('./env');

// Connects to MongoDB and resolves once the connection is ready.
// Kept separate from server.js so server.js only has to say
// "connect, then start listening" without knowing the details of *how*.
async function connectDB() {
  if (!env.mongodbUri) {
    // Fail fast and loud: a server with no DB configured shouldn't
    // silently boot and accept requests it can't actually fulfill.
    throw new Error('MONGODB_URI is not set. Check your .env file.');
  }

  await mongoose.connect(env.mongodbUri);

  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDB;
