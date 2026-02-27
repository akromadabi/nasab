import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "jejak_nasab",
});
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...");

    const hp = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.upsert({ where: { email: "admin@jejaknasab.com" }, update: {}, create: { name: "Admin Nasab", email: "admin@jejaknasab.com", password: hp, role: "SUPER_ADMIN", status: "APPROVED" } });
    console.log("✅ Admin:", admin.email);

    const up = await bcrypt.hash("user123", 12);
    const user1 = await prisma.user.upsert({ where: { email: "budi@example.com" }, update: {}, create: { name: "Budi Santoso", email: "budi@example.com", password: up, role: "USER", status: "APPROVED" } });
    await prisma.user.upsert({ where: { email: "siti@example.com" }, update: {}, create: { name: "Siti Aminah", email: "siti@example.com", password: up, role: "USER", status: "PENDING" } });
    console.log("✅ Users created");

    const bani = await prisma.bani.create({ data: { name: "Bani H. Ahmad Dahlan", description: "Keturunan H. Ahmad Dahlan dari Padang, Sumatera Barat.", createdById: admin.id } });
    await prisma.baniUser.create({ data: { baniId: bani.id, userId: admin.id, role: "ADMIN" } });
    await prisma.baniUser.create({ data: { baniId: bani.id, userId: user1.id, role: "EDITOR" } });
    console.log("✅ Bani:", bani.name);

    const root = await prisma.member.create({ data: { baniId: bani.id, fullName: "H. Ahmad Dahlan", nickname: "Pak Dahlan", gender: "MALE", birthDate: new Date("1920-03-15"), birthPlace: "Padang", deathDate: new Date("2005-08-20"), isAlive: false, city: "Padang", bio: "Pendiri keluarga besar", generation: 0, addedById: admin.id } });
    await prisma.bani.update({ where: { id: bani.id }, data: { rootMemberId: root.id } });

    const rootWife = await prisma.member.create({ data: { baniId: bani.id, fullName: "Hj. Salmah", nickname: "Mak Salmah", gender: "FEMALE", birthDate: new Date("1925-07-10"), birthPlace: "Bukittinggi", deathDate: new Date("2010-12-01"), isAlive: false, city: "Padang", generation: 0, addedById: admin.id } });
    await prisma.marriage.create({ data: { husbandId: root.id, wifeId: rootWife.id, marriageDate: new Date("1945-01-01"), isActive: true, marriageOrder: 1 } });

    const c1 = await prisma.member.create({ data: { baniId: bani.id, fullName: "H. Muhammad Yusuf", nickname: "Pak Yusuf", gender: "MALE", birthDate: new Date("1948-05-20"), birthPlace: "Padang", isAlive: false, deathDate: new Date("2020-03-15"), city: "Jakarta", phoneWhatsapp: "081234567890", fatherId: root.id, motherId: rootWife.id, generation: 1, addedById: admin.id } });
    const c1w = await prisma.member.create({ data: { baniId: bani.id, fullName: "Hj. Fatimah", gender: "FEMALE", birthDate: new Date("1952-09-12"), birthPlace: "Jakarta", isAlive: true, city: "Jakarta", phoneWhatsapp: "081234567891", generation: 1, addedById: admin.id } });
    await prisma.marriage.create({ data: { husbandId: c1.id, wifeId: c1w.id, marriageDate: new Date("1970-06-15"), isActive: true, marriageOrder: 1 } });

    const c2 = await prisma.member.create({ data: { baniId: bani.id, fullName: "Hj. Aisyah", nickname: "Bu Aisyah", gender: "FEMALE", birthDate: new Date("1950-11-03"), birthPlace: "Padang", isAlive: true, city: "Bandung", phoneWhatsapp: "081298765432", fatherId: root.id, motherId: rootWife.id, generation: 1, addedById: admin.id } });
    const c2h = await prisma.member.create({ data: { baniId: bani.id, fullName: "H. Rahmat Hidayat", gender: "MALE", birthDate: new Date("1947-02-28"), birthPlace: "Bandung", isAlive: true, city: "Bandung", generation: 1, addedById: admin.id } });
    await prisma.marriage.create({ data: { husbandId: c2h.id, wifeId: c2.id, marriageDate: new Date("1972-04-20"), isActive: true, marriageOrder: 1 } });

    await prisma.member.create({ data: { baniId: bani.id, fullName: "Ir. Ibrahim", nickname: "Pak Ibrahim", gender: "MALE", birthDate: new Date("1955-08-17"), birthPlace: "Padang", isAlive: true, city: "Surabaya", phoneWhatsapp: "081345678901", fatherId: root.id, motherId: rootWife.id, generation: 1, addedById: admin.id } });

    const gc1 = await prisma.member.create({ data: { baniId: bani.id, fullName: "Dr. Rizki Yusuf", gender: "MALE", birthDate: new Date("1975-03-10"), birthPlace: "Jakarta", isAlive: true, city: "Jakarta", phoneWhatsapp: "082111222333", fatherId: c1.id, motherId: c1w.id, generation: 2, addedById: admin.id } });
    await prisma.member.create({ data: { baniId: bani.id, fullName: "Nurul Yusuf", nickname: "Nurul", gender: "FEMALE", birthDate: new Date("1978-07-25"), birthPlace: "Jakarta", isAlive: true, city: "Depok", fatherId: c1.id, motherId: c1w.id, generation: 2, addedById: admin.id } });
    const gc3 = await prisma.member.create({ data: { baniId: bani.id, fullName: "Ahmad Fauzi Hidayat", nickname: "Fauzi", gender: "MALE", birthDate: new Date("1976-01-05"), birthPlace: "Bandung", isAlive: true, city: "Bandung", fatherId: c2h.id, motherId: c2.id, generation: 2, addedById: admin.id } });
    await prisma.member.create({ data: { baniId: bani.id, fullName: "Zahra Hidayat", gender: "FEMALE", birthDate: new Date("1980-12-15"), birthPlace: "Bandung", isAlive: true, city: "Yogyakarta", fatherId: c2h.id, motherId: c2.id, generation: 2, addedById: admin.id } });

    await prisma.member.create({ data: { baniId: bani.id, fullName: "Bilal Rizki", gender: "MALE", birthDate: new Date("2005-04-10"), birthPlace: "Jakarta", isAlive: true, city: "Jakarta", fatherId: gc1.id, generation: 3, addedById: admin.id } });
    await prisma.member.create({ data: { baniId: bani.id, fullName: "Khadijah Rizki", nickname: "Dijah", gender: "FEMALE", birthDate: new Date("2008-09-22"), birthPlace: "Jakarta", isAlive: true, city: "Jakarta", fatherId: gc1.id, generation: 3, addedById: admin.id } });
    await prisma.member.create({ data: { baniId: bani.id, fullName: "Rafif Fauzi", gender: "MALE", birthDate: new Date("2003-06-18"), birthPlace: "Bandung", isAlive: true, city: "Bandung", fatherId: gc3.id, generation: 3, addedById: admin.id } });
    console.log("✅ 15 members, 4 generations");

    await prisma.activityLog.create({ data: { userId: admin.id, baniId: bani.id, action: "CREATE", entityType: "BANI", entityId: bani.id, description: "Membuat bani " + bani.name } });
    console.log("✅ Activity logs");
    console.log("\n🎉 Seeding complete!");
    console.log("📋 admin@jejaknasab.com / admin123");
    console.log("   budi@example.com / user123");
}

main()
    .catch((e) => { console.error("❌", e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
