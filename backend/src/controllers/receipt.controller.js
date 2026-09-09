const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const receiptService = require('../services/receipt.service');

exports.list = asyncHandler(async (req, res) => {
  const receipts = await receiptService.listForUploader(req.user.userId);
  sendSuccess(res, { receipts });
});

exports.getById = asyncHandler(async (req, res) => {
  const receipt = await receiptService.getByIdForUploader(req.params.id, req.user.userId);
  sendSuccess(res, receipt);
});

exports.create = asyncHandler(async (req, res) => {
  const receipt = await receiptService.create(req.user.userId, req.body, req.file);
  sendSuccess(res, receipt, 201);
});
