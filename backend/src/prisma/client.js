const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

/**
 * Build the DATABASE_URL with pool timeout & connection limit params
 * so Prisma doesn't time out waiting for a Neon serverless connection.
 */
function buildClientOptions() {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) return {};

  // Append Prisma-level pool config via query params
  const separator = baseUrl.includes("?") ? "&" : "?";
  const pooledUrl = `${baseUrl}${separator}connection_limit=5&pool_timeout=30`;

  return {
    datasources: {
      db: { url: pooledUrl }
    }
  };
}

// Always reuse a single PrismaClient via global cache.
// Previously the guard (NODE_ENV !== "production") was skipping caching
// while .env had NODE_ENV=production, causing multiple clients and pool exhaustion.
const prisma = global.__prismaClient || new PrismaClient(buildClientOptions());
global.__prismaClient = prisma;

module.exports = prisma;
