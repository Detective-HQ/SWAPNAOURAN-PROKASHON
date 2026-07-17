const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");

const createReview = async (req, res) => {
  const { bookId, rating, comment } = req.body;

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || !book.isActive || book.isDeleted) {
    throw new ApiError(404, "Book not found");
  }

  const existing = await prisma.review.findUnique({
    where: { userId_bookId: { userId: req.user.id, bookId } }
  });
  if (existing) {
    throw new ApiError(400, "You have already reviewed this book");
  }

  const review = await prisma.review.create({
    data: { userId: req.user.id, bookId, rating, comment },
    include: { user: { select: { id: true, name: true } } }
  });

  sendSuccess(res, 201, "Review created", review);
};

const listBookReviews = async (req, res) => {
  const { bookId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where: { bookId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true } } }
    }),
    prisma.review.count({ where: { bookId } })
  ]);

  const avgResult = await prisma.review.aggregate({
    where: { bookId },
    _avg: { rating: true },
    _count: { rating: true }
  });

  sendSuccess(res, 200, "Reviews fetched", {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    averageRating: avgResult._avg.rating || 0,
    totalReviews: avgResult._count.rating || 0
  });
};

const deleteReview = async (req, res) => {
  const { id } = req.params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new ApiError(404, "Review not found");
  if (review.userId !== req.user.id && req.user.role !== "ADMIN") {
    throw new ApiError(403, "Not authorized");
  }
  await prisma.review.delete({ where: { id } });
  sendSuccess(res, 200, "Review deleted");
};

module.exports = { createReview, listBookReviews, deleteReview };
