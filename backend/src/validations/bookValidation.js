const { z } = require("zod");

const bookTypes = ["PHYSICAL", "EBOOK"];

const baseBookSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  type: z.enum(bookTypes),
  coverImage: z.string().url().optional(),
  fileUrl: z.string().url().optional(),
  isActive: z.boolean().optional()
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
