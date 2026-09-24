import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Check, 
  Clock3, 
  Layers3, 
  Target, 
  Zap, 
  Shield, 
  Heart, 
  Calendar, 
  Users, 
  Award, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { InteractivePreview } from "@/components/landing/interactive-preview";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { WorkflowTimeline } from "@/components/landing/workflow-timeline";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { StandaloneRedirectGuard } from "@/components/pwa/standalone-redirect-guard";


export default function Home() {
  const tickerItems = [
    { text: "RUANG KULIAH TERTATA", dot: "#d9684e" },
    { text: "AI STUDY COMPANION & MODUL", dot: "#c8ef70" },
    { text: "RITME ORGANISASI JELAS", dot: "#0f6849" },
    { text: "DEADLINE TERKONTROL", dot: "#d1ae2c" },
    { text: "EXPORT KALENDER (.ICS)", dot: "#22c55e" },
    { text: "REKAP PORTOFOLIO CV", dot: "#7b6cee" },
    { text: "BUILT FOR INDONESIAN STUDENTS", dot: "#103626" },
  ];

  return (
    <main className="atlas-page landing-page min-h-screen bg-[#f7f8f5] text-[#10261b]">
      <StandaloneRedirectGuard />

      {/* ── STICKY FLOATING NAVBAR (Page-Wide) ── */}
      <div className="fixed top-3 sm:top-4 inset-x-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <LandingNavbar />
        </div>
      </div>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="atlas-hero relative min-h-screen bg-[#103626] px-4 pb-16 pt-20 sm:pt-24 text-[#f6f8f1] sm:px-8 sm:pb-20 lg:px-12 overflow-hidden w-full">

        {/* Ambient grain */}
        <div className="atlas-grain absolute inset-0 opacity-25 pointer-events-none" />

        {/* Floating gradient orbs */}
        <div 
          className="orb-float-1 pointer-events-none absolute right-[5%] top-[12%] h-80 w-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(200,239,112,.24), transparent 65%)", filter: "blur(4px)" }}
        />
        <div 
          className="orb-float-2 pointer-events-none absolute left-[2%] top-[52%] h-56 w-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(15,104,73,.22), transparent 65%)", filter: "blur(2px)" }}
        />
        <div 
          className="orb-float-3 pointer-events-none absolute right-[25%] bottom-[8%] h-44 w-44 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(200,239,112,.15), transparent 65%)", filter: "blur(3px)" }}
        />

        {/* Hero Content Grid */}
        <div className="relative z-10 mx-auto w-full min-w-0 grid max-w-7xl gap-8 sm:gap-12 pb-8 pt-4 sm:pt-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:pt-12">

          {/* Left Column — Sharp Copywriting */}
          <div className="w-full min-w-0">
            {/* Live Status Pill */}
            <div className="hero-stagger-2 inline-flex max-w-full items-center gap-2 sm:gap-2.5 rounded-full border border-[#c8ef70]/30 bg-[#c8ef70]/10 px-3 py-1.5 text-[10px] sm:text-xs font-black tracking-wider text-[#d8f89a]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8ef70] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c8ef70]" />
              </span>
              <span className="truncate sm:whitespace-normal">v2.4 LIVE • BUILT FOR INDONESIAN STUDENTS</span>
            </div>

            {/* Display Headline */}
            <h1 className="hero-stagger-3 font-display mt-5 sm:mt-6 text-3xl sm:text-5xl md:text-6xl lg:text-[4.6rem] font-black leading-[1] sm:leading-[.95] tracking-[-.05em] sm:tracking-[-.065em]">
              Kuliah jalan.<br />
              <span className="text-[#c8ef70]">Ambis organisasi</span><br />
              tetap terarah.
            </h1>

            {/* Sub-headline */}
            <p className="hero-stagger-4 mt-4 sm:mt-6 text-sm sm:text-base md:text-lg leading-relaxed text-[#c6d7cc]">
              Lupakan grup WhatsApp berantakan, catatan tercecer, dan deadline tugas yang tiba-tiba menumpuk. nGampUS menyatukan jadwal kuliah, proker organisasi, dan portofolio CV dalam satu workspace cerdas.
            </p>

            {/* CTA Buttons */}
            <div className="hero-stagger-5 mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link 
                href="/register" 
                className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-[#c8ef70] px-6 py-3.5 sm:py-4 text-sm sm:text-base font-black text-[#103626] shadow-xl shadow-black/25 transition-all hover:-translate-y-1 hover:bg-[#d5f685] hover:shadow-2xl active:scale-98"
              >
                <span className="truncate">Mulai Petakan Semestermu</span> <ArrowRight size={18} className="shrink-0" />
              </Link>
              <PwaInstallButton
                variant="hero"
                className="w-full sm:w-auto justify-center"
              />
            </div>

            {/* Hero Quick Proof Points */}
            <div className="hero-stagger-6 mt-8 sm:mt-10 flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-white/10 pt-4 sm:pt-5 text-xs text-[#b2c7ba]">
              <span className="flex items-center gap-1.5">
                <Check size={16} className="text-[#c8ef70]" /> 100% Gratis Selamanya
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={16} className="text-[#c8ef70]" /> Database Terisolasi RLS
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-[#c8ef70]" /> Setup Cepat 2 Menit
              </span>
            </div>
          </div>

          {/* Right Column — Live Interactive Preview */}
          <div className="hero-stagger-4 relative w-full min-w-0 overflow-hidden pt-4 lg:pt-0">
            <InteractivePreview />
          </div>

        </div>

      </section>

      {/* ── TICKER STRIP ────────────────────────────────────────── */}
      <div className="atlas-ticker overflow-hidden border-y border-[#d3ddd4] bg-[#eff3ed] py-4 max-w-full">
        <div className="flex min-w-max items-center gap-8 text-xs sm:text-sm font-black tracking-[.15em] text-[#103626]">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="flex items-center gap-8">
              <span>{item.text}</span>
              <i className="h-2 w-2 rounded-full shrink-0" style={{ background: item.dot }} />
            </span>
          ))}
        </div>
      </div>

      {/* ── BENTO GRID SECTION: CORE WORKSPACE SYSTEM ──────────── */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24 lg:px-12 scroll-mt-20">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0f6849]/20 bg-[#dff3e5] px-3.5 py-1 text-xs font-black tracking-wider text-[#0f6849]">
              FITUR UTAMA
            </div>
            <h2 className="font-display mt-4 text-3xl sm:text-5xl font-black tracking-tight text-[#103626] leading-tight">
              Bukan sekadar to-do list.<br />
              Satu tempat untuk semua urusan kuliah & organisasi.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#55675b]">
              Dibuat karena masalah nyata anak kuliah: info tugas hilang di tumpukan chat WhatsApp, dan jadwal rapat himpunan bentrok dengan jam kelas.
            </p>
          </div>
        </Reveal>

        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* Bento Card 1: Jadwal Kuliah & Link Pertemuan (Wide 2 Cols) */}
          <Reveal className="md:col-span-2">
            <div className="group relative overflow-hidden rounded-3xl sm:rounded-[2rem] border border-[#d8e3da] bg-white p-5 sm:p-8 lg:p-9 shadow-sm transition hover:shadow-xl hover:border-[#b4d2bd]">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849]">
                  <Calendar size={24} />
                </span>
                <span className="font-mono text-xs font-black text-[#75887b] uppercase tracking-wider">
                  01 / Smart Schedule
                </span>
              </div>

              <div className="mt-6 max-w-md">
                <h3 className="font-display text-2xl font-black text-[#103626] tracking-tight">
                  Jadwal Kuliah dengan 1-Click Link Pertemuan & Export .ICS
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#55675b]">
                  Tautkan link Zoom, Google Meet, dan Google Drive materi kuliah langsung ke mata kuliah terkait. Dilengkapi filter hari pintar dan fitur export ke Google Calendar / Apple Calendar.
                </p>
              </div>

              {/* Realistic Mockup UI Snippet */}
              <div className="mt-8 rounded-2xl border border-[#e2eae3] bg-[#f9faf8] p-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-[#e5ece5] pb-2.5 text-xs font-bold text-[#55675b]">
                  <div className="flex items-center gap-2">
                    <span>HARI SENIN</span>
                    <span className="rounded-full bg-[#103626] px-2 py-0.2 text-[9px] font-black text-[#c8ef70]">HARI INI</span>
                  </div>
                  <span className="text-[#0f6849] font-bold">2 Kelas Tersedia</span>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white p-3 border border-[#d8e3da]">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      08:00 - 09:40 WIB
                    </span>
                    <h5 className="font-display font-bold text-sm text-[#10261b] mt-1">
                      Algoritma & Pemrograman Lanjut (3 SKS)
                    </h5>
                    <p className="text-xs text-[#6e7f74]">Lab Komputer B • Dr. Ir. Gunawan</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#103626] px-3 py-1.5 text-xs font-bold text-[#c8ef70]">
                      Masuk Kelas
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#eff4ef] px-3 py-1.5 text-xs font-bold text-[#3d5244]">
                      Materi & Modul
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 2: Smart Deadline Radar (1 Col) */}
          <Reveal delay={1}>
            <div className="group relative h-full flex flex-col justify-between overflow-hidden rounded-3xl sm:rounded-[2rem] border border-[#d8e3da] bg-white p-5 sm:p-8 shadow-sm transition hover:shadow-xl hover:border-[#b4d2bd]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#feeae5] text-[#e57255]">
                    <Clock3 size={24} />
                  </span>
                  <span className="font-mono text-xs font-black text-[#75887b] uppercase tracking-wider">
                    02 / Radar
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="font-display text-xl font-black text-[#103626] tracking-tight">
                    Smart Deadline Radar
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#55675b]">
                    Tugas diurutkan otomatis berdasarkan urgensi. Peringatan visual warna merah untuk H-1 dan H-2.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2.5 rounded-2xl border border-[#feeae5] bg-[#fffbfb] p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#c73b18]">Tugas Analisis Pasar</span>
                  <span className="rounded bg-[#c73b18] px-1.5 py-0.5 text-[9px] font-black text-white">BESOK</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#fce0d8] overflow-hidden">
                  <div className="h-full rounded-full bg-[#e57255]" style={{ width: "90%" }} />
                </div>
                <p className="text-[11px] text-[#7d5045]">Pengumpulan: Besok 23:59 WIB</p>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 3: Modul Kuliah & AI Study Companion (Wide 2 Cols) */}
          <Reveal delay={2} className="md:col-span-2">
            <div className="group relative overflow-hidden rounded-3xl sm:rounded-[2rem] border border-[#d8e3da] bg-white p-5 sm:p-8 lg:p-9 shadow-sm transition hover:shadow-xl hover:border-[#b4d2bd]">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#c8ef70]/25 text-[#103626]">
                  <Sparkles size={24} className="text-[#0f6849]" />
                </span>
                <span className="font-mono text-xs font-black text-[#75887b] uppercase tracking-wider">
                  03 / Modul & AI Study Companion
                </span>
              </div>

              <div className="mt-6 max-w-md">
                <h3 className="font-display text-2xl font-black text-[#103626] tracking-tight">
                  Manajemen Modul P1-P16 & Tanya AI Instan
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#55675b]">
                  Kelompokkan slide kuliah, catatan, dan link drive per pertemuan (P1–P16). Bingung konsep kuliah yang rumit? Cukup klik <strong>Tanya AI</strong> untuk rangkuman dan tanya jawab langsung.
                </p>
              </div>

              {/* Mockup AI Discussion */}
              <div className="mt-8 rounded-2xl border border-[#d8e3da] bg-[#fafbfa] p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#e5ece5] pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#0f6849]">P5: Kompleksitas Algoritma (Big-O)</span>
                    <span className="rounded bg-[#dff3e5] px-2 py-0.2 text-[9px] font-extrabold text-[#0f6849]">Selesai Dibaca</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#65746a]">Slide PDF & Catatan</span>
                </div>
                <div className="rounded-xl bg-white p-3 border border-[#e2eae3] text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-[#103626]">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-[#103626] text-[#c8ef70] text-[8px]">AI</span>
                    <span>Asisten AI Modul:</span>
                  </div>
                  <p className="text-[11px] text-[#55675b] leading-relaxed">
                    "Intinya, O(1) konstan, O(n) linier bertambah sesuai input, dan O(n²) biasanya terjadi pada nested loop. Mau kita bedah contoh kode pengujiannya?"
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 4: Organisasi & Proker (1 Col) */}
          <Reveal delay={2}>
            <div className="group relative h-full flex flex-col justify-between overflow-hidden rounded-3xl sm:rounded-[2rem] border border-[#d8e3da] bg-white p-5 sm:p-8 shadow-sm transition hover:shadow-xl hover:border-[#b4d2bd]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e5f1fa] text-[#2978ba]">
                    <Users size={24} />
                  </span>
                  <span className="font-mono text-xs font-black text-[#75887b] uppercase tracking-wider">
                    04 / Struktur
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="font-display text-xl font-black text-[#103626] tracking-tight">
                    Organisasi & Proker
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#55675b]">
                    Pantau jabatan di BEM, Himpunan, atau UKM. Pecah program kerja menjadi timeline kegiatan terukur.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#dce8f3] bg-[#f7fbfe] p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1e5887]">BEM Univ • Divisi Riset</span>
                  <span className="text-[10px] font-extrabold text-[#2978ba]">Ketua</span>
                </div>
                <div className="rounded-lg bg-white p-2 border border-[#dce8f3] text-xs font-medium text-[#3b5569]">
                  📌 Survei Aspirasi Mahasiswa (Progress: 75%)
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 5: Portofolio & CV Otomatis (Wide 3 Cols) */}
          <Reveal delay={3} className="md:col-span-3">
            <div className="group relative overflow-hidden rounded-3xl sm:rounded-[2rem] border border-[#d8e3da] bg-white p-5 sm:p-8 lg:p-9 shadow-sm transition hover:shadow-xl hover:border-[#b4d2bd]">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f0ecfc] text-[#644fe2]">
                  <Award size={24} />
                </span>
                <span className="font-mono text-xs font-black text-[#75887b] uppercase tracking-wider">
                  05 / Portofolio Auto-Curated
                </span>
              </div>

              <div className="mt-6 max-w-xl">
                <h3 className="font-display text-2xl font-black text-[#103626] tracking-tight">
                  Ubah Riwayat Proker Menjadi CV ATS-Ready
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#55675b]">
                  Setiap kali kamu menyelesaikan proker atau proyek kuliah, nGampUS merangkumnya menjadi poin-poin pencapaian bernilai tinggi siap ekspor untuk resume beasiswa atau magang.
                </p>
              </div>

              {/* Mockup Resume Row */}
              <div className="mt-8 grid sm:grid-cols-2 gap-3 rounded-2xl border border-[#e3dff5] bg-[#faf9fe] p-4">
                <div className="rounded-xl bg-white p-3.5 border border-[#e3dff5]">
                  <span className="text-[10px] font-black uppercase text-[#644fe2]">PENGALAMAN ORGANISASI</span>
                  <h6 className="font-bold text-sm text-[#10261b] mt-1">Project Officer — Tech Seminar 2025</h6>
                  <p className="text-xs text-[#675775] mt-1">Mengelola 20 panitia dan menjaring 450+ peserta aktif.</p>
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-[#e3dff5]">
                  <span className="text-[10px] font-black uppercase text-[#0f6849]">PROYEK KULIAH</span>
                  <h6 className="font-bold text-sm text-[#10261b] mt-1">Aplikasi Web E-Commerce Mahasiswa</h6>
                  <p className="text-xs text-[#675775] mt-1">Next.js & Supabase • Nilai Akhir A (4.00).</p>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ── THE ATLAS METHOD (HOW IT WORKS) ────────────────────── */}
      <section id="how-it-works" className="border-t border-[#d8e3da] bg-[#f0f4ed] px-4 py-16 sm:px-8 sm:py-24 lg:px-12 scroll-mt-20">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-black tracking-widest text-[#0f6849] uppercase">
                4-STEP WORKFLOW
              </span>
              <h2 className="font-display mt-3 text-3xl sm:text-5xl font-black tracking-tight text-[#103626]">
                Alur Kerja yang Menjaga Pikiran Tetap Jernih
              </h2>
              <p className="mt-4 text-base text-[#526357]">
                Dari kekacauan awal semester menuju ritme harian yang teratur dan terukur. Klik tiap tahap untuk melihat visualisasinya.
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
            <span className="text-xs font-black tracking-widest text-[#0f6849] uppercase">
              PERTANYAAN UMUM
            </span>
            <h2 className="font-display mt-3 text-3xl sm:text-5xl font-black tracking-tight text-[#103626]">
              Semua yang Perlu Kamu Tahu
            </h2>
            <p className="mt-3 text-base text-[#59695d]">
              Transparan, aman, dan tanpa biaya tersembunyi.
            </p>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <FaqAccordion />
        </Reveal>
      </section>

      {/* ── BIG CTA SECTION ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-8 sm:pb-24 lg:px-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-[#103626] px-5 py-10 sm:px-12 sm:py-20 text-white shadow-2xl">
            {/* Ambient decorative circles */}
            <div className="cta-ring-spin pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border-[36px] border-[#c8ef70]/10 opacity-70" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full border-[28px] border-[#c8ef70]/05 opacity-50" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#c8ef70]/30 bg-white/5 px-4 py-1.5 text-xs font-black tracking-wider text-[#d8f89a] mb-6">
                  <Sparkles size={14} className="text-[#c8ef70]" />
                  MULAI HARI INI SECARA GRATIS
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-black leading-tight tracking-tight">
                  Jangan biarkan semester ini berlalu dalam kepanikan.
                </h2>
                <p className="mt-5 text-base sm:text-lg text-[#c5d6ca] leading-relaxed max-w-xl">
                  Bangun workspace nGampUS milikmu sekarang. Hanya butuh 2 menit untuk menata jadwal, tugas, dan ambisi besarmu.
                </p>
              </div>

              <div className="lg:justify-self-end flex flex-col items-start lg:items-end gap-4">
                <Link 
                  href="/register" 
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-[#c8ef70] px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-black text-[#103626] shadow-[0_6px_0_#82a737] sm:shadow-[0_8px_0_#82a737] transition-all hover:-translate-y-1 hover:bg-[#d6f888]"
                >
                  Buat Ruangmu Sekarang <ArrowRight size={20} />
                </Link>
                <span className="text-xs font-semibold text-[#8ab09a]">
                  ✦ 100% Gratis • Tanpa Kartu Kredit • Setup 2 Menit
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-[#d3ddd4] bg-[#eff3ed]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-12 lg:px-12">
          <div className="grid gap-10 md:grid-cols-4 pb-10 border-b border-[#d8e3da]">
            
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5 font-display text-2xl font-black tracking-tight text-[#103626]">
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
                Workspace terpadu untuk mahasiswa Indonesia. Rapikan jadwal kuliah, deadline tugas, kepanitiaan organisasi, dan rangkum portofolio dalam satu tempat yang praktis.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#526357] pt-2">
                <span>Created with</span>
                <Heart size={14} className="fill-[#e11d48] text-[#e11d48]" />
                <span>by</span>
                <a
                  href="https://www.instagram.com/gusrchmd_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 font-bold text-[#103626] ring-1 ring-[#d3ddd4] hover:bg-[#eaf5eb] hover:text-[#0f6849] transition"
                >
                  <svg
                    width="14"
                    height="14"
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
              <p className="font-display font-black text-xs uppercase tracking-wider text-[#103626]">
                Eksplorasi
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-[#55675b]">
                <li><a href="#features" className="hover:text-[#0f6849] transition">Fitur Utama</a></li>
                <li><a href="#how-it-works" className="hover:text-[#0f6849] transition">Cara Kerja</a></li>
                <li><a href="#faq" className="hover:text-[#0f6849] transition">FAQ</a></li>
              </ul>
            </div>

            {/* App Actions Column */}
            <div>
              <p className="font-display font-black text-xs uppercase tracking-wider text-[#103626]">
                Akses Workspace
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-[#55675b]">
                <li><Link href="/login" className="hover:text-[#0f6849] transition">Masuk Akun</Link></li>
                <li><Link href="/register" className="hover:text-[#0f6849] transition font-bold text-[#0f6849]">Daftar Gratis</Link></li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-[#708075]">
            <p>© {new Date().getFullYear()} nGampUS. All rights reserved.</p>
            <p className="font-mono text-[11px]">Security Hardened • OWASP Compliant</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
