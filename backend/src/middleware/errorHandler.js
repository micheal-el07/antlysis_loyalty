const multer = require('multer');
const { AppError } = require('../utils/errors');
const { sendError } = require('../utils/response');
const { formatZodError } = require('./validate');

// Centralized error handler — must be the last middleware mounted in app.js.
// Every route/service throws or forwards errors here via next(err); nothing
// upstream formats an error response itself.
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.code);
  }

  if (err.name === 'ZodError') {
    return sendError(res, 400, formatZodError(err), 'VALIDATION_ERROR');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return sendError(res, 409, 'A record with this value already exists.', 'CONFLICT');
  }

  if (err.name === 'SequelizeValidationError') {
    const message = err.errors?.[0]?.message || 'Invalid request data.';
    return sendError(res, 400, message, 'VALIDATION_ERROR');
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return sendError(res, 400, 'Referenced record does not exist.', 'INVALID_REFERENCE');
  }

  if (err instanceof multer.MulterError) {
    return sendError(res, 400, err.message, 'UPLOAD_ERROR');
  }

  console.error(err);
  return sendError(res, 500, 'Something went wrong. Please try again later.', 'INTERNAL_ERROR');
};
