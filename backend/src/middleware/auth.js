const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UnauthenticatedError } = require('../utils/errors');
const { isBlocked } = require('../services/tokenBlocklist.service');

module.exports = async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthenticatedError());
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    return next(new UnauthenticatedError('Invalid or expired token.'));
  }

  try {
    // Fails closed: if Redis is unreachable the error goes to errorHandler
    // rather than letting a possibly-revoked token through.
    if (payload.jti && (await isBlocked(payload.jti))) {
      return next(new UnauthenticatedError('Invalid or expired token.'));
    }
  } catch (err) {
    return next(err);
  }

  req.user = { userId: payload.userId, role: payload.role, jti: payload.jti, exp: payload.exp };
  return next();
};
