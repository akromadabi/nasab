import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST create marriage
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { husbandId, wifeId, marriageDate, marriageOrder } = body;

        if (!husbandId || !wifeId) {
            return NextResponse.json(
                { error: "Husband and wife IDs are required" },
                { status: 400 }
            );
        }

        // Get husband to find baniId for access check
        const husband = await prisma.member.findUnique({
            where: { id: husbandId },
            select: { baniId: true },
        });

        if (!husband) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // Check access
        const baniUser = await prisma.baniUser.findUnique({
            where: { baniId_userId: { baniId: husband.baniId, userId: session.user.id } },
        });

        if (!baniUser || baniUser.role === "VIEWER") {
            return NextResponse.json({ error: "Tidak memiliki akses edit" }, { status: 403 });
        }

        const marriage = await prisma.marriage.create({
            data: {
                husbandId,
                wifeId,
                marriageDate: marriageDate ? new Date(marriageDate) : null,
                marriageOrder: marriageOrder || 1,
            },
        });

        return NextResponse.json(marriage, { status: 201 });
    } catch (error) {
        console.error("Create marriage error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
