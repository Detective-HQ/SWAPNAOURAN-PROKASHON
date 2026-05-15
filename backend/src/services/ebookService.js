const fs = require("fs");
const path = require("path");
const axios = require("axios");
const mime = require("mime-types");

const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { signFileToken, verifyFileToken } = require("../utils/jwt");
const { getLocalFilePathFromUrl } = require("./storageService");
const env = require("../config/env");

const requireEbookAccess = async (userId, bookId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (user && user.role === "ADMIN") {
    return true;
  }

  const access = await prisma.ebookAccess.findFirst({
    where: {
      userId,
      bookId
    }
  });

  if (!access) {
    throw new ApiError(403, "Access Denied");
  }

  return access;
};

const getReadUrl = async ({ userId, bookId }) => {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, type: true, title: true, fileUrl: true, isActive: true }
  });

  if (!book || !book.isActive) {
    throw new ApiError(404, "Book not found");
  }

  if (book.type !== "EBOOK") {
    throw new ApiError(400, "This is not an e-book");
  }

  if (!book.fileUrl) {
    throw new ApiError(404, "E-book file is missing");
  }

  await requireEbookAccess(userId, bookId);

  const token = signFileToken({
    userId,
    bookId,
    action: "READ_EBOOK"
  });

  return {
    bookId: book.id,
    title: book.title,
    streamUrl: `/api/ebooks/${book.id}/stream?token=${token}`
  };
};

const validateStreamToken = ({ token, expectedBookId }) => {
  let decoded;
  try {
    decoded = verifyFileToken(token);
  } catch (err) {
    throw new ApiError(401, err.message === "jwt expired" ? "Stream token expired" : "Invalid stream token");
  }
  if (decoded.action !== "READ_EBOOK") {
    throw new ApiError(401, "Invalid stream token");
  }
  if (decoded.bookId !== expectedBookId) {
    throw new ApiError(401, "Stream token mismatch");
  }
  return decoded;
};

const streamLocalFile = async ({ filePath, res, filenameHint }) => {
  let stat;
  try {
    stat = await fs.promises.stat(filePath);
  } catch {
    throw new ApiError(404, "E-book file not found on server");
  }
  const ext = path.extname(filePath) || ".pdf";
  const contentType = mime.lookup(ext) || "application/pdf";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Content-Disposition", `inline; filename="${filenameHint || `book${ext}`}"`);

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
};

const streamRemoteFile = async ({ url, res, filenameHint }) => {
  let response;
  try {
    response = await axios.get(url, { responseType: "stream" });
  } catch (err) {
    if (err?.response?.status === 404) {
      throw new ApiError(404, "E-book file not found on storage");
    }
    throw new ApiError(502, "Failed to fetch e-book file from storage");
  }
  const contentType = response.headers["content-type"] || "application/pdf";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `inline; filename="${filenameHint || "ebook.pdf"}"`);

  if (response.headers["content-length"]) {
    res.setHeader("Content-Length", response.headers["content-length"]);
  }

  response.data.pipe(res);
};

const getPreviewUrl = async ({ bookId }) => {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, type: true, title: true, fileUrl: true, isActive: true }
  });

  if (!book || !book.isActive) {
    throw new ApiError(404, "Book not found");
  }

  if (book.type !== "EBOOK") {
    throw new ApiError(400, "This is not an e-book");
  }

  if (!book.fileUrl) {
    throw new ApiError(404, "E-book file is missing");
  }

  const token = signFileToken({
    bookId,
    action: "PREVIEW_EBOOK"
  });

  return {
    bookId: book.id,
    title: book.title,
    streamUrl: `/api/ebooks/${book.id}/stream-preview?token=${token}`
  };
};

const streamPreview = async ({ bookId, token, res }) => {
  let decoded;
  try {
    decoded = verifyFileToken(token);
  } catch (err) {
    throw new ApiError(401, err.message === "jwt expired" ? "Preview token expired" : "Invalid preview token");
  }
  if (decoded.action !== "PREVIEW_EBOOK") {
    throw new ApiError(401, "Invalid preview token");
  }
  if (decoded.bookId !== bookId) {
    throw new ApiError(401, "Preview token mismatch");
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, fileUrl: true, title: true, type: true, isActive: true }
  });

  if (!book || !book.isActive || book.type !== "EBOOK" || !book.fileUrl) {
    throw new ApiError(404, "E-book file not found");
  }

  const fileNameSafe = `${book.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "ebook"}.pdf`;
  const localPath = getLocalFilePathFromUrl(book.fileUrl);

  if (localPath && fs.existsSync(localPath)) {
    await streamLocalFile({
      filePath: localPath,
      res,
      filenameHint: fileNameSafe
    });
    return;
  }

  await streamRemoteFile({
    url: book.fileUrl,
    res,
    filenameHint: fileNameSafe
  });
};

const streamEbook = async ({ bookId, token, res }) => {
  const decoded = validateStreamToken({ token, expectedBookId: bookId });
  await requireEbookAccess(decoded.userId, bookId);

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, fileUrl: true, title: true, type: true, isActive: true }
  });

  if (!book || !book.isActive || book.type !== "EBOOK" || !book.fileUrl) {
    throw new ApiError(404, "E-book file not found");
  }

  const fileNameSafe = `${book.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "ebook"}.pdf`;
  const localPath = getLocalFilePathFromUrl(book.fileUrl);

  if (localPath && fs.existsSync(localPath)) {
    await streamLocalFile({
      filePath: localPath,
      res,
      filenameHint: fileNameSafe
    });
    return;
  }

  await streamRemoteFile({
    url: book.fileUrl,
    res,
    filenameHint: fileNameSafe
  });
};

module.exports = {
  getReadUrl,
  streamEbook,
  getPreviewUrl,
  streamPreview
};
