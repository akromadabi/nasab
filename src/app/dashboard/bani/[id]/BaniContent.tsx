"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    Minimize2,
    Phone,
    User,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Search,
    Plus,
    Baby,
    Heart,
    Users,
    Loader2,
    X,
    ChevronRight,
    ChevronLeft,
    TreePine,
    List,
    MapPin,
    Calendar,
    Download,
    Edit,
    Trash2,
    Settings,
    Globe,
    Lock,
    Copy,
    Check,
    ArrowDownUp,
    Smartphone,
    CalendarDays,
    Palette,
    Flower2,
} from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import ExportTree from "@/components/ExportTree";
import { TREE_THEMES, THEME_KEYS, type ThemeKey, type TreeThemeConfig } from "@/lib/treeThemes";

// ============================================
// Social Media Platforms Config
// ============================================
const SOCIAL_MEDIA_PLATFORMS = [
    { key: "instagram", label: "Instagram", placeholder: "@username", color: "text-pink-600", bg: "bg-pink-50" },
    { key: "facebook", label: "Facebook", placeholder: "Nama atau URL", color: "text-blue-600", bg: "bg-blue-50" },
    { key: "tiktok", label: "TikTok", placeholder: "@username", color: "text-surface-900", bg: "bg-surface-100" },
    { key: "twitter", label: "Twitter / X", placeholder: "@username", color: "text-sky-500", bg: "bg-sky-50" },
    { key: "youtube", label: "YouTube", placeholder: "Channel URL", color: "text-red-600", bg: "bg-red-50" },
    { key: "linkedin", label: "LinkedIn", placeholder: "URL profil", color: "text-blue-700", bg: "bg-blue-50" },
];

function getSocialMediaUrl(platform: string, value: string): string {
    const v = value.trim();
    // If already a full URL, return as-is
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    const username = v.replace(/^@/, '');
    switch (platform) {
        case 'instagram': return `https://instagram.com/${username}`;
        case 'facebook': return `https://facebook.com/${username}`;
        case 'tiktok': return `https://tiktok.com/@${username}`;
        case 'twitter': return `https://x.com/${username}`;
        case 'youtube': return `https://youtube.com/${username.startsWith('@') ? username : '@' + username}`;
        case 'linkedin': return `https://linkedin.com/in/${username}`;
        default: return '#';
    }
}

function SocialMediaIcon({ platform, className = "w-4 h-4" }: { platform: string; className?: string }) {
    switch (platform) {
        case "instagram":
            return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>;
        case "facebook":
            return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
        case "tiktok":
            return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>;
        case "twitter":
            return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
        case "youtube":
            return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
        case "linkedin":
            return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
        default:
            return <ExternalLink className={className} />;
    }
}

