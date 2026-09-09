// Config file consumed by sequelize-cli (via .sequelizerc). Keep this in the
// plain per-environment shape the CLI expects — app runtime config lives in
// ./env.js instead.
require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';

// SQL query logging: on in development (where you want to see queries),
// off everywhere else — driven by NODE_ENV rather than fixed per-block, so
// a new environment doesn't silently inherit Sequelize's noisy
// console.log-everything default by omission.
const sqlLogging = nodeEnv === 'development' ? console.log : false;

// A missing DB_PASSWORD should crash at boot with a clear message instead
// of silently connecting with a fallback that ships in this repo's
// history. Only the block matching the active NODE_ENV is ever actually
// read (by sequelize-cli or database.js) — the other two blocks still
// need *a* value so this module can be required without side effects in
// every environment, but that value is never used to connect to anything.
function dbPassword(envName, unusedFallback) {
  if (nodeEnv !== envName) return process.env.DB_PASSWORD || unusedFallback;
  const value = process.env.DB_PASSWORD;
  if (!value) {
    throw new Error(`Missing required environment variable: DB_PASSWORD (needed for NODE_ENV=${envName}).`);
  }
  return value;
}

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: dbPassword('development', 'unused'),
    database: process.env.DB_NAME || 'loyalty_program_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: sqlLogging,
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: dbPassword('test', 'postgres'),
    database: process.env.DB_NAME_TEST || 'antlysis_loyalty_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: sqlLogging,
  },
  production: {
    username: process.env.DB_USER,
    password: dbPassword('production', 'unused'),
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    use_env_variable: process.env.DATABASE_URL ? 'DATABASE_URL' : undefined,
    logging: sqlLogging,
  },
};
