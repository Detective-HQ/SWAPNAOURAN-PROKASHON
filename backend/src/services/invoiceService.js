const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");

const buildInvoice = async ({ orderId, requester }) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      items: {
        include: {
          book: {
            select: { title: true, type: true }
          }
        }
      },
      payment: true
    }
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (requester.role !== "ADMIN" && requester.id !== order.userId) {
    throw new ApiError(403, "Not authorized to view invoice");
  }

  return {
    invoiceNumber: order.invoiceNumber || `INV-${order.id.slice(-8).toUpperCase()}`,
    orderId: order.id,
    orderDate: order.createdAt,
    customer: order.user,
    status: order.status,
    payment: order.payment
      ? {
          provider: order.payment.provider,
          status: order.payment.status,
          transactionId: order.payment.providerPaymentId
        }
      : null,
    items: order.items.map((item) => ({
      bookTitle: item.book.title,
      bookType: item.book.type,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice)
    })),
    grandTotal: Number(order.totalAmount)
  };
};

module.exports = {
  buildInvoice
};