function SocialMediaDynamicFields({ entries, onChange, inputClass, labelClass }: {
    entries: { key: string; value: string }[];
    onChange: (entries: { key: string; value: string }[]) => void;
    inputClass: string;
    labelClass: string;
}) {
    const [showPicker, setShowPicker] = useState(false);
    const usedKeys = entries.map(e => e.key);
    const availablePlatforms = SOCIAL_MEDIA_PLATFORMS.filter(p => !usedKeys.includes(p.key));

    const addPlatform = (key: string) => {
        onChange([...entries, { key, value: "" }]);
        setShowPicker(false);
    };

    const updateValue = (index: number, value: string) => {
        const next = [...entries];
        next[index] = { ...next[index], value };
        onChange(next);
    };

    const removePlatform = (index: number) => {
        onChange(entries.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <label className={labelClass}>Sosial Media</label>

            {entries.map((entry, i) => {
                const platform = SOCIAL_MEDIA_PLATFORMS.find(p => p.key === entry.key);
                return (
                    <div key={entry.key} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${platform?.bg || 'bg-surface-100'} ${platform?.color || 'text-surface-500'} flex items-center justify-center flex-shrink-0`}>
                            <SocialMediaIcon platform={entry.key} className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={entry.value}
                            onChange={(e) => updateValue(i, e.target.value)}
                            className={`${inputClass} flex-1`}
                            placeholder={platform?.placeholder || ""}
                        />
                        <button
                            type="button"
                            onClick={() => removePlatform(i)}
                            className="w-8 h-8 rounded-lg border border-surface-200 text-surface-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors flex-shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            })}

            {availablePlatforms.length > 0 && (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowPicker(!showPicker)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-surface-300 text-xs text-surface-500 font-medium hover:border-primary-400 hover:text-primary-600 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Sosial Media
                    </button>

                    {showPicker && (
                        <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-xl border border-surface-200 shadow-xl z-20 p-1 animate-scale-in">
                            {availablePlatforms.map(p => (
                                <button
                                    type="button"
                                    key={p.key}
                                    onClick={() => addPlatform(p.key)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-50 transition-colors text-left"
                                >
                                    <div className={`w-7 h-7 rounded-md ${p.bg} ${p.color} flex items-center justify-center`}>
                                        <SocialMediaIcon platform={p.key} className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-sm text-surface-700 font-medium">{p.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================
// Types
// ============================================
interface SpouseInfo {
    id: string;
    fullName: string;
    photo: string | null;
    gender: string;
}

interface TreeMember {
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
    fatherId: string | null;
    motherId: string | null;
    city: string | null;
    birthPlace?: string | null;
    address?: string | null;
    bio?: string | null;
    socialMedia?: Record<string, string> | null;
    marriagesAsHusband?: { id: string; wife: SpouseInfo }[];
    marriagesAsWife?: { id: string; husband: SpouseInfo }[];
}

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
    birthPlace: string | null;
    address: string | null;
    bio: string | null;
    socialMedia: Record<string, string> | null;
    father: { id: string; fullName: string } | null;
    mother: { id: string; fullName: string } | null;
}

interface TreeNodeData extends TreeMember {
    children: TreeNodeData[];
    spouseName?: string;
}

type QuickAddType = "child" | "spouse" | "sibling";

interface QuickAddContext {
    type: QuickAddType;
    member: TreeMember;
}

// ============================================
// Build Tree
// ============================================
function buildTree(members: TreeMember[], rootId?: string): TreeNodeData | null {
    if (members.length === 0) return null;

    const memberMap = new Map<string, TreeMember>();
    members.forEach((m) => memberMap.set(m.id, m));

    let root: TreeMember | undefined;
    if (rootId) root = memberMap.get(rootId);
    if (!root) root = members.find((m) => m.generation === 0);
    if (!root) root = members.reduce((a, b) => (a.generation < b.generation ? a : b));

    function buildNode(member: TreeMember): TreeNodeData {
        const children = members
            .filter((m) => m.fatherId === member.id || m.motherId === member.id)
            .filter((m, i, arr) => arr.findIndex((a) => a.id === m.id) === i)
            .sort((a, b) => a.fullName.localeCompare(b.fullName));

        return { ...member, children: children.map((c) => buildNode(c)) };
    }

    return buildNode(root);
}

// ============================================
// Quick Add Menu (Dropdown)
// ============================================
function QuickAddMenu({
    node,
    onSelect,
    onClose,
}: {
    node: TreeNodeData;
    onSelect: (type: QuickAddType) => void;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b border-surface-100">
                    <p className="text-xs text-surface-400 font-medium">Tambah keluarga untuk</p>
                    <p className="text-sm font-semibold text-surface-900 truncate">{node.fullName}</p>
                </div>

                {/* Options */}
                <div className="p-2">
                    <button
                        onClick={() => onSelect("child")}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-50 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Baby className="w-4.5 h-4.5 text-primary-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-surface-800">Tambah Anak</p>
                            <p className="text-[11px] text-surface-400">Anak kandung</p>
                        </div>
                    </button>
                    <button
                        onClick={() => onSelect("spouse")}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-pink-50 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-lg bg-pink-100 flex items-center justify-center">
                            <Heart className="w-4.5 h-4.5 text-pink-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-surface-800">Tambah Pasangan</p>
                            <p className="text-[11px] text-surface-400">Suami / Istri</p>
                        </div>
                    </button>
                    <button
                        onClick={() => onSelect("sibling")}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Users className="w-4.5 h-4.5 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-surface-800">Tambah Saudara</p>
                            <p className="text-[11px] text-surface-400">Saudara kandung</p>
                        </div>
                    </button>
                </div>

                {/* Cancel */}
                <div className="px-2 pb-2">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:bg-surface-50 transition-colors"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Quick Add Modal
// ============================================
function QuickAddModal({
    context,
    allMembers,
    baniId,
    onClose,
    onSuccess,
}: {
    context: QuickAddContext;
    allMembers: TreeMember[];
    baniId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [fullName, setFullName] = useState("");
    const [nickname, setNickname] = useState("");
    const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
    const [isAlive, setIsAlive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [otherParentId, setOtherParentId] = useState("");

    const { type, member } = context;

    // Get spouses from marriage data
    const spouses: SpouseInfo[] = [];
    if (member.gender === "MALE" && member.marriagesAsHusband) {
        member.marriagesAsHusband.forEach((m) => spouses.push(m.wife));
    } else if (member.gender === "FEMALE" && member.marriagesAsWife) {
        member.marriagesAsWife.forEach((m) => spouses.push(m.husband));
    }

    const hasOneSpouse = spouses.length === 1;
    const hasMultipleSpouses = spouses.length > 1;

    useEffect(() => {
        if (type === "child" && hasOneSpouse) {
            setOtherParentId(spouses[0].id);
        }
    }, [type, hasOneSpouse]);

    const title =
        type === "child"
            ? `Tambah Anak ${member.fullName}`
            : type === "spouse"
                ? `Tambah Pasangan ${member.fullName}`
                : `Tambah Saudara ${member.fullName}`;

    const subtitle =
        type === "child"
            ? "Anggota baru akan menjadi anak dari orang ini"
            : type === "spouse"
                ? "Anggota baru akan menjadi pasangan orang ini"
                : "Anggota baru akan memiliki orang tua yang sama";

    useEffect(() => {
        if (type === "spouse") {
            setGender(member.gender === "MALE" ? "FEMALE" : "MALE");
        }
    }, [type, member.gender]);

    const otherParentOptions =
        type === "child"
            ? spouses.length > 0
                ? spouses.map((s) => ({ id: s.id, fullName: s.fullName, gender: s.gender, generation: 0 }))
                : member.gender === "MALE"
                    ? allMembers.filter((m) => m.gender === "FEMALE")
                    : allMembers.filter((m) => m.gender === "MALE")
            : [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) return;
        setLoading(true);
        setError("");

        try {
            let fatherId: string | undefined;
            let motherId: string | undefined;

            if (type === "child") {
                if (member.gender === "MALE") {
                    fatherId = member.id;
                    motherId = otherParentId || undefined;
                } else {
                    motherId = member.id;
                    fatherId = otherParentId || undefined;
                }
            } else if (type === "sibling") {
                fatherId = member.fatherId || undefined;
                motherId = member.motherId || undefined;
            }

            const res = await fetch("/api/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    baniId,
                    fullName: fullName.trim(),
                    nickname: nickname.trim() || undefined,
                    gender,
                    isAlive,
                    fatherId,
                    motherId,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Gagal menyimpan");
                return;
            }

            if (type === "spouse") {
                const husbandId = member.gender === "MALE" ? member.id : data.id;
                const wifeId = member.gender === "FEMALE" ? member.id : data.id;
                const marriageRes = await fetch("/api/marriages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ husbandId, wifeId }),
                });
                if (!marriageRes.ok) {
                    console.error("Failed to create marriage, but member was created");
                }
            }

            onSuccess();
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="sticky top-0 bg-white rounded-t-2xl border-b border-surface-100 p-5 flex items-start justify-between z-10">
                    <div>
                        <h2 className="text-lg font-bold text-surface-900">{title}</h2>
                        <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors text-surface-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
                    )}

                    {/* Relation Info */}
                    {type === "child" && (
                        <div className="p-3 rounded-xl bg-primary-50 border border-primary-100">
                            <p className="text-xs font-medium text-primary-700">
                                {member.gender === "MALE" ? "Ayah" : "Ibu"}:{" "}
                                <span className="font-bold">{member.fullName}</span>
                            </p>
                        </div>
                    )}

                    {type === "sibling" && (member.fatherId || member.motherId) && (
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 space-y-1">
                            <p className="text-xs text-blue-600">Orang tua yang sama dengan {member.fullName}:</p>
                            {member.fatherId && (
                                <p className="text-xs font-medium text-blue-700">
                                    Ayah: {allMembers.find((m) => m.id === member.fatherId)?.fullName || "—"}
                                </p>
                            )}
                            {member.motherId && (
                                <p className="text-xs font-medium text-blue-700">
                                    Ibu: {allMembers.find((m) => m.id === member.motherId)?.fullName || "—"}
                                </p>
                            )}
                        </div>
                    )}

                    {type === "spouse" && (
                        <div className="p-3 rounded-xl bg-pink-50 border border-pink-100">
                            <p className="text-xs font-medium text-pink-700">
                                <Heart className="w-3.5 h-3.5 inline" /> Pasangan dari <span className="font-bold">{member.fullName}</span>
                            </p>
                        </div>
                    )}

                    {/* Other Parent (for child type) */}
                    {type === "child" && hasOneSpouse && (
                        <div className="p-3 rounded-xl bg-primary-50 border border-primary-100">
                            <p className="text-xs font-medium text-primary-700">
                                {member.gender === "MALE" ? "Ibu" : "Ayah"}:{" "}
                                <span className="font-bold">{spouses[0].fullName}</span>
                            </p>
                        </div>
                    )}

                    {type === "child" && hasMultipleSpouses && (
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">
                                {member.gender === "MALE" ? "Ibu" : "Ayah"}
                            </label>
                            <select
                                value={otherParentId}
                                onChange={(e) => setOtherParentId(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-900 focus:outline-none focus:border-primary-500 bg-white"
                            >
                                <option value="">
                                    — Pilih {member.gender === "MALE" ? "Ibu" : "Ayah"} —
                                </option>
                                {otherParentOptions.map((m) => (
                                    <option key={m.id} value={m.id}>{m.fullName}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white"
                            placeholder="Nama lengkap"
                            autoFocus
                        />
                    </div>

                    {/* Nickname */}
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">
                            Nama Panggilan
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 bg-white"
                            placeholder="Panggilan sehari-hari"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">
                            Jenis Kelamin <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setGender("MALE")}
                                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${gender === "MALE"
                                    ? "bg-blue-50 text-blue-700 border-2 border-blue-300"
                                    : "bg-white text-surface-500 border border-surface-200 hover:bg-surface-50"
                                    }`}
                            >
                                <User className="w-3.5 h-3.5" /> Laki-laki
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender("FEMALE")}
                                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${gender === "FEMALE"
                                    ? "bg-pink-50 text-pink-700 border-2 border-pink-300"
                                    : "bg-white text-surface-500 border border-surface-200 hover:bg-surface-50"
                                    }`}
                            >
                                <User className="w-3.5 h-3.5" /> Perempuan
                            </button>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Status</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAlive(true)}
                                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isAlive
                                    ? "bg-green-50 text-green-700 border-2 border-green-300"
                                    : "bg-white text-surface-500 border border-surface-200 hover:bg-surface-50"
                                    }`}
                            >
                                <Heart className="w-3 h-3" /> Hidup
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAlive(false)}
                                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${!isAlive
                                    ? "bg-surface-100 text-surface-700 border-2 border-surface-300"
                                    : "bg-white text-surface-500 border border-surface-200 hover:bg-surface-50"
                                    }`}
                            >
                                <Flower2 className="w-3 h-3" /> Wafat
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-surface-200 text-surface-600 font-medium text-sm hover:bg-surface-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !fullName.trim()}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold text-sm hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Simpan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ============================================
// Tree Node
// ============================================
function TreeNode({
    node,
    level,
    expanded,
    toggleExpand,
    selectedId,
    onSelect,
    onShowQuickMenu,
    canEdit = true,
    orientation,
    theme,
}: {
    node: TreeNodeData;
    level: number;
    expanded: Set<string>;
    toggleExpand: (id: string) => void;
    selectedId: string | null;
    onSelect: (id: string) => void;
    onShowQuickMenu: (node: TreeNodeData) => void;
    canEdit?: boolean;
    orientation?: string;
    theme: TreeThemeConfig;
}) {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedId === node.id;
    const isHorizontal = orientation === "HORIZONTAL";

    const nodeCard = (
        <div
            onClick={() => onSelect(node.id)}
            className={`tree-node relative cursor-pointer rounded-xl sm:rounded-2xl border-2 p-2 sm:p-3 w-28 sm:w-44 text-center transition-all group ${isSelected
                ? `${theme.card.selectedBorder} ${theme.card.selectedBg} shadow-lg`
                : node.isAlive
                    ? `${theme.card.border} ${theme.card.bg} hover:opacity-90`
                    : `${theme.card.border} ${theme.card.bg} opacity-80 hover:opacity-100`
                } ${theme.card.shadow}`}
        >
            {/* Avatar */}
            <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full mx-auto mb-1 sm:mb-2 flex items-center justify-center ${node.gender === "MALE" ? `${theme.avatar.maleBg} ${theme.avatar.maleText}` : `${theme.avatar.femaleBg} ${theme.avatar.femaleText}`}`}>
                {node.photo ? (
                    <img src={node.photo} alt={node.fullName} className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover" />
                ) : (
                    <User className="w-4 h-4 sm:w-6 sm:h-6" />
                )}
            </div>

            {/* Name */}
            <p className={`text-xs sm:text-sm font-semibold ${theme.card.textPrimary} truncate`}>{node.fullName}</p>
            {node.nickname && <p className={`text-[10px] ${theme.card.textMuted} truncate`}>({node.nickname})</p>}
            {!node.isAlive && (
                <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${theme.badge.deceasedBg} ${theme.badge.deceasedText} mt-1`}>Alm.</span>
            )}

            {/* Spouse label — clickable for edit, X to remove */}
            {(() => {
                const spouseEntries: { marriageId: string; spouseId: string; name: string }[] = [];
                if (node.gender === "MALE" && node.marriagesAsHusband) {
                    node.marriagesAsHusband.forEach((m) => spouseEntries.push({ marriageId: m.id, spouseId: m.wife.id, name: m.wife.fullName }));
                } else if (node.gender === "FEMALE" && node.marriagesAsWife) {
                    node.marriagesAsWife.forEach((m) => spouseEntries.push({ marriageId: m.id, spouseId: m.husband.id, name: m.husband.fullName }));
                }
                if (spouseEntries.length === 0) return null;
                return (
                    <div className="mt-1.5 space-y-0.5">
                        {spouseEntries.map((entry) => (
                            <div key={entry.marriageId} className={`flex items-center gap-0.5 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full ${node.gender === "MALE" ? `${theme.spouse.maleBg} ${theme.spouse.maleText}` : `${theme.spouse.femaleBg} ${theme.spouse.femaleText}`}`}>
                                <span
                                    className="truncate flex-1 cursor-pointer hover:underline"
                                    onClick={(e) => { e.stopPropagation(); onSelect(entry.spouseId); }}
                                    title={`Lihat ${entry.name}`}
                                >
                                    <Heart className="w-3 h-3 inline" /> {entry.name}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            })()}

            {/* WhatsApp icon - only when selected and canEdit */}
            {isSelected && canEdit && node.phoneWhatsapp && (
                <a
                    href={getWhatsAppLink(node.phoneWhatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md hover:bg-green-400 transition-all animate-scale-in z-10"
                >
                    <Phone className="w-3 h-3" />
                </a>
            )}

            {/* Quick Add button - only when selected and canEdit */}
            {isSelected && canEdit && (
                <button
                    onClick={(e) => { e.stopPropagation(); onShowQuickMenu(node); }}
                    className="absolute -top-2 -left-2 z-30 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md hover:bg-emerald-400 transition-all hover:scale-110 animate-scale-in"
                    title="Tambah keluarga"
                >
                    <Plus className="w-3 h-3" />
                </button>
            )}

            {/* Expand toggle */}
            {hasChildren && (
                <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                    className={isHorizontal
                        ? "absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-md hover:bg-primary-400 transition-colors text-xs"
                        : "absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-md hover:bg-primary-400 transition-colors text-xs"
                    }
                >
                    {isHorizontal
                        ? (isExpanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)
                        : (isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)
                    }
                </button>
            )}
        </div>
    );

    if (isHorizontal) {
        // ===== HORIZONTAL LAYOUT (left-to-right) =====
        return (
            <div className="flex flex-row items-center">
                {nodeCard}

                {hasChildren && isExpanded && (
                    <div className="flex flex-row items-center">
                        {/* Horizontal line from parent to vertical bar */}
                        <div className={`h-0.5 w-8 bg-gradient-to-r ${theme.line.color}`} />

                        {/* Children column with vertical connectors */}
                        <div className="flex flex-col">
                            {node.children.map((child, index) => (
                                <div key={child.id} className="flex flex-row items-center relative">
                                    {/* Vertical connector bar — top half + bottom half */}
                                    {node.children.length > 1 && (
                                        <div className="flex flex-col w-0.5 self-stretch">
                                            <div className={`flex-1 w-full ${index === 0 ? "bg-transparent" : theme.line.color}`} />
                                            <div className={`flex-1 w-full ${index === node.children.length - 1 ? "bg-transparent" : theme.line.color}`} />
                                        </div>
                                    )}

                                    {/* Horizontal stub from vertical bar to child node */}
                                    <div className={`h-0.5 w-6 ${theme.line.color}`} />

                                    {/* Child node */}
                                    <div className="py-2 sm:py-3">
                                        <TreeNode
                                            node={child}
                                            level={level + 1}
                                            expanded={expanded}
                                            toggleExpand={toggleExpand}
                                            selectedId={selectedId}
                                            onSelect={onSelect}
                                            onShowQuickMenu={onShowQuickMenu}
                                            canEdit={canEdit}
                                            orientation={orientation}
                                            theme={theme}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ===== VERTICAL LAYOUT (top-to-bottom, default) =====
    return (
        <div className="flex flex-col items-center">
            {nodeCard}

            {/* Children */}
            {hasChildren && isExpanded && (
                <div className="flex flex-col items-center">
                    {/* Vertical line from parent down to horizontal bar */}
                    <div className={`w-0.5 h-8 bg-gradient-to-b ${theme.line.color}`} />

                    {/* Children row with horizontal connectors */}
                    <div className="flex">
                        {node.children.map((child, index) => (
                            <div key={child.id} className="flex flex-col items-center relative">
                                {/* Horizontal connector bar — left half + right half */}
                                {node.children.length > 1 && (
                                    <div className="flex w-full h-0.5">
                                        {/* Left half of horizontal bar */}
                                        <div className={`flex-1 h-full ${index === 0 ? "bg-transparent" : theme.line.color
                                            }`} />
                                        {/* Right half of horizontal bar */}
                                        <div className={`flex-1 h-full ${index === node.children.length - 1 ? "bg-transparent" : theme.line.color
                                            }`} />
                                    </div>
                                )}

                                {/* Vertical stub from horizontal bar down to child node */}
                                <div className={`w-0.5 h-6 ${theme.line.color}`} />

                                {/* Child node with padding for gap */}
                                <div className="px-2 sm:px-3">
                                    <TreeNode
                                        node={child}
                                        level={level + 1}
                                        expanded={expanded}
                                        toggleExpand={toggleExpand}
                                        selectedId={selectedId}
                                        onSelect={onSelect}
                                        onShowQuickMenu={onShowQuickMenu}
                                        canEdit={canEdit}
                                        orientation={orientation}
                                        theme={theme}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// Member List Tab (inline)
// ============================================
function MemberListTab({ members, baniId, onSelectMember }: { members: MemberData[]; baniId: string; onSelectMember: (member: MemberData) => void }) {
    const [search, setSearch] = useState("");
    const [filterGeneration, setFilterGeneration] = useState<number | null>(null);

    const maxGen = Math.max(...members.map((m) => m.generation), 0);
    const generations = Array.from({ length: maxGen + 1 }, (_, i) => i);

    const filtered = members.filter((m) => {
        const matchSearch =
            m.fullName.toLowerCase().includes(search.toLowerCase()) ||
            m.nickname?.toLowerCase().includes(search.toLowerCase()) ||
            m.city?.toLowerCase().includes(search.toLowerCase());
        const matchGen = filterGeneration === null || m.generation === filterGeneration;
        return matchSearch && matchGen;
    });

    const grouped = filtered.reduce((acc, m) => {
        if (!acc[m.generation]) acc[m.generation] = [];
        acc[m.generation].push(m);
        return acc;
    }, {} as Record<number, MemberData[]>);

    return (
        <div className="space-y-3">
            {/* Search & Filter - single row */}
            <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        placeholder="Cari nama..."
                    />
                </div>
                <select
                    value={filterGeneration === null ? "" : filterGeneration}
                    onChange={(e) => setFilterGeneration(e.target.value === "" ? null : parseInt(e.target.value))}
                    className="px-3 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-700 focus:outline-none focus:border-primary-500 bg-white min-w-[100px]"
                >
                    <option value="">Semua</option>
                    {generations.map((g) => (
                        <option key={g} value={g}>Gen {g + 1}</option>
                    ))}
                </select>
            </div>

            {/* Members by generation */}
            {Object.keys(grouped)
                .sort((a, b) => Number(a) - Number(b))
                .map((gen) => (
                    <div key={gen}>
                        <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                            Generasi {Number(gen) + 1}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {grouped[Number(gen)].map((member) => (
                                <button
                                    key={member.id}
                                    onClick={() => onSelectMember(member)}
                                    className="group p-3 rounded-xl bg-white border border-surface-200 hover:border-primary-200 hover:shadow-md transition-all flex items-center gap-3 text-left w-full"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${member.gender === "MALE" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"} ${!member.isAlive ? "opacity-60" : ""}`}>
                                        {member.photo ? (
                                            <img src={member.photo} alt={member.fullName} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-semibold text-surface-900 truncate">{member.fullName}</p>
                                            {!member.isAlive && (
                                                <span className="text-[10px] px-1 py-0.5 rounded bg-surface-100 text-surface-400 flex-shrink-0">Alm.</span>
                                            )}
                                        </div>
                                        {member.nickname && <p className="text-xs text-surface-400 truncate">{member.nickname}</p>}
                                        {member.city && (
                                            <p className="text-[11px] text-surface-400 mt-0.5 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {member.city}</p>
                                        )}
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-surface-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

            {filtered.length === 0 && (
                <div className="text-center py-12 rounded-xl bg-white border border-surface-200">
                    <User className="w-10 h-10 text-surface-300 mx-auto mb-3" />
                    <p className="text-surface-500 text-sm">Tidak ada anggota ditemukan</p>
                </div>
            )}
        </div>
    );
}

// ============================================
// Member Detail Popup
// ============================================
function MemberDetailPopup({ member, baniId, onClose, onEdit, onDelete }: { member: MemberData; baniId: string; onClose: () => void; onEdit: (memberId: string) => void; onDelete?: (memberId: string) => void }) {
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
        } catch { return dateStr; }
    };

    const socialMedia = member.socialMedia as Record<string, string> | null;
    const socialEntries = socialMedia ? Object.entries(socialMedia).filter(([, v]) => v) : [];
    const hasContact = member.phoneWhatsapp || socialEntries.length > 0;
    const hasAddress = member.address || member.city;
    const hasDates = member.birthDate || member.deathDate;
    const hasParents = member.father || member.mother;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 sm:items-center sm:pt-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`relative px-5 pt-5 pb-4 flex-shrink-0 ${member.gender === "MALE" ? "bg-gradient-to-br from-blue-50 to-blue-100/50" : "bg-gradient-to-br from-pink-50 to-pink-100/50"}`}>
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
                    >
                        <X className="w-4 h-4 text-surface-500" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold ${member.gender === "MALE" ? "bg-blue-200/60 text-blue-600" : "bg-pink-200/60 text-pink-600"} ${!member.isAlive ? "opacity-60" : ""}`}>
                            {member.photo ? (
                                <img src={member.photo} alt={member.fullName} className="w-16 h-16 rounded-2xl object-cover" />
                            ) : (
                                <User className="w-8 h-8" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-bold text-surface-900">{member.fullName}</h3>
                                {!member.isAlive && (
                                    <span className="px-1.5 py-0.5 rounded-lg bg-surface-200/80 text-surface-500 text-[10px] font-medium flex items-center gap-0.5"><Flower2 className="w-2.5 h-2.5" /> Almarhum/ah</span>
                                )}
                            </div>
                            {member.nickname && <p className="text-sm text-surface-500">&quot;{member.nickname}&quot;</p>}
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${member.gender === "MALE" ? "bg-blue-200/60 text-blue-700" : "bg-pink-200/60 text-pink-700"}`}>
                                    {member.gender === "MALE" ? "Laki-laki" : "Perempuan"}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-100/60 text-primary-700 font-medium">Generasi {member.generation + 1}</span>
                            </div>
                        </div>
                    </div>
                    {/* Bio */}
                    {member.bio && (
                        <p className="mt-3 text-sm text-surface-600 leading-relaxed">{member.bio}</p>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                    {/* Tanggal */}
                    {hasDates && (
                        <div className="space-y-2">
                            <h4 className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> Tanggal
                            </h4>
                            {member.birthDate && (
                                <div>
                                    <p className="text-[11px] text-surface-400">Tanggal Lahir</p>
                                    <p className="text-sm text-surface-900 font-medium">
                                        {formatDate(member.birthDate)}
                                        {member.birthPlace ? ` — ${member.birthPlace}` : ""}
                                    </p>
                                </div>
                            )}
                            {member.deathDate && (
                                <div>
                                    <p className="text-[11px] text-surface-400">Tanggal Wafat</p>
                                    <p className="text-sm text-surface-900 font-medium">{formatDate(member.deathDate)}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Kontak */}
                    <div className="space-y-2">
                        <h4 className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> Kontak
                        </h4>
                        {hasContact ? (
                            <>
                                {member.phoneWhatsapp && (
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={getWhatsAppLink(member.phoneWhatsapp)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-500"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            {member.phoneWhatsapp}
                                        </a>
                                    </div>
                                )}
                                {socialEntries.map(([key, value]) => {
                                    const platform = SOCIAL_MEDIA_PLATFORMS.find(p => p.key === key);
                                    return (
                                        <a key={key} href={getSocialMediaUrl(key, value)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                            <div className={`w-6 h-6 rounded-md ${platform?.bg || 'bg-surface-100'} ${platform?.color || 'text-surface-500'} flex items-center justify-center`}>
                                                <SocialMediaIcon platform={key} className="w-3 h-3" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-surface-400">{platform?.label || key}</p>
                                                <p className="text-sm text-surface-900">{value}</p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </>
                        ) : (
                            <p className="text-sm text-surface-400">Belum diisi</p>
                        )}
                    </div>

                    {/* Alamat */}
                    {hasAddress && (
                        <div className="space-y-2">
                            <h4 className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" /> Alamat
                            </h4>
                            {member.address && <p className="text-sm text-surface-900">{member.address}</p>}
                            {member.city && <p className="text-sm text-surface-600 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {member.city}</p>}
                        </div>
                    )}

                    {/* Relasi */}
                    {hasParents && (
                        <div className="space-y-2">
                            <h4 className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> Orang Tua
                            </h4>
                            {member.father && (
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <User className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-surface-400">Ayah</p>
                                        <p className="text-sm text-surface-900 font-medium">{member.father.fullName}</p>
                                    </div>
                                </div>
                            )}
                            {member.mother && (
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                                        <User className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-surface-400">Ibu</p>
                                        <p className="text-sm text-surface-900 font-medium">{member.mother.fullName}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer - Edit & Delete Buttons */}
                <div className="px-5 pb-4 pt-2 flex gap-2 flex-shrink-0 border-t border-surface-100">
                    {onDelete && (
                        <button
                            onClick={() => {
                                if (confirm(`Hapus anggota "${member.fullName}"? Tindakan ini tidak dapat dibatalkan.`)) {
                                    onDelete(member.id);
                                }
                            }}
                            className="px-3 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
                            title="Hapus"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    {member.phoneWhatsapp && (
                        <a
                            href={getWhatsAppLink(member.phoneWhatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-400 transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            WhatsApp
                        </a>
                    )}
                    <button
                        onClick={() => { onClose(); onEdit(member.id); }}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary-200 text-primary-600 text-sm font-medium hover:bg-primary-50 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Add Member Modal (Popup Form)
// ============================================
function AddMemberModal({
    baniId,
    existingMembers,
    onClose,
    onSuccess,
}: {
    baniId: string;
    existingMembers: TreeMember[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
    const [socialMediaEntries, setSocialMediaEntries] = useState<{ key: string; value: string }[]>([]);
    const [bio, setBio] = useState("");
    const [fatherId, setFatherId] = useState("");
    const [motherId, setMotherId] = useState("");

    const fathers = existingMembers.filter((m) => m.gender === "MALE");
    const mothers = existingMembers.filter((m) => m.gender === "FEMALE");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const socialMedia: Record<string, string> = {};
            socialMediaEntries.forEach(e => { if (e.value) socialMedia[e.key] = e.value; });

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
                setError(data.error || "Gagal menyimpan");
                return;
            }

            onSuccess();
            onClose();
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all";
    const labelClass = "block text-xs font-medium text-surface-600 mb-1";

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 sm:items-center sm:pt-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-surface-900">Tambah Anggota</h2>
                        <p className="text-xs text-surface-400">Tambahkan anggota baru ke pohon nasab</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center hover:bg-surface-200 transition-colors"
                    >
                        <X className="w-4 h-4 text-surface-500" />
                    </button>
                </div>

                {/* Scrollable Form */}
                <div className="overflow-y-auto flex-1 px-5 py-4">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                            {error}
                        </div>
                    )}

                    <form id="add-member-form" onSubmit={handleSubmit} className="space-y-4">
                        {/* Data Dasar */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Data Dasar</h3>

                            <div>
                                <label className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
                                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Nama lengkap" required />
                            </div>

                            <div>
                                <label className={labelClass}>Nama Panggilan</label>
                                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputClass} placeholder="Panggilan sehari-hari" />
                            </div>

                            <div>
                                <label className={labelClass}>Jenis Kelamin <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setGender("MALE")}
                                        className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${gender === "MALE" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-surface-200 text-surface-500"}`}>
                                        <User className="w-3.5 h-3.5" /> Laki-laki
                                    </button>
                                    <button type="button" onClick={() => setGender("FEMALE")}
                                        className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${gender === "FEMALE" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-surface-200 text-surface-500"}`}>
                                        <User className="w-3.5 h-3.5" /> Perempuan
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className={labelClass}>Tanggal Lahir</label>
                                    <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Tempat Lahir</label>
                                    <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className={inputClass} placeholder="Kota" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Status</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => { setIsAlive(true); setDeathDate(""); }}
                                        className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${isAlive ? "border-green-500 bg-green-50 text-green-700" : "border-surface-200 text-surface-500"}`}>
                                        <Heart className="w-3.5 h-3.5" /> Masih Hidup
                                    </button>
                                    <button type="button" onClick={() => setIsAlive(false)}
                                        className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${!isAlive ? "border-surface-500 bg-surface-100 text-surface-700" : "border-surface-200 text-surface-500"}`}>
                                        <Flower2 className="w-3.5 h-3.5" /> Sudah Wafat
                                    </button>
                                </div>
                            </div>

                            {!isAlive && (
                                <div>
                                    <label className={labelClass}>Tanggal Wafat</label>
                                    <input type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} className={inputClass} />
                                </div>
                            )}
                        </div>

                        {/* Relasi */}
                        <div className="space-y-3 pt-2 border-t border-surface-100">
                            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Relasi Keluarga</h3>

                            <div>
                                <label className={labelClass}>Ayah</label>
                                <select value={fatherId} onChange={(e) => setFatherId(e.target.value)} className={inputClass}>
                                    <option value="">-- Pilih Ayah --</option>
                                    {fathers.map((m) => (
                                        <option key={m.id} value={m.id}>{m.fullName} (Gen. {m.generation + 1})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Ibu</label>
                                <select value={motherId} onChange={(e) => setMotherId(e.target.value)} className={inputClass}>
                                    <option value="">-- Pilih Ibu --</option>
                                    {mothers.map((m) => (
                                        <option key={m.id} value={m.id}>{m.fullName} (Gen. {m.generation + 1})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Kontak */}
                        <div className="space-y-3 pt-2 border-t border-surface-100">
                            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Kontak & Alamat</h3>

                            <div>
                                <label className={labelClass}>No. WhatsApp</label>
                                <input type="tel" value={phoneWhatsapp} onChange={(e) => setPhoneWhatsapp(e.target.value)} className={inputClass} placeholder="08xxxxxxxxxx" />
                            </div>

                            <SocialMediaDynamicFields
                                entries={socialMediaEntries}
                                onChange={setSocialMediaEntries}
                                inputClass={inputClass}
                                labelClass={labelClass}
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className={labelClass}>Alamat</label>
                                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="Alamat" />
                                </div>
                                <div>
                                    <label className={labelClass}>Kota</label>
                                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Kota" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Bio / Catatan</label>
                                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Catatan tentang anggota ini" />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2 px-5 py-4 border-t border-surface-100 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-surface-200 text-surface-600 font-medium text-sm hover:bg-surface-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="add-member-form"
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold text-sm hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Edit Member Popup
// ============================================
function EditMemberPopup({
    memberId,
    baniId,
    allMembers,
    onClose,
    onSuccess,
}: {
    memberId: string;
    baniId: string;
    allMembers: TreeMember[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

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
    const [socialMediaEntries, setSocialMediaEntries] = useState<{ key: string; value: string }[]>([]);
    const [bio, setBio] = useState("");
    const [fatherId, setFatherId] = useState("");
    const [motherId, setMotherId] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/members/${memberId}`, {
                    credentials: 'include',
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    setError(errData.error || `Error ${res.status}`);
                    setLoading(false);
                    return;
                }
                const data = await res.json();

                setFullName(data.fullName);
                setNickname(data.nickname || "");
                setGender(data.gender);
                setBirthDate(data.birthDate ? data.birthDate.split("T")[0] : "");
                setBirthPlace(data.birthPlace || "");
                setIsAlive(data.isAlive);
                setDeathDate(data.deathDate ? data.deathDate.split("T")[0] : "");
                setAddress(data.address || "");
                setCity(data.city || "");
                setPhoneWhatsapp(data.phoneWhatsapp || "");
                // Load social media dynamically
                const sm = data.socialMedia as Record<string, string> | null;
                if (sm) {
                    setSocialMediaEntries(Object.entries(sm).filter(([, v]) => v).map(([key, value]) => ({ key, value: value as string })));
                }
                setBio(data.bio || "");
                setFatherId(data.fatherId || "");
                setMotherId(data.motherId || "");
            } catch (err) {
                console.error("Failed to fetch:", err);
                setError("Gagal memuat data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [memberId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const socialMedia: Record<string, string> = {};
            socialMediaEntries.forEach(e => { if (e.value) socialMedia[e.key] = e.value; });

            const res = await fetch(`/api/members/${memberId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
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

            onSuccess();
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus anggota ini? Tindakan ini tidak dapat dibatalkan.")) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/members/${memberId}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error);
                return;
            }
            onSuccess();
        } catch {
            setError("Gagal menghapus anggota");
        } finally {
            setDeleting(false);
        }
    };

    const fathers = allMembers.filter((m) => m.gender === "MALE" && m.id !== memberId);
    const mothers = allMembers.filter((m) => m.gender === "FEMALE" && m.id !== memberId);

    const inputClass = "w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all";
    const labelClass = "block text-xs font-medium text-surface-600 mb-1";

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 sm:items-center sm:pt-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-surface-900">Edit Anggota</h2>
                        {fullName && <p className="text-xs text-surface-400">Ubah data {fullName}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center hover:bg-surface-200 transition-colors"
                    >
                        <X className="w-4 h-4 text-surface-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                ) : (
                    <>
                        {/* Scrollable Form */}
                        <div className="overflow-y-auto flex-1 px-5 py-4">
                            {error && (
                                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
                            )}

                            <form id="edit-member-form" onSubmit={handleSubmit} className="space-y-4">
                                {/* Data Dasar */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Data Dasar</h3>

                                    <div>
                                        <label className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
                                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} required />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Nama Panggilan</label>
                                        <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputClass} />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Jenis Kelamin</label>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setGender("MALE")}
                                                className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${gender === "MALE" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-surface-200 text-surface-500"}`}>
                                                <User className="w-3.5 h-3.5" /> Laki-laki
                                            </button>
                                            <button type="button" onClick={() => setGender("FEMALE")}
                                                className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${gender === "FEMALE" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-surface-200 text-surface-500"}`}>
                                                <User className="w-3.5 h-3.5" /> Perempuan
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className={labelClass}>Tanggal Lahir</label>
                                            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Tempat Lahir</label>
                                            <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className={inputClass} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Status</label>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => { setIsAlive(true); setDeathDate(""); }}
                                                className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${isAlive ? "border-green-500 bg-green-50 text-green-700" : "border-surface-200 text-surface-500"}`}>
                                                <Heart className="w-3.5 h-3.5" /> Masih Hidup
                                            </button>
                                            <button type="button" onClick={() => setIsAlive(false)}
                                                className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${!isAlive ? "border-surface-500 bg-surface-100 text-surface-700" : "border-surface-200 text-surface-500"}`}>
                                                <Flower2 className="w-3.5 h-3.5" /> Sudah Wafat
                                            </button>
                                        </div>
                                    </div>

                                    {!isAlive && (
                                        <div>
                                            <label className={labelClass}>Tanggal Wafat</label>
                                            <input type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} className={inputClass} />
                                        </div>
                                    )}
                                </div>

                                {/* Relasi */}
                                <div className="space-y-3 pt-2 border-t border-surface-100">
                                    <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Relasi Keluarga</h3>

                                    <div>
                                        <label className={labelClass}>Ayah</label>
                                        <select value={fatherId} onChange={(e) => setFatherId(e.target.value)} className={inputClass}>
                                            <option value="">-- Pilih Ayah --</option>
                                            {fathers.map((m) => (
                                                <option key={m.id} value={m.id}>{m.fullName} (Gen. {m.generation + 1})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Ibu</label>
                                        <select value={motherId} onChange={(e) => setMotherId(e.target.value)} className={inputClass}>
                                            <option value="">-- Pilih Ibu --</option>
                                            {mothers.map((m) => (
                                                <option key={m.id} value={m.id}>{m.fullName} (Gen. {m.generation + 1})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Kontak */}
                                <div className="space-y-3 pt-2 border-t border-surface-100">
                                    <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Kontak & Alamat</h3>

                                    <div>
                                        <label className={labelClass}>No. WhatsApp</label>
                                        <input type="tel" value={phoneWhatsapp} onChange={(e) => setPhoneWhatsapp(e.target.value)} className={inputClass} placeholder="08xxxxxxxxxx" />
                                    </div>

                                    <SocialMediaDynamicFields
                                        entries={socialMediaEntries}
                                        onChange={setSocialMediaEntries}
                                        inputClass={inputClass}
                                        labelClass={labelClass}
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className={labelClass}>Alamat</label>
                                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Kota</label>
                                            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Bio / Catatan</label>
                                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex gap-2 px-5 py-4 border-t border-surface-100 flex-shrink-0">
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-3 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-surface-200 text-surface-600 font-medium text-sm hover:bg-surface-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="edit-member-form"
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold text-sm hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Simpan"
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ============================================
// Main BaniContent Component
// ============================================
export default function BaniContent({
    baniId,
    baniName,
    members,
    canEdit,
    initialOrientation = "VERTICAL",
    initialIsPublic = false,
    initialShowWa = false,
    initialShowBirth = false,
    initialShowAddress = false,
    initialShowSocmed = false,
    isFreeUser = false,
    initialCardTheme = "STANDARD",
}: {
    baniId: string;
    baniName: string;
    members: MemberData[];
    canEdit: boolean;
    initialOrientation?: string;
    initialIsPublic?: boolean;
    initialShowWa?: boolean;
    initialShowBirth?: boolean;
    initialShowAddress?: boolean;
    initialShowSocmed?: boolean;
    isFreeUser?: boolean;
    initialCardTheme?: string;
}) {
    const [activeTab, setActiveTab] = useState<"tree" | "list">("tree");

    // Tree state
    const [treeMembers, setTreeMembers] = useState<TreeMember[]>([]);
    const [loadingTree, setLoadingTree] = useState(true);

    // Compute export stats from treeMembers
    const exportStats = useMemo(() => {
        if (treeMembers.length === 0) return undefined;
        const totalMale = treeMembers.filter(m => m.gender === 'MALE').length;
        const totalFemale = treeMembers.filter(m => m.gender === 'FEMALE').length;
        const totalAlive = treeMembers.filter(m => m.isAlive).length;
        const maxGen = Math.max(...treeMembers.map(m => m.generation), 0);
        return {
            totalMembers: treeMembers.length,
            totalAlive,
            totalMale,
            totalFemale,
            totalGenerations: maxGen + 1,
        };
    }, [treeMembers]);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const treeRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Quick add
    const [quickAddContext, setQuickAddContext] = useState<QuickAddContext | null>(null);
    const [quickAddMenuNode, setQuickAddMenuNode] = useState<TreeNodeData | null>(null);
    const [detailPopupMember, setDetailPopupMember] = useState<MemberData | null>(null);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [editPopupMemberId, setEditPopupMemberId] = useState<string | null>(null);

    // Settings popup
    const [showSettings, setShowSettings] = useState(false);
    const [treeOrientation, setTreeOrientation] = useState(initialOrientation);
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [savingSettings, setSavingSettings] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showWaPublic, setShowWaPublic] = useState(initialShowWa);
    const [showBirthPublic, setShowBirthPublic] = useState(initialShowBirth);
    const [showAddressPublic, setShowAddressPublic] = useState(initialShowAddress);
    const [showSocmedPublic, setShowSocmedPublic] = useState(initialShowSocmed);
    const [cardTheme, setCardTheme] = useState<ThemeKey>((initialCardTheme || "STANDARD") as ThemeKey);
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState<"orientation" | "theme" | "visibility">("orientation");
    const [confirmDeleteName, setConfirmDeleteName] = useState("");
    const [deletingBani, setDeletingBani] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Auto-open settings from dashboard ?settings=true
    const searchParams = useSearchParams();
    useEffect(() => {
        if (searchParams.get("settings") === "true") {
            setShowSettings(true);
        }
    }, [searchParams]);
    const currentTheme = TREE_THEMES[cardTheme] || TREE_THEMES.STANDARD;

    // Fetch tree members (with marriage data)
    const fetchTreeMembers = useCallback(async () => {
        try {
            const res = await fetch(`/api/members?baniId=${baniId}`);
            const data = await res.json();
            setTreeMembers(data);

            const toExpand = new Set<string>();
            data.forEach((m: TreeMember) => {
                if (m.generation <= 1) toExpand.add(m.id);
            });
            setExpanded(toExpand);
        } catch (err) {
            console.error("Failed to fetch:", err);
        } finally {
            setLoadingTree(false);
        }
    }, [baniId]);

    useEffect(() => {
        fetchTreeMembers();
    }, [fetchTreeMembers]);

    const tree = buildTree(treeMembers);

    const toggleExpand = useCallback((id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const expandAll = () => setExpanded(new Set(treeMembers.map((m) => m.id)));
    const collapseAll = () => setExpanded(new Set());

    const selectedMember = selectedId ? treeMembers.find((m) => m.id === selectedId) : null;

    // No auto-open popup — detail shown inline below tree

    const zoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
    const zoomOut = () => setScale((s) => Math.max(s - 0.1, 0.3));
    const resetZoom = () => setScale(1);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error("Fullscreen error:", err);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFsChange);
        return () => document.removeEventListener("fullscreenchange", handleFsChange);
    }, []);

    // Pinch-to-zoom using Pointer Events API (works better on mobile)
    const scaleRef = useRef(scale);
    scaleRef.current = scale;
    const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
    const pinchStartDistRef = useRef(0);
    const pinchStartScaleRef = useRef(1);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

        if (pointersRef.current.size === 2) {
            const pts = Array.from(pointersRef.current.values());
            const dx = pts[0].x - pts[1].x;
            const dy = pts[0].y - pts[1].y;
            pinchStartDistRef.current = Math.sqrt(dx * dx + dy * dy);
            pinchStartScaleRef.current = scaleRef.current;
        }
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!pointersRef.current.has(e.pointerId)) return;
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointersRef.current.size === 2 && pinchStartDistRef.current > 0) {
            e.preventDefault();
            const pts = Array.from(pointersRef.current.values());
            const dx = pts[0].x - pts[1].x;
            const dy = pts[0].y - pts[1].y;
            const currentDist = Math.sqrt(dx * dx + dy * dy);
            const ratio = currentDist / pinchStartDistRef.current;
            const newScale = Math.min(Math.max(pinchStartScaleRef.current * ratio, 0.2), 3);
            setScale(Math.round(newScale * 100) / 100);
        }
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        pointersRef.current.delete(e.pointerId);
        if (pointersRef.current.size < 2) {
            pinchStartDistRef.current = 0;
        }
    }, []);

    const handleQuickAdd = useCallback((member: TreeMember, type: QuickAddType) => {
        setQuickAddContext({ type, member });
    }, []);

    const handleShowQuickMenu = useCallback((node: TreeNodeData) => {
        setQuickAddMenuNode(node);
    }, []);

    const handleQuickMenuSelect = useCallback((type: QuickAddType) => {
        if (quickAddMenuNode) {
            handleQuickAdd(quickAddMenuNode, type);
            setQuickAddMenuNode(null);
        }
    }, [quickAddMenuNode, handleQuickAdd]);

    const handleQuickAddSuccess = useCallback(() => {
        setQuickAddContext(null);
        fetchTreeMembers();
    }, [fetchTreeMembers]);

    const handleAddMemberSuccess = useCallback(() => {
        fetchTreeMembers();
        window.location.reload();
    }, [fetchTreeMembers]);

    // Settings handlers
    const saveSettings = useCallback(async (newOrientation: string, newIsPublic: boolean, extras?: { showWaPublic?: boolean; showBirthPublic?: boolean; showAddressPublic?: boolean; showSocmedPublic?: boolean; cardTheme?: string }) => {
        setSavingSettings(true);
        try {
            await fetch(`/api/banis/${baniId}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ treeOrientation: newOrientation, isPublic: newIsPublic, ...extras }),
            });
            setTreeOrientation(newOrientation);
            setIsPublic(newIsPublic);
            if (extras?.showWaPublic !== undefined) setShowWaPublic(extras.showWaPublic);
            if (extras?.showBirthPublic !== undefined) setShowBirthPublic(extras.showBirthPublic);
            if (extras?.showAddressPublic !== undefined) setShowAddressPublic(extras.showAddressPublic);
            if (extras?.showSocmedPublic !== undefined) setShowSocmedPublic(extras.showSocmedPublic);
            if (extras?.cardTheme !== undefined) setCardTheme(extras.cardTheme as ThemeKey);
        } catch (err) {
            console.error("Save settings error:", err);
        } finally {
            setSavingSettings(false);
            setSettingsSaved(true);
            setTimeout(() => setSettingsSaved(false), 2000);
        }
    }, [baniId]);

    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/tree/${baniId}` : '';

    const handleDeleteBani = useCallback(async () => {
        if (confirmDeleteName !== baniName) return;
        setDeletingBani(true);
        setDeleteError("");
        try {
            const res = await fetch(`/api/banis/${baniId}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                setDeleteError(data.error || "Gagal menghapus");
                return;
            }
            window.location.href = "/dashboard";
        } catch {
            setDeleteError("Terjadi kesalahan");
        } finally {
            setDeletingBani(false);
        }
    }, [baniId, baniName, confirmDeleteName]);

    const copyPublicLink = useCallback(async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(publicUrl);
            } else {
                // Fallback for non-HTTPS / mobile
                const textArea = document.createElement('textarea');
                textArea.value = publicUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                textArea.style.top = '-9999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // If all else fails, prompt user to copy manually
            window.prompt('Salin link ini:', publicUrl);
        }
    }, [publicUrl]);

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="flex rounded-xl bg-surface-100 p-1 flex-1">
                        <button
                            onClick={() => setActiveTab("tree")}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "tree"
                                ? "bg-white text-primary-700 shadow-sm"
                                : "text-surface-500 hover:text-surface-700"
                                }`}
                        >
                            <TreePine className="w-4 h-4" />
                            Pohon Nasab
                        </button>
                        <button
                            onClick={() => setActiveTab("list")}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "list"
                                ? "bg-white text-primary-700 shadow-sm"
                                : "text-surface-500 hover:text-surface-700"
                                }`}
                        >
                            <List className="w-4 h-4" />
                            Daftar ({members.length})
                        </button>
                    </div>

                    {/* Settings button */}
                    {canEdit && (
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2.5 rounded-xl bg-white border border-surface-200 shadow-sm hover:bg-surface-50 active:bg-surface-100 transition-colors"
                            title="Pengaturan"
                        >
                            <Settings className="w-4 h-4 text-surface-500" />
                        </button>
                    )}

                    {/* Tree controls - desktop only */}
                    {activeTab === "tree" && (
                        <div className="hidden sm:flex items-center gap-3 ml-auto">
                            {/* Zoom toolbar */}
                            <div className="flex items-center bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
                                <button
                                    onClick={zoomOut}
                                    className="p-2.5 hover:bg-surface-50 active:bg-surface-100 transition-colors"
                                    title="Perkecil"
                                >
                                    <ZoomOut className="w-4 h-4 text-surface-500" />
                                </button>
                                <div className="w-px h-5 bg-surface-200" />
                                <button
                                    onClick={resetZoom}
                                    className="px-3 py-2 hover:bg-surface-50 active:bg-surface-100 transition-colors"
                                    title="Reset zoom"
                                >
                                    <span className="text-xs font-semibold text-primary-600 min-w-[2.5rem] text-center block">
                                        {Math.round(scale * 100)}%
                                    </span>
                                </button>
                                <div className="w-px h-5 bg-surface-200" />
                                <button
                                    onClick={zoomIn}
                                    className="p-2.5 hover:bg-surface-50 active:bg-surface-100 transition-colors"
                                    title="Perbesar"
                                >
                                    <ZoomIn className="w-4 h-4 text-surface-500" />
                                </button>
                                <div className="w-px h-5 bg-surface-200" />
                                <button
                                    onClick={toggleFullscreen}
                                    className="p-2.5 hover:bg-surface-50 active:bg-surface-100 transition-colors"
                                    title={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
                                >
                                    {isFullscreen ? (
                                        <Minimize2 className="w-4 h-4 text-surface-500" />
                                    ) : (
                                        <Maximize2 className="w-4 h-4 text-surface-500" />
                                    )}
                                </button>
                            </div>
                            <ExportTree treeContainerRef={treeRef} baniName={baniName || "Pohon-Nasab"} stats={exportStats} isFreeUser={isFreeUser} cardTheme={cardTheme} />
                        </div>
                    )}

                    {/* Add member - desktop only */}
                    {canEdit && activeTab === "list" && (
                        <button
                            onClick={() => setShowAddMemberModal(true)}
                            className="hidden sm:inline-flex ml-auto touch-target items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-500 transition-colors shadow-md shadow-primary-600/20"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah
                        </button>
                    )}
                </div>

                {/* Add member - mobile only, below tabs */}
                {canEdit && activeTab === "list" && (
                    <button
                        onClick={() => setShowAddMemberModal(true)}
                        className="sm:hidden inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary-600 text-white font-medium text-xs hover:bg-primary-500 transition-colors shadow-md shadow-primary-600/20"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Anggota
                    </button>
                )}
            </div>

            {/* Content Area */}
            {activeTab === "tree" ? (
                <>
                    {loadingTree ? (
                        <div className="flex items-center justify-center min-h-[40vh] sm:min-h-[60vh]">
                            <div className="text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-surface-500 text-sm">Memuat pohon nasab...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Export - mobile only */}
                            <div className="sm:hidden">
                                <ExportTree treeContainerRef={treeRef} baniName={baniName || "Pohon-Nasab"} stats={exportStats} isFreeUser={isFreeUser} cardTheme={cardTheme} />
                            </div>

                            {/* Tree View */}
                            <div
                                ref={containerRef}
                                className="relative overflow-auto rounded-xl sm:rounded-2xl bg-white border border-surface-200 min-h-[40vh] sm:min-h-[60vh] p-3 sm:p-8"
                                style={{ touchAction: 'pan-x pan-y' }}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                            >
                                {/* Mobile floating controls */}
                                <div className="sm:hidden fixed bottom-20 right-3 z-30 flex flex-col gap-2">
                                    <button
                                        onClick={zoomIn}
                                        className="w-10 h-10 rounded-full bg-white border border-surface-200 shadow-lg flex items-center justify-center active:bg-surface-100 transition-colors"
                                        title="Perbesar"
                                    >
                                        <ZoomIn className="w-4 h-4 text-surface-600" />
                                    </button>
                                    <button
                                        onClick={resetZoom}
                                        className="w-10 h-10 rounded-full bg-white border border-surface-200 shadow-lg flex items-center justify-center active:bg-surface-100 transition-colors"
                                        title="Reset zoom"
                                    >
                                        <span className="text-[10px] font-bold text-primary-600">{Math.round(scale * 100)}%</span>
                                    </button>
                                    <button
                                        onClick={zoomOut}
                                        className="w-10 h-10 rounded-full bg-white border border-surface-200 shadow-lg flex items-center justify-center active:bg-surface-100 transition-colors"
                                        title="Perkecil"
                                    >
                                        <ZoomOut className="w-4 h-4 text-surface-600" />
                                    </button>
                                    <button
                                        onClick={toggleFullscreen}
                                        className="w-10 h-10 rounded-full bg-primary-600 shadow-lg shadow-primary-600/30 flex items-center justify-center active:bg-primary-500 transition-colors"
                                        title={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
                                    >
                                        {isFullscreen ? (
                                            <Minimize2 className="w-4 h-4 text-white" />
                                        ) : (
                                            <Maximize2 className="w-4 h-4 text-white" />
                                        )}
                                    </button>
                                </div>
                                <div ref={treeRef} className="min-w-fit">
                                    <div
                                        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
                                        className="flex justify-center min-w-fit"
                                    >
                                        {tree ? (
                                            <TreeNode
                                                node={tree}
                                                level={0}
                                                expanded={expanded}
                                                toggleExpand={toggleExpand}
                                                selectedId={selectedId}
                                                onSelect={setSelectedId}
                                                onShowQuickMenu={handleShowQuickMenu}
                                                canEdit={canEdit}
                                                orientation={treeOrientation}
                                                theme={currentTheme}
                                            />
                                        ) : (
                                            <div className="text-center py-20">
                                                <p className="text-surface-500">Belum ada anggota di pohon ini</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Inline Detail Bar - below tree */}
                            {selectedMember && (() => {
                                const m = selectedMember;
                                const formatDate = (d: string | null) => {
                                    if (!d) return null;
                                    try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return d; }
                                };
                                const infoParts: string[] = [];
                                if (m.birthPlace || m.birthDate) infoParts.push([m.birthPlace, formatDate(m.birthDate)].filter(Boolean).join(', '));
                                if (m.city) infoParts.push(m.city);
                                if (m.deathDate) infoParts.push('Wafat ' + formatDate(m.deathDate));

                                // Get spouses
                                const spouseEntries: { marriageId: string; spouseId: string; name: string }[] = [];
                                if (m.gender === 'MALE' && m.marriagesAsHusband) {
                                    m.marriagesAsHusband.forEach((mar) => spouseEntries.push({ marriageId: mar.id, spouseId: mar.wife.id, name: mar.wife.fullName }));
                                } else if (m.gender === 'FEMALE' && m.marriagesAsWife) {
                                    m.marriagesAsWife.forEach((mar) => spouseEntries.push({ marriageId: mar.id, spouseId: mar.husband.id, name: mar.husband.fullName }));
                                }

                                return (
                                    <div className="space-y-2 animate-scale-in">
                                        {/* Main member bar */}
                                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-surface-200 bg-white shadow-sm">
                                            {/* Avatar */}
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${m.gender === 'MALE' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                                {m.photo ? (
                                                    <img src={m.photo} alt={m.fullName} className="w-9 h-9 rounded-full object-cover" />
                                                ) : (
                                                    <User className="w-4 h-4" />
                                                )}
                                            </div>
                                            {/* Name & info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-semibold text-sm text-surface-900 truncate">{m.fullName}</span>
                                                    {m.nickname && <span className="text-xs text-surface-400 truncate">&ldquo;{m.nickname}&rdquo;</span>}
                                                    {!m.isAlive && <span className="text-[10px] bg-surface-100 text-surface-400 px-1 py-0.5 rounded">Alm{m.gender === 'FEMALE' ? 'h' : ''}.</span>}
                                                    <span className="text-[10px] text-surface-400 bg-surface-50 px-1.5 py-0.5 rounded">Gen {m.generation}</span>
                                                </div>
                                                {infoParts.length > 0 && (
                                                    <p className="text-[11px] text-surface-400 truncate mt-0.5">{infoParts.join(' · ')}</p>
                                                )}
                                            </div>
                                            {/* Actions */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {m.phoneWhatsapp && (
                                                    <a href={getWhatsAppLink(m.phoneWhatsapp)} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-400 transition-colors" title="WhatsApp">
                                                        <Phone className="w-3 h-3" />
                                                    </a>
                                                )}
                                                {/* Social Media Icons */}
                                                {(() => {
                                                    const sm = m.socialMedia as Record<string, string> | null;
                                                    if (!sm) return null;
                                                    return Object.entries(sm).filter(([, v]) => v).map(([key]) => {
                                                        const platform = SOCIAL_MEDIA_PLATFORMS.find(p => p.key === key);
                                                        if (!platform) return null;
                                                        return (
                                                            <a key={key} href={getSocialMediaUrl(key, sm[key])} target="_blank" rel="noopener noreferrer" className={`w-7 h-7 rounded-lg ${platform.bg} ${platform.color} flex items-center justify-center hover:opacity-80 transition-opacity`} title={`${platform.label}: ${sm[key]}`}>
                                                                <SocialMediaIcon platform={key} className="w-3 h-3" />
                                                            </a>
                                                        );
                                                    });
                                                })()}
                                                {canEdit && (
                                                    <>
                                                        <button onClick={() => setEditPopupMemberId(m.id)} className="w-7 h-7 rounded-lg border border-surface-200 text-surface-500 flex items-center justify-center hover:bg-surface-50 transition-colors" title="Edit">
                                                            <Edit className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm(`Hapus anggota "${m.fullName}"? Tindakan ini tidak dapat dibatalkan.`)) return;
                                                                try {
                                                                    const res = await fetch(`/api/members/${m.id}`, { method: 'DELETE' });
                                                                    if (!res.ok) {
                                                                        const data = await res.json();
                                                                        alert(data.error || 'Gagal menghapus');
                                                                        return;
                                                                    }
                                                                    setSelectedId(null);
                                                                    fetchTreeMembers();
                                                                    window.location.reload();
                                                                } catch {
                                                                    alert('Gagal menghapus anggota');
                                                                }
                                                            }}
                                                            className="w-7 h-7 rounded-lg border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => setSelectedId(null)} className="w-7 h-7 rounded-lg border border-surface-200 text-surface-400 flex items-center justify-center hover:bg-surface-50 transition-colors" title="Tutup">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Spouse section */}
                                        {spouseEntries.length > 0 && (
                                            <div className="px-3 py-2 rounded-xl border border-surface-200 bg-white shadow-sm">
                                                <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">Pasangan</p>
                                                <div className="space-y-1.5">
                                                    {spouseEntries.map((entry) => (
                                                        <div key={entry.marriageId} className="flex items-center gap-2">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${m.gender === 'MALE' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                <User className="w-3 h-3" />
                                                            </div>
                                                            <span className="text-sm text-surface-900 font-medium flex-1 truncate">{entry.name}</span>
                                                            {canEdit && (
                                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                                    <button
                                                                        onClick={() => setEditPopupMemberId(entry.spouseId)}
                                                                        className="w-6 h-6 rounded-md border border-surface-200 text-surface-500 flex items-center justify-center hover:bg-surface-50 transition-colors"
                                                                        title="Edit pasangan"
                                                                    >
                                                                        <Edit className="w-2.5 h-2.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={async () => {
                                                                            const action = confirm(
                                                                                `Pilih OK untuk menghapus anggota "${entry.name}" beserta data pernikahan.\n\nPilih Cancel lalu gunakan tombol hapus di popup edit jika hanya ingin memutus hubungan pernikahan.`
                                                                            );
                                                                            if (!action) return;
                                                                            try {
                                                                                const res = await fetch(`/api/members/${entry.spouseId}`, { method: 'DELETE' });
                                                                                if (!res.ok) {
                                                                                    const data = await res.json();
                                                                                    alert(data.error || 'Gagal menghapus');
                                                                                    return;
                                                                                }
                                                                                fetchTreeMembers();
                                                                                window.location.reload();
                                                                            } catch {
                                                                                alert('Gagal menghapus pasangan');
                                                                            }
                                                                        }}
                                                                        className="w-6 h-6 rounded-md border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors"
                                                                        title="Hapus pasangan"
                                                                    >
                                                                        <Trash2 className="w-2.5 h-2.5" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </>
            ) : (
                /* Member List Tab */
                <MemberListTab members={members} baniId={baniId} onSelectMember={setDetailPopupMember} />
            )}

            {/* Quick Add Menu (top-level, outside transform) */}
            {quickAddMenuNode && (
                <QuickAddMenu
                    node={quickAddMenuNode}
                    onSelect={handleQuickMenuSelect}
                    onClose={() => setQuickAddMenuNode(null)}
                />
            )}

            {/* Quick Add Modal */}
            {quickAddContext && (
                <QuickAddModal
                    context={quickAddContext}
                    allMembers={treeMembers}
                    baniId={baniId}
                    onClose={() => setQuickAddContext(null)}
                    onSuccess={handleQuickAddSuccess}
                />
            )}

            {/* Member Detail Popup */}
            {detailPopupMember && (
                <MemberDetailPopup
                    member={detailPopupMember}
                    baniId={baniId}
                    onClose={() => setDetailPopupMember(null)}
                    onEdit={(id) => setEditPopupMemberId(id)}
                    onDelete={canEdit ? async (id) => {
                        try {
                            const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
                            if (!res.ok) {
                                const data = await res.json();
                                alert(data.error || 'Gagal menghapus');
                                return;
                            }
                            setDetailPopupMember(null);
                            fetchTreeMembers();
                            window.location.reload();
                        } catch {
                            alert('Gagal menghapus anggota');
                        }
                    } : undefined}
                />
            )}

            {/* Edit Member Popup */}
            {editPopupMemberId && (
                <EditMemberPopup
                    memberId={editPopupMemberId}
                    baniId={baniId}
                    allMembers={treeMembers}
                    onClose={() => setEditPopupMemberId(null)}
                    onSuccess={() => {
                        setEditPopupMemberId(null);
                        fetchTreeMembers();
                        window.location.reload();
                    }}
                />
            )}

            {/* Add Member Modal */}
            {showAddMemberModal && (
                <AddMemberModal
                    baniId={baniId}
                    existingMembers={treeMembers}
                    onClose={() => setShowAddMemberModal(false)}
                    onSuccess={handleAddMemberSuccess}
                />
            )}


            {/* Settings Popup */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in max-h-[85vh] flex flex-col">
                        <div className="px-5 py-3.5 border-b border-surface-100 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-base font-bold text-surface-900 flex items-center gap-2">
                                <Settings className="w-4.5 h-4.5 text-primary-600" /> Pengaturan
                            </h2>
                            <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors">
                                <X className="w-4.5 h-4.5 text-surface-400" />
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="px-3 pt-3 flex gap-1 flex-shrink-0 bg-surface-50 mx-3 mt-3 rounded-xl p-1">
                            {([
                                { key: "orientation" as const, label: "Orientasi", icon: <ArrowDownUp className="w-3.5 h-3.5" /> },
                                { key: "theme" as const, label: "Tema", icon: <Palette className="w-3.5 h-3.5" /> },
                                { key: "visibility" as const, label: "Visibilitas", icon: isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" /> },
                            ]).map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveSettingsTab(tab.key)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${activeSettingsTab === tab.key
                                        ? "bg-white text-primary-700 shadow-sm border border-surface-200"
                                        : "text-surface-500 hover:text-surface-700"
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="overflow-y-auto flex-1 px-5 py-4 min-h-[180px]">
                            {/* === Tab: Orientasi === */}
                            {activeSettingsTab === "orientation" && (
                                <div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => saveSettings("VERTICAL", isPublic)}
                                            disabled={savingSettings}
                                            className={`p-2.5 rounded-xl border-2 transition-all text-center ${treeOrientation === "VERTICAL"
                                                ? "border-primary-500 bg-primary-50"
                                                : "border-surface-200 hover:border-surface-300"
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-1.5">
                                                <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
                                                    <circle cx="16" cy="4" r="3" className={treeOrientation === "VERTICAL" ? "fill-primary-500" : "fill-surface-300"} />
                                                    <line x1="16" y1="7" x2="16" y2="16" className={treeOrientation === "VERTICAL" ? "stroke-primary-400" : "stroke-surface-300"} strokeWidth="2" />
                                                    <line x1="8" y1="16" x2="24" y2="16" className={treeOrientation === "VERTICAL" ? "stroke-primary-400" : "stroke-surface-300"} strokeWidth="2" />
                                                    <circle cx="8" cy="25" r="3" className={treeOrientation === "VERTICAL" ? "fill-primary-400" : "fill-surface-300"} />
                                                    <circle cx="24" cy="25" r="3" className={treeOrientation === "VERTICAL" ? "fill-primary-400" : "fill-surface-300"} />
                                                </svg>
                                                <span className={`text-[11px] font-medium ${treeOrientation === "VERTICAL" ? "text-primary-700" : "text-surface-500"}`}>Vertikal</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => saveSettings("HORIZONTAL", isPublic)}
                                            disabled={savingSettings}
                                            className={`p-2.5 rounded-xl border-2 transition-all text-center ${treeOrientation === "HORIZONTAL"
                                                ? "border-primary-500 bg-primary-50"
                                                : "border-surface-200 hover:border-surface-300"
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-1.5">
                                                <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
                                                    <circle cx="4" cy="16" r="3" className={treeOrientation === "HORIZONTAL" ? "fill-primary-500" : "fill-surface-300"} />
                                                    <line x1="7" y1="16" x2="16" y2="16" className={treeOrientation === "HORIZONTAL" ? "stroke-primary-400" : "stroke-surface-300"} strokeWidth="2" />
                                                    <line x1="16" y1="8" x2="16" y2="24" className={treeOrientation === "HORIZONTAL" ? "stroke-primary-400" : "stroke-surface-300"} strokeWidth="2" />
                                                    <circle cx="25" cy="8" r="3" className={treeOrientation === "HORIZONTAL" ? "fill-primary-400" : "fill-surface-300"} />
                                                    <circle cx="25" cy="24" r="3" className={treeOrientation === "HORIZONTAL" ? "fill-primary-400" : "fill-surface-300"} />
                                                </svg>
                                                <span className={`text-[11px] font-medium ${treeOrientation === "HORIZONTAL" ? "text-primary-700" : "text-surface-500"}`}>Horizontal</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* === Tab: Tema Card === */}
                            {activeSettingsTab === "theme" && (
                                <div className="grid grid-cols-3 gap-2">
                                    {THEME_KEYS.map((key) => {
                                        const t = TREE_THEMES[key];
                                        const isActive = cardTheme === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => saveSettings(treeOrientation, isPublic, { cardTheme: key })}
                                                disabled={savingSettings}
                                                className={`p-2 rounded-xl border-2 transition-all text-center ${isActive
                                                    ? "border-primary-500 bg-primary-50"
                                                    : "border-surface-200 hover:border-surface-300"
                                                    }`}
                                            >
                                                <div className="flex justify-center gap-0.5 mb-1">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.preview.accent }} />
                                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.preview.bg, border: `1px solid ${t.preview.accent}` }} />
                                                </div>
                                                <p className={`text-[10px] font-medium truncate ${isActive ? "text-primary-700" : "text-surface-600"}`}>{t.name}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* === Tab: Visibilitas === */}
                            {activeSettingsTab === "visibility" && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => saveSettings(treeOrientation, false)}
                                            disabled={savingSettings}
                                            className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${!isPublic
                                                ? "border-primary-500 bg-primary-50"
                                                : "border-surface-200 hover:border-surface-300"
                                                }`}
                                        >
                                            <Lock className={`w-4 h-4 ${!isPublic ? "text-primary-600" : "text-surface-300"}`} />
                                            <span className={`text-xs font-medium ${!isPublic ? "text-primary-700" : "text-surface-500"}`}>Privat</span>
                                        </button>
                                        <button
                                            onClick={() => saveSettings(treeOrientation, true)}
                                            disabled={savingSettings}
                                            className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${isPublic
                                                ? "border-green-500 bg-green-50"
                                                : "border-surface-200 hover:border-surface-300"
                                                }`}
                                        >
                                            <Globe className={`w-4 h-4 ${isPublic ? "text-green-600" : "text-surface-300"}`} />
                                            <span className={`text-xs font-medium ${isPublic ? "text-green-700" : "text-surface-500"}`}>Publik</span>
                                        </button>
                                    </div>

                                    {/* Public link */}
                                    {isPublic && (
                                        <div className="p-2.5 rounded-lg bg-green-50 border border-green-200">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={publicUrl}
                                                    className="flex-1 px-2 py-1 rounded-lg bg-white border border-green-200 text-[11px] text-surface-700 truncate"
                                                />
                                                <button
                                                    onClick={copyPublicLink}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 text-white text-[11px] font-medium hover:bg-green-500 transition-colors flex-shrink-0"
                                                >
                                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                    {copied ? "OK!" : "Salin"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Public data toggles */}
                                    {isPublic && (
                                        <div className="space-y-1.5 pt-1">
                                            <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Data Publik</p>
                                            {[
                                                { key: 'showWaPublic', label: 'WhatsApp', value: showWaPublic, icon: <Smartphone className="w-3.5 h-3.5 text-green-500" /> },
                                                { key: 'showBirthPublic', label: 'Tanggal Lahir', value: showBirthPublic, icon: <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> },
                                                { key: 'showAddressPublic', label: 'Alamat', value: showAddressPublic, icon: <MapPin className="w-3.5 h-3.5 text-red-500" /> },
                                                { key: 'showSocmedPublic', label: 'Sosial Media', value: showSocmedPublic, icon: <Globe className="w-3.5 h-3.5 text-purple-500" /> },
                                            ].map(item => (
                                                <button
                                                    key={item.key}
                                                    onClick={() => saveSettings(treeOrientation, true, { [item.key]: !item.value })}
                                                    disabled={savingSettings}
                                                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-50 transition-all"
                                                >
                                                    <span className="flex items-center gap-2 text-xs text-surface-700">
                                                        {item.icon}
                                                        <span className="font-medium">{item.label}</span>
                                                    </span>
                                                    <div className={`w-8 h-4.5 rounded-full transition-colors relative ${item.value ? 'bg-green-500' : 'bg-surface-300'}`}>
                                                        <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${item.value ? 'translate-x-[14px]' : 'translate-x-0.5'}`} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Danger Zone: Hapus Bani - always at bottom */}
                        {canEdit && (
                            <div className="px-5 py-3 border-t border-surface-100 flex-shrink-0">
                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-200"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Hapus Bani
                                    </button>
                                ) : (
                                    <div className="space-y-2.5">
                                        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
                                            <p className="text-[11px] text-red-700 font-medium">
                                                Semua data anggota, pernikahan, dan log aktivitas akan dihapus permanen.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-surface-500 mb-1">
                                                Ketik <span className="font-bold text-surface-700">{baniName}</span> untuk konfirmasi:
                                            </p>
                                            <input
                                                type="text"
                                                value={confirmDeleteName}
                                                onChange={(e) => setConfirmDeleteName(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-red-200 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                                placeholder={baniName}
                                            />
                                        </div>
                                        {deleteError && (
                                            <p className="text-xs text-red-600">{deleteError}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setShowDeleteConfirm(false); setConfirmDeleteName(""); setDeleteError(""); }}
                                                className="flex-1 py-2 rounded-xl border border-surface-200 text-xs font-medium text-surface-600 hover:bg-surface-50 transition-colors"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                onClick={handleDeleteBani}
                                                disabled={confirmDeleteName !== baniName || deletingBani}
                                                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                            >
                                                {deletingBani ? (
                                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Menghapus...</>
                                                ) : (
                                                    <><Trash2 className="w-3.5 h-3.5" /> Hapus</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Saving / Saved indicator */}
                        {(savingSettings || settingsSaved) && (
                            <div className="px-5 py-2 border-t border-surface-100 flex-shrink-0">
                                {savingSettings ? (
                                    <p className="text-xs text-primary-500 text-center animate-pulse">Menyimpan...</p>
                                ) : (
                                    <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Tersimpan
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

