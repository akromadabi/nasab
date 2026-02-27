import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    Activity,
    Filter,
    Calendar,
    Users,
    TreePine,
    Plus,
    Pencil,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 20;

const actionConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    CREATE: { label: "Dibuat", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: Plus },
    UPDATE: { label: "Diubah", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Pencil },
    DELETE: { label: "Dihapus", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: Trash2 },
    VIEW: { label: "Dilihat", color: "text-surface-700", bg: "bg-surface-50 border-surface-200", icon: Eye },
};

export default async function ActivityLogsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; action?: string }>;
}) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const isAdmin =
        session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";
    if (!isAdmin) redirect("/dashboard");

    const params = await searchParams;
    const page = Math.max(1, parseInt(params.page || "1"));
    const actionFilter = params.action || "";

    const where = actionFilter ? { action: actionFilter } : {};

    const [logs, totalCount] = await Promise.all([
        prisma.activityLog.findMany({
            where,
            include: {
                user: { select: { name: true, avatar: true } },
                bani: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
        prisma.activityLog.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // Count by action type for filter badges
    const actionCounts = await prisma.activityLog.groupBy({
        by: ["action"],
        _count: true,
    });
    const countMap: Record<string, number> = {};
    actionCounts.forEach((a) => {
        countMap[a.action] = a._count;
    });

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="animate-fade-in">
                <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary-600" />
                    </div>
                    Log Aktivitas
                </h1>
                <p className="text-surface-500 mt-2">
                    Semua aktivitas pengguna di sistem — {totalCount} total log
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 animate-slide-up">
                <a
                    href="/dashboard/logs"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${!actionFilter
                            ? "bg-primary-50 text-primary-700 border-primary-200"
                            : "bg-white text-surface-600 border-surface-200 hover:bg-surface-50"
                        }`}
                >
                    <Filter className="w-3.5 h-3.5" />
                    Semua ({totalCount})
                </a>
                {Object.entries(actionConfig).map(([key, config]) => {
                    const count = countMap[key] || 0;
                    if (count === 0) return null;
                    const Icon = config.icon;
                    return (
                        <a
                            key={key}
                            href={`/dashboard/logs?action=${key}`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${actionFilter === key
                                    ? `${config.bg} ${config.color}`
                                    : "bg-white text-surface-600 border-surface-200 hover:bg-surface-50"
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {config.label} ({count})
                        </a>
                    );
                })}
            </div>

            {/* Logs List */}
            <div className="rounded-2xl bg-white border border-surface-200 overflow-hidden animate-slide-up" style={{ animationDelay: "0.1s" }}>
                {logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Activity className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                        <p className="text-surface-500">Belum ada log aktivitas</p>
                    </div>
                ) : (
                    <div className="divide-y divide-surface-100">
                        {logs.map((log) => {
                            const config = actionConfig[log.action] || actionConfig.VIEW;
                            const Icon = config.icon;
                            return (
                                <div key={log.id} className="px-4 sm:px-6 py-4 flex items-start gap-3 hover:bg-surface-50/50 transition-colors">
                                    {/* Action icon */}
                                    <div className={`w-8 h-8 rounded-lg ${config.bg} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-surface-800">
                                            <span className="font-semibold">{log.user.name}</span>{" "}
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${config.bg} ${config.color} border`}>
                                                {config.label}
                                            </span>{" "}
                                            <span className="text-surface-500">{log.entityType}</span>
                                        </p>
                                        {log.description && (
                                            <p className="text-xs text-surface-500 mt-0.5 truncate">
                                                {log.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-surface-400">
                                            {log.bani?.name && (
                                                <span className="flex items-center gap-1">
                                                    <TreePine className="w-3 h-3" /> {log.bani.name}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(log.createdAt).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                    <a
                        href={`/dashboard/logs?page=${Math.max(1, page - 1)}${actionFilter ? `&action=${actionFilter}` : ""}`}
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${page <= 1
                                ? "opacity-40 pointer-events-none bg-surface-50 text-surface-400 border-surface-200"
                                : "bg-white text-surface-600 border-surface-200 hover:bg-surface-50"
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" /> Prev
                    </a>
                    <span className="px-4 py-2 text-sm font-medium text-surface-600">
                        {page} / {totalPages}
                    </span>
                    <a
                        href={`/dashboard/logs?page=${Math.min(totalPages, page + 1)}${actionFilter ? `&action=${actionFilter}` : ""}`}
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${page >= totalPages
                                ? "opacity-40 pointer-events-none bg-surface-50 text-surface-400 border-surface-200"
                                : "bg-white text-surface-600 border-surface-200 hover:bg-surface-50"
                            }`}
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </a>
                </div>
            )}
        </div>
    );
}
