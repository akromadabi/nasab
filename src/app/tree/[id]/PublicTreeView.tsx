"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";

interface TreeMember {
    id: string;
    fullName: string;
    nickname: string | null;
    gender: "MALE" | "FEMALE";
    photo: string | null;
    isAlive: boolean;
    generation: number;
    fatherId: string | null;
    motherId: string | null;
    marriagesAsHusband: { wife: { id: string; fullName: string; photo: string | null; gender: string } }[];
    marriagesAsWife: { husband: { id: string; fullName: string; photo: string | null; gender: string } }[];
}

interface TreeNodeData {
    id: string;
    fullName: string;
    nickname: string | null;
    gender: string;
    photo: string | null;
    isAlive: boolean;
    generation: number;
    fatherId: string | null;
    motherId: string | null;
    spouses: { id: string; fullName: string; photo: string | null; gender: string }[];
    children: TreeNodeData[];
}

function buildTree(members: TreeMember[]): TreeNodeData | null {
    if (members.length === 0) return null;

    const memberMap = new Map<string, TreeMember>();
    members.forEach(m => memberMap.set(m.id, m));

    let root = members.find(m => m.generation === 0);
    if (!root) root = members.reduce((a, b) => (a.generation < b.generation ? a : b));

    function buildNode(member: TreeMember): TreeNodeData {
        const spouses: { id: string; fullName: string; photo: string | null; gender: string }[] = [];
        if (member.marriagesAsHusband) {
            member.marriagesAsHusband.forEach(m => spouses.push(m.wife));
        }
        if (member.marriagesAsWife) {
            member.marriagesAsWife.forEach(m => spouses.push(m.husband));
        }

        const children = members
            .filter(m => m.fatherId === member.id || m.motherId === member.id)
            .filter((m, i, arr) => arr.findIndex(a => a.id === m.id) === i)
            .sort((a, b) => a.fullName.localeCompare(b.fullName))
            .map(c => buildNode(c));

        return {
            id: member.id,
            fullName: member.fullName,
            nickname: member.nickname,
            gender: member.gender,
            photo: member.photo,
            isAlive: member.isAlive,
            generation: member.generation,
            fatherId: member.fatherId,
            motherId: member.motherId,
            spouses,
            children,
        };
    }

    return buildNode(root);
}

function TreeNode({ node, expanded, onToggle }: {
    node: TreeNodeData;
    expanded: Set<string>;
    onToggle: (id: string) => void;
}) {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const isMale = node.gender === "MALE";

    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
                {/* Main person */}
                <button
                    onClick={() => hasChildren && onToggle(node.id)}
                    className={`flex flex-col items-center px-3 py-2 rounded-xl border-2 transition-all min-w-[100px] ${isMale
                            ? "border-blue-200 bg-blue-50 hover:border-blue-300"
                            : "border-pink-200 bg-pink-50 hover:border-pink-300"
                        } ${!node.isAlive ? "opacity-60" : ""}`}
                >
                    {node.photo ? (
                        <img src={node.photo} alt="" className="w-8 h-8 rounded-full object-cover mb-1" />
                    ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1 ${isMale ? "bg-blue-400" : "bg-pink-400"}`}>
                            {node.fullName[0]}
                        </div>
                    )}
                    <span className="text-[11px] font-medium text-surface-800 text-center leading-tight max-w-[90px] truncate">
                        {node.fullName}
                    </span>
                    {hasChildren && (
                        <span className="text-[9px] text-surface-400 mt-0.5">
                            {isExpanded ? "▲" : `▼ ${node.children.length}`}
                        </span>
                    )}
                </button>

                {/* Spouses */}
                {node.spouses.map(spouse => (
                    <div key={spouse.id} className="flex items-center gap-1">
                        <span className="text-surface-300 text-xs">♥</span>
                        <div className={`flex flex-col items-center px-3 py-2 rounded-xl border-2 min-w-[100px] ${spouse.gender === "MALE"
                                ? "border-blue-200 bg-blue-50"
                                : "border-pink-200 bg-pink-50"
                            }`}>
                            {spouse.photo ? (
                                <img src={spouse.photo} alt="" className="w-8 h-8 rounded-full object-cover mb-1" />
                            ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1 ${spouse.gender === "MALE" ? "bg-blue-400" : "bg-pink-400"}`}>
                                    {spouse.fullName[0]}
                                </div>
                            )}
                            <span className="text-[11px] font-medium text-surface-800 text-center leading-tight max-w-[90px] truncate">
                                {spouse.fullName}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div className="mt-3 pt-3 border-t-2 border-surface-200">
                    <div className="flex gap-4 flex-wrap justify-center">
                        {node.children.map(child => (
                            <TreeNode key={child.id} node={child} expanded={expanded} onToggle={onToggle} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PublicTreeView({ members, orientation }: {
    members: TreeMember[];
    orientation: string;
}) {
    const [scale, setScale] = useState(0.8);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const tree = buildTree(members);

    useEffect(() => {
        const toExpand = new Set<string>();
        members.forEach(m => { if (m.generation <= 1) toExpand.add(m.id); });
        setExpanded(toExpand);
    }, [members]);

    const toggleExpand = useCallback((id: string) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    return (
        <div ref={containerRef} className={`relative ${isFullscreen ? "bg-white" : ""}`}>
            {/* Controls */}
            <div className="sticky top-0 z-10 flex items-center justify-end gap-2 p-3">
                <div className="flex items-center bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
                    <button onClick={() => setScale(s => Math.max(s - 0.1, 0.3))} className="p-2 hover:bg-surface-50">
                        <ZoomOut className="w-4 h-4 text-surface-500" />
                    </button>
                    <span className="px-2 text-xs font-semibold text-primary-600">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(s + 0.1, 2))} className="p-2 hover:bg-surface-50">
                        <ZoomIn className="w-4 h-4 text-surface-500" />
                    </button>
                </div>
                <button onClick={toggleFullscreen} className="p-2 bg-white rounded-xl border border-surface-200 shadow-sm hover:bg-surface-50">
                    {isFullscreen ? <Minimize2 className="w-4 h-4 text-surface-500" /> : <Maximize2 className="w-4 h-4 text-surface-500" />}
                </button>
            </div>

            {/* Tree */}
            <div className="overflow-auto p-8" style={{ minHeight: isFullscreen ? "100vh" : "70vh" }}>
                <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
                    {tree ? (
                        <TreeNode node={tree} expanded={expanded} onToggle={toggleExpand} />
                    ) : (
                        <p className="text-center text-surface-400 py-20">Belum ada data pohon nasab</p>
                    )}
                </div>
            </div>
        </div>
    );
}
