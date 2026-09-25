const redis = require('../config/redis');

const keyFor = (jti) => `jwt:blocklist:${jti}`;

// The TTL matches the token's remaining lifetime, so Redis drops the entry
// exactly when the token would have expired anyway.
async function blockToken(jti, exp) {
  const ttlSeconds = exp - Math.floor(Date.now() / 1000);
  if (ttlSeconds <= 0) return;
  await redis.set(keyFor(jti), '1', { EX: ttlSeconds });
}

async function isBlocked(jti) {
  return (await redis.exists(keyFor(jti))) === 1;
}

module.exports = { blockToken, isBlocked };
