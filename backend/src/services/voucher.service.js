const { Voucher, User, Receipt } = require('../models');
const { toPublicVoucher, toAdminVoucher } = require('../utils/serializers');
const { NotFoundError } = require('../utils/errors');
const { resolvePagination, buildPaginationMeta } = require('../utils/pagination');
const { availableVoucherWhere } = require('../utils/voucherAvailability');

const OWNER_INCLUDE = { model: User, as: 'owner', attributes: ['id', 'name'] };
const RECEIPT_INCLUDE = { model: Receipt, as: 'receipt', attributes: ['id', 'orderId'] };

async function listForRequester(requester, { page, limit } = {}) {
  const isAdmin = requester.role === 'admin';
  const pageInfo = resolvePagination({ page, limit });
  const where = isAdmin ? {} : { uploaderId: requester.userId };

  const { rows, count } = await Voucher.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    ...(pageInfo ? { limit: pageInfo.limit, offset: (pageInfo.page - 1) * pageInfo.limit } : {}),
    // receipt is joined either way — order_id (shown in both the user's and
    // admin's voucher tables) comes from it. owner is admin-only.
    include: isAdmin ? [OWNER_INCLUDE, RECEIPT_INCLUDE] : [RECEIPT_INCLUDE],
  });

  // A cheap SUM query, not derived from `rows` — pagination means `rows` is
  // only the current page, so a client-side total would be wrong (and even
  // unpaginated, amount is a value, not just a count, so it still needs a
  // real aggregate). Only computed for a user's own vouchers — "total
  // unexpired amount across every user" wasn't asked for and is a
  // different, less obviously meaningful number for admin.
  const availableAmount = isAdmin
    ? null
    : Number((await Voucher.sum('amount', { where: availableVoucherWhere(requester.userId) })) || 0);

  return {
    vouchers: rows.map(isAdmin ? toAdminVoucher : toPublicVoucher),
    pagination: buildPaginationMeta(pageInfo, count),
    availableAmount,
  };
}

// Same not-found-for-non-owner treatment as receipts, for the same reason.
async function getByIdForRequester(id, requester) {
  const voucher = await Voucher.findByPk(id);
  if (!voucher || (requester.role !== 'admin' && voucher.uploaderId !== requester.userId)) {
    throw new NotFoundError('Voucher not found.');
  }
  return toPublicVoucher(voucher);
}

module.exports = { listForRequester, getByIdForRequester };
