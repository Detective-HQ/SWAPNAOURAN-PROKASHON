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

const shiprocketApi = async (method, path, body = null, isRetry = false) => {
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
    // If token was revoked/expired mid-session, clear cache and retry once
    if (!isRetry && err.response?.status === 401) {
      console.warn("[Shiprocket] Token expired or revoked. Refreshing token and retrying...");
      cachedToken = null;
      tokenExpiresAt = 0;
      return shiprocketApi(method, path, body, true);
    }
    const msg = err.response?.data?.message || err.response?.data?.errors || err.message;
    console.error("[Shiprocket API Error]", method, path, msg);
    throw new ApiError(502, `Shiprocket API error: ${JSON.stringify(msg)}`);
  }
};

const isPhysicalBookType = (type) => type === "PHYSICAL" || type === "ENGLISH_BOOK";

// Realistic defaults for a standard paperback book (previously 500g/25x18x3 were too large)
const BOOK_DEFAULTS = {
  weightGrams: 300,
  lengthCm: 22,
  breadthCm: 14,
  heightCm: 2
};

const computePackageFromLineItems = (lineItems) => {
  const physical = lineItems.filter((item) => isPhysicalBookType(item.book.type));

  const totalWeightKg = physical.reduce(
    (sum, item) => sum + ((Number(item.book.weightGrams) || BOOK_DEFAULTS.weightGrams) / 1000) * item.quantity,
    0
  );

  const maxLength = physical.length
    ? Math.max(...physical.map((item) => Number(item.book.lengthCm) || BOOK_DEFAULTS.lengthCm))
    : BOOK_DEFAULTS.lengthCm;
  const maxBreadth = physical.length
    ? Math.max(...physical.map((item) => Number(item.book.breadthCm) || BOOK_DEFAULTS.breadthCm))
    : BOOK_DEFAULTS.breadthCm;
  const totalHeight = physical.reduce(
    (sum, item) => sum + (Number(item.book.heightCm) || BOOK_DEFAULTS.heightCm) * item.quantity,
    0
  );

  return {
    totalWeightKg: Math.max(totalWeightKg, 0.3),
    maxLength,
    maxBreadth,
    totalHeight: Math.max(totalHeight, BOOK_DEFAULTS.heightCm)
  };
};

const pickCheapestCourier = (couriers) => {
  const available = (couriers || []).filter((courier) => !courier.blocked);
  if (!available.length) return null;

  return available.reduce((best, courier) => {
    const rate = Number(courier.rate || courier.freight_charge || 0);
    if (!Number.isFinite(rate) || rate <= 0) return best;
    if (!best || rate < best.rate) {
      return {
        rate,
        // courier_id is stored so we can force the SAME courier at fulfillment time
        courierId: String(courier.courier_company_id || courier.id || ""),
        courierName: courier.courier_name || "",
        estimatedDeliveryDays: courier.estimated_delivery_days || ""
      };
    }
    return best;
  }, null);
};

