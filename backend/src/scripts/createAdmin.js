const bcrypt = require("bcryptjs");
const prisma = require("../prisma/client");
const env = require("../config/env");

const createAdmin = async () => {
  const existing = await prisma.user.findUnique({
    where: { email: env.adminEmail }
  });

  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Admin already exists: ${existing.email}`);
    return;
  }

  const password = await bcrypt.hash(env.adminPassword, env.bcryptSaltRounds);

  const admin = await prisma.user.create({
    data: {
      name: env.adminName,
      email: env.adminEmail,
      password,
      role: "ADMIN"
    }
  });

  // eslint-disable-next-line no-console
  console.log(`Admin created: ${admin.email}`);
};

createAdmin()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
