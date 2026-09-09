const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const adminService = require('../services/admin.service');

exports.listReceipts = asyncHandler(async (req, res) => {
  const result = await adminService.listAllReceipts(req.query);
  sendSuccess(res, result);
});

exports.getReceiptById = asyncHandler(async (req, res) => {
  const receipt = await adminService.getReceiptById(req.params.id);
  sendSuccess(res, receipt);
});

exports.updateReceiptStatus = asyncHandler(async (req, res) => {
  const result = await adminService.updateReceiptStatus(req.params.id, req.user.userId, req.body);
  sendSuccess(res, result);
});
