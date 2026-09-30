const WEIGHTS = {
  correctness: 0.30,
  security: 0.25,
  performance: 0.15,
  maintainability: 0.15,
  quality: 0.15,
};

const SEVERITY_PENALTIES = {
  critical: 40,
  high: 25,
  medium: 12,
  low: 5,
};

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function issueMatches(issue, terms) {
  const text = `${issue?.title || ''} ${issue?.explanation || ''}`.toLowerCase();
  return terms.some((term) => text.includes(term));
}

function calculateScoreBreakdown({ sourceCode = '', issues = [] } = {}) {
  const code = String(sourceCode);
  const normalizedIssues = Array.isArray(issues) ? issues : [];

  // Start from a clean-code baseline. Scores fall only when there is evidence
  // of a problem, rather than assuming every submission begins at 90.
  const scores = {
    correctness: 100,
    security: 100,
    performance: 100,
    maintainability: 100,
    quality: 100,
  };

  const applyIssuePenalty = (category, issue) => {
    const penalty = SEVERITY_PENALTIES[issue?.severity] || 0;
    if (penalty) scores[category] -= penalty;
  };

  for (const issue of normalizedIssues) {
    switch (issue?.type) {
      case 'bug':
        applyIssuePenalty('correctness', issue);
        break;
      case 'security':
        applyIssuePenalty('security', issue);
        break;
      case 'performance':
        applyIssuePenalty('performance', issue);
        break;
      case 'style':
        applyIssuePenalty('maintainability', issue);
        applyIssuePenalty('quality', issue);
        break;
      default:
        break;
    }
  }

  // High-confidence source-code signals. We only apply these when the AI has
  // not already reported the same issue, preventing double penalties.
  const hasSqlInjection =
    /(?:SELECT|INSERT|UPDATE|DELETE)[\s\S]{0,500}(?:\+|\$\{)[\s\S]{0,500}(?:username|password|input|query|id)/i.test(code) &&
    /(?:SELECT|INSERT|UPDATE|DELETE)/i.test(code);

  if (hasSqlInjection) {
    if (!normalizedIssues.some((issue) => issueMatches(issue, ['sql injection', 'sql query', 'query injection']))) {
      scores.security -= 45;
    }
    scores.quality -= 8;
  }

  const hasSensitiveLogging =
    /console\.log\s*\([\s\S]{0,160}(?:password|token|secret|authorization)/i.test(code);

  if (hasSensitiveLogging) {
    if (!normalizedIssues.some((issue) => issueMatches(issue, ['secret exposure', 'sensitive data', 'sensitive information', 'password', 'credential']))) {
      scores.security -= 20;
    }
    scores.quality -= 5;
  }

  const storesPassword =
    /(?:password|passwd|pwd)\s*:/i.test(code) &&
    /(?:insertOne|insertMany|create|save|updateOne|updateMany|set\s*\()/i.test(code);

  if (storesPassword) scores.security -= 35;

  if (/\beval\s*\(/i.test(code)) scores.security -= 35;

  if (/(?:password|api[_-]?key|secret|token)\s*[:=]\s*['"][^'"]{6,}['"]/i.test(code)) {
    scores.security -= 30;
  }

  const loopCount = countMatches(code, /\b(for|while)\s*\([^)]*\)\s*\{/g);
  if (loopCount >= 2) scores.performance -= 15;

  const looseEquality = countMatches(code, /(^|[^=])==([^=]|$)/g);
  if (looseEquality > 0) scores.quality -= Math.min(10, looseEquality * 5);

  if (/console\.log\s*\(/i.test(code)) scores.quality -= 3;

  if (/async\s+function|async\s*\(/i.test(code) && !/\bawait\b/i.test(code)) {
    scores.quality -= 4;
  }

  if (code.length > 12000) {
    scores.maintainability -= 8;
    scores.quality -= 5;
  }

  for (const category of Object.keys(scores)) {
    scores[category] = clamp(scores[category]);
  }

  return scores;
}

function calculateFinalScore(scores) {
  const weightedScore =
    scores.correctness * WEIGHTS.correctness +
    scores.security * WEIGHTS.security +
    scores.performance * WEIGHTS.performance +
    scores.maintainability * WEIGHTS.maintainability +
    scores.quality * WEIGHTS.quality;

  return Math.round(weightedScore);
}

module.exports = {
  calculateScoreBreakdown,
  calculateFinalScore,
  WEIGHTS,
};
