import { PrismaClient } from '@prisma/client';

const isLocalDB = process.env.USE_LOCAL_DB === "true";
const dbUrl = (isLocalDB ? process.env.DATABASE_URL_LOCAL : process.env.DATABASE_URL) || "postgresql://unknown:unknown@unknown:5432/unknown";

console.log("--------------------------------------------------");
console.log(`Connected DB: ${isLocalDB ? "LOCAL (PostgreSQL)" : "CLOUD (Neon)"}`);
if (isLocalDB && !process.env.DATABASE_URL_LOCAL) {
  console.error("❌ ERROR: USE_LOCAL_DB is true but DATABASE_URL_LOCAL is not defined in .env");
}
console.log("--------------------------------------------------");

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
