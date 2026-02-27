import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Nama, email, dan password harus diisi" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password minimal 6 karakter" },
                { status: 400 }
            );
        }

        // Check existing user
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email sudah terdaftar" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if this is the first user (make them SUPER_ADMIN & auto-approve)
        const userCount = await prisma.user.count();
        const isFirstUser = userCount === 0;

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: isFirstUser ? "SUPER_ADMIN" : "USER",
                status: isFirstUser ? "APPROVED" : "PENDING",
            },
        });

        return NextResponse.json(
            {
                message: isFirstUser
                    ? "Akun Super Admin berhasil dibuat! Silakan login."
                    : "Registrasi berhasil! Akun Anda menunggu persetujuan admin.",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan saat mendaftar" },
            { status: 500 }
        );
    }
}
