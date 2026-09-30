const mongoose = require('mongoose');
const Review = require('../models/Review');
const { generateReview } = require('../services/aiReviewService');
const validateAIOutput = require('../utils/validateAIOutput');

async function createReview(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      const error = new Error('User authentication is required.');
      error.statusCode = 401;
      return next(error);
    }

    const { language, sourceCode } = req.body;

    const aiOutput = await generateReview({
      language,
      sourceCode,
    });

    validateAIOutput(aiOutput);

    const review = await Review.create({
      user: req.user.id,
      language,
      sourceCode,
      score: aiOutput.score,
      scoreBreakdown: aiOutput.scoreBreakdown,
      summary: aiOutput.summary,
      issues: aiOutput.issues || [],
      strengths: aiOutput.strengths || [],
      improvedCode: aiOutput.improvedCode || '',
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

async function getReviews(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      const error = new Error('User authentication is required.');
      error.statusCode = 401;
      return next(error);
    }

    const reviews = await Review.find({
      user: req.user.id,
    })
      .select('language score scoreBreakdown summary issues createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
}

async function getReviewById(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      const error = new Error('Invalid review ID.');
      error.statusCode = 400;
      return next(error);
    }

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!review) {
      const error = new Error('Review not found.');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteReview(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      const error = new Error('Invalid review ID.');
      error.statusCode = 400;
      return next(error);
    }

    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!review) {
      const error = new Error('Review not found.');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  deleteReview,
};