const { Op } = require('sequelize');
const { sequelize, Receipt, Voucher, User } = require('../models');
const { toPublicReceipt, toAdminReceipt, toPublicVoucher } = require('../utils/serializers');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { VOUCHER_REWARD_RATE, VOUCHER_VALIDITY_DAYS } = require('../config/constants');
const { resolvePagination, buildPaginationMeta } = require('../utils/pagination');
const { buildDateRangeWhere } = require('../utils/dateRange');

const UPLOADER_INCLUDE = { model: User, as: 'uploader', attributes: ['id', 'name'] };

// receipt.purchaseAmount comes back from Postgres as a string (Sequelize
// doesn't parse DECIMAL to a JS number, to avoid float precision loss on
// the way in) — convert explicitly and round to cents rather than relying
// on implicit string->number coercion producing something like
// 3.2090000000000005.
function calculateVoucherAmount(purchaseAmount) {
  return Math.round(Number(purchaseAmount) * VOUCHER_REWARD_RATE * 100) / 100;
}

async function listAllReceipts({ page, limit, status, search, dateFrom, dateTo } = {}) {
  const pageInfo = resolvePagination({ page, limit });
  const dateRange = buildDateRangeWhere(dateFrom, dateTo);
  const where = {
    ...(status ? { status } : {}),
    ...(dateRange ? { purchaseDate: dateRange } : {}),
    // Matches order ID or the joined uploader's name — '$uploader.name$'
    // is Sequelize's syntax for referencing an included association's
    // column in a where clause.
    ...(search
      ? {
          [Op.or]: [
            { orderId: { [Op.iLike]: `%${search}%` } },
            { '$uploader.name$': { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {}),
  };

  const { rows, count } = await Receipt.findAndCountAll({
    where,
    include: [UPLOADER_INCLUDE],
    order: [['submissionDate', 'DESC']],
    ...(pageInfo ? { limit: pageInfo.limit, offset: (pageInfo.page - 1) * pageInfo.limit } : {}),
  });

  return { receipts: rows.map(toAdminReceipt), pagination: buildPaginationMeta(pageInfo, count) };
}

async function getReceiptById(id) {
  const receipt = await Receipt.findByPk(id, { include: [UPLOADER_INCLUDE] });
  if (!receipt) throw new NotFoundError('Receipt not found.');
  return toAdminReceipt(receipt);
}

// Approving a receipt and issuing its voucher happen inside one managed
// transaction: Sequelize commits only if every step succeeds and rolls back
// everything (including the status change) if any step throws — so a
// voucher-creation failure can never leave a receipt marked "approved"
// without a voucher, and a failed status update can never leave a
// dangling voucher behind.
async function updateReceiptStatus(receiptId, adminId, { status, rejectedReason }) {
  return sequelize.transaction(async (transaction) => {
    const receipt = await Receipt.findByPk(receiptId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!receipt) {
      throw new NotFoundError('Receipt not found.');
    }

    if (receipt.status !== 'pending') {
      throw new ConflictError('This receipt has already been reviewed.');
    }

    if (status === 'approved') {
      receipt.status = 'approved';
      receipt.approvedAt = new Date();
      receipt.approvedBy = adminId;
      receipt.rejectedReason = null;
      await receipt.save({ transaction });
      
      const voucher = await Voucher.create(
        {
          receiptId: receipt.id,
          uploaderId: receipt.uploaderId,
          amount: calculateVoucherAmount(receipt.purchaseAmount),
          expiryDate: new Date(Date.now() + VOUCHER_VALIDITY_DAYS * 24 * 60 * 60 * 1000),
        },
        { transaction }
      );

      return { receipt: toPublicReceipt(receipt), voucher: toPublicVoucher(voucher) };
    }

    receipt.status = 'rejected';
    receipt.rejectedReason = rejectedReason;
    receipt.approvedAt = null;
    await receipt.save({ transaction });

    return { receipt: toPublicReceipt(receipt), voucher: null };
  });
}

module.exports = { listAllReceipts, getReceiptById, updateReceiptStatus };
