const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { getMyWishlist, addToWishlist, removeFromWishlist, checkWishlist } = require("../controllers/wishlistController");
const { addWishlistSchema } = require("../validations/wishlistValidation");

const router = express.Router();

router.use(authMiddleware);

router.get("/", asyncHandler(getMyWishlist));
router.get("/check/:bookId", asyncHandler(checkWishlist));
router.post("/", validate({ body: addWishlistSchema }), asyncHandler(addToWishlist));
router.delete("/:bookId", asyncHandler(removeFromWishlist));

module.exports = router;
