const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { createReturnRequest, getMyReturns } = require("../controllers/returnController");
const { createReturnSchema } = require("../validations/returnValidation");

const router = express.Router();

router.use(authMiddleware);

router.get("/", asyncHandler(getMyReturns));
router.post("/", validate({ body: createReturnSchema }), asyncHandler(createReturnRequest));

module.exports = router;
