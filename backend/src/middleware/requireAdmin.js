const { ForbiddenError } = require('../utils/errors');

// Mount after authMiddleware — relies on req.user being already set.
module.exports = function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ForbiddenError('Admin access required.'));
  }
  return next();
};
