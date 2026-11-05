import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Check, 
  Clock3, 
  Calendar, 
  Users, 
  Award, 
  Sparkles,
  Shield,
  Heart,
  BookOpen,
  ArrowUpRight,
  ArrowDown
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { HeroShowcase } from "@/components/landing/hero-showcase";
import { HeroRemotionPlayer } from "@/components/landing/hero-remotion-player";
import { ProofStrip } from "@/components/landing/proof-strip";
import { BeforeAfter } from "@/components/landing/before-after";
import { BentoFeatures } from "@/components/landing/bento-features";
import { InteractiveDemo } from "@/components/landing/interactive-demo";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { WorkflowTimeline } from "@/components/landing/workflow-timeline";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { StandaloneRedirectGuard } from "@/components/pwa/standalone-redirect-guard";

export default function Home() {
  return (
    <main className="landing-page min-h-screen bg-[#fafaf7] text-[#10261b] selection:bg-[#C6F432]/30 selection:text-[#0a1f16]">
      <StandaloneRedirectGuard />

      {/* ── STICKY FLOATING NAVBAR ── */}
      <div className="fixed top-3 sm:top-4 inset-x-3 sm:inset-x-6 lg:inset-x-8 z-50 pointer-events-none flex justify-center">
        <div className="w-full max-w-7xl pointer-events-auto">
          <LandingNavbar />
        </div>
      </div>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative pt-16 sm:pt-18 lg:pt-20 pb-8 sm:pb-10 lg:pb-12 px-4 sm:px-8 lg:px-12 w-full overflow-hidden border-b border-white/10 bg-[#0a1f16] text-[#F4F1EA]">
        {/* Subtle Dark Emerald Radial Ambience */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-radial from-[#12332a]/70 via-[#0a1f16]/40 to-transparent blur-3xl opacity-70"
        />

        <div className="relative mx-auto w-full max-w-7xl">
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center w-full min-w-0">
            
            {/* Left Column: Sharp Editorial Copy */}
            <div className="max-w-2xl w-full min-w-0">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C6F432]/30 bg-[#12332a] px-3.5 py-1.5 text-xs font-mono font-bold text-[#C6F432] shadow-xs">
                <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
                <span>Ruang Belajar & Ambisi Mahasiswa Indonesia</span>
              </div>

              {/* Display Headline */}
              {/* A/B Test Alternative 1: "Kuliah teratur. Ambisi organisasi tetap melesat." */}
              {/* A/B Test Alternative 2: "Berhenti panik tiap malam Minggu karena deadline numpuk." */}
              <h1 className="font-display mt-5 text-3xl sm:text-5xl lg:text-[3.6rem] xl:text-[4rem] font-black leading-[1.08] tracking-tight text-[#F4F1EA] text-balance">
                Tugas numpuk.<br />
                Jadwal bentrok.<br />
                <span className="text-[#C6F432]">Grup WA 999+.</span>
              </h1>

              {/* Subcopy */}
              <p className="mt-4 text-sm sm:text-base lg:text-lg leading-relaxed text-[#F4F1EA]/75 text-pretty max-w-xl font-normal">
                ngampUS merapikan semuanya di satu tempat: jadwal kuliah, deadline, organisasi, sampai CV magang.
              </p>

              {/* CTAs */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#C6F432] px-6 py-3.5 sm:px-7 sm:py-3.5 text-sm sm:text-base font-bold text-[#0a1f16] shadow-md shadow-[#C6F432]/20 transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  <span>Mulai Gratis</span>
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-[#12332a] px-6 py-3.5 text-sm font-bold text-[#F4F1EA] transition-all hover:bg-white/10 active:scale-[0.98]"
                >
                  <span>Lihat cara kerjanya</span>
                  <ArrowDown size={16} className="text-[#C6F432]" />
                </a>
              </div>

              {/* Trust & Proof Signals */}
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 font-mono text-xs text-[#F4F1EA]/60">
                <span>Gratis selamanya</span>
                <span className="text-white/20">·</span>
                <span>Setup 2 menit</span>
                <span className="text-white/20">·</span>
                <span>Tanpa iklan</span>
              </div>
            </div>

            {/* Right Column: Remotion Showcase Motion Player */}
            <div className="w-full min-w-0 flex justify-center lg:justify-end -mt-2 lg:-mt-6">
              <HeroRemotionPlayer />
            </div>

          </div>
        </div>
      </section>

      {/* ── PROOF STRIP ─────────────────────────────────────────── */}
      <ProofStrip />

      {/* ── BEFORE / AFTER ──────────────────────────────────────── */}
      <BeforeAfter />

      {/* ── BENTO GRID FITUR ────────────────────────────────────── */}
      <BentoFeatures />

      {/* ── DEMO INTERAKTIF ─────────────────────────────────────── */}
      <InteractiveDemo />

      {/* ── WORKFLOW TIMELINE SECTION ───────────────────────────── */}
      <section id="how-it-works" className="border-t border-[#e5ece5] bg-[#f5f7f2] px-4 py-16 sm:px-8 sm:py-24 lg:px-12 scroll-mt-20">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dff3e5] px-3.5 py-1 text-xs font-bold text-[#0f6849]">
                ALUR 4 LANGKAH
              </span>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#10261b]">
                Menjaga pikiran tetap jernih sepanjang semester.
              </h2>
              <p className="mt-4 text-base text-[#55675b]">
                Dari kekacauan awal semester menuju rutinitas harian yang teratur dan terukur. Klik tiap tahap untuk melihat rinciannya.
              </p>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <WorkflowTimeline />
          </Reveal>
        </div>
      </section>

      {/* ── FAQ SECTION ────────────────────────────────────────── */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24 lg:px-12 scroll-mt-20">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dff3e5] px-3.5 py-1 text-xs font-bold text-[#0f6849]">
              PERTANYAAN UMUM
            </span>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#10261b]">
              Semua hal yang perlu kamu ketahui.
            </h2>
            <p className="mt-3 text-base text-[#55675b]">
              Transparan, aman, dan tanpa biaya langganan apa pun.
            </p>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <FaqAccordion />
        </Reveal>
      </section>

      {/* ── FINAL CTA SECTION ──────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-8 sm:pb-24 lg:px-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-[#10261b] px-6 py-12 sm:px-14 sm:py-20 text-white shadow-xl">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold text-[#dff3e5] mb-5">
                  <Sparkles size={13} className="text-[#c8ef70]" />
                  MULAI HARI INI SECARA GRATIS
                </div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                  Jangan biarkan semester ini berlalu dalam kepanikan.
                </h2>
                <p className="mt-4 text-base sm:text-lg text-[#cad7ce] leading-relaxed max-w-xl">
                  Bangun workspace nGampUS milikmu sekarang. Hanya butuh 2 menit untuk menata jadwal, tugas, dan target perkuliahanmu.
                </p>
              </div>

              <div className="lg:justify-self-end flex flex-col items-start lg:items-end gap-3.5">
                <Link 
                  href="/register" 
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-[#0f6849] px-7 py-4 text-base font-bold text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#0b4d36] active:scale-98"
                >
                  <span>Buat Ruang Kuliahmu</span>
                  <ArrowRight size={18} />
                </Link>
                <span className="text-xs font-medium text-[#8ca393]">
                  ✦ 100% Gratis • Tanpa Kartu Kredit • Setup 2 Menit
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-[#e5ece5] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="grid gap-10 md:grid-cols-4 pb-12 border-b border-[#edf2ee]">
            
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5 font-display text-2xl font-black tracking-tight text-[#10261b]">
                <Image
                  src="/logo_ngampUS.png"
                  alt="ngampUS Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <span>
                  ngamp<span className="text-[#0f6849]">US</span>
                </span>
              </Link>
              <p className="text-sm text-[#55675b] max-w-sm leading-relaxed">
                Workspace terpadu untuk mahasiswa Indonesia. Rapikan jadwal kuliah, deadline tugas, kepanitiaan organisasi, dan rangkum portofolio dalam satu tempat yang hening dan teratur.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#708075] pt-2">
                <span>Created with</span>
                <Heart size={14} className="fill-rose-500 text-rose-500" />
                <span>by</span>
                <a
                  href="https://www.instagram.com/gusrchmd_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#f5f8f5] px-2.5 py-1 font-bold text-[#10261b] border border-[#dbe5dc] hover:bg-[#dff3e5] hover:text-[#0f6849] transition"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#e1306c]"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  @gusrchmd_
                </a>
              </div>
            </div>

            {/* Navigation Column */}
            <div>
              <p className="font-display font-bold text-xs uppercase tracking-wider text-[#10261b]">
                Eksplorasi
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-[#55675b]">
                <li><a href="#features" className="hover:text-[#0f6849] transition">Fitur Utama</a></li>
                <li><a href="#how-it-works" className="hover:text-[#0f6849] transition">Alur Kerja</a></li>
                <li><a href="#faq" className="hover:text-[#0f6849] transition">Pertanyaan Umum (FAQ)</a></li>
              </ul>
            </div>

            {/* App Actions Column */}
            <div>
              <p className="font-display font-bold text-xs uppercase tracking-wider text-[#10261b]">
                Akses Workspace
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-[#55675b]">
                <li><Link href="/login" className="hover:text-[#0f6849] transition">Masuk Akun</Link></li>
                <li><Link href="/register" className="hover:text-[#0f6849] transition font-bold text-[#0f6849]">Daftar Gratis</Link></li>
                <li className="pt-2">
                  <PwaInstallButton
                    variant="navbar"
                    className="border border-[#0f6849]/20 bg-[#0f6849]/5 text-[#0f6849] hover:bg-[#0f6849]/15 text-xs py-1.5 px-3"
                  />
                </li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-[#708075]">
            <p>© {new Date().getFullYear()} nGampUS — Ruang Belajar & Ambisi Mahasiswa Indonesia.</p>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#0f6849]" />
                Sistem Aktif & Terenkripsi RLS
              </span>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
