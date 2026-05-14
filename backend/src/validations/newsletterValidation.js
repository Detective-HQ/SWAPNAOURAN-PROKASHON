const { z } = require("zod");

const subscribeSchema = z.object({
  email: z.string().email()
});

module.exports = {
  subscribeSchema
};
