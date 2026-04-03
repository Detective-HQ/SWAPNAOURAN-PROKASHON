const prisma = require("../prisma/client");

const getAdminAnalytics = async () => {
  const [totalUsers, totalOrders, paidOrdersCount, salesAgg, paidItems] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { totalAmount: true }
    }),
    prisma.orderItem.findMany({
      where: { order: { status: "PAID" } },
      select: {
        quantity: true,
        totalPrice: true,
        book: {
          select: {
            type: true
          }
        }
      }
    })
  ]);

  const typeSummary = paidItems.reduce(
    (acc, item) => {
      const key = item.book.type === "EBOOK" ? "ebook" : "physical";
      acc[key].units += item.quantity;
      acc[key].revenue += Number(item.totalPrice);
      return acc;
    },
    {
      ebook: { units: 0, revenue: 0 },
      physical: { units: 0, revenue: 0 }
    }
  );

  return {
    totalUsers,
    totalOrders,
    paidOrders: paidOrdersCount,
    totalSales: Number(salesAgg._sum.totalAmount || 0),
    salesByBookType: typeSummary
  };
};

module.exports = {
  getAdminAnalytics
};
