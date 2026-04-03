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

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {})
  });
};

module.exports = errorMiddleware;
