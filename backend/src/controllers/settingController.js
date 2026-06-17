const { getSetting, setSetting } = require("../services/settingService");
const { sendSuccess } = require("../utils/response");

// Admin GET all relevant settings
const getAdminSettings = async (req, res) => {
  const flashSale = await getSetting('FLASH_SALE');
  const announcementBanner = await getSetting('ANNOUNCEMENT_BANNER');

  sendSuccess(res, 200, "Settings fetched successfully", {
    flashSale: flashSale || { active: false },
    announcementBanner: announcementBanner || { active: false, text: "" }
  });
};

// Admin PUT setting
const updateSetting = async (req, res) => {
  const { key, value } = req.body;
  const updated = await setSetting(key, value);
  sendSuccess(res, 200, "Setting updated successfully", updated);
};

// Public GET active banners/sales
const getPublicSettings = async (req, res) => {
  const announcementBanner = await getSetting('ANNOUNCEMENT_BANNER');
  
  sendSuccess(res, 200, "Public settings fetched", {
    announcementBanner: announcementBanner && announcementBanner.active ? announcementBanner : null
  });
};

module.exports = {
  getAdminSettings,
  updateSetting,
  getPublicSettings
};
