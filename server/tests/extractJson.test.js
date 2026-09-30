const extractJson = require('../src/utils/extractJson');

describe('extractJson', () => {
  test('parses clean JSON', () => {
    expect(extractJson('{"score": 90}')).toEqual({ score: 90 });
  });

  test('parses JSON in a ```json fence', () => {
    const input = 'Here is the review:\n```json\n{"score": 85}\n```';
    expect(extractJson(input)).toEqual({ score: 85 });
  });

  test('parses JSON in a plain ``` fence', () => {
    const input = '```\n{"score": 70}\n```';
    expect(extractJson(input)).toEqual({ score: 70 });
  });

  test('parses JSON with prose before and after', () => {
    const input = 'Sure, here you go:\n{"score": 60}\nLet me know if you need more!';
    expect(extractJson(input)).toEqual({ score: 60 });
  });

  test('throws a clear error when no JSON is present', () => {
    expect(() => extractJson('I cannot help with that.')).toThrow(
      'Could not extract valid JSON from the AI response.'
    );
  });
});
