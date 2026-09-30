const { verifyToken } = require('../utils/token');

function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Not authorized. No token provided.');
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    const error = new Error('Not authorized. No token provided.');
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      const error = new Error('Not authorized. Invalid token.');
      error.statusCode = 401;
      return next(error);
    }

    req.user = {
      id: decoded.id,
    };

    next();
  } catch (error) {
    error.statusCode = 401;
    error.message = 'Not authorized. Token is invalid or expired.';
    next(error);
  }
}

module.exports = protect;