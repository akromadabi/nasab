"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    TreePine,
    LayoutDashboard,
    Plus,
    LogOut,
    Shield,
    Activity,
    Users,
    MoreHorizontal,
    X,
} from "lucide-react";

const userNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/bani", icon: TreePine, label: "Daftar Bani" },
    { href: "/dashboard/bani/create", icon: Plus, label: "Buat Bani" },
];

const adminNavItems = [
    { href: "/admin/users", icon: Users, label: "Kelola Pengguna" },
    { href: "/admin/banis", icon: TreePine, label: "Semua Bani" },
    { href: "/dashboard/logs", icon: Activity, label: "Log Aktivitas" },
];

// Bottom nav items for mobile
const mobileNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/dashboard/bani", icon: TreePine, label: "Bani" },
    { href: "/dashboard/bani/create", icon: Plus, label: "Buat", isAction: true },
];

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [showMobileMore, setShowMobileMore] = useState(false);

    const isAdmin =
        session?.user &&
        (session.user.role === "SUPER_ADMIN" ||
            session.user.role === "ADMIN");

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* ===================== */}
            {/* MOBILE: Bottom Nav    */}
            {/* ===================== */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-surface-200">
                <div className="flex items-stretch justify-around px-1">
                    {mobileNavItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center py-2 px-3 min-w-[56px] transition-colors relative ${item.isAction
                                    ? ""
                                    : active
                                        ? "text-primary-600"
                                        : "text-surface-400"
                                    }`}
                            >
                                {item.isAction ? (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 -mt-3">
                                        <item.icon className="w-5 h-5 text-white" />
                                    </div>
                                ) : (
                                    <item.icon className={`w-5 h-5 ${active ? "text-primary-600" : "text-surface-400"}`} />
                                )}
                                <span className={`text-[10px] mt-0.5 font-medium ${item.isAction
                                    ? "text-primary-600"
                                    : active
                                        ? "text-primary-600"
                                        : "text-surface-400"
                                    }`}>
                                    {item.label}
                                </span>
                                {active && !item.isAction && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full" />
                                )}
                            </Link>
                        );
                    })}

                    {/* More button */}
                    <button
                        onClick={() => setShowMobileMore(!showMobileMore)}
                        className="flex flex-col items-center justify-center py-2 px-3 min-w-[56px] transition-colors text-surface-400"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5 font-medium">Lainnya</span>
                    </button>
                </div>
            </nav>

            {/* Mobile "More" Sheet */}
            {showMobileMore && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowMobileMore(false)}
                    />
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl animate-slide-up max-h-[70vh] overflow-y-auto">
                        <div className="p-4">
                            {/* Handle bar */}
                            <div className="w-10 h-1 rounded-full bg-surface-300 mx-auto mb-4" />

                            {/* User info */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                                    {session?.user?.name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-surface-900 truncate">
                                        {session?.user?.name || "User"}
                                    </p>
                                    <p className="text-xs text-surface-400 truncate">
                                        {session?.user?.email}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowMobileMore(false)}
                                    className="p-1.5 rounded-lg hover:bg-surface-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-surface-400" />
                                </button>
                            </div>

                            {/* Admin nav */}
                            {isAdmin && (
                                <div className="mb-4">
                                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5" />
                                        Admin
                                    </p>
                                    <div className="space-y-1">
                                        {adminNavItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setShowMobileMore(false)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(item.href)
                                                    ? "bg-gold-50 text-gold-700"
                                                    : "text-surface-600 hover:bg-surface-100"
                                                    }`}
                                            >
                                                <item.icon className={`w-5 h-5 ${isActive(item.href) ? "text-gold-600" : "text-surface-400"}`} />
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Logout */}
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Keluar
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ===================== */}
            {/* DESKTOP: Side Sidebar */}
            {/* ===================== */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex flex-col flex-grow bg-white border-r border-surface-200">
                    {/* Logo */}
                    <div className="p-4 border-b border-surface-200">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20">
                                <TreePine className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-surface-900">Jejak Nasab</h1>
                                <p className="text-xs text-surface-400">Silsilah Digital</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-3 pt-2 pb-1">
                            Menu Utama
                        </p>
                        {userNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`touch-target flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(item.href)
                                    ? "bg-primary-50 text-primary-700 shadow-sm"
                                    : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                                    }`}
                            >
                                <item.icon
                                    className={`w-5 h-5 ${isActive(item.href) ? "text-primary-600" : "text-surface-400"
                                        }`}
                                />
                                {item.label}
                            </Link>
                        ))}

                        {/* Admin Nav — always visible for admins */}
                        {isAdmin && (
                            <>
                                <div className="pt-3 pb-1">
                                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-3 flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5" />
                                        Admin
                                    </p>
                                </div>
                                {adminNavItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`touch-target flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(item.href)
                                            ? "bg-gold-50 text-gold-700 shadow-sm"
                                            : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                                            }`}
                                    >
                                        <item.icon
                                            className={`w-5 h-5 ${isActive(item.href) ? "text-gold-600" : "text-surface-400"
                                                }`}
                                        />
                                        {item.label}
                                    </Link>
                                ))}
                            </>
                        )}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-3 border-t border-surface-200">
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                                {session?.user?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-surface-900 truncate">
                                    {session?.user?.name || "User"}
                                </p>
                                <p className="text-xs text-surface-400 truncate">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="touch-target flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            Keluar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
