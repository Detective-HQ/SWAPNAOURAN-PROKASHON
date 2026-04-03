const { z } = require("zod");

const orderItemSchema = z.object({
  bookId: z.string().min(1),
  quantity: z.number().int().positive().default(1)
});

const addressSchema = z
  .object({
    line1: z.string().min(2),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(3),
    country: z.string().min(2)
  })
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

module.exports = {
  createOrderSchema,
  orderIdParamsSchema,
  payOrderParamsSchema,
  verifyPaymentSchema
};
