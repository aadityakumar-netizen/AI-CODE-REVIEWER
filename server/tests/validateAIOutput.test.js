const validateAIOutput = require('../src/utils/validateAIOutput');

const validScores = {
  correctness: 90,
  security: 90,
  performance: 90,
  maintainability: 90,
  quality: 90,
};

describe('validateAIOutput', () => {
  test('passes for valid output', () => {
    expect(() =>
      validateAIOutput({
        score: 90,
        scoreBreakdown: validScores,
        summary: 'Good code.',
        issues: [
          {
            type: 'style',
            severity: 'low',
            title: 'x',
            explanation: 'x',
            suggestion: 'x',
          },
        ],
        strengths: ['Clear structure'],
        improvedCode: '',
      })
    ).not.toThrow();
  });

  test('rejects missing scoreBreakdown', () => {
    expect(() =>
      validateAIOutput({
        score: 90,
        summary: 'ok',
        issues: [],
        strengths: [],
        improvedCode: '',
      })
    ).toThrow(/scoreBreakdown/);
  });

  test('rejects an out-of-range category score', () => {
    expect(() =>
      validateAIOutput({
        score: 90,
        scoreBreakdown: { ...validScores, security: 150 },
        summary: 'ok',
        issues: [],
        strengths: [],
        improvedCode: '',
      })
    ).toThrow(/security/);
  });

  test('rejects an invalid issue type enum', () => {
    expect(() =>
      validateAIOutput({
        score: 50,
        scoreBreakdown: validScores,
        summary: 'ok',
        issues: [
          {
            type: 'not-real',
            severity: 'high',
            title: 'x',
            explanation: 'x',
            suggestion: 'x',
          },
        ],
        strengths: [],
        improvedCode: '',
      })
    ).toThrow(/Invalid issue type/);
  });

  test('rejects a non-array issues field', () => {
    expect(() =>
      validateAIOutput({
        score: 50,
        scoreBreakdown: validScores,
        summary: 'ok',
        issues: 'not-an-array',
        strengths: [],
        improvedCode: '',
      })
    ).toThrow(/issues/);
  });
});
