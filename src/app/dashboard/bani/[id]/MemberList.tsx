"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search,
    Phone,
    User,
    ChevronRight,
} from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";


interface MemberData {
    id: string;
    fullName: string;
    nickname: string | null;
    gender: "MALE" | "FEMALE";
    birthDate: string | null;
    deathDate: string | null;
    isAlive: boolean;
    photo: string | null;
    phoneWhatsapp: string | null;
    generation: number;
    city: string | null;
    father: { id: string; fullName: string } | null;
    mother: { id: string; fullName: string } | null;
}

export default function MemberList({
    members,
    baniId,
}: {
    members: MemberData[];
    baniId: string;
}) {
    const [search, setSearch] = useState("");
    const [filterGeneration, setFilterGeneration] = useState<number | null>(null);

    const maxGen = Math.max(...members.map((m) => m.generation), 0);
    const generations = Array.from({ length: maxGen + 1 }, (_, i) => i);

    const filtered = members.filter((m) => {
        const matchSearch =
            m.fullName.toLowerCase().includes(search.toLowerCase()) ||
            m.nickname?.toLowerCase().includes(search.toLowerCase()) ||
            m.city?.toLowerCase().includes(search.toLowerCase());
        const matchGen =
            filterGeneration === null || m.generation === filterGeneration;
        return matchSearch && matchGen;
    });

    // Group by generation
    const grouped = filtered.reduce((acc, m) => {
        if (!acc[m.generation]) acc[m.generation] = [];
        acc[m.generation].push(m);
        return acc;
    }, {} as Record<number, MemberData[]>);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-surface-900">
                    Daftar Anggota ({members.length})
                </h2>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="touch-target w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        placeholder="Cari nama atau kota..."
                    />
                </div>
                <select
                    value={filterGeneration === null ? "" : filterGeneration}
                    onChange={(e) =>
                        setFilterGeneration(
                            e.target.value === "" ? null : parseInt(e.target.value)
                        )
                    }
                    className="touch-target px-4 py-3 rounded-xl border border-surface-200 text-surface-700 focus:outline-none focus:border-primary-500 bg-white"
                >
                    <option value="">Semua Generasi</option>
                    {generations.map((g) => (
                        <option key={g} value={g}>
                            Generasi {g + 1}
                        </option>
                    ))}
                </select>
            </div>

            {/* Members by generation */}
            {Object.keys(grouped)
                .sort((a, b) => Number(a) - Number(b))
                .map((gen) => (
                    <div key={gen}>
                        <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">
                            Generasi {Number(gen) + 1}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {grouped[Number(gen)].map((member) => (
                                <Link
                                    key={member.id}
                                    href={`/dashboard/bani/${baniId}/members/${member.id}`}
                                    className="group p-4 rounded-xl bg-white border border-surface-200 hover:border-primary-200 hover:shadow-md transition-all flex items-center gap-3"
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${member.gender === "MALE"
                                            ? "bg-blue-50 text-blue-600"
                                            : "bg-pink-50 text-pink-600"
                                            } ${!member.isAlive ? "opacity-60" : ""}`}
                                    >
                                        {member.photo ? (
                                            <img
                                                src={member.photo}
                                                alt={member.fullName}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-surface-900 truncate">
                                                {member.fullName}
                                            </p>
                                            {!member.isAlive && (
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-surface-100 text-surface-500">
                                                    Alm.
                                                </span>
                                            )}
                                        </div>
                                        {member.nickname && (
                                            <p className="text-xs text-surface-400">{member.nickname}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                            {member.father && (
                                                <span className="text-xs text-surface-400">
                                                    Ayah: {member.father.fullName}
                                                </span>
                                            )}
                                        </div>
                                        {member.city && (
                                            <p className="text-xs text-surface-400 mt-0.5">📍 {member.city}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        {member.phoneWhatsapp && (
                                            <a
                                                href={getWhatsAppLink(member.phoneWhatsapp)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="touch-target p-2 rounded-lg hover:bg-green-50 transition-colors"
                                                title="Chat WhatsApp"
                                            >
                                                <Phone className="w-4.5 h-4.5 text-green-600" />
                                            </a>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-surface-300 group-hover:text-primary-500 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

            {filtered.length === 0 && (
                <div className="text-center py-12 rounded-xl bg-white border border-surface-200">
                    <User className="w-10 h-10 text-surface-300 mx-auto mb-3" />
                    <p className="text-surface-500">Tidak ada anggota ditemukan</p>
                </div>
            )}
        </div>
    );
}
