import { NextResponse } from "next/server";

export async function GET() {
    const envCheck = {
        DATABASE_URL: process.env.DATABASE_URL ? "SET (" + process.env.DATABASE_URL.replace(/:[^:@]+@/, ":***@") + ")" : "NOT SET",
        AUTH_SECRET: process.env.AUTH_SECRET ? "SET (length: " + process.env.AUTH_SECRET.length + ")" : "NOT SET",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET (length: " + process.env.NEXTAUTH_SECRET.length + ")" : "NOT SET",
        AUTH_URL: process.env.AUTH_URL || "NOT SET",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
        NODE_ENV: process.env.NODE_ENV || "NOT SET",
    };

    let dbStatus = "NOT TESTED";
    try {
        const { PrismaMariaDb } = await import("@prisma/adapter-mariadb");
        const { PrismaClient } = await import("@/generated/prisma/client");

        const url = process.env.DATABASE_URL || "";
        const parsed = new URL(url);
        const dbConfig = {
            host: parsed.hostname || "localhost",
            port: parseInt(parsed.port) || 3306,
            user: decodeURIComponent(parsed.username) || "root",
            password: decodeURIComponent(parsed.password) || "",
            database: parsed.pathname.replace("/", "") || "jejak_nasab",
        };

        const adapter = new PrismaMariaDb(dbConfig);
        const prisma = new PrismaClient({ adapter });
        const userCount = await prisma.user.count();
        dbStatus = `OK (${userCount} users found)`;
        await prisma.$disconnect();
    } catch (error) {
        dbStatus = `ERROR: ${error instanceof Error ? error.message : String(error)}`;
    }

    return NextResponse.json({
        env: envCheck,
        db: dbStatus,
        timestamp: new Date().toISOString(),
    });
}
