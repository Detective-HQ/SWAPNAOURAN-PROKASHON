const { sendSuccess } = require("../utils/response");
const {
  createOrder,
  getShippingQuote,
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
    shippingAddress: req.body.shippingAddress,
    shippingQuote: req.body.shippingQuote
  });

  sendSuccess(res, 201, "Order created", order);
};

const getShippingQuoteController = async (req, res) => {
  const quote = await getShippingQuote({
    items: req.body.items,
    pincode: req.body.pincode
  });

  sendSuccess(res, 200, "Shipping quote calculated", quote);
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
    where: { id: orderId }
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status !== "PAID") {
    throw new ApiError(400, "Can only fulfill paid orders");
  }

  const result = await createShiprocketOrder(orderId);

  // Fetch the final, updated order to return to the frontend
  const updatedOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          book: { select: { id: true, title: true, type: true, coverImage: true } }
        }
      },
      payment: true
    }
  });

  sendSuccess(res, 200, "Order successfully pushed to Shiprocket", {
    ...updatedOrder,
    // AWB is auto-assigned inside createShiprocketOrder. If successful, awbCode is already in updatedOrder.
    // We surface it here for convenience; null means AWB assignment is still pending (admin can assign manually).
    awbCode: updatedOrder.awbCode || null,
    shiprocketShipmentId: updatedOrder.shiprocketShipmentId || null
  });
};

module.exports = {
  createOrderController,
  getShippingQuoteController,
  listMyOrders,
  getOrderByIdController,
  initiateOrderPayment,
  verifyOrderPayment,
  getOrderInvoice,
  fulfillShiprocket
};
