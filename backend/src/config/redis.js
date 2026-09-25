const { createClient } = require('redis');
const env = require('./env');

const redis = createClient({ url: env.redisUrl });

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});

module.exports = redis;
