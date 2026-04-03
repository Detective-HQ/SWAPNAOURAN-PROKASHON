const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { verifyQr } = require("../controllers/qrController");
const { qrIdParamsSchema } = require("../validations/qrValidation");

const router = express.Router();

router.get("/verify/:id", authMiddleware, validate({ params: qrIdParamsSchema }), asyncHandler(verifyQr));

module.exports = router;
