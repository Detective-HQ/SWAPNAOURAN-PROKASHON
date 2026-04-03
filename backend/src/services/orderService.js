const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { createPaymentSession, verifyPaymentSession, provider } = require("./paymentService");
const { ensureQRCodesForPaidOrder } = require("./qrService");

const normalizeItems = (items) => {
  const map = new Map();
  for (const item of items) {
    const prev = map.get(item.bookId) || 0;
    map.set(item.bookId, prev + (item.quantity || 1));
  }

  return [...map.entries()].map(([bookId, quantity]) => ({ bookId, quantity }));
};

const getOrderScope = (user) => (user.role === "ADMIN" ? {} : { userId: user.id });

const createOrder = async ({ userId, items, shippingAddress }) => {
  const normalizedItems = normalizeItems(items);
  const bookIds = normalizedItems.map((item) => item.bookId);

  const books = await prisma.book.findMany({
    where: { id: { in: bookIds }, isActive: true }
  });

  if (books.length !== bookIds.length) {
    throw new ApiError(400, "Some books are invalid or inactive");
  }

  const bookById = books.reduce((acc, book) => ({ ...acc, [book.id]: book }), {});

  const hasPhysical = normalizedItems.some((item) => bookById[item.bookId].type === "PHYSICAL");
  if (hasPhysical && !shippingAddress) {
    throw new ApiError(400, "Shipping address is required for physical books");
  }

  const orderItems = normalizedItems.map((item) => {
    const book = bookById[item.bookId];
    const unitPrice = Number(book.price);
    const totalPrice = unitPrice * item.quantity;
    return {
      bookId: book.id,
      quantity: item.quantity,
      unitPrice,
      totalPrice
    };
  });

  const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      shippingAddress: shippingAddress || undefined,
      items: {
        create: orderItems
      }
    },
    include: {
      items: {
        include: { book: true }
      }
    }
  });

  return order;
};

const getOrderById = async ({ orderId, requester }) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...getOrderScope(requester)
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          book: { select: { id: true, title: true, type: true, coverImage: true } }
        }
      },
      payment: true,
      qrCodes: true
    }
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return order;
};

const listOrders = async ({ requester }) =>
  prisma.order.findMany({
    where: getOrderScope(requester),
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          book: {
            select: { id: true, title: true, type: true, coverImage: true }
          }
        }
      },
      payment: true
    },
    orderBy: { createdAt: "desc" }
  });

const initiatePayment = async ({ orderId, requester }) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...getOrderScope(requester)
    },
    include: {
      payment: true
    }
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status === "PAID") {
    throw new ApiError(400, "Order already paid");
  }

  const session = await createPaymentSession(order);

  const payment = await prisma.payment.upsert({
    where: {
      orderId: order.id
    },
    update: {
      provider: session.provider,
      providerPaymentId: session.providerPaymentId,
      status: "CREATED",
      payload: session.raw
    },
    create: {
      orderId: order.id,
      provider: session.provider,
      providerPaymentId: session.providerPaymentId,
      amount: order.totalAmount,
      status: "CREATED",
      payload: session.raw
    }
  });

  return {
    orderId: order.id,
    provider: session.provider,
    paymentId: payment.id,
    providerPaymentId: payment.providerPaymentId,
    clientSecret: session.clientSecret,
    ...(session.checkoutData ? { checkoutData: session.checkoutData } : {}),
    hint:
      provider === "MOCK"
        ? "Pass confirmationCode=MOCK_SUCCESS in verify API"
        : provider === "RAZORPAY"
          ? "Open Razorpay checkout using checkoutData and then verify using razorpay_* fields"
          : null
  };
};

const markOrderFailed = async ({ orderId, paymentId, reason }) =>
  prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: "FAILED" }
    });

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "FAILED",
        payload: { reason }
      }
    });
  });

const finalizePaidOrder = async ({ orderId, paymentId, paymentMeta }) => {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { book: true }
        }
      }
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.status !== "PAID") {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          invoiceNumber: order.invoiceNumber || `INV-${order.id.slice(-8).toUpperCase()}`
        }
      });
    }

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "SUCCESS",
        providerPaymentId: paymentMeta.providerPaymentId,
        payload: paymentMeta.raw
      }
    });

    const ebookItems = order.items.filter((item) => item.book.type === "EBOOK");
    if (ebookItems.length > 0) {
      await tx.ebookAccess.createMany({
        data: ebookItems.map((item) => ({
          userId: order.userId,
          bookId: item.bookId,
          orderId: order.id
        })),
        skipDuplicates: true
      });
    }
  });

  await ensureQRCodesForPaidOrder(orderId);

  return getOrderById({
    orderId,
    requester: { id: "admin-view", role: "ADMIN" }
  });
};

const verifyPayment = async ({ orderId, requester, payload }) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...getOrderScope(requester)
    },
    include: {
      payment: true
    }
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!order.payment) {
    throw new ApiError(400, "Payment not initialized for this order");
  }

  if (order.status === "PAID") {
    return getOrderById({
      orderId,
      requester: { id: "admin-view", role: "ADMIN" }
    });
  }

  const verification = await verifyPaymentSession({
    paymentRecord: order.payment,
    payload
  });

  if (!verification.success) {
    await markOrderFailed({
      orderId: order.id,
      paymentId: order.payment.id,
      reason: verification.reason || "Payment verification failed"
    });
    throw new ApiError(400, verification.reason || "Payment verification failed");
  }

  return finalizePaidOrder({
    orderId: order.id,
    paymentId: order.payment.id,
    paymentMeta: verification
  });
};

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  initiatePayment,
  verifyPayment
};
