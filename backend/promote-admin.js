#!/usr/bin/env node

const prisma = require("./src/prisma/client");

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: node promote-admin.js <user-email-address>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`${email} is already an admin.`);
    return;
  }

  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" }
  });

  console.log(`Promoted ${email} to ADMIN.`);
}

main()
  .catch((error) => {
    console.error("Failed to promote admin:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
