const router = require('express').Router();
const voucherController = require('../controllers/voucher.controller');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { idParamSchema } = require('../validators/commonValidator');
const { paginationQuerySchema } = require('../validators/paginationValidator');

router.get('/', authMiddleware, validate(paginationQuerySchema, 'query'), voucherController.list);
router.get('/:id', authMiddleware, validate(idParamSchema, 'params'), voucherController.getById);

module.exports = router;
