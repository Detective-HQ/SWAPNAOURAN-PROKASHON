const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const {
  getAdminUsers,
  getAdminBooks,
  getAdminOrders,
  getAnalytics
} = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users", asyncHandler(getAdminUsers));
router.get("/books", asyncHandler(getAdminBooks));
router.get("/orders", asyncHandler(getAdminOrders));
router.get("/analytics", asyncHandler(getAnalytics));

module.exports = router;
