import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    User,
    Phone,
    MapPin,
    Calendar,
    Edit,
    Heart,
    GitBranch,
    MessageCircle,
    Flower2,
} from "lucide-react";
import { formatDate, getWhatsAppLink, getInitials } from "@/lib/utils";

interface PageProps {
    params: Promise<{ id: string; memberId: string }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
    const { id: baniId, memberId } = await params;
    const session = await auth();
    if (!session?.user) redirect("/login");

    const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: {
            father: { select: { id: true, fullName: true, photo: true, gender: true } },
            mother: { select: { id: true, fullName: true, photo: true, gender: true } },
            childrenAsFather: {
                select: { id: true, fullName: true, gender: true, birthDate: true, isAlive: true, photo: true },
                orderBy: { birthDate: "asc" },
            },
            childrenAsMother: {
                select: { id: true, fullName: true, gender: true, birthDate: true, isAlive: true, photo: true },
                orderBy: { birthDate: "asc" },
            },
            marriagesAsHusband: {
                include: { wife: { select: { id: true, fullName: true, photo: true, gender: true } } },
                orderBy: { marriageOrder: "asc" },
            },
            marriagesAsWife: {
                include: { husband: { select: { id: true, fullName: true, photo: true, gender: true } } },
                orderBy: { marriageOrder: "asc" },
            },
            addedBy: { select: { name: true } },
        },
    });

    if (!member) notFound();

    // Check user access
    const baniUser = await prisma.baniUser.findUnique({
        where: { baniId_userId: { baniId, userId: session.user.id } },
    });
    const isAdmin = session.user.role === "SUPER_ADMIN";
    const canEdit = baniUser?.role !== "VIEWER";

    const children = [
        ...member.childrenAsFather,
        ...member.childrenAsMother,
    ].filter((c, i, arr) => arr.findIndex((a) => a.id === c.id) === i);

    const spouses =
        member.gender === "MALE"
            ? member.marriagesAsHusband.map((m) => ({ ...m.wife, marriageDate: m.marriageDate, isActive: m.isActive }))
            : member.marriagesAsWife.map((m) => ({ ...m.husband, marriageDate: m.marriageDate, isActive: m.isActive }));

    const socialMedia = member.socialMedia as Record<string, string> | null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
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
                        Detail Anggota
                    </h1>
                </div>
                {canEdit && (
                    <Link
                        href={`/dashboard/bani/${baniId}/members/${memberId}/edit`}
                        className="touch-target inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary-200 text-primary-700 text-sm font-medium hover:bg-primary-50 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Link>
                )}
            </div>

            {/* Profile Card */}
            <div className="rounded-2xl bg-white border border-surface-200 p-6">
                <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div
                        className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 ${member.gender === "MALE"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-pink-100 text-pink-600"
                            } ${!member.isAlive ? "opacity-60" : ""}`}
                    >
                        {member.photo ? (
                            <img
                                src={member.photo}
                                alt={member.fullName}
                                className="w-20 h-20 rounded-2xl object-cover"
                            />
                        ) : (
                            getInitials(member.fullName)
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold text-surface-900">
                                {member.fullName}
                            </h2>
                            {!member.isAlive && (
                                <span className="px-2 py-0.5 rounded-lg bg-surface-100 text-surface-500 text-xs font-medium inline-flex items-center gap-0.5">
                                    <Flower2 className="w-3 h-3" /> Almarhum/ah
                                </span>
                            )}
                        </div>
                        {member.nickname && (
                            <p className="text-sm text-surface-500 mt-0.5">
                                &quot;{member.nickname}&quot;
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span
                                className={`text-xs px-2.5 py-1 rounded-lg font-medium ${member.gender === "MALE"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-pink-50 text-pink-700"
                                    }`}
                            >
                                {member.gender === "MALE" ? "Laki-laki" : "Perempuan"}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 font-medium">
                                Generasi {member.generation + 1}
                            </span>
                            {member.isAlive && (
                                <span className="text-xs px-2.5 py-1 rounded-lg bg-green-50 text-green-700 font-medium">
                                    <Heart className="w-3 h-3" /> Hidup
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bio */}
                {member.bio && (
                    <div className="mt-5 pt-5 border-t border-surface-100">
                        <p className="text-sm text-surface-600 leading-relaxed">{member.bio}</p>
                    </div>
                )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dates */}
                <div className="rounded-2xl bg-white border border-surface-200 p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Tanggal
                    </h3>
                    {member.birthDate && (
                        <div>
                            <p className="text-xs text-surface-400">Tanggal Lahir</p>
                            <p className="text-sm text-surface-900 font-medium">
                                {formatDate(member.birthDate)}
                                {member.birthPlace ? ` — ${member.birthPlace}` : ""}
                            </p>
                        </div>
                    )}
                    {member.deathDate && (
                        <div>
                            <p className="text-xs text-surface-400">Tanggal Wafat</p>
                            <p className="text-sm text-surface-900 font-medium">
                                {formatDate(member.deathDate)}
                            </p>
                        </div>
                    )}
                    {!member.birthDate && !member.deathDate && (
                        <p className="text-sm text-surface-400">Belum diisi</p>
                    )}
                </div>

                {/* Contact */}
                <div className="rounded-2xl bg-white border border-surface-200 p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Kontak
                    </h3>
                    {member.phoneWhatsapp && (
                        <div>
                            <p className="text-xs text-surface-400">WhatsApp</p>
                            <a
                                href={getWhatsAppLink(member.phoneWhatsapp)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-500"
                            >
                                <MessageCircle className="w-4 h-4" />
                                {member.phoneWhatsapp}
                            </a>
                        </div>
                    )}
                    {socialMedia?.instagram && (
                        <div>
                            <p className="text-xs text-surface-400">Instagram</p>
                            <p className="text-sm text-surface-900">{socialMedia.instagram}</p>
                        </div>
                    )}
                    {socialMedia?.facebook && (
                        <div>
                            <p className="text-xs text-surface-400">Facebook</p>
                            <p className="text-sm text-surface-900">{socialMedia.facebook}</p>
                        </div>
                    )}
                    {!member.phoneWhatsapp && !socialMedia?.instagram && !socialMedia?.facebook && (
                        <p className="text-sm text-surface-400">Belum diisi</p>
                    )}
                </div>

                {/* Address */}
                {(member.address || member.city) && (
                    <div className="rounded-2xl bg-white border border-surface-200 p-5 space-y-3 sm:col-span-2">
                        <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Alamat
                        </h3>
                        {member.address && (
                            <p className="text-sm text-surface-900">{member.address}</p>
                        )}
                        {member.city && (
                            <p className="text-sm text-surface-600 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {member.city}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Family Relations */}
            <div className="rounded-2xl bg-white border border-surface-200 p-6 space-y-5">
                <h3 className="text-base font-semibold text-surface-900 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-primary-500" />
                    Hubungan Keluarga
                </h3>

                {/* Parents */}
                {(member.father || member.mother) && (
                    <div>
                        <p className="text-xs text-surface-400 uppercase tracking-wider mb-2">
                            Orang Tua
                        </p>
                        <div className="flex flex-col gap-2">
                            {member.father && (
                                <Link
                                    href={`/dashboard/bani/${baniId}/members/${member.father.id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-surface-900">
                                            {member.father.fullName}
                                        </p>
                                        <p className="text-xs text-surface-400">Ayah</p>
                                    </div>
                                </Link>
                            )}
                            {member.mother && (
                                <Link
                                    href={`/dashboard/bani/${baniId}/members/${member.mother.id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-surface-900">
                                            {member.mother.fullName}
                                        </p>
                                        <p className="text-xs text-surface-400">Ibu</p>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Spouses */}
                {spouses.length > 0 && (
                    <div>
                        <p className="text-xs text-surface-400 uppercase tracking-wider mb-2">
                            Pasangan
                        </p>
                        <div className="flex flex-col gap-2">
                            {spouses.map((spouse: any) => (
                                <Link
                                    key={spouse.id}
                                    href={`/dashboard/bani/${baniId}/members/${spouse.id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${spouse.gender === "MALE"
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-pink-100 text-pink-600"
                                            }`}
                                    >
                                        <Heart className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-surface-900">
                                            {spouse.fullName}
                                        </p>
                                        <p className="text-xs text-surface-400">
                                            {member.gender === "MALE" ? "Istri" : "Suami"}
                                            {spouse.marriageDate &&
                                                ` · Menikah ${new Date(spouse.marriageDate).getFullYear()}`}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Children */}
                {children.length > 0 && (
                    <div>
                        <p className="text-xs text-surface-400 uppercase tracking-wider mb-2">
                            Anak ({children.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {children.map((child: any) => (
                                <Link
                                    key={child.id}
                                    href={`/dashboard/bani/${baniId}/members/${child.id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${child.gender === "MALE"
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-pink-100 text-pink-600"
                                            } ${!child.isAlive ? "opacity-60" : ""}`}
                                    >
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-surface-900">
                                            {child.fullName}
                                        </p>
                                        {child.birthDate && (
                                            <p className="text-xs text-surface-400">
                                                Lahir {new Date(child.birthDate).getFullYear()}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {!member.father && !member.mother && spouses.length === 0 && children.length === 0 && (
                    <p className="text-sm text-surface-400">Belum ada relasi keluarga</p>
                )}
            </div>

            {/* Meta */}
            <div className="text-xs text-surface-400 text-center pb-4">
                Ditambahkan oleh {member.addedBy?.name || "Unknown"} ·{" "}
                {formatDate(member.createdAt)}
            </div>
        </div>
    );
}
