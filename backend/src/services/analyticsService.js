const prisma = require("../prisma/client");

const getAdminAnalytics = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUsers, totalOrders, paidOrdersCount, salesAgg, paidItems, salesOverTimeRaw, topBooksRaw] = await Promise.all([
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
    }),
    prisma.order.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        createdAt: true,
        totalAmount: true
      },
      orderBy: { createdAt: "asc" }
    }),
    prisma.orderItem.groupBy({
      by: ['bookId'],
      where: {
        order: { status: 'PAID' }
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
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

  // Group daily sales
  const salesMap = {};
  // Initialize last 30 days with 0 revenue to have a complete graph
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    salesMap[dateStr] = 0;
  }

  salesOverTimeRaw.forEach(order => {
    const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    // Only accumulate if within our 30-day window
    if (salesMap[dateStr] !== undefined) {
      salesMap[dateStr] += Number(order.totalAmount);
    }
  });

  const salesOverTime = Object.keys(salesMap).map(date => ({
    date,
    revenue: salesMap[date]
  }));

  // Fetch book details for top books
  const topBooks = await Promise.all(
    topBooksRaw.map(async (item) => {
      const book = await prisma.book.findUnique({
        where: { id: item.bookId },
        select: { title: true, type: true }
      });
      return {
        id: item.bookId,
        title: book?.title || 'Unknown Book',
        type: book?.type || 'PHYSICAL',
        units: item._sum.quantity || 0,
        revenue: Number(item._sum.totalPrice || 0)
      };
    })
  );

  return {
    totalUsers,
    totalOrders,
    paidOrders: paidOrdersCount,
    totalSales: Number(salesAgg._sum.totalAmount || 0),
    salesByBookType: typeSummary,
    salesOverTime,
    topBooks
  };
};

module.exports = {
  getAdminAnalytics
};
