const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, dashboardController.getDashboard);

module.exports = router;
