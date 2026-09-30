const jwt = require('jsonwebtoken');
const env = require('../config/env');

// A token's payload is just the user's id — everything else about the
// user (email, etc.) is looked up fresh from the database when needed,
// rather than trusted from the token. That way, if a user's data
// changes, every request still sees current data, not a stale snapshot
// baked into a token that might not expire for days.
function generateToken(userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { generateToken, verifyToken };
