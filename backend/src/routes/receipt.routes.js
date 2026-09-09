const router = require('express').Router();
const receiptController = require('../controllers/receipt.controller');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const upload = require('../config/multer');
const { createReceiptSchema, receiptListQuerySchema } = require('../validators/receiptValidator');
const { idParamSchema } = require('../validators/commonValidator');

router.get('/', authMiddleware, validate(receiptListQuerySchema, 'query'), receiptController.list);

router.get('/:id', authMiddleware, validate(idParamSchema, 'params'), receiptController.getById);

// multipart/form-data — field name "image" for the file, plus orderId /
// purchaseDate / purchaseAmount as regular fields.
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  validate(createReceiptSchema),
  receiptController.create
);

module.exports = router;
