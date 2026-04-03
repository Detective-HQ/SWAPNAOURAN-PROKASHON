const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const {
  listBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require("../controllers/bookController");
const {
  createBookSchema,
  updateBookSchema,
  bookIdParamsSchema,
  listBooksQuerySchema
} = require("../validations/bookValidation");

const router = express.Router();

router.get("/", validate({ query: listBooksQuerySchema }), asyncHandler(listBooks));
router.get("/:id", validate({ params: bookIdParamsSchema }), asyncHandler(getBookById));
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validate({ body: createBookSchema }),
  asyncHandler(createBook)
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate({ params: bookIdParamsSchema, body: updateBookSchema }),
  asyncHandler(updateBook)
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate({ params: bookIdParamsSchema }),
  asyncHandler(deleteBook)
);

module.exports = router;
