const express = require("express");

const authRoutes = require("./authRoutes");
const bookRoutes = require("./bookRoutes");
const orderRoutes = require("./orderRoutes");
const ebookRoutes = require("./ebookRoutes");
const adminRoutes = require("./adminRoutes");
const galleryRoutes = require("./galleryRoutes");
const qrRoutes = require("./qrRoutes");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy"
  });
});

router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/orders", orderRoutes);
router.use("/ebooks", ebookRoutes);
router.use("/admin", adminRoutes);
router.use("/gallery", galleryRoutes);
router.use("/qr", qrRoutes);

module.exports = router;
