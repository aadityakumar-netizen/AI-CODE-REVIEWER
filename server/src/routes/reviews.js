const express = require('express');

const protect = require('../middleware/auth');
const validateReview = require('../middleware/validateReview');
const { reviewCreationLimiter } = require('../middleware/rateLimiters');

const {
  createReview,
  getReviews,
  getReviewById,
  deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();

// All review routes require authentication
router.use(protect);

router.post(
  '/',
  reviewCreationLimiter,
  validateReview,
  createReview
);

router.get('/', getReviews);

router.get('/:id', getReviewById);

router.delete('/:id', deleteReview);

module.exports = router;