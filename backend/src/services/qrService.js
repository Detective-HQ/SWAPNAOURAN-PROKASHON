const QRCode = require("qrcode");
const prisma = require("../prisma/client");
const { uploadBase64 } = require("./storageService");

const buildQrPayload = ({ user, book, order }) => {
  if (book.type === "PHYSICAL") {
    return {
      userId: user.id,
      name: user.name,
      bookId: book.id,
      orderId: order.id,
      address: order.shippingAddress || null
    };
  }

  return {
    userId: user.id,
    bookId: book.id,
    orderId: order.id
  };
};

const createQrForOrderItem = async ({ user, book, order }) => {
  const payload = buildQrPayload({ user, book, order });
  const text = JSON.stringify(payload);
  const qrDataUrl = await QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    width: 360,
    margin: 1
  });

  const uploaded = await uploadBase64({
    dataUrl: qrDataUrl,
    folder: "qr",
    filename: `${order.id}-${book.id}-${Date.now()}.png`
  });

  return prisma.qRCode.create({
    data: {
      userId: user.id,
      bookId: book.id,
      orderId: order.id,
      imageUrl: uploaded.url,
      qrData: payload
    }
  });
};

const ensureQRCodesForPaidOrder = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: {
        include: { book: true }
      },
      qrCodes: true
    }
  });

  if (!order || order.status !== "PAID") {
    return;
  }

  for (const item of order.items) {
    const existingCount = order.qrCodes.filter((qr) => qr.bookId === item.bookId).length;
    const needed = Math.max(item.quantity - existingCount, 0);

    for (let i = 0; i < needed; i += 1) {
      await createQrForOrderItem({ user: order.user, book: item.book, order });
    }
  }
};

const verifyAndTrackQr = async (qrId) => {
  const qr = await prisma.qRCode.findUnique({
    where: { id: qrId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      book: { select: { id: true, title: true, type: true } },
      order: { select: { id: true, status: true, createdAt: true } }
    }
  });

  if (!qr) {
    return null;
  }

  await prisma.qRCode.update({
    where: { id: qrId },
    data: {
      scannedCount: { increment: 1 },
      lastScannedAt: new Date()
    }
  });

  return qr;
};

module.exports = {
  ensureQRCodesForPaidOrder,
  verifyAndTrackQr
};
