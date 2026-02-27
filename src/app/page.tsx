"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  TreePine,
  Users,
  Download,
  MessageCircle,
  Shield,
  Smartphone,
  ArrowRight,
  Heart,
  Sparkles,
  Eye,
  CheckCircle2,
  Leaf,
  GitBranch,
} from "lucide-react";

/* ──────────────────────────────────────────
   Animated Tree SVG (light version)
   ────────────────────────────────────────── */
function AnimatedTree() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 400 300" className="w-full relative z-10">
        {/* Lines */}
        <line x1="200" y1="60" x2="200" y2="105" stroke="#bbf7d0" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="200" y1="130" x2="100" y2="185" stroke="#bbf7d0" strokeWidth="1.5" />
        <line x1="200" y1="130" x2="200" y2="185" stroke="#bbf7d0" strokeWidth="1.5" />
        <line x1="200" y1="130" x2="300" y2="185" stroke="#bbf7d0" strokeWidth="1.5" />
        <line x1="100" y1="210" x2="65" y2="255" stroke="#bbf7d0" strokeWidth="1.5" />
        <line x1="100" y1="210" x2="135" y2="255" stroke="#bbf7d0" strokeWidth="1.5" />
        <line x1="300" y1="210" x2="300" y2="255" stroke="#bbf7d0" strokeWidth="1.5" />

        {/* Root */}
        <g className="tree-svg-node">
          <rect x="150" y="25" width="100" height="40" rx="20" fill="#16a34a" />
          <text x="200" y="50" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">H. Ahmad</text>
        </g>
        {/* Couple */}
        <g className="tree-svg-node" style={{ animationDelay: "0.1s" }}>
          <rect x="145" y="108" width="110" height="36" rx="18" fill="#0d9488" />
          <text x="200" y="131" textAnchor="middle" fill="white" fontSize="11" fontWeight="500">♥ Hj. Fatimah</text>
        </g>
        {/* Children */}
        <g className="tree-svg-node" style={{ animationDelay: "0.2s" }}>
          <rect x="58" y="185" width="84" height="32" rx="16" fill="#2563eb" />
          <text x="100" y="206" textAnchor="middle" fill="white" fontSize="11" fontWeight="500">Abdullah</text>
        </g>
        <g className="tree-svg-node" style={{ animationDelay: "0.3s" }}>
          <rect x="158" y="185" width="84" height="32" rx="16" fill="#db2777" />
          <text x="200" y="206" textAnchor="middle" fill="white" fontSize="11" fontWeight="500">Khadijah</text>
        </g>
        <g className="tree-svg-node" style={{ animationDelay: "0.4s" }}>
          <rect x="258" y="185" width="84" height="32" rx="16" fill="#2563eb" />
          <text x="300" y="206" textAnchor="middle" fill="white" fontSize="11" fontWeight="500">Ibrahim</text>
        </g>
        {/* Grandchildren */}
        <g className="tree-svg-node" style={{ animationDelay: "0.5s" }}>
          <rect x="25" y="252" width="78" height="28" rx="14" fill="#94a3b8" />
          <text x="64" y="271" textAnchor="middle" fill="white" fontSize="10" fontWeight="500">Yusuf</text>
        </g>
        <g className="tree-svg-node" style={{ animationDelay: "0.6s" }}>
          <rect x="113" y="252" width="78" height="28" rx="14" fill="#94a3b8" />
          <text x="152" y="271" textAnchor="middle" fill="white" fontSize="10" fontWeight="500">Aisyah</text>
        </g>
        <g className="tree-svg-node" style={{ animationDelay: "0.7s" }}>
          <rect x="261" y="252" width="78" height="28" rx="14" fill="#94a3b8" />
          <text x="300" y="271" textAnchor="middle" fill="white" fontSize="10" fontWeight="500">Hasan</text>
        </g>
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────────
   Main Landing Page — Fully Clean Light Theme
   ────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: TreePine, title: "Pohon Nasab Interaktif",
      desc: "Visualisasi silsilah yang indah dan mudah dinavigasi. Zoom, scroll, dan jelajahi setiap cabang.",
      accentBg: "bg-emerald-50", accentText: "text-emerald-600",
    },
    {
      icon: Users, title: "Kolaborasi Keluarga",
      desc: "Ajak seluruh anggota keluarga untuk bersama-sama melengkapi data nasab.",
      accentBg: "bg-blue-50", accentText: "text-blue-600",
    },
    {
      icon: Download, title: "Export PDF & Gambar",
      desc: "Cetak pohon nasab dalam format PDF atau gambar berkualitas tinggi.",
      accentBg: "bg-amber-50", accentText: "text-amber-600",
    },
    {
      icon: MessageCircle, title: "Terhubung via WhatsApp",
      desc: "Satu klik langsung menghubungi anggota keluarga lewat WhatsApp.",
      accentBg: "bg-green-50", accentText: "text-green-600",
    },
    {
      icon: Smartphone, title: "Ramah di Semua Perangkat",
      desc: "Dioptimalkan untuk ponsel, tablet, dan desktop.",
      accentBg: "bg-violet-50", accentText: "text-violet-600",
    },
    {
      icon: Shield, title: "Aman & Terkontrol",
      desc: "Sistem approval admin dan role management untuk keamanan data keluarga.",
      accentBg: "bg-rose-50", accentText: "text-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-surface-200/50" : "bg-white/70 backdrop-blur-md border-b border-surface-200/30"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-base sm:text-lg font-bold text-surface-900 tracking-tight">
                Jejak Nasab
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-3 sm:px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors">
                Masuk
              </Link>
              <Link href="/register" className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-400 hover:to-primary-500 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section — Light ── */}
      <section className="relative pt-20 sm:pt-28 pb-12 sm:pb-20 px-4 overflow-hidden">
        {/* Subtle decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-50/60 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs sm:text-sm font-medium mb-5 sm:mb-8">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            Menyambung Tali Silaturahmi
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-surface-900 leading-[1.1] mb-4 sm:mb-6 tracking-tight">
            Abadikan Silsilah
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-emerald-500">
              Keluarga Anda
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-lg text-surface-500 max-w-xl mx-auto mb-6 sm:mb-10 leading-relaxed">
            Catat, visualisasikan, dan bagikan pohon nasab keluarga besar Anda secara kolaboratif. Mudah digunakan untuk semua usia.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 sm:mb-16">
            <Link href="/register" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl hover:from-primary-400 hover:to-primary-500 transition-all shadow-md shadow-primary-500/20 hover:shadow-lg hover:-translate-y-0.5">
              Mulai Catat Nasab
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 text-sm font-medium text-surface-600 border border-surface-200 rounded-2xl hover:bg-surface-100 hover:border-surface-300 transition-all">
              Sudah Punya Akun
            </Link>
          </div>

          {/* Tree Illustration */}
          <div className="rounded-2xl bg-white border border-surface-200 shadow-lg p-4 sm:p-6 max-w-lg mx-auto">
            <AnimatedTree />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-10 sm:py-16 px-4 border-y border-surface-200/60">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {[
              { value: "100+", label: "Keluarga" },
              { value: "1500+", label: "Anggota" },
              { value: "50+", label: "Pohon Nasab" },
              { value: "99%", label: "Kepuasan" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary-600 mb-0.5">{s.value}</div>
                <p className="text-xs sm:text-sm text-surface-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-12 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-semibold mb-3 sm:mb-4 uppercase tracking-wider">
              <GitBranch className="w-3.5 h-3.5" />
              Fitur Lengkap
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-surface-900 mb-2 sm:mb-4 tracking-tight">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-sm sm:text-base text-surface-500 max-w-lg mx-auto">
              Dirancang khusus untuk keluarga besar Indonesia
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {features.map((f, i) => (
              <div key={i} className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-surface-200/80 hover:border-surface-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${f.accentBg} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${f.accentText}`} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-surface-900 mb-1 sm:mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-surface-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-12 sm:py-24 px-4 bg-white border-y border-surface-200/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-surface-900 mb-2 sm:mb-4 tracking-tight">
              Mudah Sekali Dimulai
            </h2>
            <p className="text-sm sm:text-base text-surface-500 max-w-md mx-auto">
              Tiga langkah sederhana untuk mulai mencatat silsilah
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-[44px] left-[16.6%] right-[16.6%] h-[2px] bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200" />

            {[
              { num: "01", title: "Buat Akun", desc: "Daftar gratis dalam hitungan detik.", icon: Sparkles },
              { num: "02", title: "Tambah Anggota", desc: "Masukkan data anggota dan hubungan kekerabatan.", icon: Users },
              { num: "03", title: "Lihat & Bagikan", desc: "Pohon nasab terbentuk. Bagikan atau cetak.", icon: Eye },
            ].map((s, i) => (
              <div key={i} className="relative flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-0">
                <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md ring-4 ring-surface-50 flex-shrink-0 md:mb-4">
                  <s.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-primary-500 tracking-widest uppercase">Langkah {s.num}</span>
                  <h3 className="text-sm sm:text-lg font-bold text-surface-900 mb-0.5 sm:mb-1">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-surface-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: CheckCircle2, text: "Gratis untuk selamanya", color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: Eye, text: "Bisa dibagikan secara publik", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Heart, text: "Dibuat untuk keluarga Indonesia", color: "text-rose-500", bg: "bg-rose-50" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white border border-surface-200/80">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-xs sm:text-sm text-surface-700 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section — Light ── */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-surface-200 shadow-lg p-6 sm:p-12">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-surface-900 mb-2 sm:mb-4 tracking-tight">
              Mulai Abadikan Nasab
              <br className="hidden sm:block" />
              Keluarga Anda Hari Ini
            </h2>
            <p className="text-xs sm:text-base text-surface-500 mb-5 sm:mb-8 max-w-md mx-auto leading-relaxed">
              Setiap nama dalam keluarga besar layak dikenang dan diwariskan kepada generasi berikutnya.
            </p>
            <Link href="/register" className="group inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl hover:from-primary-400 hover:to-primary-500 transition-all shadow-md shadow-primary-500/20 hover:shadow-lg hover:-translate-y-0.5">
              Daftar Sekarang — Gratis
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer — Light ── */}
      <footer className="border-t border-surface-200 py-6 sm:py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-surface-900 font-semibold text-sm">Jejak Nasab</span>
                <span className="text-surface-400 text-sm">&copy; {new Date().getFullYear()}</span>
              </div>
            </div>
            <p className="text-surface-400 text-xs sm:text-sm italic">
              &ldquo;Menyambung Tali Silaturahmi, Satu Nasab Sekaligus&rdquo;
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
