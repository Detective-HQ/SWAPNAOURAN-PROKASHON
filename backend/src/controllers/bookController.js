const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");

const publicBookSelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  type: true,
  coverImage: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
};

const listBooks = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;
  const { type, search } = req.query;

  const where = {
    isActive: true,
    ...(type ? { type } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      select: publicBookSelect,
      orderBy: { createdAt: "desc" }
    }),
    prisma.book.count({ where })
  ]);

  sendSuccess(res, 200, "Books fetched", {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

const getBookById = async (req, res) => {
  const book = await prisma.book.findUnique({
    where: { id: req.params.id },
    select: publicBookSelect
  });

  if (!book || !book.isActive) {
    throw new ApiError(404, "Book not found");
  }

  sendSuccess(res, 200, "Book fetched", book);
};

const createBook = async (req, res) => {
  const created = await prisma.book.create({
    data: req.body
  });

  sendSuccess(res, 201, "Book created", created);
};

const updateBook = async (req, res) => {
  const existing = await prisma.book.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Book not found");
  }

  const updated = await prisma.book.update({
    where: { id: req.params.id },
    data: req.body
  });

  sendSuccess(res, 200, "Book updated", updated);
};

const deleteBook = async (req, res) => {
  const existing = await prisma.book.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Book not found");
  }

  await prisma.book.update({
    where: { id: req.params.id },
    data: { isActive: false }
  });

  sendSuccess(res, 200, "Book deleted");
};

module.exports = {
  listBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
