const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} = require("../controllers/addressController");
const {
  createAddressSchema,
  updateAddressSchema,
  addressIdParamsSchema
} = require("../validations/addressValidation");

const router = express.Router();

router.use(authMiddleware);

router.get("/", asyncHandler(getAddresses));
router.post("/", validate({ body: createAddressSchema }), asyncHandler(createAddress));
router.put(
  "/:id",
  validate({ params: addressIdParamsSchema, body: updateAddressSchema }),
  asyncHandler(updateAddress)
);
router.delete(
  "/:id",
  validate({ params: addressIdParamsSchema }),
  asyncHandler(deleteAddress)
);

module.exports = router;
