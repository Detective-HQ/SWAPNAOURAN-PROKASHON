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
  pushOrderToShiprocket,
  assignAwb,
  trackAwb,
  trackOrder,
  cancelOrder
} = require("../controllers/shiprocketController");
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

// Shiprocket admin routes
router.post("/shiprocket/orders/:orderId/push", asyncHandler(pushOrderToShiprocket));
router.post("/shiprocket/shipments/:shipmentId/awb", asyncHandler(assignAwb));
router.get("/shiprocket/track/awb/:awb", asyncHandler(trackAwb));
router.get("/shiprocket/track/order/:shiprocketOrderId", asyncHandler(trackOrder));
router.post("/shiprocket/orders/cancel", asyncHandler(cancelOrder));

module.exports = router;

