const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UnauthenticatedError } = require('../utils/errors');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthenticatedError());
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { userId: payload.userId, role: payload.role };
    return next();
  } catch (err) {
    return next(new UnauthenticatedError('Invalid or expired token.'));
  }
};
