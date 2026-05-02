const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

const clientOptions = process.env.DATABASE_URL
  ? {
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    }
  : {};

const prisma = global.prismaClient || new PrismaClient(clientOptions);

if (process.env.NODE_ENV !== "production") {
  global.prismaClient = prisma;
}

module.exports = prisma;
