const { sendSuccess } = require("../utils/response");
const {
  createOrder,
  getOrderById,
  listOrders,
  initiatePayment,
  verifyPayment
} = require("../services/orderService");
const { buildInvoice } = require("../services/invoiceService");
const { createShiprocketOrder } = require("../services/shiprocketService");
const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");

const createOrderController = async (req, res) => {
  const order = await createOrder({
    userId: req.user.id,
    items: req.body.items,
    shippingAddress: req.body.shippingAddress
  });

  sendSuccess(res, 201, "Order created", order);
};

const listMyOrders = async (req, res) => {
  const orders = await listOrders({
    requester: req.user,
    userId: req.user.id
  });

  sendSuccess(res, 200, "Orders fetched", orders);
};

const getOrderByIdController = async (req, res) => {
  const order = await getOrderById({
    orderId: req.params.id,
    requester: req.user
  });

  sendSuccess(res, 200, "Order fetched", order);
};

const initiateOrderPayment = async (req, res) => {
  const payment = await initiatePayment({
    orderId: req.params.orderId,
    requester: req.user
  });

  sendSuccess(res, 200, "Payment initiated", payment);
};

const verifyOrderPayment = async (req, res) => {
  const order = await verifyPayment({
    orderId: req.params.orderId,
    requester: req.user,
    payload: req.body
  });

  sendSuccess(res, 200, "Payment verified and order updated", order);
};

const getOrderInvoice = async (req, res) => {
  const invoice = await buildInvoice({
    orderId: req.params.id,
    requester: req.user
  });

  sendSuccess(res, 200, "Invoice generated", invoice);
};

const fulfillShiprocket = async (req, res) => {
  const orderId = req.params.id;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { book: true } },
      user: true,
      shippingAddress: true
    }
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status !== "PAID") {
    throw new ApiError(400, "Can only fulfill paid orders");
  }

  // Use the user model for details if shippingAddress lacks some fields
  const userDetails = await prisma.user.findUnique({ where: { id: order.userId } });

  const shiprocketData = await createShiprocketOrder(order, userDetails);

  // Update order with tracking details
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingNumber: shiprocketData.awbCode || shiprocketData.shipmentId?.toString(),
      deliveryStatus: "SHIPPED",
    }
  });

  sendSuccess(res, 200, "Order sent to Shiprocket", updated);
};

module.exports = {
  createOrderController,
  listMyOrders,
  getOrderByIdController,
  initiateOrderPayment,
  verifyOrderPayment,
  getOrderInvoice,
  fulfillShiprocket
};
