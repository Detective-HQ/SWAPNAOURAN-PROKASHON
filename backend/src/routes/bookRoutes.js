const express = require("express");
const multer = require("multer");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const {
  listBooks,
  getBookById,
  createBook,
  createBookWithFiles,
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
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", validate({ query: listBooksQuerySchema }), asyncHandler(listBooks));
router.get("/:id", validate({ params: bookIdParamsSchema }), asyncHandler(getBookById));
router.post(
  "/with-files",
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 }
  ]),
  asyncHandler(createBookWithFiles)
);
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
