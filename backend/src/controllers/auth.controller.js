const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const authService = require('../services/auth.service');

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendSuccess(res, result, 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const result = await authService.login(identifier, password);
  sendSuccess(res, result);
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user);
  sendSuccess(res, null);
});
