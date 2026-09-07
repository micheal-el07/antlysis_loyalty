class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request.', code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

class UnauthenticatedError extends AppError {
  constructor(message = 'Not authenticated.', code = 'UNAUTHENTICATED') {
    super(message, 401, code);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden.', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found.', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict.', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthenticatedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
