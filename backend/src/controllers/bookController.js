const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");
const { uploadBuffer, uploadPdf } = require("../services/storageService");
const { getPreviewUrl } = require("../services/ebookService");
const { getActiveFlashSale, applyFlashSaleToBook } = require("../services/settingService");

const publicBookSelect = {
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
  fileUrl: true,
  sampleChapterUrl: true,
  isActive: true,
  sku: true,
  hsn: true,
  lengthCm: true,
  breadthCm: true,
  heightCm: true,
  weightGrams: true,
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

  const flashSale = await getActiveFlashSale();
  const processedItems = items.map(book => applyFlashSaleToBook(book, flashSale));

  sendSuccess(res, 200, "Books fetched", {
    items: processedItems,
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

  const flashSale = await getActiveFlashSale();
  const processedBook = applyFlashSaleToBook(book, flashSale);

  sendSuccess(res, 200, "Book fetched", processedBook);
};

const createBook = async (req, res) => {
  let { mrp, discountPercentage, price, ...rest } = req.body;
  
  if (mrp !== undefined) {
    mrp = Number(mrp);
    discountPercentage = Number(discountPercentage) || 0;
    price = mrp - (mrp * (discountPercentage / 100));
  }

  const created = await prisma.book.create({
    data: { mrp, discountPercentage, price, ...rest }
  });

  sendSuccess(res, 201, "Book created", created);
};

const createBookWithFiles = async (req, res) => {
  const { title, description, type, authorName, isbn, bindingDetails, weight } = req.body;
  const normalizedIsbn = typeof isbn === "string" && isbn.trim() !== "" ? isbn.trim() : null;
  const normalizedBindingDetails = typeof bindingDetails === "string" && bindingDetails.trim() !== "" ? bindingDetails.trim() : null;
  const normalizedWeight = typeof weight === "string" && weight.trim() !== "" ? weight.trim() : null;
  let price = Number(req.body.price);
  const mrp = req.body.mrp !== undefined ? Number(req.body.mrp) : null;
  const discountPercentage = req.body.discountPercentage !== undefined ? Number(req.body.discountPercentage) : 0;
  const stockQuantity = req.body.stockQuantity !== undefined ? parseInt(req.body.stockQuantity, 10) : 0;
  const parsedPageCount = req.body.pageCount !== undefined && req.body.pageCount !== "" ? parseInt(req.body.pageCount, 10) : null;
  const pageCount = Number.isNaN(parsedPageCount) ? null : parsedPageCount;
  const parsedCopiesSold = req.body.copiesSold !== undefined && req.body.copiesSold !== "" ? parseInt(req.body.copiesSold, 10) : 0;
  const copiesSold = Number.isNaN(parsedCopiesSold) ? 0 : parsedCopiesSold;

  // Shipping dimension fields
  const sku = req.body.sku || null;
  const hsn = req.body.hsn || null;
  const lengthCm = req.body.lengthCm !== undefined ? Number(req.body.lengthCm) : null;
  const breadthCm = req.body.breadthCm !== undefined ? Number(req.body.breadthCm) : null;
  const heightCm = req.body.heightCm !== undefined ? Number(req.body.heightCm) : null;
  const weightGrams = req.body.weightGrams !== undefined ? Number(req.body.weightGrams) : null;

  if (mrp && mrp > 0) {
    price = mrp - (mrp * (discountPercentage / 100));
  }

  if (!title || !description || !Number.isFinite(price) || price <= 0 || !["PHYSICAL", "EBOOK", "ENGLISH_BOOK"].includes(type)) {
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
      authorName,
      isbn: normalizedIsbn,
      pageCount,
      bindingDetails: normalizedBindingDetails,
      weight: normalizedWeight,
      stockQuantity,
      copiesSold,
      price,
      mrp,
      discountPercentage,
      type,
      coverImage: coverImageUrl,
      fileUrl,
      sampleChapterUrl,
      sku,
      hsn,
      lengthCm,
      breadthCm,
      heightCm,
      weightGrams
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

  let {
    mrp,
    discountPercentage,
    price,
    stockQuantity,
    pageCount,
    copiesSold,
    sku,
    hsn,
    lengthCm,
    breadthCm,
    heightCm,
    weightGrams,
    isbn,
    bindingDetails,
    ...rest
  } = req.body;
  
  const normalizedIsbn = isbn !== undefined
    ? (typeof isbn === "string" && isbn.trim() !== "" ? isbn.trim() : null)
    : undefined;
  const normalizedBindingDetails = bindingDetails !== undefined
    ? (typeof bindingDetails === "string" && bindingDetails.trim() !== "" ? bindingDetails.trim() : null)
    : undefined;

  if (stockQuantity !== undefined) {
    stockQuantity = parseInt(stockQuantity, 10);
  }
  if (pageCount !== undefined) {
    if (pageCount === "" || pageCount === null) {
      pageCount = null;
    } else {
      const parsedPageCount = parseInt(pageCount, 10);
      pageCount = Number.isNaN(parsedPageCount) ? null : parsedPageCount;
    }
  }
  if (copiesSold !== undefined) {
    const parsedCopiesSold = parseInt(copiesSold, 10);
    copiesSold = Number.isNaN(parsedCopiesSold) ? 0 : parsedCopiesSold;
  }

  // Parse shipping dimension fields
  if (lengthCm !== undefined) lengthCm = Number(lengthCm);
  if (breadthCm !== undefined) breadthCm = Number(breadthCm);
  if (heightCm !== undefined) heightCm = Number(heightCm);
  if (weightGrams !== undefined) weightGrams = Number(weightGrams);

  if (mrp !== undefined || discountPercentage !== undefined) {
    const finalMrp = mrp !== undefined ? Number(mrp) : Number(existing.mrp || 0);
    const finalDiscount = discountPercentage !== undefined ? Number(discountPercentage) : Number(existing.discountPercentage || 0);
    
    if (finalMrp > 0) {
      price = finalMrp - (finalMrp * (finalDiscount / 100));
      mrp = finalMrp;
      discountPercentage = finalDiscount;
    }
  }

  const updated = await prisma.book.update({
    where: { id: req.params.id },
    data: {
      mrp,
      discountPercentage,
      price,
      stockQuantity,
      pageCount,
      copiesSold,
      sku,
      hsn,
      lengthCm,
      breadthCm,
      heightCm,
      weightGrams,
      ...(normalizedIsbn !== undefined ? { isbn: normalizedIsbn } : {}),
      ...(normalizedBindingDetails !== undefined ? { bindingDetails: normalizedBindingDetails } : {}),
      ...rest
    }
  });

  sendSuccess(res, 200, "Book updated", updated);
};

const deleteBook = async (req, res) => {
  const existing = await prisma.book.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { orderItems: true } } }
  });

  if (!existing) {
    throw new ApiError(404, "Book not found");
  }

  if (existing._count.orderItems > 0) {
    // Soft delete if orders exist to maintain history
    await prisma.book.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    return sendSuccess(res, 200, "Book disabled (cannot be deleted due to existing orders)");
  } else {
    // Hard delete if no orders
    await prisma.book.delete({
      where: { id: req.params.id }
    });
    return sendSuccess(res, 200, "Book permanently deleted");
  }
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
