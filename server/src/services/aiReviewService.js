const getAIProvider = require('./aiProviders');
const buildReviewPrompt = require('./promptBuilder');
const extractJson = require('../utils/extractJson');
const validateAIOutput = require('../utils/validateAIOutput');
const buildImprovedCode = require('../utils/buildImprovedCode');
const {
  calculateScoreBreakdown,
  calculateFinalScore,
} = require('../utils/calculateScore');

function buildFallbackSummary(issues) {
  if (!issues.length) {
    return 'No significant issues were identified in the submitted code.';
  }

  const highestSeverity = ['critical', 'high', 'medium', 'low'].find((severity) =>
    issues.some((issue) => issue.severity === severity)
  );

  return `${issues.length} issue${issues.length === 1 ? '' : 's'} identified; the most serious finding is ${highestSeverity}-severity.`;
}

async function generateReview(
  { language, sourceCode },
  provider = getAIProvider()
) {
  const prompt = buildReviewPrompt({ language, sourceCode });
  const rawResponse = await provider.complete(prompt);

  let output;

  try {
    output = extractJson(rawResponse);
  } catch (error) {
    throw new Error(
      `${error.message} Raw response started with: "${String(rawResponse || '').slice(0, 120)}..."`
    );
  }

  if (!output || typeof output !== 'object' || Array.isArray(output)) {
    throw new Error('AI response must be a JSON object.');
  }

  if (typeof output.improvedCode !== 'string') {
    output.improvedCode = '';
  }

  if (!Array.isArray(output.issues)) {
    output.issues = [];
  }

  if (!Array.isArray(output.strengths)) {
    output.strengths = [];
  }

  if (typeof output.summary !== 'string' || !output.summary.trim()) {
    output.summary = buildFallbackSummary(output.issues);
  }

  // Scores are deliberately calculated by the server. The local LLM is
  // responsible for finding issues and strengths, but it cannot repeatedly
  // force the application into the same 80/90 score pattern.
  if (!output.improvedCode.trim()) {
    output.improvedCode = buildImprovedCode({
      sourceCode,
      issues: output.issues,
    });
  }

  const scoreBreakdown = calculateScoreBreakdown({
    sourceCode,
    issues: output.issues,
  });

  output.scoreBreakdown = scoreBreakdown;
  output.score = calculateFinalScore(scoreBreakdown);

  validateAIOutput(output);

  return output;
}

module.exports = {
  generateReview,
};