const getShippingQuoteForItems = async ({ items, booksById, pincode }) => {
  const lineItems = items.map((item) => ({
    bookId: item.bookId,
    quantity: item.quantity,
    book: booksById[item.bookId]
  }));

  const subtotalAmount = lineItems.reduce(
    (sum, item) => sum + Number(item.book.price) * item.quantity,
    0
  );

  const hasPhysical = lineItems.some((item) => isPhysicalBookType(item.book.type));
  if (!hasPhysical) {
    return {
      subtotalAmount,
      deliveryCharge: 0,
      totalAmount: subtotalAmount,
      requiresDelivery: false,
      courierName: null,
      estimatedDeliveryDays: null
    };
  }

  const normalizedPincode = String(pincode || "").trim();
  if (!/^\d{6}$/.test(normalizedPincode)) {
    throw new ApiError(400, "A valid 6-digit delivery pincode is required");
  }

  if (!env.shiprocketPickupPincode) {
    throw new ApiError(500, "Shiprocket pickup pincode is not configured");
  }
  if (!env.shiprocketPickupLocation) {
    throw new ApiError(500, "Shiprocket pickup location name is not configured");
  }

  const pkg = computePackageFromLineItems(lineItems);
  const params = new URLSearchParams({
    pickup_postcode: env.shiprocketPickupPincode,
    delivery_postcode: normalizedPincode,
    cod: "0",
    weight: String(pkg.totalWeightKg),
    length: String(pkg.maxLength),
    breadth: String(pkg.maxBreadth),
    height: String(pkg.totalHeight)
  });

  const result = await shiprocketApi("GET", `/courier/serviceability/?${params.toString()}`);
  const cheapest = pickCheapestCourier(result?.data?.available_courier_companies);

  if (!cheapest) {
    throw new ApiError(400, "Delivery is not available for this pincode");
  }

  const deliveryCharge = Math.ceil(cheapest.rate);

  return {
    subtotalAmount,
    deliveryCharge,
    totalAmount: subtotalAmount + deliveryCharge,
    requiresDelivery: true,
    // Return courierId so it can be locked into the order record at checkout
    courierId: cheapest.courierId,
    courierName: cheapest.courierName,
    estimatedDeliveryDays: cheapest.estimatedDeliveryDays,
    package: {
      weightKg: pkg.totalWeightKg,
      lengthCm: pkg.maxLength,
      breadthCm: pkg.maxBreadth,
      heightCm: pkg.totalHeight
    }
  };
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
  const pincode = String(addr.pincode || addr.postalCode || "").trim();
  const billingAddress = String(addr.address || addr.line1 || "").trim();
  const billingPhone = String(addr.phone || "").replace(/\D/g, "").slice(-10);

  if (!pincode) {
    throw new ApiError(400, "Shipping address is missing pincode. Update the order address before fulfilling.");
  }
  if (billingAddress.length < 6) {
    throw new ApiError(400, "Shipping address must be at least 6 characters long (Shiprocket requirement).");
  }
  if (!addr.city || !addr.state) {
    throw new ApiError(400, "Shipping address is incomplete. City and state are required.");
  }
  if (billingPhone.length !== 10) {
    throw new ApiError(400, "Shipping address must include a valid 10-digit phone number.");
  }

  // Build order_items array for Shiprocket
  const orderItems = order.items
    .filter((item) => item.book.type === "PHYSICAL" || item.book.type === "ENGLISH_BOOK")
    .map((item) => {
      const unitPrice = Number(item.unitPrice);
      const mrp = Number(item.book.mrp || item.unitPrice);
      // Shiprocket expects the absolute discount amount in INR per unit, NOT percentage
      const discountAmount = Math.max(0, Math.round((mrp - unitPrice) * 100) / 100);
      return {
        name: item.book.title,
        sku: item.book.sku || `BOOK-${item.book.id.slice(-8)}`,
        units: item.quantity,
        selling_price: unitPrice,
        discount: discountAmount,
        tax: 0,
        hsn: item.book.hsn || ""
      };
    });

  if (orderItems.length === 0) {
    throw new ApiError(400, "No physical items to ship in this order");
  }

  const physicalLineItems = order.items.filter((item) => isPhysicalBookType(item.book.type));

  // Prefer package snapshot from checkout so fulfill uses the exact dims that were quoted
  const hasPackageSnapshot =
    order.packageWeightKg != null &&
    order.packageLengthCm != null &&
    order.packageBreadthCm != null &&
    order.packageHeightCm != null;

  const pkg = hasPackageSnapshot
    ? {
        totalWeightKg: Number(order.packageWeightKg),
        maxLength: Number(order.packageLengthCm),
        maxBreadth: Number(order.packageBreadthCm),
        totalHeight: Number(order.packageHeightCm)
      }
    : computePackageFromLineItems(physicalLineItems);

  // Safe subtotal: if subtotalAmount is null, compute from items to avoid double-counting deliveryCharge
  const subtotalAmount = order.subtotalAmount
    ? Number(order.subtotalAmount)
    : order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const shippingCharges = Number(order.deliveryCharge ?? 0);

  if (!order.selectedCourierId) {
    throw new ApiError(
      400,
      "This order has no locked courier from checkout. Recreate the order with a valid shipping quote before fulfilling."
    );
  }

  const payload = {
    order_id: order.id,
    order_date: new Date(order.createdAt).toISOString().split("T")[0],
    pickup_location: env.shiprocketPickupLocation,
    channel_id: env.shiprocketChannelId || undefined,
    comment: `Swapnaouran Prokashon Order`,
    billing_customer_name: addr.name || order.user.name || "Customer",
    billing_last_name: "",
    billing_address: billingAddress,
    billing_address_2: addr.addressLine2 || addr.line2 || "",
    billing_city: addr.city || "",
    billing_pincode: pincode,
    billing_state: addr.state || "",
    billing_country: "India",
    billing_email: order.user.email || addr.email || "",
    billing_phone: billingPhone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: "Prepaid",
    shipping_charges: shippingCharges,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: subtotalAmount,
    length: pkg.maxLength,
    breadth: pkg.maxBreadth,
    height: pkg.totalHeight,
    weight: pkg.totalWeightKg
  };

  const result = await shiprocketApi("POST", "/orders/create/adhoc", payload);

  if (!result?.order_id) {
    const detail = result?.message || result?.errors || "Shiprocket did not return an order ID";
    throw new ApiError(502, `Shiprocket API error: ${JSON.stringify(detail)}`);
  }

  // Save Shiprocket references
  await prisma.order.update({
    where: { id: orderId },
    data: {
      shiprocketOrderId: String(result.order_id),
      shiprocketShipmentId: result.shipment_id ? String(result.shipment_id) : null,
      deliveryStatus: "PROCESSING"
    }
  });

  // Auto-assign AWB using the courier locked at checkout (same rate path as quote)
  if (!result.shipment_id) {
    throw new ApiError(502, "Shiprocket order created but no shipment_id was returned for AWB assignment");
  }

  const courierId = String(order.selectedCourierId);
  try {
    const awbResult = await requestShipment(String(result.shipment_id), courierId);
    const awb = awbResult?.awb_assign_status === 1
      ? (awbResult?.response?.data?.awb_code || awbResult?.awb_code || null)
      : null;
    if (!awb) {
      throw new ApiError(
        502,
        `AWB assignment failed for locked courier ${order.selectedCourierName || courierId}. Do not assign a different courier — retry with the locked courier.`
      );
    }
    await prisma.order.update({
      where: { id: orderId },
      data: {
        awbCode: String(awb),
        trackingNumber: String(awb)
      }
    });
    result._awbCode = awb;
  } catch (awbErr) {
    if (awbErr instanceof ApiError) throw awbErr;
    throw new ApiError(
      502,
      `AWB auto-assignment failed for locked courier ${courierId}: ${awbErr?.message || "unknown error"}`
    );
  }

  return result;
};

