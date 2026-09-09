// Shape Sequelize instances into the plain objects sent in API responses.
// Kept here (rather than duplicated per-service) since more than one
// service serializes the same entity (e.g. admin + voucher services both
// return vouchers).

function toAuthUser(user) {
  return { id: user.id, name: user.name, role: user.role };
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };
}

function toPublicReceipt(receipt) {
  return {
    id: receipt.id,
    uploaderId: receipt.uploaderId,
    orderId: receipt.orderId,
    imageUrl: receipt.imageUrl,
    purchaseDate: receipt.purchaseDate,
    purchaseAmount: receipt.purchaseAmount,
    status: receipt.status,
    submissionDate: receipt.submissionDate,
    approvedAt: receipt.approvedAt,
    approvedBy: receipt.approvedBy,
    rejectedReason: receipt.rejectedReason,
  };
}

// For admin listing/detail views, where the reviewer needs to see who
// submitted the receipt. Only populated when the query eager-loaded the
// `uploader` association.
function toAdminReceipt(receipt) {
  return {
    ...toPublicReceipt(receipt),
    uploader: receipt.uploader ? { id: receipt.uploader.id, name: receipt.uploader.name } : null,
  };
}

// Slimmer than toPublicReceipt — only what the dashboard summary needs.
function toDashboardReceipt(receipt) {
  return {
    id: receipt.id,
    orderId: receipt.orderId,
    purchaseAmount: receipt.purchaseAmount,
    submissionDate: receipt.submissionDate,
    status: receipt.status,
    rejectedReason: receipt.rejectedReason,
  };
}

// Snake_case on purpose — matches the voucher shape already agreed with the
// frontend (id, receipt_id, amount, expiry_date, created_at).
function toPublicVoucher(voucher) {
  return {
    id: voucher.id,
    receipt_id: voucher.receiptId,
    amount: voucher.amount,
    expiry_date: voucher.expiryDate,
    created_at: voucher.createdAt,
  };
}

// For the admin voucher list, where the reviewer needs to see who holds
// the voucher. Only populated when the query eager-loaded the `owner`
// association.
function toAdminVoucher(voucher) {
  return {
    ...toPublicVoucher(voucher),
    owner: voucher.owner ? { id: voucher.owner.id, name: voucher.owner.name } : null,
    order_id: voucher.receipt ? voucher.receipt.orderId : null,
  };
}

module.exports = {
  toAuthUser,
  toPublicUser,
  toPublicReceipt,
  toAdminReceipt,
  toDashboardReceipt,
  toPublicVoucher,
  toAdminVoucher,
};
