const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const routes = require("./routes");
const ApiError = require("./utils/ApiError");
const errorMiddleware = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "frame-ancestors": ["'self'", "http://localhost:3000"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(morgan("dev"));
const webhookRoutes = require("./routes/webhookRoutes");

app.use("/api/webhooks", webhookRoutes);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Disable CSP headers for PDF stream endpoints so Chrome's PDF viewer can render
app.use("/api/ebooks", (req, res, next) => {
  if (req.path.includes("/stream")) {
    res.removeHeader("Content-Security-Policy");
  }
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", apiLimiter);
app.use("/api", routes);

app.use((_req, _res, next) => next(new ApiError(404, "Route not found")));
app.use(errorMiddleware);

module.exports = app;
