const prisma = require("../prisma/client");
const { sendSuccess } = require("../utils/response");
const { getReadUrl, streamEbook, getPreviewUrl, streamPreview } = require("../services/ebookService");

const readEbook = async (req, res) => {
  const payload = await getReadUrl({
    userId: req.user.id,
    bookId: req.params.id
  });

  sendSuccess(res, 200, "Access granted", payload);
};

const streamEbookController = async (req, res) => {
  await streamEbook({
    bookId: req.params.id,
    token: req.query.token,
    res
  });
};

const listMyEbooks = async (req, res) => {
  const accesses = await prisma.ebookAccess.findMany({
    where: { userId: req.user.id },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          type: true,
          coverImage: true,
          sampleChapterUrl: true,
          isActive: true,
          createdAt: true
        }
      }
    },
    orderBy: { grantedAt: "desc" }
  });

  const items = accesses.map((a) => a.book).filter((b) => b.isActive);

  sendSuccess(res, 200, "My ebooks fetched", items);
};

const previewEbook = async (req, res) => {
  const payload = await getPreviewUrl({
    bookId: req.params.id
  });

  sendSuccess(res, 200, "Preview access granted", payload);
};

const streamPreviewController = async (req, res) => {
  await streamPreview({
    bookId: req.params.id,
    token: req.query.token,
    res
  });
};

module.exports = {
  readEbook,
  streamEbookController,
  previewEbook,
  streamPreviewController,
  listMyEbooks
};
