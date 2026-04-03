const { z } = require("zod");

const ebookIdParamsSchema = z.object({
  id: z.string().min(1)
});

const ebookStreamQuerySchema = z.object({
  token: z.string().min(1)
});

module.exports = {
  ebookIdParamsSchema,
  ebookStreamQuerySchema
};
