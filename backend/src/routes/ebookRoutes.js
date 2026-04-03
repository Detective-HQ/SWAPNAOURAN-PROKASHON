const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { readEbook, streamEbookController } = require("../controllers/ebookController");
const { ebookIdParamsSchema, ebookStreamQuerySchema } = require("../validations/ebookValidation");

const router = express.Router();

router.use(authMiddleware);
router.get("/:id/read", validate({ params: ebookIdParamsSchema }), asyncHandler(readEbook));
router.get(
  "/:id/stream",
  validate({ params: ebookIdParamsSchema, query: ebookStreamQuerySchema }),
  asyncHandler(streamEbookController)
);

module.exports = router;
