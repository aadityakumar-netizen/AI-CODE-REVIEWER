process.env.JWT_SECRET = 'test-secret-for-jest';

const { generateToken, verifyToken } = require('../src/utils/token');
const protect = require('../src/middleware/auth');

describe('JWT utility', () => {
  test('a generated token verifies back to the same id', () => {
    const token = generateToken('user-123');
    expect(verifyToken(token).id).toBe('user-123');
  });

  test('an invalid token throws', () => {
    expect(() => verifyToken('not-a-real-token')).toThrow();
  });
});

describe('protect middleware', () => {
  test('rejects a request with no Authorization header', () => {
    const req = { headers: {} };
    const next = jest.fn();
    protect(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  test('rejects a malformed token', () => {
    const req = { headers: { authorization: 'Bearer garbage' } };
    const next = jest.fn();
    protect(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  test('accepts a valid token and sets req.user', () => {
    const token = generateToken('user-456');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    protect(req, {}, next);
    expect(next).toHaveBeenCalledWith(); // called with no error
    expect(req.user).toEqual({ id: 'user-456' });
  });
});
