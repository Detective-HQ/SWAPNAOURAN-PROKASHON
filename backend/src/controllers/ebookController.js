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
  streamPreviewController
};
