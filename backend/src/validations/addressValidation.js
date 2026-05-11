const { z } = require("zod");

const createAddressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Full address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Valid pincode is required"),
  isDefault: z.boolean().optional()
});

const updateAddressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().min(10, "Valid phone number is required").optional(),
  address: z.string().min(5, "Full address is required").optional(),
  city: z.string().min(2, "City is required").optional(),
  state: z.string().min(2, "State is required").optional(),
  pincode: z.string().min(4, "Valid pincode is required").optional(),
  isDefault: z.boolean().optional()
});

const addressIdParamsSchema = z.object({
  id: z.string().min(1)
});

module.exports = {
  createAddressSchema,
  updateAddressSchema,
  addressIdParamsSchema
};
