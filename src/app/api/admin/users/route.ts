import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET all users (admin only)
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                avatar: true,
                tierId: true,
                createdAt: true,
                tier: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        maxBanis: true,
                        canGeneratePdf: true,
                        canGenerateImage: true,
                    },
                },
                _count: { select: { baniUsers: true, createdBanis: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Get users error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST create new user (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { name, email, password, userRole, tierId } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Nama, email, dan password wajib diisi" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password minimal 6 karakter" },
                { status: 400 }
            );
        }

        // Check existing email
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: "Email sudah terdaftar" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Find default tier if no tierId provided
        let assignTierId = tierId || null;
        if (!assignTierId) {
            const defaultTier = await prisma.userTier.findFirst({
                where: { isDefault: true },
            });
            if (defaultTier) assignTierId = defaultTier.id;
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: userRole || "USER",
                status: "APPROVED",
                tierId: assignTierId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                tierId: true,
            },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "CREATE",
                entityType: "USER",
                entityId: user.id,
                description: `Menambahkan pengguna baru "${user.name}"`,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("Create user error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PATCH update user status/role/tier
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { userId, status, userRole, tierId } = body;

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        // Prevent self-modification
        if (userId === session.user.id) {
            return NextResponse.json(
                { error: "Tidak bisa mengubah akun sendiri" },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (userRole) updateData.role = userRole;
        if (tierId !== undefined) updateData.tierId = tierId || null;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                tierId: true,
                tier: { select: { name: true, color: true } },
            },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "UPDATE",
                entityType: "USER",
                entityId: userId,
                description: `Mengubah pengguna "${updatedUser.name}"`,
                newValues: updateData,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
