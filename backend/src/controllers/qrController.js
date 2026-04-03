const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");
const { verifyAndTrackQr } = require("../services/qrService");

const verifyQr = async (req, res) => {
  const qr = await verifyAndTrackQr(req.params.id);
  if (!qr) {
    throw new ApiError(404, "QR code not found");
  }

  sendSuccess(res, 200, "QR verified", qr);
};

module.exports = {
  verifyQr
};
