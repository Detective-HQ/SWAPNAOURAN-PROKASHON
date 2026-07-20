const prisma = require("../prisma/client");

const cleanupDeletedBooks = async () => {
  try {
    console.log("🧹 Running scheduled database cleanup for deleted books...");
    const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Find books that have been deleted for more than 24 hours
    const booksToCleanup = await prisma.book.findMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: threshold
        }
      },
      include: {
        _count: {
          select: { orderItems: true }
        }
      }
    });

    console.log(`🔍 Found ${booksToCleanup.length} books in trash eligible for permanent cleanup.`);

    let hardDeletedCount = 0;
    let softDeletedKeptCount = 0;

    for (const book of booksToCleanup) {
      if (book._count.orderItems === 0) {
        // If there are no orders, we can safely hard-delete it from DB
        await prisma.book.delete({
          where: { id: book.id }
        });
        hardDeletedCount++;
      } else {
        // Keep soft-deleted forever when orders exist (FK). Still visible in Trash UI.
        softDeletedKeptCount++;
      }
    }

    console.log(`✅ Cleanup completed: ${hardDeletedCount} hard-deleted, ${softDeletedKeptCount} kept soft-deleted due to orders.`);
  } catch (error) {
    console.error("❌ Error during deleted books cleanup:", error);
  }
};

const startCleanupInterval = () => {
  // Run on startup
  cleanupDeletedBooks();
  // Run every hour (3600000 ms)
  setInterval(cleanupDeletedBooks, 60 * 60 * 1000);
};

module.exports = {
  cleanupDeletedBooks,
  startCleanupInterval
};
