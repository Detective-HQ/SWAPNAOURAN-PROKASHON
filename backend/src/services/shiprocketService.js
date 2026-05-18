const axios = require("axios");
const env = require("../config/env");
const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// ──────────────────────── Token management ────────────────────────
let cachedToken = null;
let tokenExpiresAt = 0;

const getAuthToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  if (!env.shiprocketEmail || !env.shiprocketPassword) {
    throw new ApiError(500, "Shiprocket credentials not configured");
  }

  const { data } = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
    email: env.shiprocketEmail,
    password: env.shiprocketPassword
  });

  cachedToken = data.token;
  // Token is valid for ~10 days; refresh after 9 days
  tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
  return cachedToken;
};

const shiprocketApi = async (method, path, body = null) => {
  const token = await getAuthToken();
  const config = {
    method,
    url: `${SHIPROCKET_BASE_URL}${path}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  };
  if (body) config.data = body;

  try {
    const { data } = await axios(config);
    return data;
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.errors || err.message;
    console.error("[Shiprocket API Error]", method, path, msg);
    throw new ApiError(502, `Shiprocket API error: ${JSON.stringify(msg)}`);
  }
};

// ──────────────────────── Create Shiprocket Order ────────────────────────
/**
 * Pushes a paid order from our DB to Shiprocket.
 * Accepts our internal orderId.
 */
const createShiprocketOrder = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: { include: { book: true } },
      payment: true
    }
  });

  if (!order) throw new ApiError(404, "Order not found");
  if (order.status !== "PAID") throw new ApiError(400, "Only paid orders can be shipped");
  if (order.shiprocketOrderId) throw new ApiError(400, "Order already pushed to Shiprocket");

  // Build shipping address from order JSON
  const addr = order.shippingAddress || {};

  // Build order_items array for Shiprocket
  const orderItems = order.items
    .filter((item) => item.book.type === "PHYSICAL" || item.book.type === "ENGLISH_BOOK")
    .map((item) => ({
      name: item.book.title,
      sku: item.book.sku || `BOOK-${item.book.id.slice(-8)}`,
      units: item.quantity,
      selling_price: Number(item.unitPrice),
      discount: item.book.discountPercentage ? Number(item.book.discountPercentage) : 0,
      tax: 0,
      hsn: item.book.hsn || ""
    }));

  if (orderItems.length === 0) {
    throw new ApiError(400, "No physical items to ship in this order");
  }

  // Calculate package dimensions from heaviest / largest item
  const physicalBooks = order.items
    .filter((item) => item.book.type === "PHYSICAL" || item.book.type === "ENGLISH_BOOK")
    .map((i) => i.book);

  const totalWeightKg = physicalBooks.reduce((sum, b) => {
    return sum + (Number(b.weightGrams) || 500) / 1000;
  }, 0);

  const maxLength = Math.max(...physicalBooks.map((b) => Number(b.lengthCm) || 25));
  const maxBreadth = Math.max(...physicalBooks.map((b) => Number(b.breadthCm) || 18));
  const totalHeight = physicalBooks.reduce((sum, b) => sum + (Number(b.heightCm) || 3), 0);

  const payload = {
    order_id: order.id,
    order_date: new Date(order.createdAt).toISOString().split("T")[0],
    pickup_location: env.shiprocketPickupLocation,
    channel_id: env.shiprocketChannelId || undefined,
    comment: `Swapnaouran Prokashon Order`,
    billing_customer_name: addr.name || order.user.name || "Customer",
    billing_last_name: "",
    billing_address: addr.address || "",
    billing_address_2: "",
    billing_city: addr.city || "",
    billing_pincode: addr.pincode || "",
    billing_state: addr.state || "",
    billing_country: "India",
    billing_email: order.user.email || "",
    billing_phone: addr.phone || "",
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: "Prepaid",
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: Number(order.totalAmount),
    length: maxLength,
    breadth: maxBreadth,
    height: totalHeight,
    weight: totalWeightKg
  };

  const result = await shiprocketApi("POST", "/orders/create/adhoc", payload);

  // Save Shiprocket references
  await prisma.order.update({
    where: { id: orderId },
    data: {
      shiprocketOrderId: String(result.order_id),
      shiprocketShipmentId: result.shipment_id ? String(result.shipment_id) : null,
      deliveryStatus: "PROCESSING"
    }
  });

  return result;
};

// ──────────────────────── Request Shipment (AWB assignment) ────────────────────────
const requestShipment = async (shiprocketShipmentId, courierId) => {
  const result = await shiprocketApi("POST", "/courier/assign/awb", {
    shipment_id: shiprocketShipmentId,
    courier_id: courierId || undefined
  });

  return result;
};

// ──────────────────────── Track by AWB ────────────────────────
const trackByAwb = async (awbCode) => {
  const result = await shiprocketApi("GET", `/courier/track/awb/${awbCode}`);
  return result;
};

// ──────────────────────── Track by Shiprocket Order ID ────────────────────────
const trackByShiprocketOrderId = async (shiprocketOrderId) => {
  const result = await shiprocketApi("GET", `/courier/track?order_id=${shiprocketOrderId}`);
  return result;
};

// ──────────────────────── Cancel Shiprocket Order ────────────────────────
const cancelShiprocketOrder = async (shiprocketOrderIds) => {
  const result = await shiprocketApi("POST", "/orders/cancel", {
    ids: Array.isArray(shiprocketOrderIds) ? shiprocketOrderIds : [shiprocketOrderIds]
  });
  return result;
};

// ──────────────────────── Get Available Couriers ────────────────────────
const getAvailableCouriers = async (shiprocketOrderId) => {
  const order = await prisma.order.findFirst({
    where: { shiprocketOrderId: String(shiprocketOrderId) }
  });

  if (!order || !order.shiprocketShipmentId) {
    throw new ApiError(400, "Shipment not created yet for this order");
  }

  const addr = order.shippingAddress || {};
  const result = await shiprocketApi(
    "GET",
    `/courier/serviceability/?pickup_postcode=${env.shiprocketPickupLocation}&delivery_postcode=${addr.pincode || ""}&cod=0&weight=0.5&shipment_id=${order.shiprocketShipmentId}`
  );

  return result;
};

// ──────────────────────── Process Shiprocket Webhook ────────────────────────
/**
 * Handles status update webhooks from Shiprocket.
 * Maps Shiprocket status to our DeliveryStatus enum.
 */
const processWebhook = async (payload) => {
  const { order_id, current_status, awb } = payload;

  if (!order_id) return { ignored: true, reason: "No order_id in payload" };

  const order = await prisma.order.findFirst({
    where: { shiprocketOrderId: String(order_id) }
  });

  if (!order) return { ignored: true, reason: "Order not found for shiprocket order_id" };

  // Map Shiprocket statuses to our enum
  const statusMap = {
    "NEW": "PROCESSING",
    "PICKUP SCHEDULED": "PROCESSING",
    "PICKUP GENERATED": "PROCESSING",
    "PICKUP QUEUED": "PROCESSING",
    "OUT FOR PICKUP": "PROCESSING",
    "PICKED UP": "SHIPPED",
    "SHIPPED": "SHIPPED",
    "IN TRANSIT": "IN_TRANSIT",
    "OUT FOR DELIVERY": "IN_TRANSIT",
    "DELIVERED": "DELIVERED",
    "UNDELIVERED": "IN_TRANSIT",
    "RTO INITIATED": "IN_TRANSIT",
    "RTO DELIVERED": "PROCESSING",
    "CANCELLED": "PROCESSING"
  };

  const statusUpper = (current_status || "").toUpperCase();
  const deliveryStatus = statusMap[statusUpper] || order.deliveryStatus;

  const updateData = { deliveryStatus };
  if (awb) updateData.awbCode = String(awb);
  if (awb) updateData.trackingNumber = String(awb);

  await prisma.order.update({
    where: { id: order.id },
    data: updateData
  });

  return { success: true, orderId: order.id, newStatus: deliveryStatus };
};

// ──────────────────────── NDR / Dispute ────────────────────────

const listNdrDisputes = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.perPage) query.set("per_page", params.perPage);
  if (params.fromDate) query.set("from_date", params.fromDate);
  if (params.toDate) query.set("to_date", params.toDate);
  if (params.status) query.set("status", params.status);
  if (params.awb) query.set("awb", params.awb);
  const qs = query.toString();
  const result = await shiprocketApi("GET", `/ndr/list${qs ? `?${qs}` : ""}`);
  return result;
};

const getNdrDetails = async (ndrId) => {
  const result = await shiprocketApi("GET", `/ndr/${ndrId}`);
  return result;
};

const raiseDispute = async (payload) => {
  const result = await shiprocketApi("POST", "/ndr/dispute", payload);
  if (result.dispute_id) {
    await prisma.dispute.updateMany({
      where: { ndrId: payload.ndr_id },
      data: { shiprocketDisputeId: String(result.dispute_id) }
    });
  }
  return result;
};

const updateDispute = async (disputeId, payload) => {
  const result = await shiprocketApi("PUT", `/ndr/dispute/${disputeId}`, payload);
  return result;
};

const resolveNdr = async (payload) => {
  const result = await shiprocketApi("POST", "/ndr/resolve", payload);
  return result;
};

// ──────────────────────── Local Dispute Records ────────────────────────

const createLocalDispute = async (data) => {
  const dispute = await prisma.dispute.create({ data });
  return dispute;
};

const listLocalDisputes = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.orderId) where.orderId = filters.orderId;
  if (filters.ndrId) where.ndrId = filters.ndrId;
  const disputes = await prisma.dispute.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: { id: true, invoiceNumber: true, userId: true, totalAmount: true, status: true }
      }
    }
  });
  return disputes;
};

const getLocalDispute = async (id) => {
  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      order: {
        select: { id: true, invoiceNumber: true, totalAmount: true, status: true, shippingAddress: true }
      }
    }
  });
  return dispute;
};

const updateLocalDispute = async (id, data) => {
  const dispute = await prisma.dispute.update({
    where: { id },
    data
  });
  return dispute;
};

module.exports = {
  createShiprocketOrder,
  requestShipment,
  trackByAwb,
  trackByShiprocketOrderId,
  cancelShiprocketOrder,
  getAvailableCouriers,
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
};
