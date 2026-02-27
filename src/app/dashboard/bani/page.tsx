import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Plus,
    TreePine,
    Users,
    ChevronRight,
} from "lucide-react";

export default async function BaniListPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const banis = await prisma.bani.findMany({
        where: {
            baniUsers: { some: { userId: session.user.id } },
        },
        include: {
            _count: { select: { members: true } },
            baniUsers: {
                where: { userId: session.user.id },
                select: { role: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Bani Saya</h1>
                    <p className="text-surface-500 mt-1">Kelola silsilah keluarga Anda</p>
                </div>
                <Link
                    href="/dashboard/bani/create"
                    className="touch-target flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold shadow-lg shadow-primary-600/20 hover:from-primary-500 hover:to-primary-600 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Buat Bani</span>
                </Link>
            </div>

            {banis.length === 0 ? (
                <div className="text-center py-20 rounded-2xl bg-white border border-surface-200">
                    <TreePine className="w-14 h-14 text-surface-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-surface-700 mb-2">Belum Ada Bani</h3>
                    <p className="text-surface-500 mb-6 max-w-sm mx-auto">
                        Mulai dokumentasikan silsilah keluarga Anda dengan membuat bani pertama.
                    </p>
                    <Link
                        href="/dashboard/bani/create"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-500 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Buat Bani Pertama
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {banis.map((bani) => {
                        const userRole = bani.baniUsers[0]?.role || "VIEWER";
                        return (
                            <Link
                                key={bani.id}
                                href={`/dashboard/bani/${bani.id}`}
                                className="group rounded-2xl bg-white border border-surface-200 p-5 hover:shadow-lg hover:border-primary-200 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                                        <TreePine className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-surface-900 truncate group-hover:text-primary-700 transition-colors">
                                                {bani.name}
                                            </h3>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${userRole === "ADMIN"
                                                    ? "bg-gold-100 text-gold-700"
                                                    : userRole === "EDITOR"
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "bg-surface-100 text-surface-500"
                                                }`}>
                                                {userRole === "ADMIN" ? "Admin" : userRole === "EDITOR" ? "Editor" : "Viewer"}
                                            </span>
                                        </div>
                                        {bani.description && (
                                            <p className="text-sm text-surface-500 line-clamp-2 mt-1">{bani.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-3">
                                            <span className="flex items-center gap-1 text-xs text-surface-400">
                                                <Users className="w-3.5 h-3.5" />
                                                {bani._count.members} anggota
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-surface-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
