const { sendSuccess } = require("../utils/response");
const { getReadUrl, streamEbook } = require("../services/ebookService");

const readEbook = async (req, res) => {
  const payload = await getReadUrl({
    userId: req.user.id,
    bookId: req.params.id
  });

  sendSuccess(res, 200, "Access granted", payload);
};

const streamEbookController = async (req, res) => {
  await streamEbook({
    userId: req.user.id,
    bookId: req.params.id,
    token: req.query.token,
    res
  });
};

module.exports = {
  readEbook,
  streamEbookController
};
