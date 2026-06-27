const { z } = require("zod");

const bookTypes = ["PHYSICAL", "EBOOK", "ENGLISH_BOOK"];

const baseBookSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  authorName: z.string().optional(),
  isbn: z.string().nullable().optional(),
  pageCount: z.number().int().positive().nullable().optional(),
  bindingDetails: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  copiesSold: z.number().int().min(0).nullable().optional(),
  price: z.number().positive().optional(),
  mrp: z.number().positive().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  type: z.enum(bookTypes),
  coverImage: z.string().url().optional(),
  fileUrl: z.string().url().optional(),
  sampleChapterUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  // Shiprocket shipping dimensions
  sku: z.string().optional(),
  hsn: z.string().optional(),
  lengthCm: z.number().positive().optional(),
  breadthCm: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  weightGrams: z.number().positive().optional()
});

const createBookSchema = baseBookSchema.superRefine((value, ctx) => {
  if (value.type === "EBOOK" && !value.fileUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "fileUrl is required for EBOOK"
    });
  }
});

const updateBookSchema = baseBookSchema.partial().superRefine((value, ctx) => {
  if (value.type === "EBOOK" && value.fileUrl === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "fileUrl cannot be empty for EBOOK"
    });
  }
});

const bookIdParamsSchema = z.object({
  id: z.string().min(1)
});

const listBooksQuerySchema = z.object({
  type: z.enum(bookTypes).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

module.exports = {
  createBookSchema,
  updateBookSchema,
  bookIdParamsSchema,
  listBooksQuerySchema
};
