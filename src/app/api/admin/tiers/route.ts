import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all tiers
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

        const tiers = await prisma.userTier.findMany({
            include: { _count: { select: { users: true } } },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(tiers);
    } catch (error) {
        console.error("Get tiers error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST create tier
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
        const { name, color, maxBanis, maxGenerations, canGeneratePdf, canGenerateImage, isDefault } = body;

        if (!name) {
            return NextResponse.json({ error: "Nama kelas wajib diisi" }, { status: 400 });
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.userTier.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        const tier = await prisma.userTier.create({
            data: {
                name,
                color: color || "#6B7280",
                maxBanis: maxBanis ?? 1,
                maxGenerations: maxGenerations ?? 10,
                canGeneratePdf: canGeneratePdf ?? false,
                canGenerateImage: canGenerateImage ?? false,
                isDefault: isDefault ?? false,
            },
        });

        return NextResponse.json(tier, { status: 201 });
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Nama kelas sudah ada" }, { status: 400 });
        }
        console.error("Create tier error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PATCH update tier
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
        const { id, name, color, maxBanis, maxGenerations, canGeneratePdf, canGenerateImage, isDefault } = body;

        if (!id) {
            return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
        }

        if (isDefault) {
            await prisma.userTier.updateMany({
                where: { isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (color !== undefined) updateData.color = color;
        if (maxBanis !== undefined) updateData.maxBanis = maxBanis;
        if (maxGenerations !== undefined) updateData.maxGenerations = maxGenerations;
        if (canGeneratePdf !== undefined) updateData.canGeneratePdf = canGeneratePdf;
        if (canGenerateImage !== undefined) updateData.canGenerateImage = canGenerateImage;
        if (isDefault !== undefined) updateData.isDefault = isDefault;

        const tier = await prisma.userTier.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(tier);
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Nama kelas sudah ada" }, { status: 400 });
        }
        console.error("Update tier error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE tier
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
        }

        // Set users with this tier to null
        await prisma.user.updateMany({
            where: { tierId: id },
            data: { tierId: null },
        });

        await prisma.userTier.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete tier error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
