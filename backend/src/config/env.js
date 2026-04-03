const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 5000),
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:5000",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  fileTokenSecret: process.env.FILE_TOKEN_SECRET || process.env.JWT_SECRET || "change-file-token-secret",
  fileTokenExpiresIn: process.env.FILE_TOKEN_EXPIRES_IN || "10m",
  bcryptSaltRounds: toNumber(process.env.BCRYPT_SALT_ROUNDS, 12),
  paymentProvider: (process.env.PAYMENT_PROVIDER || "MOCK").toUpperCase(),
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  adminEmail: process.env.ADMIN_EMAIL || "admin@example.com",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@123",
  adminName: process.env.ADMIN_NAME || "Platform Admin"
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

if (!process.env.JWT_SECRET && env.nodeEnv === "production") {
  throw new Error("JWT_SECRET is required in production");
}

module.exports = env;