// ──────────────────────── Request Shipment (AWB assignment) ────────────────────────
const requestShipment = async (shiprocketShipmentId, courierId) => {
  if (!courierId) {
    throw new ApiError(400, "courier_id is required to assign AWB (must match the courier locked at checkout)");
  }

  const result = await shiprocketApi("POST", "/courier/assign/awb", {
    shipment_id: shiprocketShipmentId,
    courier_id: courierId
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
    where: { shiprocketOrderId: String(shiprocketOrderId) },
    include: { items: { include: { book: true } } }
  });

  if (!order || !order.shiprocketShipmentId) {
    throw new ApiError(400, "Shipment not created yet for this order");
  }

  const addr = order.shippingAddress || {};
  const pincode = String(addr.pincode || addr.postalCode || "").trim();

  const hasPackageSnapshot =
    order.packageWeightKg != null &&
    order.packageLengthCm != null &&
    order.packageBreadthCm != null &&
    order.packageHeightCm != null;

  const pkg = hasPackageSnapshot
    ? {
        totalWeightKg: Number(order.packageWeightKg),
        maxLength: Number(order.packageLengthCm),
        maxBreadth: Number(order.packageBreadthCm),
        totalHeight: Number(order.packageHeightCm)
      }
    : computePackageFromLineItems(
        order.items.filter((item) => isPhysicalBookType(item.book.type))
      );

  const params = new URLSearchParams({
    pickup_postcode: env.shiprocketPickupPincode,
    delivery_postcode: pincode,
    cod: "0",
    weight: String(pkg.totalWeightKg),
    length: String(pkg.maxLength),
    breadth: String(pkg.maxBreadth),
    height: String(pkg.totalHeight),
    shipment_id: String(order.shiprocketShipmentId)
  });

  const result = await shiprocketApi("GET", `/courier/serviceability/?${params.toString()}`);
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
    "RTO INITIATED": "RTO",
    "RTO DELIVERED": "RTO",
    "CANCELLED": "CANCELLED"
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
  getShippingQuoteForItems,
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
