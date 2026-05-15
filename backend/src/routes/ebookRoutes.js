const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { readEbook, streamEbookController, previewEbook, streamPreviewController, listMyEbooks } = require("../controllers/ebookController");
const { ebookIdParamsSchema, ebookStreamQuerySchema } = require("../validations/ebookValidation");

const router = express.Router();

// Public preview endpoints (no auth required)
router.get("/:id/preview", validate({ params: ebookIdParamsSchema }), asyncHandler(previewEbook));
router.get(
  "/:id/stream-preview",
  validate({ params: ebookIdParamsSchema, query: ebookStreamQuerySchema }),
  asyncHandler(streamPreviewController)
);

// Stream endpoint - secured by its own JWT token in the query string.
// Must be ABOVE authMiddleware because iframes cannot send Clerk headers.
router.get(
  "/:id/stream",
  validate({ params: ebookIdParamsSchema, query: ebookStreamQuerySchema }),
  asyncHandler(streamEbookController)
);

// Authenticated endpoints (require Clerk auth header)
router.use(authMiddleware);
router.get("/", asyncHandler(listMyEbooks));
router.get("/:id/read", validate({ params: ebookIdParamsSchema }), asyncHandler(readEbook));

module.exports = router;
