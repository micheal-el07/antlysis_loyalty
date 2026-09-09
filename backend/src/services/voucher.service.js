const { Voucher, User, Receipt } = require('../models');
const { toPublicVoucher, toAdminVoucher } = require('../utils/serializers');
const { NotFoundError } = require('../utils/errors');

const OWNER_INCLUDE = { model: User, as: 'owner', attributes: ['id', 'name'] };
const RECEIPT_INCLUDE = { model: Receipt, as: 'receipt', attributes: ['id', 'orderId'] };

async function listForRequester(requester) {
  const isAdmin = requester.role === 'admin';
  const where = isAdmin ? {} : { uploaderId: requester.userId };
  const vouchers = await Voucher.findAll({
    where,
    order: [['createdAt', 'DESC']],
    ...(isAdmin ? { include: [OWNER_INCLUDE, RECEIPT_INCLUDE] } : {}),
  });
  return vouchers.map(isAdmin ? toAdminVoucher : toPublicVoucher);
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
