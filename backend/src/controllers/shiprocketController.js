const { sendSuccess } = require("../utils/response");
const {
  createShiprocketOrder,
  requestShipment,
  trackByAwb,
  trackByShiprocketOrderId,
  cancelShiprocketOrder,
  processWebhook
} = require("../services/shiprocketService");
const env = require("../config/env");

/**
 * POST /api/admin/shiprocket/orders/:orderId/push
 * Push an order to Shiprocket
 */
const pushOrderToShiprocket = async (req, res) => {
  const result = await createShiprocketOrder(req.params.orderId);
  sendSuccess(res, 200, "Order pushed to Shiprocket", result);
};

/**
 * POST /api/admin/shiprocket/shipments/:shipmentId/awb
 * Request AWB assignment for a shipment
 */
const assignAwb = async (req, res) => {
  const { courierId } = req.body;
  const result = await requestShipment(req.params.shipmentId, courierId);
  sendSuccess(res, 200, "AWB assignment requested", result);
};

/**
 * GET /api/admin/shiprocket/track/awb/:awb
 * Track shipment by AWB code
 */
const trackAwb = async (req, res) => {
  const result = await trackByAwb(req.params.awb);
  sendSuccess(res, 200, "Tracking info fetched", result);
};

/**
 * GET /api/admin/shiprocket/track/order/:shiprocketOrderId
 * Track shipment by Shiprocket order ID
 */
const trackOrder = async (req, res) => {
  const result = await trackByShiprocketOrderId(req.params.shiprocketOrderId);
  sendSuccess(res, 200, "Tracking info fetched", result);
};

/**
 * POST /api/admin/shiprocket/orders/cancel
 * Cancel order(s) on Shiprocket
 */
const cancelOrder = async (req, res) => {
  const { ids } = req.body;
  const result = await cancelShiprocketOrder(ids);
  sendSuccess(res, 200, "Order(s) cancelled on Shiprocket", result);
};

/**
 * POST /api/webhooks/shiprocket
 * Receives tracking status updates from Shiprocket.
 * Shiprocket sends a POST with order tracking details.
 */
const shiprocketWebhookHandler = async (req, res) => {
  // Optional: verify webhook token
  const token = req.headers["x-api-key"] || req.query.token;
  if (env.shiprocketWebhookToken && token !== env.shiprocketWebhookToken) {
    return res.status(401).json({ success: false, message: "Invalid webhook token" });
  }

  const result = await processWebhook(req.body);

  return res.status(200).json({ success: true, data: result });
};

module.exports = {
  pushOrderToShiprocket,
  assignAwb,
  trackAwb,
  trackOrder,
  cancelOrder,
  shiprocketWebhookHandler
};
