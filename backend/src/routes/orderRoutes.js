const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const {
  createOrderController,
  listMyOrders,
  getOrderByIdController,
  initiateOrderPayment,
  verifyOrderPayment,
  getOrderInvoice,
  fulfillShiprocket
} = require("../controllers/orderController");
const {
  createOrderSchema,
  orderIdParamsSchema,
  payOrderParamsSchema,
  verifyPaymentSchema
} = require("../validations/orderValidation");

const router = express.Router();

router.use(authMiddleware);

router.post("/", validate({ body: createOrderSchema }), asyncHandler(createOrderController));
router.get("/my", asyncHandler(listMyOrders));
router.get("/:id/invoice", validate({ params: orderIdParamsSchema }), asyncHandler(getOrderInvoice));
router.post(
  "/:id/fulfill-shiprocket",
  adminMiddleware,
  validate({ params: orderIdParamsSchema }),
  asyncHandler(fulfillShiprocket)
);
router.get("/:id", validate({ params: orderIdParamsSchema }), asyncHandler(getOrderByIdController));
router.post("/:orderId/pay", validate({ params: payOrderParamsSchema }), asyncHandler(initiateOrderPayment));
router.post(
  "/:orderId/verify",
  validate({ params: payOrderParamsSchema, body: verifyPaymentSchema }),
  asyncHandler(verifyOrderPayment)
);

module.exports = router;
