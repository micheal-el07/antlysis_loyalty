const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/receipts', require('./receipt.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/vouchers', require('./voucher.routes'));

module.exports = router;
