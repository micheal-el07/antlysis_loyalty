const { Sequelize } = require('sequelize');
const env = require('./env');
const dbConfig = require('./config')[env.nodeEnv];

const sequelize = dbConfig.use_env_variable
  ? new Sequelize(process.env[dbConfig.use_env_variable], dbConfig)
  : new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

module.exports = sequelize;
