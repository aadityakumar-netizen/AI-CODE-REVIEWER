const {
  calculateScoreBreakdown,
  calculateFinalScore,
} = require('../src/utils/calculateScore');

describe('calculateScore', () => {
  test('clean code receives a strong baseline score', () => {
    const scores = calculateScoreBreakdown({
      sourceCode: 'function add(a, b) { return a + b; }',
      issues: [],
    });

    expect(scores.security).toBe(100);
    expect(scores.performance).toBe(100);
    expect(calculateFinalScore(scores)).toBe(100);
  });

  test('SQL injection significantly reduces security', () => {
    const scores = calculateScoreBreakdown({
      sourceCode: `function login(username) { const q = "SELECT * FROM users WHERE username = '" + username + "'"; return db.query(q); }`,
      issues: [],
    });

    expect(scores.security).toBeLessThan(60);
  });

  test('severity findings reduce the relevant category', () => {
    const scores = calculateScoreBreakdown({
      sourceCode: 'const value = 1;',
      issues: [
        {
          type: 'bug',
          severity: 'high',
          title: 'Bug',
          explanation: 'Bug',
          suggestion: 'Fix it',
        },
      ],
    });

    expect(scores.correctness).toBe(75);
  });
});
