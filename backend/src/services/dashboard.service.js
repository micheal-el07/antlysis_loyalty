const { User, Receipt, Voucher } = require('../models');
const { toDashboardReceipt } = require('../utils/serializers');
const { NotFoundError } = require('../utils/errors');
const { RECENT_RECEIPTS_LIMIT } = require('../config/constants');
const { availableVoucherWhere } = require('../utils/voucherAvailability');

async function getDashboard(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found.');

  const [pendingReceipts, approvedReceipts, availableVouchers, recentReceipts] =
    await Promise.all([
      Receipt.count({ where: { uploaderId: userId, status: 'pending' } }),
      Receipt.count({ where: { uploaderId: userId, status: 'approved' } }),
      Voucher.count({ where: availableVoucherWhere(userId) }),
      Receipt.findAll({
        where: { uploaderId: userId },
        order: [['submissionDate', 'DESC']],
        limit: RECENT_RECEIPTS_LIMIT,
      }),
    ]);

  return {
    user: { name: user.name },
    stats: { pendingReceipts, approvedReceipts, availableVouchers },
    recentReceipts: recentReceipts.map(toDashboardReceipt),
  };
}

module.exports = { getDashboard };
