const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

// Connect to the database FIRST, and only start accepting HTTP
// requests once that succeeds. If the DB connection fails, the
// process exits instead of running in a broken half-working state.
async function startServer() {
  try {
    await connectDB();

    app.listen(env.port, () => {
      console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
