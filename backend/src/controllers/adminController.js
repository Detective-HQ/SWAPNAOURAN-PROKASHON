const prisma = require("../prisma/client");
const { sendSuccess } = require("../utils/response");
const { getAdminAnalytics } = require("../services/analyticsService");
const { resolvePublicAssetUrl } = require("../services/storageService");

const getAdminUsers = async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  sendSuccess(res, 200, "Users fetched", users);
};

const getAdminBooks = async (_req, res) => {
  const books = await prisma.book.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      title: true,
      description: true,
      authorName: true,
      isbn: true,
      pageCount: true,
      bindingDetails: true,
      weight: true,
      stockQuantity: true,
      copiesSold: true,
      price: true,
      mrp: true,
      discountPercentage: true,
      type: true,
      coverImage: true,
      isActive: true,
      sku: true,
      hsn: true,
      lengthCm: true,
      breadthCm: true,
      heightCm: true,
      weightGrams: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  const data = books.map((book) => ({
    ...book,
    coverImage: resolvePublicAssetUrl(book.coverImage)
  }));

  sendSuccess(res, 200, "Books fetched", data);
};

const getAdminOrders = async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          book: {
            select: { id: true, title: true, type: true }
          }
        }
      },
      payment: true
    },
    orderBy: { createdAt: "desc" }
  });

  sendSuccess(res, 200, "Orders fetched", orders);
};

const updateAdminOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await prisma.order.update({
    where: { id },
    data: { status }
  });

  sendSuccess(res, 200, "Order status updated", order);
};

const updateAdminOrderTracking = async (req, res) => {
  const { id } = req.params;
  const { trackingNumber, deliveryStatus } = req.body;

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(trackingNumber ? { trackingNumber } : {}),
      ...(deliveryStatus ? { deliveryStatus } : {})
    }
  });

  sendSuccess(res, 200, "Order tracking updated", order);
};

const getAnalytics = async (_req, res) => {
  const analytics = await getAdminAnalytics();
  sendSuccess(res, 200, "Analytics fetched", analytics);
};

const getAdminStats = async (_req, res) => {
  const [totalUsers, totalProducts, totalOrders, revenueAgg] = await Promise.all([
    prisma.user.count(),
    prisma.book.count({ where: { isDeleted: false } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { totalAmount: true }
    })
  ]);

  sendSuccess(res, 200, "Stats fetched", {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: Number(revenueAgg._sum.totalAmount || 0)
  });
};

const getTrashBooks = async (_req, res) => {
  const books = await prisma.book.findMany({
    where: {
      isDeleted: true
    },
    select: {
      id: true,
      title: true,
      description: true,
      authorName: true,
      isbn: true,
      pageCount: true,
      bindingDetails: true,
      weight: true,
      stockQuantity: true,
      copiesSold: true,
      price: true,
      mrp: true,
      discountPercentage: true,
      type: true,
      coverImage: true,
      isActive: true,
      sku: true,
      hsn: true,
      lengthCm: true,
      breadthCm: true,
      heightCm: true,
      weightGrams: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    },
    orderBy: { deletedAt: "desc" }
  });

  const data = books.map((book) => ({
    ...book,
    coverImage: resolvePublicAssetUrl(book.coverImage)
  }));

  sendSuccess(res, 200, "Trash books fetched", data);
};

const restoreBook = async (req, res) => {
  const { id } = req.params;
  const book = await prisma.book.findUnique({
    where: { id }
  });

  if (!book) {
    const ApiError = require("../utils/ApiError");
    throw new ApiError(404, "Book not found");
  }

  const restored = await prisma.book.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null
    }
  });

  sendSuccess(res, 200, "Book restored from trash", restored);
};

module.exports = {
  getAdminUsers,
  getAdminBooks,
  getAdminOrders,
  getAnalytics,
  getAdminStats,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
  getTrashBooks,
  restoreBook
};
