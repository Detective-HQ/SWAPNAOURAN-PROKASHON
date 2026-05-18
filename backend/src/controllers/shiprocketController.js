const prisma = require("../prisma/client");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const {
  createShiprocketOrder,
  requestShipment,
  trackByAwb,
  trackByShiprocketOrderId,
  cancelShiprocketOrder,
  processWebhook,
  listNdrDisputes,
  getNdrDetails,
  raiseDispute,
  updateDispute,
  resolveNdr,
  createLocalDispute,
  listLocalDisputes,
  getLocalDispute,
  updateLocalDispute
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

// ──────────────────────── Dispute / NDR ────────────────────────

/**
 * GET /api/admin/shiprocket/ndr
 * List NDRs from Shiprocket
 */
const listNdr = async (req, res) => {
  const result = await listNdrDisputes(req.query);
  sendSuccess(res, 200, "NDR list fetched", result);
};

/**
 * GET /api/admin/shiprocket/ndr/:ndrId
 * Get NDR details from Shiprocket
 */
const getNdr = async (req, res) => {
  const result = await getNdrDetails(req.params.ndrId);
  sendSuccess(res, 200, "NDR details fetched", result);
};

/**
 * POST /api/admin/shiprocket/disputes
 * Raise a dispute on Shiprocket and record locally
 */
const raiseDisputeHandler = async (req, res) => {
  const { orderId, ndrId, issueType, description, customerName, customerPhone } = req.body;

  const shiprocketPayload = {
    ndr_id: ndrId,
    issue_type: issueType,
    description
  };
  const shiprocketResult = await raiseDispute(shiprocketPayload);

  const local = await createLocalDispute({
    orderId,
    ndrId,
    shiprocketDisputeId: shiprocketResult.dispute_id ? String(shiprocketResult.dispute_id) : null,
    issueType,
    description,
    customerName,
    customerPhone,
    ndrData: shiprocketResult
  });

  sendSuccess(res, 201, "Dispute raised", { shiprocket: shiprocketResult, local });
};

/**
 * PUT /api/admin/shiprocket/disputes/:disputeId
 * Update a dispute on Shiprocket
 */
const updateDisputeHandler = async (req, res) => {
  const { disputeId } = req.params;
  const result = await updateDispute(disputeId, req.body);
  sendSuccess(res, 200, "Dispute updated", result);
};

/**
 * POST /api/admin/shiprocket/ndr/resolve
 * Resolve an NDR
 */
const resolveNdrHandler = async (req, res) => {
  const result = await resolveNdr(req.body);
  if (result.success) {
    await prisma.dispute.updateMany({
      where: { ndrId: req.body.ndr_id },
      data: { status: "RESOLVED", resolution: req.body.resolution_note || null }
    });
  }
  sendSuccess(res, 200, "NDR resolved", result);
};

/**
 * GET /api/admin/shiprocket/disputes
 * List local dispute records
 */
const listDisputes = async (req, res) => {
  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.orderId) filters.orderId = req.query.orderId;
  if (req.query.ndrId) filters.ndrId = req.query.ndrId;
  const result = await listLocalDisputes(filters);
  sendSuccess(res, 200, "Disputes fetched", result);
};

/**
 * GET /api/admin/shiprocket/disputes/:id
 * Get a single local dispute record
 */
const getDispute = async (req, res) => {
  const result = await getLocalDispute(req.params.id);
  if (!result) throw new ApiError(404, "Dispute not found");
  sendSuccess(res, 200, "Dispute fetched", result);
};

/**
 * PUT /api/admin/shiprocket/disputes/:id/resolve
 * Resolve a local dispute record
 */
const resolveLocalDispute = async (req, res) => {
  const existing = await getLocalDispute(req.params.id);
  if (!existing) throw new ApiError(404, "Dispute not found");
  const { resolution } = req.body;
  const result = await updateLocalDispute(req.params.id, { status: "RESOLVED", resolution, adminNotes: req.body.adminNotes });
  sendSuccess(res, 200, "Dispute resolved", result);
};

module.exports = {
  pushOrderToShiprocket,
  assignAwb,
  trackAwb,
  trackOrder,
  cancelOrder,
  shiprocketWebhookHandler,
  listNdr,
  getNdr,
  raiseDisputeHandler,
  updateDisputeHandler,
  resolveNdrHandler,
  listDisputes,
  getDispute,
  resolveLocalDispute
};
