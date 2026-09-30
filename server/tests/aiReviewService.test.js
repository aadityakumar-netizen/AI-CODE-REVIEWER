const { generateReview } = require('../src/services/aiReviewService');

describe('generateReview', () => {
  test('returns parsed review and calculates score server-side', async () => {
    const fakeProvider = {
      complete: async () =>
        JSON.stringify({
          summary: 'Solid.',
          issues: [],
          strengths: ['Clear function structure'],
          improvedCode: '',
        }),
    };

    const result = await generateReview(
      { language: 'javascript', sourceCode: 'const x = 1;' },
      fakeProvider
    );

    expect(result.score).toBe(90);
    expect(result.scoreBreakdown).toEqual({
      correctness: 90,
      security: 90,
      performance: 90,
      maintainability: 90,
      quality: 90,
    });
    expect(result.summary).toBe('Solid.');
  });

  test('falls back to a summary when the model omits it', async () => {
    const fakeProvider = {
      complete: async () =>
        JSON.stringify({
          issues: [
            {
              type: 'security',
              severity: 'high',
              line: 1,
              title: 'SQL injection',
              explanation: 'Unsafe query construction.',
              suggestion: 'Use parameterized queries.',
            },
          ],
          strengths: [],
          improvedCode: '',
        }),
    };

    const result = await generateReview(
      { language: 'javascript', sourceCode: `const q = "SELECT * FROM users WHERE name='" + name;` },
      fakeProvider
    );

    expect(result.summary).toMatch(/issue/i);
    expect(result.scoreBreakdown.security).toBeLessThan(60);
  });

  test('throws a clear error when the provider returns unparseable text', async () => {
    const fakeProvider = { complete: async () => 'Sorry, I cannot help with that.' };

    await expect(
      generateReview({ language: 'javascript', sourceCode: 'const x = 1;' }, fakeProvider)
    ).rejects.toThrow(/Could not extract valid JSON/);
  });
});

test('provides a deterministic SQL injection fix when the model omits improved code', async () => {
  const fakeProvider = {
    complete: async () =>
      JSON.stringify({
        summary: 'Unsafe SQL query construction.',
        issues: [
          {
            type: 'security',
            severity: 'high',
            line: 2,
            title: 'SQL injection vulnerability',
            explanation: 'User input is concatenated into a SQL query.',
            suggestion: 'Use a parameterized query.',
          },
        ],
        strengths: [],
        improvedCode: '',
      }),
  };

  const sourceCode = `function getUser(id) {\n  const query = "SELECT * FROM users WHERE id = " + id;\n  return database.query(query);\n}`;
  const result = await generateReview(
    { language: 'javascript', sourceCode },
    fakeProvider
  );

  expect(result.improvedCode).toContain('WHERE id = ?');
  expect(result.improvedCode).toContain('database.query(query, [id])');
});
