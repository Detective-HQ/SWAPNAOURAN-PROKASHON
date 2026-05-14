const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const {
  getAdminUsers,
  getAdminBooks,
  getAdminOrders,
  getAnalytics,
  getAdminStats,
  updateAdminOrderStatus,
  updateAdminOrderTracking
} = require("../controllers/adminController");
const {
  getAllReturns,
  updateReturnStatus
} = require("../controllers/returnController");
const {
  subscribe,
  listSubscribers
} = require("../controllers/newsletterController");
const {
  updateOrderTrackingSchema
} = require("../validations/orderValidation");
const {
  updateReturnSchema
} = require("../validations/returnValidation");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users", asyncHandler(getAdminUsers));
router.get("/books", asyncHandler(getAdminBooks));
router.get("/orders", asyncHandler(getAdminOrders));
router.put("/orders/:id/status", asyncHandler(updateAdminOrderStatus));
router.put("/orders/:id/tracking", validate({ body: updateOrderTrackingSchema }), asyncHandler(updateAdminOrderTracking));
router.get("/stats", asyncHandler(getAdminStats));
router.get("/analytics", asyncHandler(getAnalytics));
router.get("/returns", asyncHandler(getAllReturns));
router.put("/returns/:id", validate({ body: updateReturnSchema }), asyncHandler(updateReturnStatus));
router.get("/newsletter", asyncHandler(listSubscribers));

module.exports = router;
