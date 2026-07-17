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
  updateAdminOrderTracking,
  getTrashBooks,
  restoreBook
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
  getAdminSettings,
  updateSetting
} = require("../controllers/settingController");
const {
  pushOrderToShiprocket,
  assignAwb,
  trackAwb,
  trackOrder,
  cancelOrder,
  listNdr,
  getNdr,
  raiseDisputeHandler,
  updateDisputeHandler,
  resolveNdrHandler,
  listDisputes,
  getDispute,
  resolveLocalDispute
} = require("../controllers/shiprocketController");
const {
  updateOrderTrackingSchema
} = require("../validations/orderValidation");
const {
  updateReturnSchema
} = require("../validations/returnValidation");
const {
  raiseDisputeSchema,
  updateDisputeSchema,
  resolveNdrSchema,
  resolveLocalDisputeSchema
} = require("../validations/disputeValidation");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users", asyncHandler(getAdminUsers));
router.get("/books/trash", asyncHandler(getTrashBooks));
router.get("/books", asyncHandler(getAdminBooks));
router.post("/books/:id/restore", asyncHandler(restoreBook));
router.get("/orders", asyncHandler(getAdminOrders));
router.put("/orders/:id/status", asyncHandler(updateAdminOrderStatus));
router.put("/orders/:id/tracking", validate({ body: updateOrderTrackingSchema }), asyncHandler(updateAdminOrderTracking));
router.get("/stats", asyncHandler(getAdminStats));
router.get("/analytics", asyncHandler(getAnalytics));
router.get("/returns", asyncHandler(getAllReturns));
router.put("/returns/:id", validate({ body: updateReturnSchema }), asyncHandler(updateReturnStatus));
router.get("/newsletter", asyncHandler(listSubscribers));
router.get("/settings", asyncHandler(getAdminSettings));
router.put("/settings", asyncHandler(updateSetting));

// Shiprocket admin routes
router.post("/shiprocket/orders/:orderId/push", asyncHandler(pushOrderToShiprocket));
router.post("/shiprocket/shipments/:shipmentId/awb", asyncHandler(assignAwb));
router.get("/shiprocket/track/awb/:awb", asyncHandler(trackAwb));
router.get("/shiprocket/track/order/:shiprocketOrderId", asyncHandler(trackOrder));
router.post("/shiprocket/orders/cancel", asyncHandler(cancelOrder));

// Shiprocket NDR / Dispute routes
router.get("/shiprocket/ndr", asyncHandler(listNdr));
router.get("/shiprocket/ndr/:ndrId", asyncHandler(getNdr));
router.post("/shiprocket/ndr/resolve", validate({ body: resolveNdrSchema }), asyncHandler(resolveNdrHandler));
router.post("/shiprocket/disputes", validate({ body: raiseDisputeSchema }), asyncHandler(raiseDisputeHandler));
router.put("/shiprocket/disputes/:disputeId", validate({ body: updateDisputeSchema }), asyncHandler(updateDisputeHandler));
router.get("/shiprocket/disputes", asyncHandler(listDisputes));
router.get("/shiprocket/disputes/:id", asyncHandler(getDispute));
router.put("/shiprocket/disputes/:id/resolve", validate({ body: resolveLocalDisputeSchema }), asyncHandler(resolveLocalDispute));

module.exports = router;

