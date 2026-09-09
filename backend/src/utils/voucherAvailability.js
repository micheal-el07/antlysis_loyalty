const { Op } = require('sequelize');

// "Available" vouchers = not yet expired. The schema has no redeemed/used
// flag, so expiry is the only signal we have for whether a voucher can
// still be used — revisit if a redemption concept gets added later.
// Shared between the dashboard's "Available Vouchers" count and the
// voucher list's "total unexpired amount", so both use the same definition.
function availableVoucherWhere(uploaderId) {
  return {
    uploaderId,
    [Op.or]: [{ expiryDate: null }, { expiryDate: { [Op.gt]: new Date() } }],
  };
}

module.exports = { availableVoucherWhere };
