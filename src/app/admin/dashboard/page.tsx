import prisma from "@/lib/prisma";
import {
    Users,
    TreePine,
    UserCheck,
    Clock,
    Activity,
    TrendingUp,
} from "lucide-react";

export default async function AdminDashboardPage() {
    // Stats
    const [totalUsers, pendingUsers, totalBanis, totalMembers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "PENDING" } }),
        prisma.bani.count(),
        prisma.member.count(),
    ]);

    const approvedUsers = await prisma.user.count({
        where: { status: "APPROVED" },
    });

    // Recent activity
    const recentActivity = await prisma.activityLog.findMany({
        include: {
            user: { select: { name: true, avatar: true } },
            bani: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    // Recent registrations
    const recentUsers = await prisma.user.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">
                    Admin Dashboard
                </h1>
                <p className="text-surface-500 mt-1">
                    Kelola pengguna dan pantau aktivitas
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-soft">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-surface-900">{totalUsers}</p>
                    <p className="text-sm text-surface-500">Total Pengguna</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-soft">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-gold-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gold-600">{pendingUsers}</p>
                    <p className="text-sm text-surface-500">Menunggu Approval</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-soft">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <TreePine className="w-5 h-5 text-primary-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-surface-900">{totalBanis}</p>
                    <p className="text-sm text-surface-500">Total Bani</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-soft">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-surface-900">{totalMembers}</p>
                    <p className="text-sm text-surface-500">Total Anggota Nasab</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Users */}
                <div className="rounded-2xl bg-white border border-surface-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
                        <h2 className="text-base font-semibold text-surface-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gold-500" />
                            Menunggu Persetujuan
                        </h2>
                        {pendingUsers > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 text-xs font-semibold">
                                {pendingUsers}
                            </span>
                        )}
                    </div>
                    <div className="divide-y divide-surface-100">
                        {recentUsers.length === 0 ? (
                            <div className="p-6 text-center text-surface-400 text-sm">
                                Tidak ada pendaftaran menunggu
                            </div>
                        ) : (
                            recentUsers.map((user) => (
                                <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-surface-900">{user.name}</p>
                                        <p className="text-xs text-surface-400">{user.email}</p>
                                    </div>
                                    <span className="text-xs text-surface-400">
                                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-2xl bg-white border border-surface-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-surface-100">
                        <h2 className="text-base font-semibold text-surface-900 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary-500" />
                            Aktivitas Terbaru
                        </h2>
                    </div>
                    <div className="divide-y divide-surface-100 max-h-80 overflow-y-auto">
                        {recentActivity.length === 0 ? (
                            <div className="p-6 text-center text-surface-400 text-sm">
                                Belum ada aktivitas
                            </div>
                        ) : (
                            recentActivity.map((log) => (
                                <div key={log.id} className="px-6 py-3 flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-[10px] font-semibold text-primary-600">
                                            {log.user.name[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-surface-700">
                                            <span className="font-medium">{log.user.name}</span>{" "}
                                            {log.description || `${log.action} ${log.entityType}`}
                                        </p>
                                        <p className="text-xs text-surface-400">
                                            {log.bani?.name && `${log.bani.name} · `}
                                            {new Date(log.createdAt).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
