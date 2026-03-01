import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE marriage
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ marriageId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { marriageId } = await params;

        const marriage = await prisma.marriage.findUnique({
            where: { id: marriageId },
            include: {
                husband: { select: { baniId: true } },
            },
        });

        if (!marriage) {
            return NextResponse.json({ error: "Pernikahan tidak ditemukan" }, { status: 404 });
        }

        // Check access
        const baniUser = await prisma.baniUser.findUnique({
            where: {
                baniId_userId: {
                    baniId: marriage.husband.baniId,
                    userId: session.user.id,
                },
            },
        });

        if (!baniUser || baniUser.role === "VIEWER") {
            return NextResponse.json({ error: "Tidak memiliki akses edit" }, { status: 403 });
        }

        await prisma.marriage.delete({
            where: { id: marriageId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete marriage error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
