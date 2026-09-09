const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const { validate } = require('../middleware/validate');
const { updateReceiptStatusSchema } = require('../validators/receiptValidator');
const { idParamSchema } = require('../validators/commonValidator');

router.get('/receipts', authMiddleware, requireAdmin, adminController.listReceipts);

router.get(
  '/receipts/:id',
  authMiddleware,
  requireAdmin,
  validate(idParamSchema, 'params'),
  adminController.getReceiptById
);

router.patch(
  '/receipts/:id',
  authMiddleware,
  requireAdmin,
  validate(idParamSchema, 'params'),
  validate(updateReceiptStatusSchema),
  adminController.updateReceiptStatus
);

module.exports = router;
