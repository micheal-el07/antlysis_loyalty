function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function sendError(res, statusCode, message, code) {
  return res.status(statusCode).json({ success: false, error: { message, code } });
}

module.exports = { sendSuccess, sendError };
