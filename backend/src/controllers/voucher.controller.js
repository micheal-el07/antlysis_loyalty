const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const voucherService = require('../services/voucher.service');

exports.list = asyncHandler(async (req, res) => {
  const vouchers = await voucherService.listForRequester(req.user);
  sendSuccess(res, vouchers);
});

exports.getById = asyncHandler(async (req, res) => {
  const voucher = await voucherService.getByIdForRequester(req.params.id, req.user);
  sendSuccess(res, voucher);
});
