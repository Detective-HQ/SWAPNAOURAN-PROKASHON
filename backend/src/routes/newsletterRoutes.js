const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { subscribe, unsubscribe, listSubscribers } = require("../controllers/newsletterController");
const { subscribeSchema } = require("../validations/newsletterValidation");

const router = express.Router();

router.post("/subscribe", validate({ body: subscribeSchema }), asyncHandler(subscribe));
router.post("/unsubscribe", validate({ body: subscribeSchema }), asyncHandler(unsubscribe));
router.get("/subscribers", authMiddleware, adminMiddleware, asyncHandler(listSubscribers));

module.exports = router;
