import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function parseDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || "localhost",
      port: parseInt(parsed.port) || 3306,
      user: decodeURIComponent(parsed.username) || "root",
      password: decodeURIComponent(parsed.password) || "",
      database: parsed.pathname.replace("/", "") || "jejak_nasab",
    };
  } catch {
    return { host: "localhost", port: 3306, user: "root", password: "", database: "jejak_nasab" };
  }
}

function createPrismaClient() {
  const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL || "");
  const adapter = new PrismaMariaDb(dbConfig);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
