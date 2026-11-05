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
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { WorkflowTimeline } from "@/components/landing/workflow-timeline";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { StandaloneRedirectGuard } from "@/components/pwa/standalone-redirect-guard";

export default function Home() {
  return (
    <main className="landing-page min-h-screen overflow-x-hidden bg-[#fafaf7] text-[#10261b] selection:bg-[#C6F432]/30 selection:text-[#0a1f16]">
      <StandaloneRedirectGuard />

      {/* ── STICKY FLOATING NAVBAR ── */}
      <div className="fixed top-3 sm:top-4 inset-x-3 sm:inset-x-6 lg:inset-x-8 z-50 pointer-events-none flex justify-center">
        <div className="w-full max-w-7xl pointer-events-auto">
          <LandingNavbar />
        </div>
      </div>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-12 w-full overflow-hidden border-b border-white/10 bg-[#0a1f16] text-[#F4F1EA]">
        {/* Subtle Dark Emerald Radial Ambience */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-radial from-[#12332a]/70 via-[#0a1f16]/40 to-transparent blur-3xl opacity-70"
        />

        <div className="relative mx-auto w-full max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center w-full min-w-0">
            
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
              <h1 className="font-display mt-6 text-3xl sm:text-5xl lg:text-[4.2rem] font-black leading-[1.08] tracking-tight text-[#F4F1EA] text-balance">
                Tugas numpuk.<br />
                Jadwal bentrok.<br />
                <span className="text-[#C6F432]">Grup WA 999+.</span>
              </h1>

              {/* Subcopy */}
              <p className="mt-5 text-sm sm:text-lg leading-relaxed text-[#F4F1EA]/75 text-pretty max-w-xl font-normal">
                ngampUS merapikan semuanya di satu tempat: jadwal kuliah, deadline, organisasi, sampai CV magang.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#C6F432] px-6 py-3.5 sm:px-7 sm:py-4 text-sm sm:text-base font-bold text-[#0a1f16] shadow-md shadow-[#C6F432]/20 transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  <span>Mulai Gratis</span>
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-[#12332a] px-6 py-4 text-sm font-bold text-[#F4F1EA] transition-all hover:bg-white/10 active:scale-[0.98]"
                >
                  <span>Lihat cara kerjanya</span>
                  <ArrowDown size={16} className="text-[#C6F432]" />
                </a>
              </div>

              {/* Trust & Proof Signals */}
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 font-mono text-xs text-[#F4F1EA]/60">
                <span>Gratis selamanya</span>
                <span className="text-white/20">·</span>
                <span>Setup 2 menit</span>
                <span className="text-white/20">·</span>
                <span>Tanpa iklan</span>
              </div>
            </div>

            {/* Right Column: Remotion Showcase Motion Player */}
            <div className="w-full min-w-0">
              <HeroRemotionPlayer />
            </div>

          </div>
        </div>
      </section>

      {/* ── HIGHLIGHT PILLARS (Clean Editorial Stat Bar) ─────────── */}
      <section className="bg-white border-b border-[#e5ece5] py-8 sm:py-10 px-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="border-l-2 border-[#0f6849] pl-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#708075]">Pintar & Terpadu</p>
              <h4 className="font-display text-lg sm:text-xl font-black text-[#10261b] mt-0.5">Jadwal Kuliah .ICS</h4>
              <p className="text-xs text-[#55675b] mt-1 leading-snug">Sinkronkan ke Google Calendar & Apple Calendar 1-klik.</p>
            </div>
            <div className="border-l-2 border-[#0f6849] pl-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#708075]">Radar Otomatis</p>
              <h4 className="font-display text-lg sm:text-xl font-black text-[#10261b] mt-0.5">Deadline H-1 & H-2</h4>
              <p className="text-xs text-[#55675b] mt-1 leading-snug">Prioritas visual cerdas agar tak ada tugas yang terlewat.</p>
            </div>
            <div className="border-l-2 border-[#0f6849] pl-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#708075]">Study Assistant</p>
              <h4 className="font-display text-lg sm:text-xl font-black text-[#10261b] mt-0.5">Modul P1–P16 & AI</h4>
              <p className="text-xs text-[#55675b] mt-1 leading-snug">Tanya jawab materi kuliah rumit langsung pada bab pertemuan.</p>
            </div>
            <div className="border-l-2 border-[#0f6849] pl-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#708075]">Siap Karir</p>
              <h4 className="font-display text-lg sm:text-xl font-black text-[#10261b] mt-0.5">Portofolio & CV ATS</h4>
              <p className="text-xs text-[#55675b] mt-1 leading-snug">Rangkum proker & proyek kuliah jadi resume magang instan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENTO GRID SECTION: CORE WORKSPACE SYSTEM ──────────── */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24 lg:px-12 scroll-mt-20">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dff3e5] px-3.5 py-1 text-xs font-bold text-[#0f6849]">
              <Sparkles size={13} />
              LIMA PILAR EKOSISTEM MAHASISWA
            </span>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#10261b] leading-tight">
              Satu ruang kerja untuk seluruh ritme kuliah dan organisasi.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#55675b] leading-relaxed">
              Bukan sekadar aplikasi catatan biasa. nGampUS dirancang khusus untuk realitas mahasiswa Indonesia: jadwal kelas praktikum, pembagian tugas kelompok, proker organisasi, hingga rekap portofolio magang.
            </p>
          </div>
        </Reveal>

        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* Bento Card 1: Jadwal Kuliah & Link Kelas (Wide 2 Cols) */}
          <Reveal className="md:col-span-2">
            <div className="group relative h-full flex flex-col justify-between overflow-hidden rounded-3xl border border-[#dce5dd] bg-white p-6 sm:p-8 shadow-xs transition-all hover:shadow-md hover:border-[#0f6849]/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849]">
                    <Calendar size={22} />
                  </span>
                  <span className="font-mono text-xs font-bold text-[#708075] uppercase tracking-wider">
                    01 / Jadwal Cerdas
                  </span>
                </div>

                <div className="mt-6 max-w-xl">
                  <h3 className="font-display text-2xl font-black text-[#10261b] tracking-tight">
                    Jadwal Kuliah Terhubung Ruang Kelas & Kalender Smartphone
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#55675b]">
                    Tautkan link Google Meet, Zoom, dan folder Google Drive materi kuliah langsung ke mata kuliah terkait. Dilengkapi filter hari cerdas dan export kalender (.ICS) ke perangkat ponselmu.
                  </p>
                </div>
              </div>

              {/* Realistic Mockup UI Snippet */}
              <div className="mt-8 rounded-2xl border border-[#edf2ee] bg-[#f9faf8] p-4">
                <div className="flex items-center justify-between border-b border-[#e5ece5] pb-2.5 text-xs font-bold text-[#55675b]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#10261b]">HARI SENIN</span>
                    <span className="rounded-full bg-[#0f6849] px-2 py-0.5 text-[9px] font-bold text-white">HARI INI</span>
                  </div>
                  <span className="text-[#0f6849] font-bold text-[11px]">2 Kelas Terjadwal • 5 SKS</span>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white p-3.5 border border-[#dce5dd]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      08:00 - 09:40 WIB
                    </span>
                    <h5 className="font-display font-bold text-sm text-[#10261b] mt-1">
                      Algoritma & Pemrograman Lanjut (3 SKS)
                    </h5>
                    <p className="text-xs text-[#708075]">Lab Komputer B • Dr. Ir. Gunawan</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-[#0f6849] px-3 py-1.5 text-xs font-bold text-white shadow-xs">
                      Buka Meet
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-[#f4f7f4] border border-[#dce5dd] px-3 py-1.5 text-xs font-semibold text-[#33463a]">
                      Materi Modul
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 2: Radar Deadline (1 Col) */}
          <Reveal delay={1}>
            <div className="group relative h-full flex flex-col justify-between overflow-hidden rounded-3xl border border-[#dce5dd] bg-white p-6 sm:p-8 shadow-xs transition-all hover:shadow-md hover:border-[#0f6849]/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-100 text-rose-800">
                    <Clock3 size={22} />
                  </span>
                  <span className="font-mono text-xs font-bold text-[#708075] uppercase tracking-wider">
                    02 / Radar Deadline
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="font-display text-xl font-black text-[#10261b] tracking-tight">
                    Radar Deadline Tugas
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#55675b]">
                    Tugas diurutkan otomatis dari yang paling mendesak. Peringatan visual warna merah untuk H-1 dan H-2 mencegah telat kumpul di portal akademik kampus.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2.5 rounded-2xl border border-rose-200 bg-rose-50/50 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-900">Laporan Praktikum Modul 4</span>
                  <span className="rounded bg-rose-200 px-1.5 py-0.5 text-[9px] font-bold text-rose-900">BESOK</span>
                </div>
                <div className="h-2 w-full rounded-full bg-rose-200 overflow-hidden">
                  <div className="h-full rounded-full bg-rose-600" style={{ width: "85%" }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-rose-800">
                  <span>Tenggat: Besok 23:59 WIB</span>
                  <span className="font-bold">Sisa 14 Jam</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 3: Modul & AI Study Companion (Wide 2 Cols) */}
          <Reveal delay={2} className="md:col-span-2">
            <div className="group relative h-full flex flex-col justify-between overflow-hidden rounded-3xl border border-[#dce5dd] bg-white p-6 sm:p-8 shadow-xs transition-all hover:shadow-md hover:border-[#0f6849]/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849]">
                    <Sparkles size={22} />
                  </span>
                  <span className="font-mono text-xs font-bold text-[#708075] uppercase tracking-wider">
                    03 / Arsip Modul & AI
                  </span>
                </div>

                <div className="mt-6 max-w-xl">
                  <h3 className="font-display text-2xl font-black text-[#10261b] tracking-tight">
                    Arsip Modul P1–P16 & AI Study Companion
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#55675b]">
                    Kelompokkan slide kuliah, catatan penting, dan tautan materi per pertemuan (P1–P16). Bingung konsep rumus atau algoritma rumit? Gunakan fitur <strong>Tanya AI</strong> untuk merangkum dan menguji pemahaman dengan kuis interaktif.
                  </p>
                </div>
              </div>

              {/* Mockup AI Discussion */}
              <div className="mt-8 rounded-2xl border border-[#edf2ee] bg-[#fafbfa] p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#e5ece5] pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0f6849]">P5: Kompleksitas Algoritma (Big-O)</span>
                    <span className="rounded bg-[#dff3e5] px-2 py-0.5 text-[9px] font-bold text-[#0f6849]">Selesai Dibaca</span>
                  </div>
                  <span className="text-[10px] text-[#708075]">Slide Pertemuan 5</span>
                </div>
                <div className="rounded-xl bg-white p-3 border border-[#edf2ee] text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#10261b]">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-[#0f6849] text-white text-[8px]">AI</span>
                    <span>Asisten Belajar Mahasiswa:</span>
                  </div>
                  <p className="text-[11px] text-[#55675b] leading-relaxed font-mono">
                    "O(1) konstan, O(n) linier mengikuti jumlah data, dan O(n²) umumnya terjadi saat perulangan bertingkat (nested loop). 3 kuis pemahaman siap dikerjakan."
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 4: Organisasi & Proker (1 Col) */}
          <Reveal delay={2}>
            <div className="group relative h-full flex flex-col justify-between overflow-hidden rounded-3xl border border-[#dce5dd] bg-white p-6 sm:p-8 shadow-xs transition-all hover:shadow-md hover:border-[#0f6849]/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e5f1fa] text-[#2978ba]">
                    <Users size={22} />
                  </span>
                  <span className="font-mono text-xs font-bold text-[#708075] uppercase tracking-wider">
                    04 / Organisasi & Proker
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="font-display text-xl font-black text-[#10261b] tracking-tight">
                    Organisasi & Proker
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#55675b]">
                    Pantau jabatan di BEM, Himpunan, atau UKM. Rinci program kerja menjadi timeline kegiatan terukur tanpa takut jadwal bentrok dengan kuliah.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#dce8f3] bg-[#f7fbfe] p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1e5887]">BEM Fakultas • Divisi Riset</span>
                  <span className="text-[10px] font-bold text-[#2978ba]">Ketua</span>
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-[#dce8f3] text-xs font-medium text-[#3b5569] flex items-center justify-between">
                  <span>📌 Survei Aspirasi Mahasiswa</span>
                  <span className="font-bold text-[#236098]">75% Siap</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 5: Portofolio & CV ATS (Full 3 Cols) */}
          <Reveal delay={3} className="md:col-span-3">
            <div className="group relative overflow-hidden rounded-3xl border border-[#dce5dd] bg-white p-6 sm:p-8 shadow-xs transition-all hover:shadow-md hover:border-[#0f6849]/30">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f1effd] text-[#644fe2]">
                  <Award size={22} />
                </span>
                <span className="font-mono text-xs font-bold text-[#708075] uppercase tracking-wider">
                  05 / Portofolio & Resume CV
                </span>
              </div>

              <div className="mt-6 max-w-xl">
                <h3 className="font-display text-2xl font-black text-[#10261b] tracking-tight">
                  Ubah Jejak Pencapaian Kuliah Menjadi CV ATS Standar Industri
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#55675b]">
                  Setiap kali menyelesaikan proker organisasi atau proyek mata kuliah, tandai dengan bintang (⭐) untuk otomatis merangkumnya menjadi poin resume berstandar Harvard/ATS siap ekspor 1-klik untuk magang atau beasiswa.
                </p>
              </div>

              {/* Mockup Resume Row */}
              <div className="mt-8 grid sm:grid-cols-2 gap-3.5 rounded-2xl border border-[#edf2ee] bg-[#fafbfa] p-4">
                <div className="rounded-xl bg-white p-3.5 border border-[#e3dff5]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#644fe2]">PENGALAMAN ORGANISASI</span>
                    <span className="text-[10px] font-semibold text-[#708075]">2024–2025</span>
                  </div>
                  <h6 className="font-bold text-sm text-[#10261b] mt-1">Project Officer — Tech Seminar 2025</h6>
                  <p className="text-xs text-[#708075] mt-1 leading-snug">
                    Memimpin 20 panitia lintas divisi, mengelola anggaran Rp15 juta, dan berhasil memfasilitasi 450+ peserta seminar nasional.
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-[#c3ddcb]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f6849]">PROYEK AKADEMIK</span>
                    <span className="text-[10px] font-semibold text-[#708075]">Nilai A (4.00)</span>
                  </div>
                  <h6 className="font-bold text-sm text-[#10261b] mt-1">Aplikasi Web E-Commerce Mahasiswa</h6>
                  <p className="text-xs text-[#708075] mt-1 leading-snug">
                    Merancang full-stack web app dengan Next.js & Supabase, menerapkan caching performa tinggi, dan terpilih dalam pameran karya.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

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
