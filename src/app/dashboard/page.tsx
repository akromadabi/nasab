import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
    TreePine,
    Users,
    Plus,
    ArrowRight,
    Crown,
    Calendar,
    Clock,
    UserCheck,
    Activity,
    Shield,
    Eye,
} from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) return null;

    const userId = session.user.id;
    const isAdmin =
        session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";

    // Get user's banis
    const baniUsers = await prisma.baniUser.findMany({
        where: { userId },
        include: {
            bani: {
                include: {
                    _count: {
                        select: { members: true },
                    },
                },
            },
        },
        orderBy: { joinedAt: "desc" },
    });

    // Get recent activity (user's banis)
    const recentActivity = await prisma.activityLog.findMany({
        where: {
            baniId: { in: baniUsers.map((bu) => bu.bani.id) },
        },
        include: {
            user: { select: { name: true, avatar: true } },
            bani: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: isAdmin ? 10 : 5,
    });

    const totalMembers = baniUsers.reduce(
        (sum, bu) => sum + bu.bani._count.members,
        0
    );

    // Admin-only data
    let adminStats = null;
    let pendingUsers: { id: string; name: string; email: string; createdAt: Date }[] = [];

    if (isAdmin) {
        const [totalUsers, pendingCount, totalBanis, totalMembersGlobal] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: "PENDING" } }),
            prisma.bani.count(),
            prisma.member.count(),
        ]);

        adminStats = { totalUsers, pendingCount, totalBanis, totalMembersGlobal };

        pendingUsers = await prisma.user.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true, name: true, email: true, createdAt: true },
        });
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Welcome Header */}
            <div className="animate-fade-in">
                <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">
                    Assalamualaikum,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
                        {session.user.name}
                    </span>{" "}
                    👋
                </h1>
                <p className="text-surface-500 mt-1">
                    Selamat datang kembali di Jejak Nasab
                </p>
            </div>

            {/* ============ ADMIN SECTION ============ */}
            {isAdmin && adminStats && (
                <div className="animate-slide-up space-y-6">
                    {/* Admin Stats Banner */}
                    <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-gold-50 to-orange-50 border border-gold-200/60 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-sm font-bold text-gold-800 uppercase tracking-wider">Panel Admin</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-gold-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    <span className="text-[11px] text-surface-500 font-medium">Pengguna</span>
                                </div>
                                <p className="text-xl font-bold text-surface-900">{adminStats.totalUsers}</p>
                            </div>
                            <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-gold-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-gold-500" />
                                    <span className="text-[11px] text-surface-500 font-medium">Pending</span>
                                </div>
                                <p className="text-xl font-bold text-gold-600">{adminStats.pendingCount}</p>
                            </div>
                            <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-gold-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <TreePine className="w-4 h-4 text-primary-500" />
                                    <span className="text-[11px] text-surface-500 font-medium">Bani</span>
                                </div>
                                <p className="text-xl font-bold text-surface-900">{adminStats.totalBanis}</p>
                            </div>
                            <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-gold-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <UserCheck className="w-4 h-4 text-green-500" />
                                    <span className="text-[11px] text-surface-500 font-medium">Anggota</span>
                                </div>
                                <p className="text-xl font-bold text-surface-900">{adminStats.totalMembersGlobal}</p>
                            </div>
                        </div>

                        {/* Admin Quick Links */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            <Link href="/admin/users" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-gold-200 text-xs font-medium text-gold-700 hover:bg-white transition-colors">
                                <Users className="w-3.5 h-3.5" /> Kelola Pengguna
                            </Link>
                            <Link href="/admin/banis" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-gold-200 text-xs font-medium text-gold-700 hover:bg-white transition-colors">
                                <TreePine className="w-3.5 h-3.5" /> Semua Bani
                            </Link>
                            <Link href="/dashboard/logs" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-gold-200 text-xs font-medium text-gold-700 hover:bg-white transition-colors">
                                <Activity className="w-3.5 h-3.5" /> Log Aktivitas
                            </Link>
                        </div>
                    </div>

                    {/* Pending Users Card */}
                    {pendingUsers.length > 0 && (
                        <div className="rounded-2xl bg-white border border-surface-200 overflow-hidden">
                            <div className="px-5 py-3 border-b border-surface-100 flex items-center justify-between bg-gold-50/50">
                                <h3 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gold-500" />
                                    Menunggu Persetujuan
                                </h3>
                                <Link href="/admin/users" className="text-xs text-gold-600 font-medium hover:text-gold-500 flex items-center gap-1">
                                    Kelola <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                            <div className="divide-y divide-surface-100">
                                {pendingUsers.map((user) => (
                                    <div key={user.id} className="px-5 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 text-xs font-bold">
                                                {user.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-surface-900">{user.name}</p>
                                                <p className="text-xs text-surface-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-surface-400">
                                            {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                            })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ============ USER STATS ============ */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
                <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-soft">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <TreePine className="w-5 h-5 text-primary-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-surface-900">{baniUsers.length}</p>
                    <p className="text-sm text-surface-500">Bani Diikuti</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-soft">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-gold-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-surface-900">{totalMembers}</p>
                    <p className="text-sm text-surface-500">Total Anggota</p>
                </div>
                <Link
                    href="/dashboard/bani/create"
                    className="col-span-2 lg:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/20 hover:from-primary-500 hover:to-primary-600 transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="text-base font-semibold">
                        Buat Bani Baru →
                    </p>
                    <p className="text-sm text-primary-100 mt-0.5">
                        Mulai catat nasab keluarga Anda
                    </p>
                </Link>
            </div>

            {/* ============ BANI LIST ============ */}
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-surface-900">
                        Bani Saya
                    </h2>
                    <Link
                        href="/dashboard/bani"
                        className="text-sm text-primary-600 hover:text-primary-500 font-medium flex items-center gap-1"
                    >
                        Lihat Semua <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {baniUsers.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white border border-surface-200 text-center">
                        <TreePine className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-surface-700 mb-2">
                            Belum Ada Bani
                        </h3>
                        <p className="text-surface-500 text-sm mb-4">
                            Mulai dengan membuat bani keluarga pertama Anda
                        </p>
                        <Link
                            href="/dashboard/bani/create"
                            className="touch-target inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-500 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Buat Bani Baru
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {baniUsers.map((bu) => (
                            <Link
                                key={bu.id}
                                href={`/dashboard/bani/${bu.bani.id}`}
                                className="group p-5 rounded-2xl bg-white border border-surface-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20">
                                        <TreePine className="w-6 h-6 text-white" />
                                    </div>
                                    {bu.role === "ADMIN" && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gold-50 text-gold-700 text-xs font-medium">
                                            <Crown className="w-3 h-3" /> Admin
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-base font-semibold text-surface-900 group-hover:text-primary-700 transition-colors">
                                    {bu.bani.name}
                                </h3>
                                {bu.bani.description && (
                                    <p className="text-sm text-surface-500 mt-1 line-clamp-2">
                                        {bu.bani.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-surface-100">
                                    <span className="text-xs text-surface-400 flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5" />
                                        {bu.bani._count.members} anggota
                                    </span>
                                    <span className="text-xs text-surface-400 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(bu.joinedAt).toLocaleDateString("id-ID", {
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* ============ RECENT ACTIVITY ============ */}
            {recentActivity.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-surface-900">
                            Aktivitas Terbaru
                        </h2>
                        {isAdmin && (
                            <Link href="/dashboard/logs" className="text-sm text-primary-600 hover:text-primary-500 font-medium flex items-center gap-1">
                                Semua Log <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                    <div className="rounded-2xl bg-white border border-surface-200 divide-y divide-surface-100">
                        {recentActivity.map((log) => (
                            <div key={log.id} className="p-4 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-semibold text-primary-600">
                                        {log.user.name[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-surface-700">
                                        <span className="font-medium">{log.user.name}</span>{" "}
                                        {log.description || `${log.action} ${log.entityType}`}
                                    </p>
                                    <p className="text-xs text-surface-400 mt-0.5">
                                        {log.bani?.name} ·{" "}
                                        {new Date(log.createdAt).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
