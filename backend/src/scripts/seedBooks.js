const prisma = require("../prisma/client");

const books = [
  {
    title: "পথের পাঁচালী",
    description: "A timeless classic by Bibhutibhushan Bandyopadhyay that captures the simple joys and sorrows of rural Bengal through the eyes of young Apu and Durga. A masterpiece of Bengali literature that paints a vivid picture of village life.",
    price: 350,
    type: "PHYSICAL",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
  },
  {
    title: "গীতাঞ্জলি",
    description: "Nobel laureate Rabindranath Tagore's celebrated collection of poems offering profound spiritual reflections on life, devotion, and the divine. A cornerstone of Bengali literary heritage that transcends time.",
    price: 250,
    type: "PHYSICAL",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
  },
  {
    title: "দেবদাস",
    description: "Sarat Chandra Chattopadhyay's iconic novel of love, sacrifice, and tragedy. The story of Devdas, a young man caught between societal expectations and his passionate love for Parvati, remains one of Bengal's most beloved tales.",
    price: 280,
    type: "PHYSICAL",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
  },
  {
    title: "বাংলা রান্নার আদর্শ সংকলন",
    description: "A comprehensive collection of authentic Bengali recipes from traditional bhapa chingri to modern fusion delicacies. This ebook is perfect for anyone who wants to master the art of Bengali cuisine with step-by-step instructions.",
    price: 199,
    type: "EBOOK",
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
  },
  {
    title: "ফেলুদা সমগ্র",
    description: "The complete adventures of Satyajit Ray's legendary detective Feluda. From the mysteries of Darjeeling to the secrets of ancient Egypt, join Feluda, Topshe, and Jatayu on thrilling investigations that keep you on the edge.",
    price: 450,
    type: "PHYSICAL",
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop",
  },
];

const seedBooks = async () => {
  const existingCount = await prisma.book.count();
  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} books. Skipping seed.`);
    return;
  }

  const created = await prisma.book.createMany({
    data: books,
  });

  console.log(`✅ Seeded ${created.count} books successfully`);

  const allBooks = await prisma.book.findMany({
    select: { id: true, title: true, type: true, price: true },
  });

  console.log("\n📚 Seeded books:");
  allBooks.forEach((book) => {
    console.log(`  - ${book.title} (${book.type}) - ₹${book.price}`);
  });
};

seedBooks()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
