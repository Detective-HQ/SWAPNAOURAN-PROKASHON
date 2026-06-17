const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const { getAdminSettings, updateSetting, getPublicSettings } = require("../controllers/settingController");

const router = express.Router();

router.get("/public", asyncHandler(getPublicSettings));
router.get("/", authMiddleware, adminMiddleware, asyncHandler(getAdminSettings));
router.put("/", authMiddleware, adminMiddleware, asyncHandler(updateSetting));

module.exports = router;
