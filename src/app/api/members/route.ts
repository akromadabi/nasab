import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET members for a bani
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const baniId = searchParams.get("baniId");

        if (!baniId) {
            return NextResponse.json({ error: "baniId is required" }, { status: 400 });
        }

        // Check access
        const baniUser = await prisma.baniUser.findUnique({
            where: { baniId_userId: { baniId, userId: session.user.id } },
        });

        const isAdmin = (session.user as any).role === "SUPER_ADMIN";
        if (!baniUser && !isAdmin) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const members = await prisma.member.findMany({
            where: { baniId },
            include: {
                father: { select: { id: true, fullName: true } },
                mother: { select: { id: true, fullName: true } },
                marriagesAsHusband: {
                    select: { id: true, marriageOrder: true, wife: { select: { id: true, fullName: true, photo: true, gender: true } } },
                    orderBy: { marriageOrder: "asc" },
                },
                marriagesAsWife: {
                    select: { id: true, marriageOrder: true, husband: { select: { id: true, fullName: true, photo: true, gender: true } } },
                    orderBy: { marriageOrder: "asc" },
                },
            },
            orderBy: [{ generation: "asc" }, { fullName: "asc" }],
        });

        return NextResponse.json(members);
    } catch (error) {
        console.error("Get members error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST create new member
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            baniId,
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

        if (!baniId || !fullName || !gender) {
            return NextResponse.json(
                { error: "Nama, jenis kelamin, dan bani harus diisi" },
                { status: 400 }
            );
        }

        // Check access
        const baniUser = await prisma.baniUser.findUnique({
            where: { baniId_userId: { baniId, userId: session.user.id } },
        });

        if (!baniUser || baniUser.role === "VIEWER") {
            return NextResponse.json({ error: "Tidak memiliki akses edit" }, { status: 403 });
        }

        // Calculate generation
        let generation = 0;
        if (fatherId) {
            const father = await prisma.member.findUnique({
                where: { id: fatherId },
                select: { generation: true },
            });
            if (father) generation = father.generation + 1;
        } else if (motherId) {
            const mother = await prisma.member.findUnique({
                where: { id: motherId },
                select: { generation: true },
            });
            if (mother) generation = mother.generation + 1;
        }

        // Check max generation limit from bani creator's tier
        const bani = await prisma.bani.findUnique({
            where: { id: baniId },
            select: { createdBy: { select: { tier: { select: { maxGenerations: true, name: true } } } } },
        });
        const maxGen = bani?.createdBy?.tier?.maxGenerations ?? 10;
        if (generation >= maxGen) {
            const tierName = bani?.createdBy?.tier?.name || "default";
            return NextResponse.json(
                { error: `Kelas "${tierName}" hanya mendukung maksimal ${maxGen} generasi. Upgrade kelas untuk menambah lebih banyak generasi.` },
                { status: 403 }
            );
        }

        const member = await prisma.member.create({
            data: {
                baniId,
                fullName,
                nickname: nickname || null,
                gender,
                birthDate: birthDate ? new Date(birthDate) : null,
                birthPlace: birthPlace || null,
                deathDate: deathDate ? new Date(deathDate) : null,
                isAlive: isAlive ?? true,
                address: address || null,
                city: city || null,
                phoneWhatsapp: phoneWhatsapp || null,
                socialMedia: socialMedia || {},
                bio: bio || null,
                fatherId: fatherId || null,
                motherId: motherId || null,
                generation,
                addedById: session.user.id,
            },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                baniId,
                action: "CREATE",
                entityType: "MEMBER",
                entityId: member.id,
                description: `Menambahkan anggota "${fullName}"`,
                newValues: { fullName, gender, generation } as any,
            },
        });

        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        console.error("Create member error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
