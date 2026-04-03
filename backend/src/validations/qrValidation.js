const { z } = require("zod");

const qrIdParamsSchema = z.object({
  id: z.string().min(1)
});

module.exports = {
  qrIdParamsSchema
};
