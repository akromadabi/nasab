import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const memberId = formData.get("memberId") as string | null;

        if (!file || !memberId) {
            return NextResponse.json(
                { error: "File dan memberId harus diisi" },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Format file harus JPG, PNG, atau WebP" },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = parseInt(process.env.MAX_FILE_SIZE || "5242880");
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "Ukuran file maksimal 5MB" },
                { status: 400 }
            );
        }

        // Check member exists and user has access
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            select: { baniId: true, fullName: true },
        });

        if (!member) {
            return NextResponse.json({ error: "Anggota tidak ditemukan" }, { status: 404 });
        }

        const baniUser = await prisma.baniUser.findUnique({
            where: { baniId_userId: { baniId: member.baniId, userId: session.user.id } },
        });

        if (!baniUser || baniUser.role === "VIEWER") {
            return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
        }

        // Create upload directory
        const uploadDir = path.join(process.cwd(), "public", "uploads", "members");
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
        const filename = `${memberId}-${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, filename);

        // Write file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Update member photo
        const photoUrl = `/uploads/members/${filename}`;
        await prisma.member.update({
            where: { id: memberId },
            data: { photo: photoUrl },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                baniId: member.baniId,
                action: "UPDATE",
                entityType: "MEMBER",
                entityId: memberId,
                description: `Mengupload foto ${member.fullName}`,
            },
        });

        return NextResponse.json({ url: photoUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Gagal mengupload file" }, { status: 500 });
    }
}
