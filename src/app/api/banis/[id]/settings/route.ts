import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET bani settings
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bani = await prisma.bani.findUnique({
            where: { id },
            select: { treeOrientation: true, isPublic: true, showWaPublic: true, showBirthPublic: true, showAddressPublic: true, showSocmedPublic: true },
        });

        if (!bani) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(bani);
    } catch (error) {
        console.error("Get bani settings error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PATCH update bani settings
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check permission
        const baniUser = await prisma.baniUser.findUnique({
            where: { baniId_userId: { baniId: id, userId: session.user.id } },
        });
        const isAdmin = (session.user as any).role === "SUPER_ADMIN";
        if (!baniUser && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (baniUser?.role === "VIEWER") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { treeOrientation, isPublic, showWaPublic, showBirthPublic, showAddressPublic, showSocmedPublic } = body;

        const updateData: any = {};
        if (treeOrientation !== undefined) updateData.treeOrientation = treeOrientation;
        if (isPublic !== undefined) updateData.isPublic = isPublic;
        if (showWaPublic !== undefined) updateData.showWaPublic = showWaPublic;
        if (showBirthPublic !== undefined) updateData.showBirthPublic = showBirthPublic;
        if (showAddressPublic !== undefined) updateData.showAddressPublic = showAddressPublic;
        if (showSocmedPublic !== undefined) updateData.showSocmedPublic = showSocmedPublic;

        const updated = await prisma.bani.update({
            where: { id },
            data: updateData,
            select: { treeOrientation: true, isPublic: true, showWaPublic: true, showBirthPublic: true, showAddressPublic: true, showSocmedPublic: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update bani settings error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
