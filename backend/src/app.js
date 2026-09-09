const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const { sendSuccess } = require('./utils/response');
const { NotFoundError } = require('./utils/errors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(morgan(':remote-addr :method :url :status :response-time ms - :res[content-length]'));
app.use(cors({
  origin: [env.frontendUrl],
  credentials: true, // only needed if you ever send cookies; harmless to include either way
}));
app.set('trust proxy', true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
  sendSuccess(res, { status: 'ok' });
});

app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/v1', require('./routes'));

app.use((req, res, next) => {
  next(new NotFoundError(`No route for ${req.method} ${req.originalUrl}`));
});

// Centralized error handler — must be mounted last.
app.use(errorHandler);

module.exports = app;
