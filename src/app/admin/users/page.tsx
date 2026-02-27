"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users,
    Search,
    CheckCircle2,
    XCircle,
    Shield,
    Clock,
    Ban,
    Loader2,
    UserCheck,
    Plus,
    X,
    Settings,
    Crown,
    Eye,
    EyeOff,
    Trash2,
    Pencil,
    FileText,
    Image as ImageIcon,
    TreePine,
    Star,
} from "lucide-react";

// Types
interface TierData {
    id: string;
    name: string;
    color: string;
    maxBanis: number;
    maxGenerations: number;
    canGeneratePdf: boolean;
    canGenerateImage: boolean;
    isDefault: boolean;
    _count?: { users: number };
}

interface UserData {
    id: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "USER";
    status: "PENDING" | "APPROVED" | "SUSPENDED";
    tierId: string | null;
    tier: { id: string; name: string; color: string; maxBanis: number; maxGenerations: number; canGeneratePdf: boolean; canGenerateImage: boolean } | null;
    createdAt: string;
    _count: { baniUsers: number; createdBanis: number };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: "Menunggu", color: "bg-gold-50 text-gold-700 border-gold-200", icon: Clock },
    APPROVED: { label: "Aktif", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
    SUSPENDED: { label: "Ditangguhkan", color: "bg-red-50 text-red-700 border-red-200", icon: Ban },
};

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    USER: "Pengguna",
};

