const prisma = require("../prisma/client");
const { sendSuccess } = require("../utils/response");
const { getAdminAnalytics } = require("../services/analyticsService");

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
    orderBy: { createdAt: "desc" }
  });

  sendSuccess(res, 200, "Books fetched", books);
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

const getAnalytics = async (_req, res) => {
  const analytics = await getAdminAnalytics();
  sendSuccess(res, 200, "Analytics fetched", analytics);
};

module.exports = {
  getAdminUsers,
  getAdminBooks,
  getAdminOrders,
  getAnalytics
};
