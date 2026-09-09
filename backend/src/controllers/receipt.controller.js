const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const receiptService = require('../services/receipt.service');

exports.list = asyncHandler(async (req, res) => {
  const result = await receiptService.listForUploader(req.user.userId, req.query);
  sendSuccess(res, result);
});

exports.getById = asyncHandler(async (req, res) => {
  const receipt = await receiptService.getByIdForUploader(req.params.id, req.user.userId);
  sendSuccess(res, receipt);
});

exports.create = asyncHandler(async (req, res) => {
  const receipt = await receiptService.create(req.user.userId, req.body, req.file);
  sendSuccess(res, receipt, 201);
});
