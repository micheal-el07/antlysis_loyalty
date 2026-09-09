// Wraps an async controller so a rejected promise flows into next(err)
// instead of needing a try/catch in every controller function.
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
