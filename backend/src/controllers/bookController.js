const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");
const { uploadBuffer, uploadPdf } = require("../services/storageService");
const { getPreviewUrl } = require("../services/ebookService");

const publicBookSelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  type: true,
  coverImage: true,
  fileUrl: true,
  sampleChapterUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
};

const listBooks = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
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

const createBookWithFiles = async (req, res) => {
  const { title, description } = req.body;
  const price = Number(req.body.price);
  const type = req.body.type;

  if (!title || !description || !Number.isFinite(price) || price <= 0 || !["PHYSICAL", "EBOOK"].includes(type)) {
    throw new ApiError(400, "Invalid book payload");
  }

  let coverImageUrl = null;
  let fileUrl = null;

  if (req.files?.coverImage?.[0]) {
    const coverFile = req.files.coverImage[0];
    const uploadedCover = await uploadBuffer({
      buffer: coverFile.buffer,
      folder: "book-covers",
      filename: `${Date.now()}-${coverFile.originalname}`,
      mimetype: coverFile.mimetype
    });
    coverImageUrl = uploadedCover.url;
  }

  if (type === "EBOOK") {
    const ebookFile = req.files?.file?.[0];
    if (!ebookFile) {
      throw new ApiError(400, "Ebook file is required for EBOOK");
    }

    const uploadedEbook = await uploadPdf({
      buffer: ebookFile.buffer,
      filename: `${Date.now()}-${ebookFile.originalname}`
    });
    fileUrl = uploadedEbook.url;
  }

  let sampleChapterUrl = null;
  const sampleChapterFile = req.files?.sampleChapter?.[0];
  if (sampleChapterFile) {
    const uploadedSample = await uploadPdf({
      buffer: sampleChapterFile.buffer,
      filename: `${Date.now()}-${sampleChapterFile.originalname}`
    });
    sampleChapterUrl = uploadedSample.url;
  }

  const created = await prisma.book.create({
    data: {
      title,
      description,
      price,
      type,
      coverImage: coverImageUrl,
      fileUrl,
      sampleChapterUrl
    }
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

const getBookSample = async (req, res) => {
  const book = await prisma.book.findUnique({
    where: { id: req.params.id },
    select: { id: true, title: true, type: true, sampleChapterUrl: true, fileUrl: true, isActive: true }
  });

  if (!book || !book.isActive) {
    throw new ApiError(404, "Sample not available");
  }

  if (book.sampleChapterUrl) {
    return res.redirect(book.sampleChapterUrl);
  }

  if (book.type === "EBOOK" && book.fileUrl) {
    const payload = await getPreviewUrl({ bookId: book.id });
    return sendSuccess(res, 200, "Preview URL generated", { streamUrl: payload.streamUrl, title: book.title });
  }

  throw new ApiError(404, "Sample not available");
};

module.exports = {
  listBooks,
  getBookById,
  createBook,
  createBookWithFiles,
  updateBook,
  deleteBook,
  getBookSample
};
