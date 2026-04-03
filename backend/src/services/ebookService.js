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
    streamUrl: `${env.appBaseUrl}/api/ebooks/${book.id}/stream?token=${token}`
  };
};

const validateStreamToken = ({ token, expectedUserId, expectedBookId }) => {
  const decoded = verifyFileToken(token);
  if (decoded.action !== "READ_EBOOK") {
    throw new ApiError(401, "Invalid stream token");
  }
  if (decoded.userId !== expectedUserId || decoded.bookId !== expectedBookId) {
    throw new ApiError(401, "Stream token mismatch");
  }
};

const streamLocalFile = async ({ filePath, res, filenameHint }) => {
  const stat = await fs.promises.stat(filePath);
  const ext = path.extname(filePath) || ".pdf";
  const contentType = mime.lookup(ext) || "application/pdf";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Content-Disposition", `inline; filename="${filenameHint || `book${ext}`}"`);

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
};

const streamRemoteFile = async ({ url, res, filenameHint }) => {
  const response = await axios.get(url, { responseType: "stream" });
  const contentType = response.headers["content-type"] || "application/pdf";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `inline; filename="${filenameHint || "ebook.pdf"}"`);

  if (response.headers["content-length"]) {
    res.setHeader("Content-Length", response.headers["content-length"]);
  }

  response.data.pipe(res);
};

const streamEbook = async ({ userId, bookId, token, res }) => {
  validateStreamToken({ token, expectedUserId: userId, expectedBookId: bookId });
  await requireEbookAccess(userId, bookId);

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
  streamEbook
};
