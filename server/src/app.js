const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { generalLimiter } = require('./middleware/rateLimiters');

const app = express();

// Sets a batch of security-related HTTP headers (e.g. disabling
// X-Powered-By, blocking MIME-sniffing) that are good defaults for
// any Express API and cost nothing to enable.
app.use(helmet());

// Restrict cross-origin requests to the known frontend URL rather than
// allowing any origin ('*'). In development this is the Vite dev
// server; in production it would be set to the deployed frontend's
// real URL via CORS_ORIGIN.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Vite's changing localhost port during development.
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

// Applies to every route below this line.
app.use(generalLimiter);

// Parses incoming JSON request bodies into req.body.
// Needed as soon as any route accepts a POST/PUT with a JSON payload
// (e.g. POST /api/reviews with { language, sourceCode }).
app.use(express.json({ limit: '1mb' }));

// Simple health check — useful for confirming the server is alive,
// and for things like uptime monitors or deployment platforms later.
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running.' });
});

// Real feature routes
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/github', require('./routes/github'));

// In production, serve the built React app from this same server —
// the simplest deployment shape for a small project (one service,
// one URL, no separate static host to configure). In development,
// the frontend runs on its own Vite dev server instead, so this
// block is skipped entirely.
if (env.nodeEnv === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // Any GET request that isn't an API route AND doesn't look like a
  // file request (no extension, e.g. /history) falls through to the
  // SPA's index.html — so client-side routes work on a hard refresh.
  // Requests for an actual file that's missing (e.g. a stale JS chunk)
  // still correctly 404 instead of silently getting index.html back.
  app.get(/^(?!\/api).*/, (req, res, next) => {
    const looksLikeFileRequest = path.extname(req.path) !== '';
    if (looksLikeFileRequest) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Order matters: notFound only runs if nothing above matched,
// and errorHandler must be registered LAST so Express treats it
// as the error-handling middleware.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
