const User = require('../models/User');
const { generateToken } = require('../utils/token');

async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Email and password are required.');
      error.statusCode = 400;
      return next(error);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const error = new Error('An account with that email already exists.');
      error.statusCode = 409;
      return next(error);
    }

    const user = await User.create({ email, password });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, data: { email: user.email, token } });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Email and password are required.');
      error.statusCode = 400;
      return next(error);
    }

    // password has `select: false` on the schema, so it must be
    // explicitly requested here to compare it.
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Deliberately the SAME error for "no such user" and "wrong
    // password" — telling an attacker which one is true is a real
    // information leak (it confirms which emails have accounts).
    const invalidCredentialsError = () => {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      return error;
    };

    if (!user) return next(invalidCredentialsError());

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(invalidCredentialsError());

    const token = generateToken(user._id);
    res.status(200).json({ success: true, data: { email: user.email, token } });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ success: true, data: { email: user.email, id: user._id } });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, getMe };
