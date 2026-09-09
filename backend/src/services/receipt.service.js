const { Receipt } = require('../models');
const { toPublicReceipt } = require('../utils/serializers');
const { NotFoundError, ConflictError, BadRequestError } = require('../utils/errors');

async function listForUploader(uploaderId) {
  const receipts = await Receipt.findAll({
    where: { uploaderId },
    order: [['submissionDate', 'DESC']],
  });
  return receipts.map(toPublicReceipt);
}

// Receipts belonging to another user are reported as not-found rather than
// forbidden, so this endpoint doesn't confirm the existence of receipts the
// caller doesn't own.
async function getByIdForUploader(id, uploaderId) {
  const receipt = await Receipt.findByPk(id);
  if (!receipt || receipt.uploaderId !== uploaderId) {
    throw new NotFoundError('Receipt not found.');
  }
  return toPublicReceipt(receipt);
}

async function create(uploaderId, { orderId, purchaseDate, purchaseAmount }, file) {
  if (!file) {
    throw new BadRequestError('A receipt image is required.');
  }

  const existing = await Receipt.findOne({ where: { uploaderId, orderId } });
  if (existing) {
    throw new ConflictError("You've already submitted a receipt with this order ID.");
  }

  const receipt = await Receipt.create({
    uploaderId,
    imageUrl: `/uploads/receipts/${file.filename}`,
    orderId,
    purchaseDate,
    purchaseAmount,
    // Forced regardless of whatever the client sent — the validator schema
    // doesn't even accept a status field, but this is the actual guarantee.
    status: 'pending',
    submissionDate: new Date(),
  });

  return toPublicReceipt(receipt);
}

module.exports = { listForUploader, getByIdForUploader, create };
