const express = require("express");
const { clerkWebhook } = require("../controllers/webhookController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

/**
 * Endpoint for Clerk webhooks.
 * IMPORTANT: It MUST receive the raw body buffer to properly verify the Svix signature.
 * It is mounted in app.js with express.raw().
 */
router.post("/clerk", express.raw({ type: 'application/json' }), asyncHandler(clerkWebhook));

module.exports = router;
