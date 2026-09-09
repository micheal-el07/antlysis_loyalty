const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const voucherService = require('../services/voucher.service');

exports.list = asyncHandler(async (req, res) => {
  const result = await voucherService.listForRequester(req.user, req.query);
  sendSuccess(res, result);
});

exports.getById = asyncHandler(async (req, res) => {
  const voucher = await voucherService.getByIdForRequester(req.params.id, req.user);
  sendSuccess(res, voucher);
});
