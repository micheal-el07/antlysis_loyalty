require('dotenv').config();

// A missing secret should crash the app at boot with a clear message, not
// silently fall back to a known value that ships in this repo's history —
// that fallback is exactly what turns "forgot to configure it" into a real
// vulnerability instead of an obvious startup failure.
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Set it in your .env file (see .env.example).`);
  }
  return value;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
