const http = require("http");
const app = require("./app");
const env = require("./config/env");
const prisma = require("./prisma/client");

const server = http.createServer(app);

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${env.port}`);
});

const shutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
