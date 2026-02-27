import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Users,
    TreePine,
    Calendar,
    ArrowRight,
    Shield,
    Eye,
} from "lucide-react";

export default async function AdminBaniListPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const banis = await prisma.bani.findMany({
        include: {
            _count: {
                select: { members: true, baniUsers: true },
            },
            createdBy: { select: { name: true } },
            baniUsers: {
                select: { role: true, user: { select: { name: true } } },
                where: { role: "ADMIN" },
                take: 3,
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const totalMembers = banis.reduce((sum, b) => sum + b._count.members, 0);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Kelola Bani</h1>
                <p className="text-surface-500 mt-1">
                    Semua bani yang terdaftar di sistem
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-soft">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                        <TreePine className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-2xl font-bold text-surface-900">{banis.length}</p>
                    <p className="text-sm text-surface-500">Total Bani</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-soft">
                    <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center mb-3">
                        <Users className="w-5 h-5 text-gold-600" />
                    </div>
                    <p className="text-2xl font-bold text-surface-900">{totalMembers}</p>
                    <p className="text-sm text-surface-500">Total Anggota</p>
                </div>
            </div>

            {/* Bani List */}
            <div className="space-y-4">
                {banis.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-white border border-surface-200">
                        <TreePine className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                        <p className="text-surface-500">Belum ada bani terdaftar</p>
                    </div>
                ) : (
                    banis.map((bani) => (
                        <div
                            key={bani.id}
                            className="rounded-2xl bg-white border border-surface-200 p-5 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                                            <TreePine className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-surface-900">
                                                {bani.name}
                                            </h3>
                                            {bani.description && (
                                                <p className="text-sm text-surface-500 line-clamp-1">
                                                    {bani.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-surface-500">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            {bani._count.members} anggota
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Shield className="w-3.5 h-3.5" />
                                            {bani._count.baniUsers} kontributor
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(bani.createdAt).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    {bani.baniUsers.length > 0 && (
                                        <div className="mt-2 flex items-center gap-1 text-xs text-surface-400">
                                            <span>Admin:</span>
                                            {bani.baniUsers.map((bu, i) => (
                                                <span key={i} className="text-surface-600">
                                                    {bu.user.name}
                                                    {i < bani.baniUsers.length - 1 ? "," : ""}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href={`/dashboard/bani/${bani.id}`}
                                    className="touch-target flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-primary-600 hover:bg-primary-50 transition-colors flex-shrink-0"
                                >
                                    <Eye className="w-4 h-4" />
                                    Lihat
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
