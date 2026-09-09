const rateLimit = require('express-rate-limit');
const {
  LOGIN_RATE_LIMIT_WINDOW_MS,
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  REGISTER_RATE_LIMIT_WINDOW_MS,
  REGISTER_RATE_LIMIT_MAX_ATTEMPTS,
} = require('../config/constants');

function authRateLimitResponse(message) {
  return {
    success: false,
    error: { message, code: 'RATE_LIMITED' },
  };
}

// Brute-force protection on login: keyed by IP, and successful logins don't
// count against the window so a user who mistypes a couple of times isn't
// locked out right after getting the password right.
const loginLimiter = rateLimit({
  windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
  max: LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: authRateLimitResponse('Too many login attempts. Please try again later.'),
});

// Looser cap on registration — there's no "correct answer" to brute-force
// here, this just stops the endpoint being used to spam-create accounts.
const registerLimiter = rateLimit({
  windowMs: REGISTER_RATE_LIMIT_WINDOW_MS,
  max: REGISTER_RATE_LIMIT_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: authRateLimitResponse('Too many accounts created from this location. Please try again later.'),
});

module.exports = { loginLimiter, registerLimiter };
