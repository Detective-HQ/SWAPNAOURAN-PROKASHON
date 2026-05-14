const { z } = require("zod");

const createReturnSchema = z.object({
  orderId: z.string().min(1),
  bookId: z.string().min(1),
  reason: z.string().min(10).max(1000)
});

const updateReturnSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "REFUNDED"]),
  adminNote: z.string().max(500).optional()
});

module.exports = {
  createReturnSchema,
  updateReturnSchema
};
