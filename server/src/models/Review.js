const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['bug', 'security', 'performance', 'style'],
      required: true,
    },

    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },

    line: {
      type: Number,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    explanation: {
      type: String,
      required: true,
    },

    suggestion: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    language: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    sourceCode: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    scoreBreakdown: {
      correctness: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },

      security: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },

      performance: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },

      maintainability: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },

      quality: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },

    summary: {
      type: String,
      required: true,
    },

    issues: {
      type: [issueSchema],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    improvedCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Review', reviewSchema);