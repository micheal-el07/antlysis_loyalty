const express = require('express');
const cors = require('cors');
const path = require('path');
const { sendSuccess } = require('./utils/response');
const { NotFoundError } = require('./utils/errors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
  sendSuccess(res, { status: 'ok' });
});

// Route modules get mounted here as endpoints are built, e.g.:
// app.use('/api/v1/auth', require('./routes/auth.routes'));

app.use((req, res, next) => {
  next(new NotFoundError(`No route for ${req.method} ${req.originalUrl}`));
});

// Centralized error handler — must be mounted last.
app.use(errorHandler);

module.exports = app;
