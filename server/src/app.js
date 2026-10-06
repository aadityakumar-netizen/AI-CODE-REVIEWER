const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const env = require('./config/env');
const connectDB = require('./config/db');

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { generalLimiter } = require('./middleware/rateLimiters');

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (env.nodeEnv === 'development') {
        if (!origin || /^https?:\/\/localhost:\d+$/.test(origin)) {
          return callback(null, true);
        }
      }

      if (!origin || origin === env.corsOrigin) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin not allowed.'));
    },
  })
);

app.use(generalLimiter);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running.',
  });
});

// Ensure MongoDB is connected before any database-dependent API route.
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    next(error);
  }
});

app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/github', require('./routes/github'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;