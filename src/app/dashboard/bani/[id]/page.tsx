import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
    Users,
    UsersRound,
    ArrowLeft,
    Settings,
    Heart,
    Crown,
    MapPin,
} from "lucide-react";
import BaniContent from "./BaniContent";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BaniDetailPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) redirect("/login");

    const baniData = await prisma.bani.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            treeOrientation: true,
            isPublic: true,
            showWaPublic: true,
            showBirthPublic: true,
            showAddressPublic: true,
            showSocmedPublic: true,
            cardTheme: true,
            createdBy: { select: { name: true } },
            rootMember: { select: { id: true, fullName: true } },
            _count: { select: { members: true } },
        },
    });

    if (!baniData) notFound();

    // Check access
    const baniUser = await prisma.baniUser.findUnique({
        where: { baniId_userId: { baniId: id, userId: session.user.id } },
    });

    const isAdmin = (session.user as any).role === "SUPER_ADMIN";
    if (!baniUser && !isAdmin) {
        return (
            <div className="max-w-lg mx-auto text-center py-20">
                <h2 className="text-xl font-semibold text-surface-700">Akses Ditolak</h2>
                <p className="text-surface-500 mt-2">Anda tidak memiliki akses ke bani ini.</p>
            </div>
        );
    }

    // Get stats
    const stats = await prisma.member.groupBy({
        by: ["gender", "isAlive"],
        where: { baniId: id },
        _count: true,
    });

    const totalAlive = stats.filter((s) => s.isAlive).reduce((sum, s) => sum + s._count, 0);
    const totalDeceased = stats.filter((s) => !s.isAlive).reduce((sum, s) => sum + s._count, 0);
    const totalMale = stats.filter((s) => s.gender === "MALE").reduce((sum, s) => sum + s._count, 0);
    const totalFemale = stats.filter((s) => s.gender === "FEMALE").reduce((sum, s) => sum + s._count, 0);

    const maxGeneration = await prisma.member.aggregate({
        where: { baniId: id },
        _max: { generation: true },
    });

    const members = await prisma.member.findMany({
        where: { baniId: id },
        include: {
            father: { select: { id: true, fullName: true } },
            mother: { select: { id: true, fullName: true } },
            marriagesAsHusband: {
                include: { wife: { select: { id: true, fullName: true, photo: true, gender: true } } },
                orderBy: { marriageOrder: "asc" },
            },
            marriagesAsWife: {
                include: { husband: { select: { id: true, fullName: true, photo: true, gender: true } } },
                orderBy: { marriageOrder: "asc" },
            },
        },
        orderBy: [{ generation: "asc" }, { fullName: "asc" }],
    });

    const canEdit = baniUser?.role !== "VIEWER";

    // Check if user is on free (default) tier for watermark
    const userWithTier = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { tier: { select: { isDefault: true } } },
    });
    const isFreeUser = !userWithTier?.tier || userWithTier.tier.isDefault;

    return (
        <div className="max-w-6xl mx-auto space-y-4">
            {/* Header + Stats Combined Card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-4 sm:p-6 text-white shadow-lg shadow-primary-600/20">
                <div className="flex items-start gap-3">
                    <Link
                        href="/dashboard"
                        className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors mt-0.5"
                    >
                        <ArrowLeft className="w-4 h-4 text-white" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg sm:text-2xl font-bold truncate">
                                {baniData.name}
                            </h1>
                            {baniUser?.role === "ADMIN" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 text-white text-xs font-medium">
                                    <Crown className="w-3 h-3" /> Admin
                                </span>
                            )}
                        </div>
                        {baniData.description && (
                            <p className="text-primary-100 text-xs sm:text-sm mt-1 line-clamp-2">{baniData.description}</p>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4">
                    <div className="bg-white/10 rounded-xl p-2 sm:p-3 text-center">
                        <Users className="w-4 h-4 mx-auto mb-1 text-primary-200" />
                        <p className="text-lg sm:text-xl font-bold">{baniData._count.members}</p>
                        <p className="text-[10px] sm:text-xs text-primary-200">Total</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-2 sm:p-3 text-center">
                        <Heart className="w-4 h-4 mx-auto mb-1 text-green-300" />
                        <p className="text-lg sm:text-xl font-bold">{totalAlive}</p>
                        <p className="text-[10px] sm:text-xs text-primary-200">Hidup</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-2 sm:p-3 text-center">
                        <MapPin className="w-4 h-4 mx-auto mb-1 text-blue-300" />
                        <p className="text-lg sm:text-xl font-bold">{(maxGeneration._max.generation ?? 0) + 1}</p>
                        <p className="text-[10px] sm:text-xs text-primary-200">Generasi</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-2 sm:p-3 text-center">
                        <UsersRound className="w-4 h-4 mx-auto mb-1 text-purple-300" />
                        <p className="text-lg sm:text-xl font-bold">{totalMale}/{totalFemale}</p>
                        <p className="text-[10px] sm:text-xs text-primary-200">L / P</p>
                    </div>
                </div>
            </div>

            {/* Content: Tabs (Tree default / Member List) */}
            <BaniContent
                baniId={id}
                baniName={baniData.name}
                members={JSON.parse(JSON.stringify(members))}
                canEdit={canEdit}
                initialOrientation={baniData.treeOrientation}
                initialIsPublic={baniData.isPublic}
                initialShowWa={baniData.showWaPublic}
                initialShowBirth={baniData.showBirthPublic}
                initialShowAddress={baniData.showAddressPublic}
                initialShowSocmed={baniData.showSocmedPublic}
                isFreeUser={isFreeUser}
                initialCardTheme={baniData.cardTheme}
            />
        </div>
    );
}
