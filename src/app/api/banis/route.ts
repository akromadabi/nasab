import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all banis for current user
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const baniUsers = await prisma.baniUser.findMany({
            where: { userId: session.user.id },
            include: {
                bani: {
                    include: {
                        _count: { select: { members: true } },
                        createdBy: { select: { name: true } },
                    },
                },
            },
            orderBy: { joinedAt: "desc" },
        });

        return NextResponse.json(baniUsers.map((bu) => ({
            ...bu.bani,
            userRole: bu.role,
        })));
    } catch (error) {
        console.error("Get banis error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST create new bani
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, rootMemberName, rootMemberGender } = body;

        if (!name) {
            return NextResponse.json({ error: "Nama bani harus diisi" }, { status: 400 });
        }

        if (!rootMemberName) {
            return NextResponse.json({ error: "Nama leluhur (asal nasab) harus diisi" }, { status: 400 });
        }

        // Check tier limit
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                tier: true,
                _count: { select: { createdBanis: true } },
            },
        });

        if (user?.tier) {
            if (user._count.createdBanis >= user.tier.maxBanis) {
                return NextResponse.json(
                    { error: `Kelas "${user.tier.name}" hanya bisa membuat maksimal ${user.tier.maxBanis} bani. Upgrade kelas Anda untuk membuat lebih banyak.` },
                    { status: 403 }
                );
            }
        }
        const result = await prisma.$transaction(async (tx) => {
            // Create bani first (without root member)
            const bani = await tx.bani.create({
                data: {
                    name,
                    description,
                    createdById: session.user.id,
                },
            });

            // Create root member (the ancestor)
            let rootMember = null;
            if (rootMemberName) {
                rootMember = await tx.member.create({
                    data: {
                        baniId: bani.id,
                        fullName: rootMemberName,
                        gender: rootMemberGender || "MALE",
                        generation: 0,
                        addedById: session.user.id,
                    },
                });

                // Update bani with root member
                await tx.bani.update({
                    where: { id: bani.id },
                    data: { rootMemberId: rootMember.id },
                });
            }

            // Add creator as bani admin
            await tx.baniUser.create({
                data: {
                    baniId: bani.id,
                    userId: session.user.id,
                    role: "ADMIN",
                },
            });

            // Log activity
            await tx.activityLog.create({
                data: {
                    userId: session.user.id,
                    baniId: bani.id,
                    action: "CREATE",
                    entityType: "BANI",
                    entityId: bani.id,
                    description: `Membuat bani "${name}"`,
                },
            });

            return { bani, rootMember };
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Create bani error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
