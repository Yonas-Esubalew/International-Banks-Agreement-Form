// /config/prisma.js
import { PrismaClient } from "@prisma/client";

// Ensure only one PrismaClient instance in development (avoids hot-reload issues)
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"], // Log queries & warnings
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
