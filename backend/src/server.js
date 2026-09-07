const app = require('./app');
const env = require('./config/env');
const sequelize = require('./config/database');

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
