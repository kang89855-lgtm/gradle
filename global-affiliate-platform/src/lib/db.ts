import { PrismaClient } from "@prisma/client";

// Prisma client singleton. The app must keep working without a database
// (static config drives public pages), so consumers call getDb() and handle
// null when DATABASE_URL is not configured.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getDb(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}
