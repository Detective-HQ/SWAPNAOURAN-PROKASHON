const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");

const getMyWishlist = async (req, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      book: {
        select: { id: true, title: true, price: true, coverImage: true, type: true, isActive: true }
      }
    }
  });
  sendSuccess(res, 200, "Wishlist fetched", items);
};

const addToWishlist = async (req, res) => {
  const { bookId } = req.body;
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || !book.isActive) throw new ApiError(404, "Book not found");

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_bookId: { userId: req.user.id, bookId } }
  });
  if (existing) throw new ApiError(400, "Book already in wishlist");

  const item = await prisma.wishlistItem.create({
    data: { userId: req.user.id, bookId },
    include: {
      book: { select: { id: true, title: true, price: true, coverImage: true, type: true } }
    }
  });
  sendSuccess(res, 201, "Added to wishlist", item);
};

const removeFromWishlist = async (req, res) => {
  const { bookId } = req.params;
  const item = await prisma.wishlistItem.findUnique({
    where: { userId_bookId: { userId: req.user.id, bookId } }
  });
  if (!item) throw new ApiError(404, "Item not in wishlist");
  await prisma.wishlistItem.delete({ where: { id: item.id } });
  sendSuccess(res, 200, "Removed from wishlist");
};

const checkWishlist = async (req, res) => {
  const { bookId } = req.params;
  const item = await prisma.wishlistItem.findUnique({
    where: { userId_bookId: { userId: req.user.id, bookId } }
  });
  sendSuccess(res, 200, "Wishlist status", { isWishlisted: !!item });
};

module.exports = { getMyWishlist, addToWishlist, removeFromWishlist, checkWishlist };
