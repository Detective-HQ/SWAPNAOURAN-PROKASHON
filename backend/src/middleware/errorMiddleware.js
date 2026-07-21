const { ZodError } = require("zod");

const errorMiddleware = (err, _req, res, _next) => {
  if (err?.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  // express-rate-limit misconfiguration (e.g. trust proxy) should not look like auth failure
  if (err?.name === "ValidationError" && err?.code?.startsWith?.("ERR_ERL_")) {
    console.error("Rate limiter configuration error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Payment temporarily unavailable due to server configuration. Please try again."
    });
  }

  // Payment provider SDKs (e.g. Razorpay) often throw plain objects with statusCode + error.description
  const providerDescription = err?.error?.description;
  const statusCode = err.statusCode || 500;
  const message =
    err.message ||
    providerDescription ||
    "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {})
  });
};

module.exports = errorMiddleware;
