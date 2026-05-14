const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");

const createReturnRequest = async (req, res) => {
  const { orderId, bookId, reason } = req.body;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: req.user.id, status: "PAID" },
    include: { items: true }
  });
  if (!order) throw new ApiError(404, "Paid order not found");

  const orderItem = order.items.find(i => i.bookId === bookId);
  if (!orderItem) throw new ApiError(400, "Book not in this order");

  const existing = await prisma.returnRequest.findFirst({
    where: { orderId, bookId, userId: req.user.id, status: { in: ["PENDING", "APPROVED"] } }
  });
  if (existing) throw new ApiError(400, "Return already requested for this item");

  const returnReq = await prisma.returnRequest.create({
    data: { orderId, userId: req.user.id, bookId, reason },
    include: { book: { select: { id: true, title: true } } }
  });
  sendSuccess(res, 201, "Return request created", returnReq);
};

const getMyReturns = async (req, res) => {
  const items = await prisma.returnRequest.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      book: { select: { id: true, title: true, coverImage: true } },
      order: { select: { id: true, invoiceNumber: true } }
    }
  });
  sendSuccess(res, 200, "Returns fetched", items);
};

const getAllReturns = async (_req, res) => {
  const items = await prisma.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      book: { select: { id: true, title: true } },
      order: { select: { id: true, invoiceNumber: true } }
    }
  });
  sendSuccess(res, 200, "All returns fetched", items);
};

const updateReturnStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;

  const existing = await prisma.returnRequest.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Return request not found");

  const updated = await prisma.returnRequest.update({
    where: { id },
    data: { status, adminNote }
  });
  sendSuccess(res, 200, "Return status updated", updated);
};

module.exports = { createReturnRequest, getMyReturns, getAllReturns, updateReturnStatus };
