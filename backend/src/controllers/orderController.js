const { sendSuccess } = require("../utils/response");
const {
  createOrder,
  getOrderById,
  listOrders,
  initiatePayment,
  verifyPayment
} = require("../services/orderService");
const { buildInvoice } = require("../services/invoiceService");

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
    requester: req.user
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

module.exports = {
  createOrderController,
  listMyOrders,
  getOrderByIdController,
  initiateOrderPayment,
  verifyOrderPayment,
  getOrderInvoice
};
