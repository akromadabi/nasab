"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Phone,
    User,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Network,
    List,
    Plus,
    Baby,
    Heart,
    Users,
    Loader2,
    X,
} from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import ExportTree from "@/components/ExportTree";
import MobileTreeView from "@/components/MobileTreeView";

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
    marriagesAsHusband?: { wife: SpouseInfo }[];
    marriagesAsWife?: { husband: SpouseInfo }[];
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

function buildTree(members: TreeMember[], rootId?: string): TreeNodeData | null {
    if (members.length === 0) return null;

    const memberMap = new Map<string, TreeMember>();
    members.forEach((m) => memberMap.set(m.id, m));

    // Find root (generation 0 or specified root)
    let root: TreeMember | undefined;
    if (rootId) {
        root = memberMap.get(rootId);
    }
    if (!root) {
        root = members.find((m) => m.generation === 0);
    }
    if (!root) {
        root = members.reduce((a, b) => (a.generation < b.generation ? a : b));
    }

    function buildNode(member: TreeMember): TreeNodeData {
        const children = members
            .filter((m) => m.fatherId === member.id || m.motherId === member.id)
            .filter((m, i, arr) => arr.findIndex((a) => a.id === m.id) === i) // dedupe
            .sort((a, b) => a.fullName.localeCompare(b.fullName));

        return {
            ...member,
            children: children.map((c) => buildNode(c)),
        };
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
    node: TreeMember;
    onSelect: (type: QuickAddType) => void;
    onClose: () => void;
}) {
    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose} />
            {/* Menu */}
            <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-surface-200 py-1.5 min-w-[180px] animate-fade-in">
                <button
                    onClick={() => onSelect("child")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-primary-50 hover:text-primary-700 transition-colors text-left"
                >
                    <Baby className="w-4 h-4" />
                    Tambah Anak
                </button>
                <button
                    onClick={() => onSelect("spouse")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-pink-50 hover:text-pink-700 transition-colors text-left"
                >
                    <Heart className="w-4 h-4" />
                    Tambah Pasangan
                </button>
                <button
                    onClick={() => onSelect("sibling")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                >
                    <Users className="w-4 h-4" />
                    Tambah Saudara
                </button>
            </div>
        </>
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

    // For child: select the other parent
    const [otherParentId, setOtherParentId] = useState("");

    const { type, member } = context;

    // Get spouses from marriage data
    const spouses: SpouseInfo[] = [];
    if (member.gender === "MALE" && member.marriagesAsHusband) {
        member.marriagesAsHusband.forEach((m) => spouses.push(m.wife));
    } else if (member.gender === "FEMALE" && member.marriagesAsWife) {
        member.marriagesAsWife.forEach((m) => spouses.push(m.husband));
    }

    // Auto-fill other parent if exactly 1 spouse
    const hasOneSpouse = spouses.length === 1;
    const hasMultipleSpouses = spouses.length > 1;

    useEffect(() => {
        if (type === "child" && hasOneSpouse) {
            setOtherParentId(spouses[0].id);
        }
    }, [type, hasOneSpouse]);

    // Determine labels and defaults
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

    // For spouse, default gender opposite of current member
    useEffect(() => {
        if (type === "spouse") {
            setGender(member.gender === "MALE" ? "FEMALE" : "MALE");
        }
    }, [type, member.gender]);

    // For child: determine other parent options
    // If spouses exist, only show spouses. Otherwise show all opposite-gender members.
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
            // Build member data based on type
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
            // For spouse, no parent relation needed

            // Create the member
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

            // For spouse type, also create a marriage record
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
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
                {/* Header */}
                <div className="sticky top-0 bg-white rounded-t-2xl border-b border-surface-100 p-5 flex items-start justify-between z-10">
                    <div>
                        <h2 className="text-lg font-bold text-surface-900">{title}</h2>
                        <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors text-surface-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Relation Info */}
                    {type === "child" && (
                        <div className="p-3 rounded-xl bg-primary-50 border border-primary-100">
                            <p className="text-xs font-medium text-primary-700">
                                {member.gender === "MALE" ? "👨 Ayah" : "👩 Ibu"}:{" "}
                                <span className="font-bold">{member.fullName}</span>
                            </p>
                        </div>
                    )}

                    {type === "sibling" && (member.fatherId || member.motherId) && (
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 space-y-1">
                            <p className="text-xs text-blue-600">Orang tua yang sama dengan {member.fullName}:</p>
                            {member.fatherId && (
                                <p className="text-xs font-medium text-blue-700">
                                    👨 Ayah: {allMembers.find((m) => m.id === member.fatherId)?.fullName || "—"}
                                </p>
                            )}
                            {member.motherId && (
                                <p className="text-xs font-medium text-blue-700">
                                    👩 Ibu: {allMembers.find((m) => m.id === member.motherId)?.fullName || "—"}
                                </p>
                            )}
                        </div>
                    )}

                    {type === "spouse" && (
                        <div className="p-3 rounded-xl bg-pink-50 border border-pink-100">
                            <p className="text-xs font-medium text-pink-700">
                                💑 Pasangan dari: <span className="font-bold">{member.fullName}</span>
                            </p>
                        </div>
                    )}

                    {/* Other Parent (for child type) */}
                    {type === "child" && hasOneSpouse && (
                        <div className="p-3 rounded-xl bg-primary-50 border border-primary-100">
                            <p className="text-xs font-medium text-primary-700">
                                {member.gender === "MALE" ? "👩 Ibu" : "👨 Ayah"}:{" "}
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
                                    <option key={m.id} value={m.id}>
                                        {m.fullName}
                                    </option>
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
                            className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            placeholder="Nama lengkap"
                            required
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
                            className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            placeholder="Panggilan sehari-hari"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">
                            Jenis Kelamin <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setGender("MALE")}
                                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${gender === "MALE"
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-surface-200 text-surface-500 hover:bg-surface-50"
                                    }`}
                            >
                                👨 Laki-laki
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender("FEMALE")}
                                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${gender === "FEMALE"
                                    ? "border-pink-500 bg-pink-50 text-pink-700"
                                    : "border-surface-200 text-surface-500 hover:bg-surface-50"
                                    }`}
                            >
                                👩 Perempuan
                            </button>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">
                            Status
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAlive(true)}
                                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${isAlive
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : "border-surface-200 text-surface-500 hover:bg-surface-50"
                                    }`}
                            >
                                ❤️ Hidup
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAlive(false)}
                                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${!isAlive
                                    ? "border-surface-500 bg-surface-100 text-surface-700"
                                    : "border-surface-200 text-surface-500 hover:bg-surface-50"
                                    }`}
                            >
                                🕊️ Wafat
                            </button>
                        </div>
                    </div>

                    {/* Buttons */}
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
    onQuickAdd,
}: {
    node: TreeNodeData;
    level: number;
    expanded: Set<string>;
    toggleExpand: (id: string) => void;
    selectedId: string | null;
    onSelect: (id: string) => void;
    onQuickAdd: (member: TreeMember, type: QuickAddType) => void;
}) {
    const [showMenu, setShowMenu] = useState(false);
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedId === node.id;

    const handleMenuSelect = (type: QuickAddType) => {
        setShowMenu(false);
        onQuickAdd(node, type);
    };

    return (
        <div className="flex flex-col items-center">
            {/* Node Card */}
            <div
                onClick={() => onSelect(node.id)}
                className={`tree-node relative cursor-pointer rounded-2xl border-2 p-3 w-36 sm:w-44 text-center transition-all group ${isSelected
                    ? "border-primary-500 bg-primary-50 shadow-lg shadow-primary-500/20"
                    : node.isAlive
                        ? node.gender === "MALE"
                            ? "border-blue-200 bg-white hover:border-blue-400"
                            : "border-pink-200 bg-white hover:border-pink-400"
                        : "border-surface-200 bg-surface-50 opacity-80 hover:opacity-100"
                    }`}
            >
                {/* Avatar */}
                <div
                    className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${node.gender === "MALE"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-pink-100 text-pink-600"
                        }`}
                >
                    {node.photo ? (
                        <img
                            src={node.photo}
                            alt={node.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <User className="w-6 h-6" />
                    )}
                </div>

                {/* Name */}
                <p className="text-xs sm:text-sm font-semibold text-surface-900 truncate">
                    {node.fullName}
                </p>
                {node.nickname && (
                    <p className="text-[10px] text-surface-400 truncate">({node.nickname})</p>
                )}
                {!node.isAlive && (
                    <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-surface-200 text-surface-500 mt-1">
                        Alm.
                    </span>
                )}

                {/* Spouse label */}
                {(() => {
                    const spouseNames: string[] = [];
                    if (node.gender === "MALE" && node.marriagesAsHusband) {
                        node.marriagesAsHusband.forEach((m) => spouseNames.push(m.wife.fullName));
                    } else if (node.gender === "FEMALE" && node.marriagesAsWife) {
                        node.marriagesAsWife.forEach((m) => spouseNames.push(m.husband.fullName));
                    }
                    if (spouseNames.length === 0) return null;
                    return (
                        <div className="mt-1.5 space-y-0.5">
                            {spouseNames.map((name, i) => (
                                <p key={i} className={`text-[9px] sm:text-[10px] truncate px-1.5 py-0.5 rounded-full ${node.gender === "MALE"
                                    ? "bg-pink-50 text-pink-500"
                                    : "bg-blue-50 text-blue-500"
                                    }`}>
                                    💑 {name}
                                </p>
                            ))}
                        </div>
                    );
                })()}

                {/* WhatsApp icon */}
                {node.phoneWhatsapp && node.isAlive && (
                    <a
                        href={getWhatsAppLink(node.phoneWhatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md hover:bg-green-400 transition-colors"
                    >
                        <Phone className="w-3.5 h-3.5" />
                    </a>
                )}

                {/* Quick Add button (+) */}
                <div className="absolute -top-2 -left-2 z-30">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md hover:bg-emerald-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110"
                        title="Tambah keluarga"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown menu */}
                    {showMenu && (
                        <QuickAddMenu
                            node={node}
                            onSelect={handleMenuSelect}
                            onClose={() => setShowMenu(false)}
                        />
                    )}
                </div>

                {/* Expand toggle */}
                {hasChildren && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(node.id);
                        }}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-md hover:bg-primary-400 transition-colors text-xs"
                    >
                        {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                        )}
                    </button>
                )}
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div className="flex flex-col items-center">
                    {/* Vertical line from parent down to horizontal bar */}
                    <div className="w-0.5 h-8 bg-gradient-to-b from-primary-300 to-primary-200" />

                    {/* Children row with horizontal connectors */}
                    <div className="flex">
                        {node.children.map((child, index) => (
                            <div key={child.id} className="flex flex-col items-center relative">
                                {/* Horizontal connector bar — left half + right half */}
                                {node.children.length > 1 && (
                                    <div className="flex w-full h-0.5">
                                        {/* Left half of horizontal bar */}
                                        <div className={`flex-1 h-full ${index === 0 ? "bg-transparent" : "bg-primary-200"
                                            }`} />
                                        {/* Right half of horizontal bar */}
                                        <div className={`flex-1 h-full ${index === node.children.length - 1 ? "bg-transparent" : "bg-primary-200"
                                            }`} />
                                    </div>
                                )}

                                {/* Vertical stub from horizontal bar down to child node */}
                                <div className="w-0.5 h-6 bg-primary-200" />

                                {/* Child node with padding for gap */}
                                <div className="px-2 sm:px-3">
                                    <TreeNode
                                        node={child}
                                        level={level + 1}
                                        expanded={expanded}
                                        toggleExpand={toggleExpand}
                                        selectedId={selectedId}
                                        onSelect={onSelect}
                                        onQuickAdd={onQuickAdd}
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
// Main Tree Page
// ============================================
export default function TreePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [baniId, setBaniId] = useState("");
    const [baniName, setBaniName] = useState("");
    const [members, setMembers] = useState<TreeMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [viewMode, setViewMode] = useState<"tree" | "list">(
        typeof window !== "undefined" && window.innerWidth < 768 ? "list" : "tree"
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const treeRef = useRef<HTMLDivElement>(null);

    // Quick add modal state
    const [quickAddContext, setQuickAddContext] = useState<QuickAddContext | null>(null);

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

            // Auto-expand first 2 generations
            const toExpand = new Set<string>();
            data.forEach((m: TreeMember) => {
                if (m.generation <= 1) toExpand.add(m.id);
            });
            setExpanded(toExpand);
        } catch (err) {
            console.error("Failed to fetch:", err);
        } finally {
            setLoading(false);
        }
    };

    const tree = buildTree(members);

    const toggleExpand = useCallback((id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const expandAll = () => {
        setExpanded(new Set(members.map((m) => m.id)));
    };

    const collapseAll = () => {
        setExpanded(new Set());
    };

    const selectedMember = selectedId
        ? members.find((m) => m.id === selectedId)
        : null;

    const zoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
    const zoomOut = () => setScale((s) => Math.max(s - 0.1, 0.3));
    const resetZoom = () => setScale(1);

    const handleQuickAdd = useCallback((member: TreeMember, type: QuickAddType) => {
        setQuickAddContext({ type, member });
    }, []);

    const handleQuickAddSuccess = useCallback(() => {
        setQuickAddContext(null);
        // Refresh tree
        if (baniId) {
            fetchMembers(baniId);
        }
    }, [baniId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-surface-500">Memuat pohon nasab...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/dashboard/bani/${baniId}`}
                        className="touch-target p-2 rounded-xl hover:bg-surface-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-surface-600" />
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold text-surface-900">
                        Pohon Nasab
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex rounded-lg border border-surface-200 overflow-hidden">
                        <button
                            onClick={() => setViewMode("tree")}
                            className={`p-2 transition-colors ${viewMode === "tree" ? "bg-primary-50 text-primary-600" : "text-surface-400 hover:bg-surface-50"}`}
                            title="Tampilan Pohon"
                        >
                            <Network className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary-50 text-primary-600" : "text-surface-400 hover:bg-surface-50"}`}
                            title="Tampilan Daftar"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    {viewMode === "tree" && (
                        <>
                            <button
                                onClick={zoomOut}
                                className="touch-target p-2 rounded-lg border border-surface-200 hover:bg-surface-100 transition-colors hidden sm:block"
                            >
                                <ZoomOut className="w-4 h-4 text-surface-600" />
                            </button>
                            <span className="text-sm text-surface-500 min-w-[3rem] text-center hidden sm:block">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={zoomIn}
                                className="touch-target p-2 rounded-lg border border-surface-200 hover:bg-surface-100 transition-colors hidden sm:block"
                            >
                                <ZoomIn className="w-4 h-4 text-surface-600" />
                            </button>
                            <button
                                onClick={resetZoom}
                                className="touch-target p-2 rounded-lg border border-surface-200 hover:bg-surface-100 transition-colors hidden sm:block"
                            >
                                <Maximize2 className="w-4 h-4 text-surface-600" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {viewMode === "list" ? (
                <MobileTreeView members={members} baniId={baniId} />
            ) : (
                <>
                    {/* Controls */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={expandAll}
                            className="touch-target px-4 py-2 rounded-lg text-sm font-medium border border-surface-200 hover:bg-surface-100 text-surface-600 transition-colors"
                        >
                            Buka Semua
                        </button>
                        <button
                            onClick={collapseAll}
                            className="touch-target px-4 py-2 rounded-lg text-sm font-medium border border-surface-200 hover:bg-surface-100 text-surface-600 transition-colors"
                        >
                            Tutup Semua
                        </button>
                        <div className="ml-auto">
                            <ExportTree treeContainerRef={treeRef} baniName={baniName || "Pohon-Nasab"} />
                        </div>
                    </div>

                    {/* Tree View */}
                    <div
                        ref={containerRef}
                        className="overflow-auto rounded-2xl bg-white border border-surface-200 min-h-[60vh] p-8"
                    >
                        <div ref={treeRef}
                        >
                            <div
                                style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
                                className="inline-flex justify-center w-full transition-transform duration-200"
                            >
                                {tree ? (
                                    <TreeNode
                                        node={tree}
                                        level={0}
                                        expanded={expanded}
                                        toggleExpand={toggleExpand}
                                        selectedId={selectedId}
                                        onSelect={setSelectedId}
                                        onQuickAdd={handleQuickAdd}
                                    />
                                ) : (
                                    <div className="text-center py-20">
                                        <p className="text-surface-500">Belum ada anggota di pohon ini</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Selected Member Detail */}
                    {selectedMember && (
                        <div className="rounded-2xl bg-white border border-surface-200 p-6 animate-slide-up">
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center ${selectedMember.gender === "MALE"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-pink-100 text-pink-600"
                                        }`}
                                >
                                    <User className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-surface-900">
                                        {selectedMember.fullName}
                                        {!selectedMember.isAlive && (
                                            <span className="ml-2 text-sm font-normal text-surface-400">
                                                (Almarhum/ah)
                                            </span>
                                        )}
                                    </h3>
                                    {selectedMember.nickname && (
                                        <p className="text-sm text-surface-500">{selectedMember.nickname}</p>
                                    )}
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        <span className="text-xs px-2 py-1 rounded-lg bg-surface-100 text-surface-600">
                                            Generasi {selectedMember.generation + 1}
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-1 rounded-lg ${selectedMember.gender === "MALE"
                                                ? "bg-blue-50 text-blue-700"
                                                : "bg-pink-50 text-pink-700"
                                                }`}
                                        >
                                            {selectedMember.gender === "MALE" ? "Laki-laki" : "Perempuan"}
                                        </span>
                                        {selectedMember.city && (
                                            <span className="text-xs px-2 py-1 rounded-lg bg-surface-100 text-surface-600">
                                                📍 {selectedMember.city}
                                            </span>
                                        )}
                                    </div>
                                    {selectedMember.phoneWhatsapp && (
                                        <a
                                            href={getWhatsAppLink(selectedMember.phoneWhatsapp)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-400 transition-colors"
                                        >
                                            <Phone className="w-4 h-4" />
                                            Chat WhatsApp
                                        </a>
                                    )}
                                    <Link
                                        href={`/dashboard/bani/${baniId}/members/${selectedMember.id}`}
                                        className="inline-flex items-center gap-2 mt-3 ml-2 px-4 py-2 rounded-lg border border-primary-200 text-primary-600 text-sm font-medium hover:bg-primary-50 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Lihat Detail
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Quick Add Modal */}
            {quickAddContext && (
                <QuickAddModal
                    context={quickAddContext}
                    allMembers={members}
                    baniId={baniId}
                    onClose={() => setQuickAddContext(null)}
                    onSuccess={handleQuickAddSuccess}
                />
            )}
        </div>
    );
}
