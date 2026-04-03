const express = require("express");
const multer = require("multer");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const ApiError = require("../utils/ApiError");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { getGallery, createGalleryItem, deleteGalleryItem } = require("../controllers/galleryController");
const { createGallerySchema, galleryIdParamsSchema } = require("../validations/galleryValidation");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new ApiError(400, "Only image files are allowed"));
  }
});

router.get("/", asyncHandler(getGallery));
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  validate({ body: createGallerySchema }),
  asyncHandler(createGalleryItem)
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate({ params: galleryIdParamsSchema }),
  asyncHandler(deleteGalleryItem)
);

module.exports = router;
