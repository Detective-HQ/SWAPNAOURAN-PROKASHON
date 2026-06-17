const express = require("express");

const validate = require("../middleware/validate");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const { authLimiter } = require("../middleware/rateLimiter");
const { signup, login, getMe } = require("../controllers/authController");
const { signupSchema, loginSchema } = require("../validations/authValidation");

const router = express.Router();

router.post("/signup", authLimiter, validate({ body: signupSchema }), asyncHandler(signup));
router.post("/login", authLimiter, validate({ body: loginSchema }), asyncHandler(login));
router.get("/me", authMiddleware, asyncHandler(getMe));

module.exports = router;
