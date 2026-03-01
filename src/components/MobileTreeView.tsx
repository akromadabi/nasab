"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    User,
    Phone,
    ChevronRight,
    ChevronLeft,
    Layers,
    MapPin,
} from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";

interface TreeMember {
    id: string;
    fullName: string;
    nickname: string | null;
    gender: "MALE" | "FEMALE";
    birthDate: string | null;
    isAlive: boolean;
    photo: string | null;
    phoneWhatsapp: string | null;
    generation: number;
    fatherId: string | null;
    motherId: string | null;
    city: string | null;
}

export default function MobileTreeView({
    members,
    baniId,
}: {
    members: TreeMember[];
    baniId: string;
}) {
    const [currentGen, setCurrentGen] = useState(0);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

    const maxGen = useMemo(
        () => Math.max(...members.map((m) => m.generation), 0),
        [members]
    );

    const generations = Array.from({ length: maxGen + 1 }, (_, i) => i);

    // Get members for current generation, optionally filtered by parent
    const currentMembers = useMemo(() => {
        let filtered = members.filter((m) => m.generation === currentGen);
        if (selectedParentId && currentGen > 0) {
            filtered = filtered.filter(
                (m) => m.fatherId === selectedParentId || m.motherId === selectedParentId
            );
        }
        return filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }, [members, currentGen, selectedParentId]);

    // Get parent name for breadcrumb
    const parentName = selectedParentId
        ? members.find((m) => m.id === selectedParentId)?.fullName
        : null;

    const navigateToChildren = (memberId: string) => {
        if (currentGen < maxGen) {
            const children = members.filter(
                (m) => m.generation === currentGen + 1 && (m.fatherId === memberId || m.motherId === memberId)
            );
            if (children.length > 0) {
                setSelectedParentId(memberId);
                setCurrentGen(currentGen + 1);
            }
        }
    };

    const goBack = () => {
        if (selectedParentId && currentGen > 0) {
            const parent = members.find((m) => m.id === selectedParentId);
            if (parent) {
                setCurrentGen(currentGen - 1);
                // Set parent's parent as the new filter
                setSelectedParentId(parent.fatherId || parent.motherId || null);
            }
        } else {
            setCurrentGen(Math.max(0, currentGen - 1));
            setSelectedParentId(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Generation Navigator */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {generations.map((gen) => (
                    <button
                        key={gen}
                        onClick={() => {
                            setCurrentGen(gen);
                            setSelectedParentId(null);
                        }}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${currentGen === gen
                            ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                            : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"
                            }`}
                    >
                        Gen {gen + 1}
                    </button>
                ))}
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Layers className="w-4 h-4 text-surface-400" />
                <span className="text-surface-500">Generasi {currentGen + 1}</span>
                {parentName && (
                    <>
                        <ChevronRight className="w-3 h-3 text-surface-300" />
                        <span className="text-primary-600 font-medium">{parentName}</span>
                    </>
                )}
                {(selectedParentId || currentGen > 0) && (
                    <button
                        onClick={goBack}
                        className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-surface-600 bg-surface-100 hover:bg-surface-200 transition-colors"
                    >
                        <ChevronLeft className="w-3 h-3" />
                        Kembali
                    </button>
                )}
            </div>

            {/* Member Cards */}
            <div className="space-y-3">
                {currentMembers.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl bg-white border border-surface-200">
                        <User className="w-10 h-10 text-surface-300 mx-auto mb-3" />
                        <p className="text-surface-500 text-sm">
                            Tidak ada anggota di generasi ini
                        </p>
                    </div>
                ) : (
                    currentMembers.map((member) => {
                        const childCount = members.filter(
                            (m) =>
                                m.generation === currentGen + 1 &&
                                (m.fatherId === member.id || m.motherId === member.id)
                        ).length;

                        return (
                            <div
                                key={member.id}
                                className="rounded-2xl bg-white border border-surface-200 overflow-hidden hover:shadow-md transition-all"
                            >
                                <div className="p-4 flex items-center gap-3">
                                    {/* Avatar */}
                                    <div
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${member.gender === "MALE"
                                            ? "bg-blue-50 text-blue-600"
                                            : "bg-pink-50 text-pink-600"
                                            } ${!member.isAlive ? "opacity-60" : ""}`}
                                    >
                                        {member.photo ? (
                                            <img
                                                src={member.photo}
                                                alt={member.fullName}
                                                className="w-14 h-14 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <User className="w-7 h-7" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-surface-900 truncate">
                                                {member.fullName}
                                            </p>
                                            {!member.isAlive && (
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-surface-100 text-surface-500 flex-shrink-0">
                                                    Alm.
                                                </span>
                                            )}
                                        </div>
                                        {member.nickname && (
                                            <p className="text-xs text-surface-400">{member.nickname}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-1">
                                            {member.city && (
                                                <span className="text-xs text-surface-400 flex items-center gap-0.5">
                                                    <MapPin className="w-3 h-3" /> {member.city}
                                                </span>
                                            )}
                                            {childCount > 0 && (
                                                <span className="text-xs text-primary-600 font-medium">
                                                    {childCount} anak
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {member.phoneWhatsapp && (
                                            <a
                                                href={getWhatsAppLink(member.phoneWhatsapp)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="touch-target p-2 rounded-lg hover:bg-green-50 transition-colors"
                                            >
                                                <Phone className="w-5 h-5 text-green-600" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom actions */}
                                <div className="flex border-t border-surface-100">
                                    <Link
                                        href={`/dashboard/bani/${baniId}/members/${member.id}`}
                                        className="flex-1 py-3 text-center text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                                    >
                                        Detail
                                    </Link>
                                    {childCount > 0 && (
                                        <button
                                            onClick={() => navigateToChildren(member.id)}
                                            className="flex-1 py-3 text-center text-xs font-medium text-gold-600 hover:bg-gold-50 transition-colors border-l border-surface-100 flex items-center justify-center gap-1"
                                        >
                                            Lihat Anak
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Stats */}
            <div className="text-center text-xs text-surface-400 pt-2">
                {currentMembers.length} anggota di generasi {currentGen + 1}
                {parentName ? ` (keturunan ${parentName})` : ""}
            </div>
        </div>
    );
}
