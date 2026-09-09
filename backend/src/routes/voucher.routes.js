const router = require('express').Router();
const voucherController = require('../controllers/voucher.controller');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { idParamSchema } = require('../validators/commonValidator');

router.get('/', authMiddleware, voucherController.list);
router.get('/:id', authMiddleware, validate(idParamSchema, 'params'), voucherController.getById);

module.exports = router;
