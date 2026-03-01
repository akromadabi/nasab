"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, Shield, User } from "lucide-react";

const errorMessages: Record<string, string> = {
    Configuration: "Terjadi kesalahan konfigurasi server. Silakan hubungi admin.",
    CredentialsSignin: "Email atau password salah.",
    Default: "Terjadi kesalahan. Silakan coba lagi.",
};

export default function LoginPage() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [quickLoading, setQuickLoading] = useState<string | null>(null);

    useEffect(() => {
        const urlError = searchParams.get("error");
        if (urlError) {
            setError(errorMessages[urlError] || errorMessages.Default);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = async (role: "admin" | "user") => {
        setError("");
        setQuickLoading(role);

        const credentials = {
            admin: { email: "admin@jejaknasab.com", password: "admin123" },
            user: { email: "budi@example.com", password: "user123" },
        };

        try {
            const { email: qEmail, password: qPass } = credentials[role];
            setEmail(qEmail);
            setPassword(qPass);

            const result = await signIn("credentials", {
                email: qEmail,
                password: qPass,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setQuickLoading(null);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface-50 relative overflow-hidden">
            {/* Subtle decorative shapes */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-50/80 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
                            <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-xl font-bold text-surface-900 tracking-tight">Jejak Nasab</h1>
                            <p className="text-xs text-surface-400">Silsilah Keluarga Digital</p>
                        </div>
                    </Link>
                </div>

                {/* Card */}
                <div className="rounded-2xl bg-white border border-surface-200 shadow-xl shadow-surface-200/50 p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-surface-900">Selamat Datang</h2>
                        <p className="text-surface-500 text-sm mt-1">
                            Masuk ke akun Anda untuk melanjutkan
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="touch-target w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-50 border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-base"
                                    placeholder="nama@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="touch-target w-full pl-12 pr-12 py-3.5 rounded-xl bg-surface-50 border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-base"
                                    placeholder="Masukkan password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="touch-target w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-base hover:from-primary-400 hover:to-primary-500 transition-all shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                "Masuk"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-surface-500 text-sm">
                            Belum punya akun?{" "}
                            <Link
                                href="/register"
                                className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
                            >
                                Daftar Sekarang
                            </Link>
                        </p>
                    </div>

                    {/* Quick Login for Testing - only show in development */}
                    {process.env.NODE_ENV !== "production" && (
                        <div className="mt-6 pt-6 border-t border-surface-200">
                            <p className="text-center text-xs text-surface-400 mb-3">⚡ Quick Login (Testing)</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => quickLogin("admin")}
                                    disabled={!!quickLoading}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-all disabled:opacity-50"
                                >
                                    {quickLoading === "admin" ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Shield className="w-4 h-4" />
                                    )}
                                    Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quickLogin("user")}
                                    disabled={!!quickLoading}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-all disabled:opacity-50"
                                >
                                    {quickLoading === "user" ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                    User
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
