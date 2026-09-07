const { BadRequestError } = require('../utils/errors');

function formatZodError(zodError) {
  return zodError.issues
    .map((issue) => (issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message))
    .join(' ');
}

// Wraps a Zod schema into an Express middleware. `source` picks which part
// of the request to validate ('body' | 'params' | 'query'). On success the
// parsed (and type-coerced) value replaces req[source] so downstream
// controllers/services can trust its shape.
//
// Usage in a validators/*.js file:
//   const { validate } = require('../middleware/validate');
//   module.exports.createReceipt = validate(createReceiptSchema);
function validate(schema, source = 'body') {
  return function validateRequest(req, res, next) {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(new BadRequestError(formatZodError(result.error), 'VALIDATION_ERROR'));
    }

    req[source] = result.data;
    return next();
  };
}

module.exports = { validate, formatZodError };
