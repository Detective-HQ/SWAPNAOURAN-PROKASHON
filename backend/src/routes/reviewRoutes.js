const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { createReview, listBookReviews, deleteReview } = require("../controllers/reviewController");
const { createReviewSchema } = require("../validations/reviewValidation");

const router = express.Router();

router.get("/book/:bookId", asyncHandler(listBookReviews));
router.post("/", authMiddleware, validate({ body: createReviewSchema }), asyncHandler(createReview));
router.delete("/:id", authMiddleware, asyncHandler(deleteReview));

module.exports = router;
