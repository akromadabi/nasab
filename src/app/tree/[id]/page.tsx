import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import BaniContent from "@/app/dashboard/bani/[id]/BaniContent";
import { Users, Heart, MapPin } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PublicTreePage({ params }: PageProps) {
    const { id } = await params;

    const bani = await prisma.bani.findUnique({
        where: { id, isPublic: true },
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
            _count: { select: { members: true } },
        },
    });

    if (!bani) notFound();

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

    const stats = await prisma.member.groupBy({
        by: ["gender", "isAlive"],
        where: { baniId: id },
        _count: true,
    });

    const totalAlive = stats.filter(s => s.isAlive).reduce((sum, s) => sum + s._count, 0);
    const totalDeceased = stats.filter(s => !s.isAlive).reduce((sum, s) => sum + s._count, 0);
    const totalMale = stats.filter(s => s.gender === "MALE").reduce((sum, s) => sum + s._count, 0);
    const totalFemale = stats.filter(s => s.gender === "FEMALE").reduce((sum, s) => sum + s._count, 0);

    const maxGeneration = await prisma.member.aggregate({
        where: { baniId: id },
        _max: { generation: true },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100">
            <div className="max-w-6xl mx-auto p-4 space-y-4">
                {/* Header - same style as user dashboard bani page */}
                <div className="rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-4 sm:p-6 text-white shadow-lg shadow-primary-600/20">
                    <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg sm:text-2xl font-bold truncate">{bani.name}</h1>
                            {bani.description && (
                                <p className="text-primary-100 text-xs sm:text-sm mt-1 line-clamp-2">{bani.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4">
                        <div className="bg-white/10 rounded-xl p-2 sm:p-3 text-center">
                            <Users className="w-4 h-4 mx-auto mb-1 text-primary-200" />
                            <p className="text-lg sm:text-xl font-bold">{bani._count.members}</p>
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
                            <span className="text-sm">👨‍👩</span>
                            <p className="text-lg sm:text-xl font-bold">{totalMale}/{totalFemale}</p>
                            <p className="text-[10px] sm:text-xs text-primary-200">L / P</p>
                        </div>
                    </div>
                </div>

                {/* Reuse the same BaniContent component with canEdit=false */}
                <BaniContent
                    baniId={id}
                    baniName={bani.name}
                    members={JSON.parse(JSON.stringify(members))}
                    canEdit={false}
                    initialOrientation={bani.treeOrientation}
                    initialIsPublic={bani.isPublic}
                    initialShowWa={bani.showWaPublic}
                    initialShowBirth={bani.showBirthPublic}
                    initialShowAddress={bani.showAddressPublic}
                    initialShowSocmed={bani.showSocmedPublic}
                />
            </div>
        </div>
    );
}
