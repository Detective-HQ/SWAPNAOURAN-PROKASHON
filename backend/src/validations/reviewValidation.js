const { z } = require("zod");

const createReviewSchema = z.object({
  bookId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

const listReviewsQuerySchema = z.object({
  bookId: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

module.exports = {
  createReviewSchema,
  listReviewsQuerySchema
};
