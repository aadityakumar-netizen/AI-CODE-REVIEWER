const rateLimit = require('express-rate-limit');

// A general ceiling on any single client hammering the API.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// A much stricter limit specifically on review creation — each one
// triggers a real AI call, which is slow and (with a paid provider)
// costs money. This is the endpoint worth protecting most.
const reviewCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many review requests. Please slow down.' },
});

module.exports = { generalLimiter, reviewCreationLimiter };
