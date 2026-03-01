"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    User,
    Phone,
    MapPin,
    Calendar,
    Loader2,
    Camera,
    Heart,
    Flower2,
} from "lucide-react";

interface ParentOption {
    id: string;
    fullName: string;
    gender: string;
    generation: number;
}

export default function AddMemberPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const [baniId, setBaniId] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [error, setError] = useState("");
    const [members, setMembers] = useState<ParentOption[]>([]);

    // Form state
    const [fullName, setFullName] = useState("");
    const [nickname, setNickname] = useState("");
    const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
    const [birthDate, setBirthDate] = useState("");
    const [birthPlace, setBirthPlace] = useState("");
    const [isAlive, setIsAlive] = useState(true);
    const [deathDate, setDeathDate] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [phoneWhatsapp, setPhoneWhatsapp] = useState("");
    const [instagram, setInstagram] = useState("");
    const [facebook, setFacebook] = useState("");
    const [bio, setBio] = useState("");
    const [fatherId, setFatherId] = useState("");
    const [motherId, setMotherId] = useState("");

    useEffect(() => {
        params.then((p) => {
            setBaniId(p.id);
            fetchMembers(p.id);
        });
    }, [params]);

    const fetchMembers = async (id: string) => {
        try {
            const res = await fetch(`/api/members?baniId=${id}`);
            const data = await res.json();
            setMembers(data);
        } catch (err) {
            console.error("Failed to fetch members:", err);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const socialMedia: Record<string, string> = {};
            if (instagram) socialMedia.instagram = instagram;
            if (facebook) socialMedia.facebook = facebook;

            const res = await fetch("/api/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    baniId,
                    fullName,
                    nickname: nickname || undefined,
                    gender,
                    birthDate: birthDate || undefined,
                    birthPlace: birthPlace || undefined,
                    isAlive,
                    deathDate: !isAlive && deathDate ? deathDate : undefined,
                    address: address || undefined,
                    city: city || undefined,
                    phoneWhatsapp: phoneWhatsapp || undefined,
                    socialMedia: Object.keys(socialMedia).length > 0 ? socialMedia : undefined,
                    bio: bio || undefined,
                    fatherId: fatherId || undefined,
                    motherId: motherId || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            router.push(`/dashboard/bani/${baniId}`);
            router.refresh();
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const fathers = members.filter((m) => m.gender === "MALE");
    const mothers = members.filter((m) => m.gender === "FEMALE");

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Link
                    href={`/dashboard/bani/${baniId}`}
                    className="touch-target p-2 rounded-xl hover:bg-surface-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-surface-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Tambah Anggota</h1>
                    <p className="text-sm text-surface-500">
                        Tambahkan anggota baru ke pohon nasab
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Data Dasar */}
                <div className="rounded-2xl bg-white border border-surface-200 p-6 space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-surface-100">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-surface-900">Data Dasar</h2>
                            <p className="text-xs text-surface-400">Informasi identitas anggota</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-base"
                            placeholder="Nama lengkap"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Nama Panggilan
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-base"
                            placeholder="Panggilan sehari-hari"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Jenis Kelamin <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setGender("MALE")}
                                className={`flex items-center justify-center gap-1.5 touch-target flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${gender === "MALE"
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-surface-200 text-surface-500 hover:bg-surface-50"
                                    }`}
                            >
                                <User className="w-3.5 h-3.5" /> Laki-laki
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender("FEMALE")}
                                className={`flex items-center justify-center gap-1.5 touch-target flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${gender === "FEMALE"
                                    ? "border-pink-500 bg-pink-50 text-pink-700"
                                    : "border-surface-200 text-surface-500 hover:bg-surface-50"
                                    }`}
                            >
                                <User className="w-3.5 h-3.5" /> Perempuan
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">
                                Tanggal Lahir
                            </label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">
                                Tempat Lahir
                            </label>
                            <input
                                type="text"
                                value={birthPlace}
                                onChange={(e) => setBirthPlace(e.target.value)}
                                className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="Kota kelahiran"
                            />
                        </div>
                    </div>

                    {/* Status Hidup */}
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Status
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setIsAlive(true); setDeathDate(""); }}
                                className={`flex items-center justify-center gap-1.5 touch-target flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${isAlive
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : "border-surface-200 text-surface-500 hover:bg-surface-50"
                                    }`}
                            >
                                <Heart className="w-3.5 h-3.5" /> Masih Hidup
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAlive(false)}
                                className={`flex items-center justify-center gap-1.5 touch-target flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${!isAlive
                                    ? "border-surface-500 bg-surface-100 text-surface-700"
                                    : "border-surface-200 text-surface-500 hover:bg-surface-50"
                                    }`}
                            >
                                <Flower2 className="w-3.5 h-3.5" /> Sudah Wafat
                            </button>
                        </div>
                    </div>

                    {!isAlive && (
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">
                                Tanggal Wafat
                            </label>
                            <input
                                type="date"
                                value={deathDate}
                                onChange={(e) => setDeathDate(e.target.value)}
                                className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* Relasi */}
                <div className="rounded-2xl bg-white border border-surface-200 p-6 space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-surface-100">
                        <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-gold-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-surface-900">Relasi Keluarga</h2>
                            <p className="text-xs text-surface-400">Hubungkan dengan orang tua</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Ayah
                        </label>
                        <select
                            value={fatherId}
                            onChange={(e) => setFatherId(e.target.value)}
                            className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 focus:outline-none focus:border-primary-500 bg-white"
                            disabled={loadingMembers}
                        >
                            <option value="">-- Pilih Ayah --</option>
                            {fathers.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.fullName} (Gen. {m.generation + 1})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Ibu
                        </label>
                        <select
                            value={motherId}
                            onChange={(e) => setMotherId(e.target.value)}
                            className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 focus:outline-none focus:border-primary-500 bg-white"
                            disabled={loadingMembers}
                        >
                            <option value="">-- Pilih Ibu --</option>
                            {mothers.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.fullName} (Gen. {m.generation + 1})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Kontak */}
                <div className="rounded-2xl bg-white border border-surface-200 p-6 space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-surface-100">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-surface-900">Kontak & Alamat</h2>
                            <p className="text-xs text-surface-400">Informasi kontak untuk silaturahmi</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            No. WhatsApp
                        </label>
                        <input
                            type="tel"
                            value={phoneWhatsapp}
                            onChange={(e) => setPhoneWhatsapp(e.target.value)}
                            className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-base"
                            placeholder="08xxxxxxxxxx"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">
                                Instagram
                            </label>
                            <input
                                type="text"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="@username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">
                                Facebook
                            </label>
                            <input
                                type="text"
                                value={facebook}
                                onChange={(e) => setFacebook(e.target.value)}
                                className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="Nama Facebook"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Alamat
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-base"
                            placeholder="Alamat lengkap"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Kota
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="touch-target w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-base"
                            placeholder="Kota domisili"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                            Bio / Catatan
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-base resize-none"
                            placeholder="Catatan tentang anggota ini"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pb-8">
                    <Link
                        href={`/dashboard/bani/${baniId}`}
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
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Anggota"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
