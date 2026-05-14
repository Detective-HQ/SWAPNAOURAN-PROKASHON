const { z } = require("zod");

const addWishlistSchema = z.object({
  bookId: z.string().min(1)
});

module.exports = {
  addWishlistSchema
};
