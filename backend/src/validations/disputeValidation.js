const { z } = require("zod");

const raiseDisputeSchema = z.object({
  orderId: z.string().min(1),
  ndrId: z.string().min(1),
  issueType: z.string().min(1),
  description: z.string().min(10).max(2000),
  customerName: z.string().optional(),
  customerPhone: z.string().optional()
});

const updateDisputeSchema = z.object({
  issue_type: z.string().optional(),
  description: z.string().optional()
});

const resolveNdrSchema = z.object({
  ndr_id: z.string().min(1),
  resolution_note: z.string().max(1000).optional()
});

const resolveLocalDisputeSchema = z.object({
  resolution: z.string().max(1000).optional(),
  adminNotes: z.string().max(2000).optional()
});

module.exports = {
  raiseDisputeSchema,
  updateDisputeSchema,
  resolveNdrSchema,
  resolveLocalDisputeSchema
};