const { z } = require("zod");

const createGallerySchema = z.object({
  title: z.string().min(2).max(150).optional()
});

const galleryIdParamsSchema = z.object({
  id: z.string().min(1)
});

module.exports = {
  createGallerySchema,
  galleryIdParamsSchema
};
