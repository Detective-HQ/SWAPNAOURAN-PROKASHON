const prisma = require("../prisma/client");
const { sendSuccess } = require("../utils/response");

const subscribe = async (req, res) => {
  const { email } = req.body;
  const existing = await prisma.newsletter.findUnique({ where: { email } });
  if (existing) {
    if (!existing.isActive) {
      await prisma.newsletter.update({
        where: { email },
        data: { isActive: true, unsubscribedAt: null }
      });
    }
    return sendSuccess(res, 200, "Already subscribed");
  }
  await prisma.newsletter.create({ data: { email } });
  sendSuccess(res, 201, "Successfully subscribed");
};

const unsubscribe = async (req, res) => {
  const { email } = req.body;
  const existing = await prisma.newsletter.findUnique({ where: { email } });
  if (!existing) return sendSuccess(res, 200, "Email not found");
  await prisma.newsletter.update({
    where: { email },
    data: { isActive: false, unsubscribedAt: new Date() }
  });
  sendSuccess(res, 200, "Successfully unsubscribed");
};

const listSubscribers = async (_req, res) => {
  const subscribers = await prisma.newsletter.findMany({
    orderBy: { createdAt: "desc" }
  });
  sendSuccess(res, 200, "Subscribers fetched", subscribers);
};

module.exports = { subscribe, unsubscribe, listSubscribers };
