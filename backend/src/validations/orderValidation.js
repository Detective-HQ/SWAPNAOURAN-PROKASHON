const { z } = require("zod");

const orderItemSchema = z.object({
  bookId: z.coerce.string().min(1),
  quantity: z.number().int().positive().default(1)
});

const addressSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    line1: z.string().min(2).optional(),
    line2: z.string().optional(),
    city: z.string().min(2).optional(),
    state: z.string().min(2).optional(),
    pincode: z.string().min(4).optional(),
    postalCode: z.string().min(3).optional(),
    country: z.string().min(2).optional()
  })
  .transform((addr) => ({
    ...addr,
    pincode: addr.pincode || addr.postalCode,
    address: addr.address || addr.line1,
    addressLine2: addr.line2
  }))
  .optional();

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  shippingAddress: addressSchema
});

const orderIdParamsSchema = z.object({
  id: z.string().min(1)
});

const payOrderParamsSchema = z.object({
  orderId: z.string().min(1)
});

const verifyPaymentSchema = z.object({
  paymentIntentId: z.string().optional(),
  providerPaymentId: z.string().optional(),
  confirmationCode: z.string().optional(),
  signature: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional()
});

const updateOrderTrackingSchema = z.object({
  trackingNumber: z.string().min(1),
  deliveryStatus: z.enum(["PROCESSING", "SHIPPED", "IN_TRANSIT", "DELIVERED"]).optional()
});

module.exports = {
  createOrderSchema,
  orderIdParamsSchema,
  payOrderParamsSchema,
  verifyPaymentSchema,
  updateOrderTrackingSchema
};
