import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET single member
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ memberId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { memberId } = await params;

        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: {
                father: { select: { id: true, fullName: true } },
                mother: { select: { id: true, fullName: true } },
            },
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        return NextResponse.json(member);
    } catch (error) {
        console.error("Get member error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PATCH update member
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ memberId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { memberId } = await params;
        const body = await request.json();

        // Get the member to check bani access
        const existingMember = await prisma.member.findUnique({
            where: { id: memberId },
            select: { baniId: true, fullName: true },
        });

        if (!existingMember) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // Check edit access
        const baniUser = await prisma.baniUser.findUnique({
            where: {
                baniId_userId: {
                    baniId: existingMember.baniId,
                    userId: session.user.id,
                },
            },
        });

        if (!baniUser || baniUser.role === "VIEWER") {
            return NextResponse.json({ error: "Tidak memiliki akses edit" }, { status: 403 });
        }

        const {
            fullName,
            nickname,
            gender,
            birthDate,
            birthPlace,
            deathDate,
            isAlive,
            address,
            city,
            phoneWhatsapp,
            socialMedia,
            bio,
            fatherId,
            motherId,
        } = body;

        // Recalculate generation if parent changed
        let generation: number | undefined;
        if (fatherId !== undefined || motherId !== undefined) {
            const parentId = fatherId || motherId;
            if (parentId) {
                const parent = await prisma.member.findUnique({
                    where: { id: parentId },
                    select: { generation: true },
                });
                if (parent) generation = parent.generation + 1;
            }
        }

        const updateData: any = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (nickname !== undefined) updateData.nickname = nickname || null;
        if (gender !== undefined) updateData.gender = gender;
        if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
        if (birthPlace !== undefined) updateData.birthPlace = birthPlace || null;
        if (deathDate !== undefined) updateData.deathDate = deathDate ? new Date(deathDate) : null;
        if (isAlive !== undefined) updateData.isAlive = isAlive;
        if (address !== undefined) updateData.address = address || null;
        if (city !== undefined) updateData.city = city || null;
        if (phoneWhatsapp !== undefined) updateData.phoneWhatsapp = phoneWhatsapp || null;
        if (socialMedia !== undefined) updateData.socialMedia = socialMedia || {};
        if (bio !== undefined) updateData.bio = bio || null;
        if (fatherId !== undefined) updateData.fatherId = fatherId || null;
        if (motherId !== undefined) updateData.motherId = motherId || null;
        if (generation !== undefined) updateData.generation = generation;

        const updated = await prisma.member.update({
            where: { id: memberId },
            data: updateData,
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                baniId: existingMember.baniId,
                action: "UPDATE",
                entityType: "MEMBER",
                entityId: memberId,
                description: `Mengubah data anggota "${updated.fullName}"`,
                oldValues: { fullName: existingMember.fullName } as any,
                newValues: updateData,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update member error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE member
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ memberId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { memberId } = await params;

        const member = await prisma.member.findUnique({
            where: { id: memberId },
            select: { baniId: true, fullName: true },
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // Check admin access
        const baniUser = await prisma.baniUser.findUnique({
            where: { baniId_userId: { baniId: member.baniId, userId: session.user.id } },
        });

        if (!baniUser || baniUser.role !== "ADMIN") {
            const isAdmin = session.user.role === "SUPER_ADMIN";
            if (!isAdmin) {
                return NextResponse.json({ error: "Hanya admin yang bisa menghapus" }, { status: 403 });
            }
        }

        await prisma.member.delete({ where: { id: memberId } });

        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                baniId: member.baniId,
                action: "DELETE",
                entityType: "MEMBER",
                entityId: memberId,
                description: `Menghapus anggota "${member.fullName}"`,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete member error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
