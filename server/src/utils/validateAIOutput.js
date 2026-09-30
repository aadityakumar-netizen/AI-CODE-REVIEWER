function isValidScore(value) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

function validateAIOutput(output) {
  if (!output || typeof output !== 'object') {
    throw new Error('AI output must be an object.');
  }

  if (!output.summary || typeof output.summary !== 'string') {
    throw new Error('AI output must contain a valid summary.');
  }

  if (!output.scoreBreakdown || typeof output.scoreBreakdown !== 'object') {
    throw new Error('AI output must contain scoreBreakdown.');
  }

  const requiredScores = [
    'correctness',
    'security',
    'performance',
    'maintainability',
    'quality',
  ];

  for (const category of requiredScores) {
    if (!isValidScore(output.scoreBreakdown[category])) {
      throw new Error(
        `Invalid scoreBreakdown.${category}. Score must be a number between 0 and 100.`
      );
    }
  }

  if (!Array.isArray(output.issues)) {
    throw new Error('AI output issues must be an array.');
  }

  const validTypes = ['bug', 'security', 'performance', 'style'];
  const validSeverities = ['low', 'medium', 'high', 'critical'];

  for (const issue of output.issues) {
    if (!issue || typeof issue !== 'object') {
      throw new Error('Each issue must be an object.');
    }

    if (!validTypes.includes(issue.type)) {
      throw new Error(`Invalid issue type: ${issue.type}`);
    }

    if (!validSeverities.includes(issue.severity)) {
      throw new Error(`Invalid issue severity: ${issue.severity}`);
    }

    if (typeof issue.title !== 'string') {
      throw new Error('Issue title must be a string.');
    }

    if (typeof issue.explanation !== 'string') {
      throw new Error('Issue explanation must be a string.');
    }

    if (typeof issue.suggestion !== 'string') {
      throw new Error('Issue suggestion must be a string.');
    }
  }

  if (!Array.isArray(output.strengths)) {
    throw new Error('AI output strengths must be an array.');
  }

  if (typeof output.improvedCode !== 'string') {
    throw new Error('AI output improvedCode must be a string.');
  }

  return true;
}

module.exports = validateAIOutput;
