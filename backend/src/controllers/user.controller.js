const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const userService = require('../services/user.service');

exports.getMe = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.user.userId);
  sendSuccess(res, user);
});

exports.updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.userId, req.body);
  sendSuccess(res, user);
});
