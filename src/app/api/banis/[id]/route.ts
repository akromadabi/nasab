import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE a bani (only ADMIN of the bani or super admin)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: baniId } = await params;

        // Check bani exists
        const bani = await prisma.bani.findUnique({
            where: { id: baniId },
            include: {
                _count: { select: { members: true } },
            },
        });

        if (!bani) {
            return NextResponse.json({ error: "Bani tidak ditemukan" }, { status: 404 });
        }

        // Check permission: only bani creator or super admin can delete
        const isSuperAdmin = session.user.role === "SUPER_ADMIN";
        const isCreator = bani.createdById === session.user.id;

        if (!isSuperAdmin && !isCreator) {
            // Also check bani admin role
            const baniUser = await prisma.baniUser.findUnique({
                where: { baniId_userId: { baniId, userId: session.user.id } },
            });
            if (!baniUser || baniUser.role !== "ADMIN") {
                return NextResponse.json(
                    { error: "Hanya admin bani yang bisa menghapus bani ini" },
                    { status: 403 }
                );
            }
        }

        // Delete in transaction
        await prisma.$transaction(async (tx) => {
            // 1. Clear rootMemberId to avoid FK constraint
            await tx.bani.update({
                where: { id: baniId },
                data: { rootMemberId: null },
            });

            // 2. Delete marriages (references members that will be deleted)
            const memberIds = await tx.member.findMany({
                where: { baniId },
                select: { id: true },
            });
            const ids = memberIds.map((m) => m.id);

            if (ids.length > 0) {
                await tx.marriage.deleteMany({
                    where: {
                        OR: [
                            { husbandId: { in: ids } },
                            { wifeId: { in: ids } },
                        ],
                    },
                });
            }

            // 3. Delete activity logs
            await tx.activityLog.deleteMany({ where: { baniId } });

            // 4. Delete bani users
            await tx.baniUser.deleteMany({ where: { baniId } });

            // 5. Delete all members
            await tx.member.deleteMany({ where: { baniId } });

            // 6. Finally delete the bani
            await tx.bani.delete({ where: { id: baniId } });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete bani error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
