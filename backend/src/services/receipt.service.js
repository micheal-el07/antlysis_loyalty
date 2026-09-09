const { Op } = require('sequelize');
const { Receipt } = require('../models');
const { toPublicReceipt } = require('../utils/serializers');
const { NotFoundError, ConflictError, BadRequestError } = require('../utils/errors');
const { resolvePagination, buildPaginationMeta } = require('../utils/pagination');
const { buildDateRangeWhere } = require('../utils/dateRange');

async function listForUploader(uploaderId, { page, limit, status, search, dateFrom, dateTo } = {}) {
  const pageInfo = resolvePagination({ page, limit });
  const dateRange = buildDateRangeWhere(dateFrom, dateTo);
  const where = {
    uploaderId,
    ...(status ? { status } : {}),
    ...(search ? { orderId: { [Op.iLike]: `%${search}%` } } : {}),
    ...(dateRange ? { purchaseDate: dateRange } : {}),
  };

  const { rows, count } = await Receipt.findAndCountAll({
    where,
    order: [['submissionDate', 'DESC']],
    ...(pageInfo ? { limit: pageInfo.limit, offset: (pageInfo.page - 1) * pageInfo.limit } : {}),
  });

  return { receipts: rows.map(toPublicReceipt), pagination: buildPaginationMeta(pageInfo, count) };
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
