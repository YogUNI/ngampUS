import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  ArrowDown,
  Sparkles,
  Heart
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { HeroRemotionPlayer } from "@/components/landing/hero-remotion-player";
import { ProofStrip } from "@/components/landing/proof-strip";
import { MediaCoverage } from "@/components/landing/media-coverage";
import { BeforeAfter } from "@/components/landing/before-after";
import { BentoFeatures } from "@/components/landing/bento-features";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { WorkflowTimeline } from "@/components/landing/workflow-timeline";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { StandaloneRedirectGuard } from "@/components/pwa/standalone-redirect-guard";

export default function Home() {
  return (
    <main className="landing-page min-h-screen bg-[#0a1f16] text-[#F4F1EA] selection:bg-[#C6F432]/30 selection:text-[#0a1f16]">
      <StandaloneRedirectGuard />

      {/* ── STICKY FLOATING NAVBAR ── */}
      <div className="fixed top-3 sm:top-4 inset-x-3 sm:inset-x-6 lg:inset-x-8 z-50 pointer-events-none flex justify-center">
        <div className="w-full max-w-7xl pointer-events-auto">
          <LandingNavbar />
        </div>
      </div>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col justify-end pt-20 sm:pt-24 lg:pt-24 pb-8 sm:pb-10 lg:pb-0 px-4 sm:px-8 lg:px-12 w-full overflow-hidden border-b border-white/10 bg-[#0a1f16] text-[#F4F1EA]">
        {/* Subtle Dark Emerald Radial Ambience */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-radial from-[#12332a]/70 via-[#0a1f16]/40 to-transparent blur-3xl opacity-70"
        />

        <div className="relative mx-auto w-full max-w-7xl flex-1 flex flex-col justify-end">
          <div className="grid gap-8 lg:gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-end w-full min-w-0">
            
            {/* Left Column: Sharp Editorial Copy */}
            <div className="max-w-2xl w-full min-w-0 pb-8 sm:pb-12 lg:pb-16 my-auto lg:my-0">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C6F432]/30 bg-[#12332a] px-3.5 py-1.5 text-xs font-mono font-bold text-[#C6F432] shadow-xs">
                <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
                <span>Ruang Belajar & Ambisi Mahasiswa Indonesia</span>
              </div>

              {/* Display Headline */}
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
            <div className="w-full min-w-0 flex justify-center lg:justify-end lg:self-end">
              <HeroRemotionPlayer />
            </div>

          </div>
        </div>
      </section>

      {/* ── PROOF STRIP ─────────────────────────────────────────── */}
      <ProofStrip />

      {/* ── SOROTAN MEDIA & FAKTA LAPANGAN ──────────────────────── */}
      <MediaCoverage />

      {/* ── BEFORE / AFTER ──────────────────────────────────────── */}
      <BeforeAfter />

      {/* ── BENTO GRID FITUR ────────────────────────────────────── */}
      <BentoFeatures />

      {/* ── WORKFLOW TIMELINE SECTION ───────────────────────────── */}
      <section 
        id="how-it-works" 
        aria-label="Alur 3 Langkah Kerja ngampUS"
        className="relative border-b border-white/10 bg-[#0d261e] py-16 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-12 text-[#F4F1EA] scroll-mt-20 overflow-hidden"
      >
        <div 
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-radial from-[#12332a]/50 via-transparent to-transparent blur-3xl opacity-50"
        />

        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#12332a] px-3.5 py-1 text-xs font-mono font-bold text-[#C6F432]">
                <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
                <span>ALUR MAHASISWA</span>
              </div>
              <h2 className="font-display mt-3 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Tiga langkah sederhana, dari kuliah hingga CV magang.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#F4F1EA]/70 leading-relaxed font-normal">
                Bebas dari kepanikan semalam suntuk. Seluruh aktivitas perkuliahanmu langsung terhubung ke portofolio yang siap pakai.
              </p>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <WorkflowTimeline />
          </Reveal>
        </div>
      </section>

      {/* ── FAQ SECTION (Harmonized Gradient Palette + Real Photo Card) ── */}
      <section 
        id="faq" 
        aria-label="Pertanyaan Umum Seputar ngampUS"
        className="relative border-b border-white/10 bg-gradient-to-b from-[#081811] via-[#0d281e] to-[#081811] py-18 sm:py-24 px-4 sm:px-8 lg:px-12 text-[#F4F1EA] scroll-mt-20 overflow-hidden"
      >
        <div 
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-0 h-[500px] w-[500px] rounded-full bg-radial from-[#12332a]/60 via-transparent to-transparent blur-3xl opacity-50"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Headline & Framed Campus Discussion Photo */}
            <div className="lg:col-span-5">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#12332a] px-3.5 py-1 text-xs font-mono font-bold text-[#C6F432]">
                  <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
                  <span>JAWABAN LENGKAP // FAQ</span>
                </div>
                <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  Semua hal yang perlu kamu ketahui.
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[#F4F1EA]/70 leading-relaxed font-normal">
                  Transparan, aman, dan tanpa biaya langganan apa pun seumur hidup.
                </p>

                {/* Framed Real Student Photo Card */}
                <div className="mt-8 relative h-60 w-full rounded-3xl overflow-hidden border border-white/15 shadow-xl hidden lg:block">
                  <Image
                    src="/images/landing/faq-student.jpg"
                    alt="Suasana diskusi mahasiswa di ruang kuliah modern"
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f16] via-[#0a1f16]/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-[#0d261e]/90 border border-white/15 p-3.5 backdrop-blur-md">
                    <p className="font-display text-xs font-bold text-white">
                      Dibangun oleh mahasiswa, untuk mahasiswa.
                    </p>
                    <p className="text-[11px] text-[#F4F1EA]/70 font-mono mt-0.5">
                      Memahami betul rasanya panik di minggu-minggu akhir semester.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Column: Sleek Accordion */}
            <div className="lg:col-span-7">
              <Reveal delay={1}>
                <FaqAccordion />
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA SECTION (Cinematic Banner with Authentic Photo Touch) ── */}
      <section className="relative border-b border-white/10 bg-[#081811] py-18 sm:py-24 px-4 sm:px-8 lg:px-12 text-white overflow-hidden">
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-[#C6F432]/30 bg-gradient-to-br from-[#12332a] via-[#0d261e] to-[#071710] p-8 sm:p-14 lg:p-16 shadow-2xl">
              
              {/* Subtle Ambient Radial Flare */}
              <div 
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#C6F432]/15 blur-3xl"
              />

              <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#C6F432]/30 bg-[#0a1f16] px-3.5 py-1 text-xs font-mono font-bold text-[#C6F432] mb-5">
                    <Sparkles size={13} />
                    <span>MULAI HARI INI SECARA GRATIS</span>
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
                    Jangan biarkan semester ini berlalu dalam kepanikan.
                  </h2>
                  <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#F4F1EA]/80 leading-relaxed max-w-xl font-normal">
                    Bangun ruang belajarmu di ngampUS sekarang. Hanya butuh 2 menit untuk menata jadwal, tugas, dan target perkuliahanmu.
                  </p>
                </div>

                <div className="lg:justify-self-end flex flex-col items-start lg:items-end gap-3.5">
                  <Link 
                    href="/register" 
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-[#C6F432] px-8 py-4 text-sm sm:text-base font-bold text-[#0a1f16] shadow-xl shadow-[#C6F432]/20 transition-all hover:brightness-110 active:scale-98"
                  >
                    <span>Buat Ruang Kuliahmu</span>
                    <ArrowRight size={18} />
                  </Link>
                  <span className="text-xs font-mono text-[#F4F1EA]/60">
                    ✦ 100% Gratis • Tanpa Kartu Kredit • Setup 2 Menit
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER (Deep Midnight Emerald Finish) ── */}
      <footer className="bg-[#040e09] text-[#F4F1EA]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="grid gap-10 md:grid-cols-4 pb-12 border-b border-white/10">
            
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5 font-display text-2xl font-black tracking-tight text-white">
                <Image
                  src="/logo_ngampUS.png"
                  alt="ngampUS Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <span>
                  ngamp<span className="text-[#C6F432]">US</span>
                </span>
              </Link>
              <p className="text-sm text-[#F4F1EA]/65 max-w-sm leading-relaxed">
                Workspace terpadu untuk mahasiswa Indonesia. Rapikan jadwal kuliah, deadline tugas, kepanitiaan organisasi, dan rangkum portofolio dalam satu tempat yang hening dan teratur.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F4F1EA]/60 pt-2">
                <span>Created with</span>
                <Heart size={14} className="fill-rose-500 text-rose-500" />
                <span>by</span>
                <a
                  href="https://www.instagram.com/gusrchmd_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 font-bold text-white border border-white/15 hover:bg-[#C6F432] hover:text-[#0a1f16] transition"
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
              <p className="font-display font-bold text-xs uppercase tracking-wider text-white">
                Eksplorasi
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-[#F4F1EA]/65">
                <li><a href="#features" className="hover:text-[#C6F432] transition">Fitur Utama</a></li>
                <li><a href="#how-it-works" className="hover:text-[#C6F432] transition">Alur Kerja</a></li>
                <li><a href="#media-coverage" className="hover:text-[#C6F432] transition">Sorotan Berita</a></li>
                <li><a href="#faq" className="hover:text-[#C6F432] transition">Pertanyaan Umum (FAQ)</a></li>
              </ul>
            </div>

            {/* App Actions Column */}
            <div>
              <p className="font-display font-bold text-xs uppercase tracking-wider text-white">
                Akses Workspace
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-[#F4F1EA]/65">
                <li><Link href="/login" className="hover:text-[#C6F432] transition">Masuk Akun</Link></li>
                <li><Link href="/register" className="hover:text-[#C6F432] transition font-bold text-[#C6F432]">Daftar Gratis</Link></li>
                <li className="pt-2">
                  <PwaInstallButton
                    variant="navbar"
                    className="border border-[#C6F432]/30 bg-[#C6F432]/10 text-[#C6F432] hover:bg-[#C6F432] hover:text-[#0a1f16] text-xs py-1.5 px-3"
                  />
                </li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-[#F4F1EA]/50">
            <p>© {new Date().getFullYear()} nGampUS — Ruang Belajar & Ambisi Mahasiswa Indonesia.</p>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-[#C6F432]">
                <span className="h-2 w-2 rounded-full bg-[#C6F432]" />
                Sistem Aktif & Terenkripsi RLS
              </span>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
