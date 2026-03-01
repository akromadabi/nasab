// Tree Card Theme Configuration
// Each theme defines colors for cards, lines, avatars, badges

export type ThemeKey = "STANDARD" | "CLASSIC" | "GRADIENT" | "GLASS" | "DARK" | "NATURE";

export interface TreeThemeConfig {
    name: string;
    description: string;
    preview: { bg: string; accent: string; text: string };
    card: {
        bg: string;
        border: string;
        selectedBorder: string;
        selectedBg: string;
        shadow: string;
        textPrimary: string;
        textSecondary: string;
        textMuted: string;
    };
    avatar: {
        maleBg: string;
        maleText: string;
        femaleBg: string;
        femaleText: string;
    };
    line: {
        color: string;
    };
    spouse: {
        maleBg: string;
        maleText: string;
        femaleBg: string;
        femaleText: string;
    };
    badge: {
        deceasedBg: string;
        deceasedText: string;
        genBg: string;
        genText: string;
    };
    export: {
        headerGradient: string[];
    };
}

export const TREE_THEMES: Record<ThemeKey, TreeThemeConfig> = {
    STANDARD: {
        name: "Standar",
        description: "Tema default aplikasi",
        preview: { bg: "#ffffff", accent: "#16a34a", text: "#1f2937" },
        card: {
            bg: "bg-white",
            border: "border-surface-200",
            selectedBorder: "border-primary-400",
            selectedBg: "bg-primary-50/30",
            shadow: "shadow-sm",
            textPrimary: "text-surface-800",
            textSecondary: "text-surface-500",
            textMuted: "text-surface-400",
        },
        avatar: {
            maleBg: "bg-blue-100",
            maleText: "text-blue-600",
            femaleBg: "bg-pink-100",
            femaleText: "text-pink-600",
        },
        line: { color: "bg-primary-200" },
        spouse: {
            maleBg: "bg-pink-50",
            maleText: "text-pink-500",
            femaleBg: "bg-blue-50",
            femaleText: "text-blue-500",
        },
        badge: {
            deceasedBg: "bg-surface-200",
            deceasedText: "text-surface-500",
            genBg: "bg-primary-100",
            genText: "text-primary-700",
        },
        export: { headerGradient: ["#15803d", "#16a34a", "#22c55e"] },
    },

    CLASSIC: {
        name: "Klasik Elegan",
        description: "Nuansa emas & krem, kesan formal",
        preview: { bg: "#fdf6e3", accent: "#b8860b", text: "#5c4033" },
        card: {
            bg: "bg-[#fdf8ef]",
            border: "border-[#d4a843]/40",
            selectedBorder: "border-[#b8860b]",
            selectedBg: "bg-[#fdf0d5]/40",
            shadow: "shadow-sm",
            textPrimary: "text-[#5c4033]",
            textSecondary: "text-[#8b7355]",
            textMuted: "text-[#a09077]",
        },
        avatar: {
            maleBg: "bg-[#e8d5b7]",
            maleText: "text-[#8b6914]",
            femaleBg: "bg-[#f0d5d5]",
            femaleText: "text-[#a0522d]",
        },
        line: { color: "bg-[#d4a843]/50" },
        spouse: {
            maleBg: "bg-[#f5e6d3]",
            maleText: "text-[#a0522d]",
            femaleBg: "bg-[#e8d5b7]",
            femaleText: "text-[#8b6914]",
        },
        badge: {
            deceasedBg: "bg-[#e8d5b7]",
            deceasedText: "text-[#8b7355]",
            genBg: "bg-[#fdf0d5]",
            genText: "text-[#b8860b]",
        },
        export: { headerGradient: ["#8b6914", "#b8860b", "#d4a843"] },
    },

    GRADIENT: {
        name: "Modern Gradient",
        description: "Gradient biru-ungu, modern & colorful",
        preview: { bg: "#f0f0ff", accent: "#7c3aed", text: "#1e1b4b" },
        card: {
            bg: "bg-white",
            border: "border-indigo-200",
            selectedBorder: "border-violet-400",
            selectedBg: "bg-violet-50/30",
            shadow: "shadow-md shadow-indigo-100/50",
            textPrimary: "text-indigo-900",
            textSecondary: "text-indigo-500",
            textMuted: "text-indigo-400",
        },
        avatar: {
            maleBg: "bg-gradient-to-br from-blue-100 to-indigo-100",
            maleText: "text-indigo-600",
            femaleBg: "bg-gradient-to-br from-pink-100 to-purple-100",
            femaleText: "text-purple-600",
        },
        line: { color: "bg-indigo-300" },
        spouse: {
            maleBg: "bg-purple-50",
            maleText: "text-purple-500",
            femaleBg: "bg-indigo-50",
            femaleText: "text-indigo-500",
        },
        badge: {
            deceasedBg: "bg-indigo-100",
            deceasedText: "text-indigo-500",
            genBg: "bg-violet-100",
            genText: "text-violet-700",
        },
        export: { headerGradient: ["#4338ca", "#7c3aed", "#a78bfa"] },
    },

    GLASS: {
        name: "Glassmorphism",
        description: "Efek kaca transparan, futuristik",
        preview: { bg: "#e0f2fe", accent: "#0ea5e9", text: "#0c4a6e" },
        card: {
            bg: "bg-white/70 backdrop-blur-sm",
            border: "border-white/60",
            selectedBorder: "border-sky-300",
            selectedBg: "bg-sky-50/40",
            shadow: "shadow-lg shadow-sky-100/30",
            textPrimary: "text-slate-800",
            textSecondary: "text-slate-500",
            textMuted: "text-slate-400",
        },
        avatar: {
            maleBg: "bg-sky-100/80",
            maleText: "text-sky-600",
            femaleBg: "bg-rose-100/80",
            femaleText: "text-rose-600",
        },
        line: { color: "bg-sky-300/60" },
        spouse: {
            maleBg: "bg-rose-50/70",
            maleText: "text-rose-500",
            femaleBg: "bg-sky-50/70",
            femaleText: "text-sky-500",
        },
        badge: {
            deceasedBg: "bg-slate-200/60",
            deceasedText: "text-slate-500",
            genBg: "bg-sky-100/60",
            genText: "text-sky-700",
        },
        export: { headerGradient: ["#0369a1", "#0ea5e9", "#38bdf8"] },
    },

    DARK: {
        name: "Dark Premium",
        description: "Mode gelap, aksen teal, eksklusif",
        preview: { bg: "#1e293b", accent: "#14b8a6", text: "#e2e8f0" },
        card: {
            bg: "bg-slate-800",
            border: "border-slate-700",
            selectedBorder: "border-teal-400",
            selectedBg: "bg-teal-900/20",
            shadow: "shadow-lg shadow-black/20",
            textPrimary: "text-slate-100",
            textSecondary: "text-slate-400",
            textMuted: "text-slate-500",
        },
        avatar: {
            maleBg: "bg-teal-900/60",
            maleText: "text-teal-300",
            femaleBg: "bg-pink-900/60",
            femaleText: "text-pink-300",
        },
        line: { color: "bg-slate-600" },
        spouse: {
            maleBg: "bg-pink-900/30",
            maleText: "text-pink-300",
            femaleBg: "bg-teal-900/30",
            femaleText: "text-teal-300",
        },
        badge: {
            deceasedBg: "bg-slate-700",
            deceasedText: "text-slate-400",
            genBg: "bg-teal-900/40",
            genText: "text-teal-300",
        },
        export: { headerGradient: ["#0f172a", "#1e293b", "#334155"] },
    },

    NATURE: {
        name: "Nature Leaf",
        description: "Hijau earthy, alami & hangat",
        preview: { bg: "#f0fdf4", accent: "#059669", text: "#064e3b" },
        card: {
            bg: "bg-[#f7fdf9]",
            border: "border-emerald-200",
            selectedBorder: "border-emerald-400",
            selectedBg: "bg-emerald-50/40",
            shadow: "shadow-sm",
            textPrimary: "text-emerald-900",
            textSecondary: "text-emerald-600",
            textMuted: "text-emerald-400",
        },
        avatar: {
            maleBg: "bg-emerald-100",
            maleText: "text-emerald-700",
            femaleBg: "bg-amber-100",
            femaleText: "text-amber-700",
        },
        line: { color: "bg-emerald-300" },
        spouse: {
            maleBg: "bg-amber-50",
            maleText: "text-amber-600",
            femaleBg: "bg-emerald-50",
            femaleText: "text-emerald-600",
        },
        badge: {
            deceasedBg: "bg-emerald-100",
            deceasedText: "text-emerald-500",
            genBg: "bg-emerald-100",
            genText: "text-emerald-700",
        },
        export: { headerGradient: ["#064e3b", "#059669", "#34d399"] },
    },
};

export const THEME_KEYS: ThemeKey[] = ["STANDARD", "CLASSIC", "GRADIENT", "GLASS", "DARK", "NATURE"];
