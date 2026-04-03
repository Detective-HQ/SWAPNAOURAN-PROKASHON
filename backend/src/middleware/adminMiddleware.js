const ApiError = require("../utils/ApiError");

const adminMiddleware = (req, _res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new ApiError(403, "Admin access required"));
  }

  return next();
};

module.exports = adminMiddleware;
