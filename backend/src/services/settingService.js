const prisma = require("../prisma/client");

/**
 * Get a site setting by key
 * @param {string} key 
 * @returns {Promise<any>}
 */
const getSetting = async (key) => {
  const setting = await prisma.siteSetting.findUnique({
    where: { key }
  });
  
  if (!setting) return null;
  
  try {
    return JSON.parse(setting.value);
  } catch (e) {
    return setting.value;
  }
};

/**
 * Set a site setting by key
 * @param {string} key 
 * @param {any} value 
 * @returns {Promise<any>}
 */
const setSetting = async (key, value) => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  
  const setting = await prisma.siteSetting.upsert({
    where: { key },
    update: { value: stringValue },
    create: { key, value: stringValue }
  });
  
  try {
    return JSON.parse(setting.value);
  } catch (e) {
    return setting.value;
  }
};

/**
 * Get active flash sale if it exists and hasn't expired
 * @returns {Promise<Object|null>}
 */
const getActiveFlashSale = async () => {
  const flashSale = await getSetting('FLASH_SALE');
  if (!flashSale || !flashSale.active) return null;
  
  const now = new Date();
  const endTime = new Date(flashSale.endTime);
  
  if (now > endTime) {
    // Automatically deactivate if expired
    await setSetting('FLASH_SALE', { ...flashSale, active: false });
    return null;
  }
  
  return flashSale;
};

/**
 * Dynamically applies active flash sale discount to a book object.
 */
const applyFlashSaleToBook = (book, flashSale) => {
  if (!flashSale || !book.mrp) return book;
  if (flashSale.bookType !== "ALL" && flashSale.bookType !== book.type) return book;
  
  const discount = Number(flashSale.discountPercentage) || 0;
  const mrp = Number(book.mrp);
  const newPrice = mrp - (mrp * (discount / 100));
  
  return {
    ...book,
    price: newPrice,
    discountPercentage: discount,
    _isFlashSale: true
  };
};

module.exports = {
  getSetting,
  setSetting,
  getActiveFlashSale,
  applyFlashSaleToBook
};
