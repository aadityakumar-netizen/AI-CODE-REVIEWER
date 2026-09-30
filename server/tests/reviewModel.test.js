const Review = require('../src/models/Review');

const scoreBreakdown = {
  correctness: 90,
  security: 90,
  performance: 90,
  maintainability: 90,
  quality: 90,
};

describe('Review model validation', () => {
  test('passes for a fully valid document', async () => {
    const review = new Review({
      user: '507f1f77bcf86cd799439011',
      language: 'JavaScript',
      sourceCode: 'const x = 1;',
      score: 90,
      scoreBreakdown,
      summary: 'Looks fine.',
      issues: [
        {
          type: 'security',
          severity: 'high',
          line: 1,
          title: 't',
          explanation: 'e',
          suggestion: 's',
        },
      ],
    });
    await expect(review.validate()).resolves.toBeUndefined();
    expect(review.language).toBe('javascript');
  });

  test('fails when required fields are missing', async () => {
    const review = new Review({ language: 'python' });
    let error;
    try {
      await review.validate();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(Object.keys(error.errors)).toEqual(
      expect.arrayContaining([
        'user',
        'sourceCode',
        'score',
        'scoreBreakdown.correctness',
        'summary',
      ])
    );
  });

  test('fails on an invalid issue enum value', async () => {
    const review = new Review({
      user: '507f1f77bcf86cd799439011',
      language: 'python',
      sourceCode: 'x = 1',
      score: 50,
      scoreBreakdown,
      summary: 'ok',
      issues: [
        {
          type: 'not-real',
          severity: 'high',
          title: 't',
          explanation: 'e',
          suggestion: 's',
        },
      ],
    });
    await expect(review.validate()).rejects.toBeDefined();
  });

  test('fails when score is out of range', async () => {
    const review = new Review({
      user: '507f1f77bcf86cd799439011',
      language: 'python',
      sourceCode: 'x=1',
      score: 200,
      scoreBreakdown,
      summary: 'ok',
    });
    await expect(review.validate()).rejects.toBeDefined();
  });
});