// ============================================
// TIER MANAGEMENT POPUP
// ============================================
function TierManagementPopup({
    tiers,
    onClose,
    onSaved,
}: {
    tiers: TierData[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const [editingTier, setEditingTier] = useState<TierData | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [name, setName] = useState("");
    const [color, setColor] = useState("#6B7280");
    const [maxBanis, setMaxBanis] = useState(1);
    const [maxGenerations, setMaxGenerations] = useState(10);
    const [canGeneratePdf, setCanGeneratePdf] = useState(false);
    const [canGenerateImage, setCanGenerateImage] = useState(false);
    const [isDefault, setIsDefault] = useState(false);

    const resetForm = () => {
        setName("");
        setColor("#6B7280");
        setMaxBanis(1);
        setMaxGenerations(10);
        setCanGeneratePdf(false);
        setCanGenerateImage(false);
        setIsDefault(false);
        setEditingTier(null);
        setError("");
    };

    const openEdit = (tier: TierData) => {
        setEditingTier(tier);
        setName(tier.name);
        setColor(tier.color);
        setMaxBanis(tier.maxBanis);
        setMaxGenerations(tier.maxGenerations);
        setCanGeneratePdf(tier.canGeneratePdf);
        setCanGenerateImage(tier.canGenerateImage);
        setIsDefault(tier.isDefault);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!name.trim()) { setError("Nama kelas wajib diisi"); return; }
        setSaving(true);
        setError("");

        try {
            const body = { name, color, maxBanis, maxGenerations, canGeneratePdf, canGenerateImage, isDefault };
            const res = editingTier
                ? await fetch("/api/admin/tiers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingTier.id, ...body }) })
                : await fetch("/api/admin/tiers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Gagal menyimpan");
            }
            resetForm();
            setShowForm(false);
            onSaved();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus kelas ini? Pengguna yang menggunakan kelas ini akan menjadi tanpa kelas.")) return;
        try {
            await fetch(`/api/admin/tiers?id=${id}`, { method: "DELETE" });
            onSaved();
        } catch { }
    };

    const presetColors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280", "#F97316"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-scale-in">
                <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary-600" /> Kelola Kelas
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors">
                        <X className="w-5 h-5 text-surface-400" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(85vh-72px)] space-y-4">
                    {/* Tier List */}
                    {tiers.length > 0 && !showForm && (
                        <div className="space-y-2">
                            {tiers.map(tier => (
                                <div key={tier.id} className="flex items-center justify-between p-3 rounded-xl border border-surface-200 hover:bg-surface-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: tier.color + "20", color: tier.color }}>
                                            <Crown className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-surface-900">{tier.name}</p>
                                                {tier.isDefault && <span className="text-[10px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded font-medium">Default</span>}
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-surface-400 mt-0.5">
                                                <span>{tier.maxBanis} bani max</span>
                                                <span>·</span>
                                                <span>{tier.maxGenerations} gen max</span>
                                                {tier.canGeneratePdf && <span className="flex items-center gap-0.5"><FileText className="w-3 h-3" /> PDF</span>}
                                                {tier.canGenerateImage && <span className="flex items-center gap-0.5"><ImageIcon className="w-3 h-3" /> Image</span>}
                                                <span>{tier._count?.users || 0} user</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEdit(tier)} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors">
                                            <Pencil className="w-3.5 h-3.5 text-surface-400" />
                                        </button>
                                        <button onClick={() => handleDelete(tier.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Form */}
                    {showForm ? (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-surface-700">{editingTier ? "Edit Kelas" : "Tambah Kelas Baru"}</h3>

                            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                            <div>
                                <label className="text-xs font-medium text-surface-500 mb-1 block">Nama Kelas</label>
                                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Contoh: Gold" />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-surface-500 mb-1 block">Warna Badge</label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {presetColors.map(c => (
                                        <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? "border-surface-900 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                                    ))}
                                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-7 h-7 rounded-full cursor-pointer" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-surface-500 mb-1 block">Maksimal Bani</label>
                                <input type="number" min={1} max={999} value={maxBanis} onChange={e => setMaxBanis(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-surface-500 mb-1 block">Maksimal Generasi</label>
                                <input type="number" min={1} max={99} value={maxGenerations} onChange={e => setMaxGenerations(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-surface-200 cursor-pointer hover:bg-surface-50 transition-colors">
                                    <input type="checkbox" checked={canGeneratePdf} onChange={e => setCanGeneratePdf(e.target.checked)} className="rounded accent-primary-600" />
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-surface-400" />
                                        <span className="text-sm text-surface-700">Akses Generate PDF</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-surface-200 cursor-pointer hover:bg-surface-50 transition-colors">
                                    <input type="checkbox" checked={canGenerateImage} onChange={e => setCanGenerateImage(e.target.checked)} className="rounded accent-primary-600" />
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-surface-400" />
                                        <span className="text-sm text-surface-700">Akses Generate Image</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-surface-200 cursor-pointer hover:bg-surface-50 transition-colors">
                                    <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="rounded accent-primary-600" />
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-surface-400" />
                                        <span className="text-sm text-surface-700">Kelas Default (untuk user baru)</span>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button onClick={() => { resetForm(); setShowForm(false); }} className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors">
                                    Batal
                                </button>
                                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingTier ? "Simpan" : "Tambah"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => { resetForm(); setShowForm(true); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-surface-300 text-sm font-medium text-surface-500 hover:border-primary-400 hover:text-primary-600 transition-colors">
                            <Plus className="w-4 h-4" /> Tambah Kelas Baru
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// ADD USER POPUP
// ============================================
function AddUserPopup({
    tiers,
    onClose,
    onSaved,
}: {
    tiers: TierData[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [userRole, setUserRole] = useState("USER");
    const [tierId, setTierId] = useState(tiers.find(t => t.isDefault)?.id || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        if (!name.trim() || !email.trim() || !password) {
            setError("Semua field wajib diisi");
            return;
        }
        if (password.length < 6) { setError("Password minimal 6 karakter"); return; }

        setSaving(true);
        setError("");
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, userRole, tierId: tierId || null }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Gagal menambahkan");
            }
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
                <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary-600" /> Tambah Pengguna
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors">
                        <X className="w-5 h-5 text-surface-400" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                    <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">Nama Lengkap</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Nama pengguna" />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="email@example.com" />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">Password</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 pr-10 rounded-xl border border-surface-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Minimal 6 karakter" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-surface-500 mb-1 block">Role</label>
                            <select value={userRole} onChange={e => setUserRole(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                                <option value="USER">Pengguna</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-surface-500 mb-1 block">Kelas</label>
                            <select value={tierId} onChange={e => setTierId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                                <option value="">Tanpa Kelas</option>
                                {tiers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button onClick={handleSave} disabled={saving} className="w-full px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Tambah Pengguna
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// USER DETAIL / EDIT POPUP
// ============================================
function UserDetailPopup({
    user,
    tiers,
    onClose,
    onSaved,
}: {
    user: UserData;
    tiers: TierData[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const [status, setStatus] = useState(user.status);
    const [userRole, setUserRole] = useState(user.role);
    const [tierId, setTierId] = useState(user.tierId || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const hasChanges = status !== user.status || userRole !== user.role || (tierId || null) !== (user.tierId || null);

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    status: status !== user.status ? status : undefined,
                    userRole: userRole !== user.role ? userRole : undefined,
                    tierId: (tierId || null) !== (user.tierId || null) ? (tierId || null) : undefined,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Gagal menyimpan");
            }
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const currentTier = tiers.find(t => t.id === tierId);
    const StatusIcon = statusConfig[user.status]?.icon || CheckCircle2;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
                <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-surface-900">Detail Pengguna</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors">
                        <X className="w-5 h-5 text-surface-400" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* User Info Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                            {user.name[0].toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-surface-900">{user.name}</h3>
                            <p className="text-sm text-surface-400">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusConfig[user.status]?.color}`}>
                                    <StatusIcon className="w-3 h-3" /> {statusConfig[user.status]?.label}
                                </span>
                                <span className="text-[11px] text-surface-400">
                                    {user._count.createdBanis} bani · {user._count.baniUsers} keanggotaan
                                </span>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                    {/* Editable Fields */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-surface-500 mb-1 block">Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                                <option value="PENDING">Menunggu</option>
                                <option value="APPROVED">Aktif</option>
                                <option value="SUSPENDED">Ditangguhkan</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-surface-500 mb-1 block">Role</label>
                            <select value={userRole} onChange={e => setUserRole(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                                <option value="USER">Pengguna</option>
                                <option value="ADMIN">Admin</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-surface-500 mb-1 block">Kelas</label>
                            <select value={tierId} onChange={e => setTierId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                                <option value="">Tanpa Kelas</option>
                                {tiers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {currentTier && (
                                <div className="mt-2 p-2.5 rounded-lg bg-surface-50 border border-surface-100">
                                    <div className="flex items-center gap-2 text-[11px] text-surface-500">
                                        <span className="flex items-center gap-1"><TreePine className="w-3 h-3" /> Max {currentTier.maxBanis} bani</span>
                                        <span>· {currentTier.maxGenerations} gen</span>
                                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> PDF: {currentTier.canGeneratePdf ? "✓" : "✗"}</span>
                                        <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> IMG: {currentTier.canGenerateImage ? "✓" : "✗"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-xs text-surface-400">
                        Bergabung {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>

                    <button onClick={handleSave} disabled={saving || !hasChanges} className="w-full px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// MAIN PAGE
// ============================================
export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [tiers, setTiers] = useState<TierData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    // Popups
    const [showAddUser, setShowAddUser] = useState(false);
    const [showTierMgmt, setShowTierMgmt] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            setUsers(data);
        } catch {
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTiers = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/tiers");
            const data = await res.json();
            setTiers(data);
        } catch { }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchTiers();
    }, [fetchUsers, fetchTiers]);

    const filteredUsers = users.filter((u) => {
        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "ALL" || u.status === filter;
        return matchSearch && matchFilter;
    });

    const filters = [
        { key: "ALL", label: "Semua" },
        { key: "PENDING", label: "Menunggu" },
        { key: "APPROVED", label: "Aktif" },
        { key: "SUSPENDED", label: "Ditangguhkan" },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Kelola Pengguna</h1>
                    <p className="text-surface-500 mt-1">Approve, suspend, atur role dan kelas pengguna</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowTierMgmt(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors">
                        <Settings className="w-4 h-4" /> Kelola Kelas
                    </button>
                    <button onClick={() => setShowAddUser(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors shadow-md shadow-primary-600/20">
                        <Plus className="w-4 h-4" /> Tambah User
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau email..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {filters.map((f) => (
                        <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === f.key ? "bg-primary-600 text-white" : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : (
                <div className="rounded-2xl bg-white border border-surface-200 divide-y divide-surface-100 overflow-hidden">
                    {filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-surface-400">
                            <Users className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                            <p className="text-sm">Tidak ada pengguna ditemukan</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                            const StatusIcon = statusConfig[user.status]?.icon || CheckCircle2;
                            return (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-surface-50 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                            {user.name[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold text-surface-900">{user.name}</p>
                                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusConfig[user.status]?.color}`}>
                                                    <StatusIcon className="w-3 h-3" /> {statusConfig[user.status]?.label}
                                                </span>
                                                <span className="text-[10px] text-surface-400 bg-surface-50 px-1.5 py-0.5 rounded">{roleLabels[user.role]}</span>
                                                {user.tier && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: user.tier.color + "15", color: user.tier.color, border: `1px solid ${user.tier.color}30` }}>
                                                        <Crown className="w-3 h-3" /> {user.tier.name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-surface-400 mt-0.5 truncate">
                                                {user.email} · {user._count.baniUsers} bani
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Popups */}
            {showTierMgmt && (
                <TierManagementPopup
                    tiers={tiers}
                    onClose={() => setShowTierMgmt(false)}
                    onSaved={() => { fetchTiers(); fetchUsers(); }}
                />
            )}
            {showAddUser && (
                <AddUserPopup
                    tiers={tiers}
                    onClose={() => setShowAddUser(false)}
                    onSaved={() => fetchUsers()}
                />
            )}
            {selectedUser && (
                <UserDetailPopup
                    user={selectedUser}
                    tiers={tiers}
                    onClose={() => setSelectedUser(null)}
                    onSaved={() => { fetchUsers(); setSelectedUser(null); }}
                />
            )}
        </div>
    );
}
