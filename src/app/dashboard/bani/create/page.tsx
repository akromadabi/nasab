"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    TreePine,
    ArrowLeft,
    User,
    Loader2,
} from "lucide-react";

export default function CreateBaniPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [rootMemberName, setRootMemberName] = useState("");
    const [rootMemberGender, setRootMemberGender] = useState("MALE");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/banis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    rootMemberName,
                    rootMemberGender,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            router.push(`/dashboard/bani/${data.bani.id}`);
            router.refresh();
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Link
                    href="/dashboard"
                    className="touch-target p-2 rounded-xl hover:bg-surface-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-surface-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Buat Bani Baru</h1>
                    <p className="text-sm text-surface-500">
                        Mulai buat catatan silsilah keluarga
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bani Info */}
                <div className="rounded-2xl bg-white border border-surface-200 p-6 space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-surface-100">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <TreePine className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-surface-900">
                                Informasi Bani
                            </h2>
                            <p className="text-xs text-surface-400">
                                Data dasar tentang bani keluarga
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Nama Bani <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-base"
                            placeholder="Contoh: Bani H. Ahmad Dahlan"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Deskripsi
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-base resize-none"
                            placeholder="Deskripsi singkat tentang keluarga besar ini"
                        />
                    </div>
                </div>

                {/* Root Ancestor */}
                <div className="rounded-2xl bg-white border border-surface-200 p-6 space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-surface-100">
                        <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                            <User className="w-5 h-5 text-gold-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-surface-900">
                                Leluhur (Asal Nasab)
                            </h2>
                            <p className="text-xs text-surface-400">
                                Orang pertama di puncak pohon nasab
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Nama Lengkap Leluhur <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={rootMemberName}
                            onChange={(e) => setRootMemberName(e.target.value)}
                            className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-base"
                            placeholder="Contoh: H. Ahmad Dahlan"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Jenis Kelamin
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setRootMemberGender("MALE")}
                                className={`flex items-center justify-center gap-1.5 touch-target flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${rootMemberGender === "MALE"
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-surface-200 text-surface-500 hover:bg-surface-50"
                                    }`}
                            >
                                <User className="w-3.5 h-3.5" /> Laki-laki
                            </button>
                            <button
                                type="button"
                                onClick={() => setRootMemberGender("FEMALE")}
                                className={`flex items-center justify-center gap-1.5 touch-target flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${rootMemberGender === "FEMALE"
                                    ? "border-pink-500 bg-pink-50 text-pink-700"
                                    : "border-surface-200 text-surface-500 hover:bg-surface-50"
                                    }`}
                            >
                                <User className="w-3.5 h-3.5" /> Perempuan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                    <Link
                        href="/dashboard"
                        className="touch-target flex-1 py-3.5 rounded-xl border border-surface-200 text-surface-600 font-medium text-center hover:bg-surface-50 transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="touch-target flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Membuat...
                            </>
                        ) : (
                            <>
                                <TreePine className="w-5 h-5" />
                                Buat Bani
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
