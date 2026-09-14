"use client";

import { useState } from "react";
import { 
  Target, 
  Layers3, 
  Clock3, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Award,
  BookOpen,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

interface WorkflowStep {
  step: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Target;
  theme: {
    bg: string;
    text: string;
    border: string;
    lightBg: string;
  };
  mockup: {
    pill: string;
    heading: string;
    detail1: string;
    detail2: string;
    tag: string;
  };
}

const STEPS: WorkflowStep[] = [
  {
    step: "01",
    badge: "LANGKAH PERTAMA",
    title: "Setup Semester & Ruang Kuliah",
    subtitle: "Sinkronkan SKS, jam, dosen & link kelas",
    description: "Cukup 2 menit untuk mendaftarkan jadwal kuliah mingguan. Tautkan link Google Meet/Zoom dan folder Google Drive materi agar siap dibuka saat jam kuliah tiba.",
    icon: Target,
    theme: {
      bg: "bg-[#0f6849]",
      text: "text-[#0f6849]",
      border: "border-[#0f6849]",
      lightBg: "bg-[#dff3e5]",
    },
    mockup: {
      pill: "SEMESTER 4 • AKTIF",
      heading: "Algoritma & Struktur Data (3 SKS)",
      detail1: "Senin, 08:00 - 09:40 WIB • Lab Komputer 3",
      detail2: "Dosen: Dr. Ir. Hendra Gunawan",
      tag: "Meet & Materi Terkoneksi",
    },
  },
  {
    step: "02",
    badge: "PETAKAN PERAN",
    title: "Hubungkan Organisasi & Proker",
    subtitle: "Pecah divisi dan tanggung jawab tim",
    description: "Aktif di BEM, Himpunan, atau UKM? Masukkan struktur divisi dan program kerjamu agar timeline kegiatan kampus berjalan sinkron tanpa ada jadwal yang bentrok.",
    icon: Layers3,
    theme: {
      bg: "bg-[#2b72bd]",
      text: "text-[#2b72bd]",
      border: "border-[#2b72bd]",
      lightBg: "bg-[#e2efff]",
    },
    mockup: {
      pill: "BEM FASILKOM • KADIV KOMINFO",
      heading: "Webinar Nasional Cyber Security 2026",
      detail1: "Ketua Pelaksana • 24 Anggota Panitia",
      detail2: "Fase Eksekusi • Target 500 Peserta",
      tag: "0 Bentrok dengan Kuliah",
    },
  },
  {
    step: "03",
    badge: "FOKUS HARIAN",
    title: "Eksekusi dengan Radar Prioritas",
    subtitle: "Tahu persis apa yang harus diselesaikan hari ini",
    description: "Buka dashboard setiap pagi untuk melihat agenda terdekat dan deadline yang mendesak. Visual badge peringatan otomatis mengarahkan fokus ke tugas H-1 & H-2.",
    icon: Clock3,
    theme: {
      bg: "bg-[#e57255]",
      text: "text-[#e57255]",
      border: "border-[#e57255]",
      lightBg: "bg-[#feeae5]",
    },
    mockup: {
      pill: "DEADLINE RADAR • H-1 URGENT",
      heading: "Laporan Praktikum Modul 4",
      detail1: "Tenggat: Besok 23:59 WIB • Algoritma",
      detail2: "Progress Saat Ini: 85% Siap Submit",
      tag: "Auto-Alert Sistem",
    },
  },
  {
    step: "04",
    badge: "HASIL NYATA",
    title: "Rekap Prestasi & Ekspor CV ATS",
    subtitle: "Pencapaian nyata siap pakai untuk masa depan",
    description: "Tutup semester dengan bangga. nGampUS merangkum riwayat proker, kepanitiaan, dan proyek kuliahmu menjadi portofolio terstruktur siap ekspor ke format resume ATS.",
    icon: Check,
    theme: {
      bg: "bg-[#644fe2]",
      text: "text-[#644fe2]",
      border: "border-[#644fe2]",
      lightBg: "bg-[#f0ecfc]",
    },
    mockup: {
      pill: "AUTO-CURATED RESUME PORTFOLIO",
      heading: "Lead Organizer — Tech Seminar & Expo",
      detail1: "Memimpin 4 divisi lintas jurusan, 1200 audiens",
      detail2: "IPK Semester: 3.88 • 2 Proyek Terpilih",
      tag: "1-Click PDF Resume",
    },
  },
];

export function WorkflowTimeline() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const current = STEPS[activeStep];
  const Icon = current.icon;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Step Indicator Progress Bar */}
      <div className="relative mb-10 hidden sm:block">
        <div className="absolute top-6 left-0 right-0 h-1 bg-[#d8e3da] -z-0" />
        <div 
          className="absolute top-6 left-0 h-1 bg-[#103626] transition-all duration-500 ease-out -z-0"
          style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
        />
        
        <div className="relative z-10 flex justify-between">
          {STEPS.map((s, idx) => {
            const isSelected = activeStep === idx;
            const isPast = activeStep > idx;
            const StepIcon = s.icon;

            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(idx)}
                className="group flex flex-col items-center focus:outline-hidden"
              >
                <div 
                  className={`grid h-12 w-12 place-items-center rounded-2xl font-display font-black text-sm transition-all duration-300 ${
                    isSelected
                      ? "bg-[#103626] text-[#c8ef70] scale-110 shadow-lg shadow-[#103626]/20 ring-4 ring-white"
                      : isPast
                      ? "bg-[#0f6849] text-white"
                      : "bg-white text-[#65746a] border border-[#d8e3da] group-hover:border-[#0f6849] group-hover:text-[#103626]"
                  }`}
                >
                  {isPast ? <Check size={18} strokeWidth={2.5} /> : <StepIcon size={18} />}
                </div>
                <span className={`mt-2.5 text-xs font-black tracking-wider transition ${
                  isSelected ? "text-[#103626]" : "text-[#708275] group-hover:text-[#103626]"
                }`}>
                  STEP {s.step}
                </span>
                <span className="text-[11px] font-semibold text-[#55675b] hidden md:inline">
                  {s.title.split(" ")[0]} {s.title.split(" ")[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Showcase Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[#d8e3da] bg-white p-6 sm:p-10 shadow-xl shadow-[#103626]/5 transition-all duration-300">
        
        {/* Subtle decorative background gradient */}
        <div 
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-3xl transition-all duration-700"
          style={{
            background: 
              activeStep === 0 ? "rgba(15,104,73,.3)" :
              activeStep === 1 ? "rgba(43,114,189,.3)" :
              activeStep === 2 ? "rgba(229,114,85,.3)" :
              "rgba(100,79,226,.3)"
          }}
        />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          
          {/* Left Column: Context & Narrative */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${current.theme.lightBg} ${current.theme.text}`}>
                {current.badge}
              </span>
              <span className="text-xs font-mono font-bold text-[#86988c]">
                Tahap {current.step} dari 04
              </span>
            </div>

            <h3 className="font-display mt-4 text-2xl sm:text-4xl font-black tracking-tight text-[#103626] leading-tight">
              {current.title}
            </h3>

            <p className="mt-2 text-sm sm:text-base font-semibold text-[#0f6849]">
              ✦ {current.subtitle}
            </p>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#55675b]">
              {current.description}
            </p>

            {/* Step navigation buttons on mobile */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {STEPS.map((s, idx) => (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(idx)}
                  className={`sm:hidden rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    activeStep === idx 
                      ? "bg-[#103626] text-[#c8ef70]" 
                      : "bg-[#eff3ee] text-[#55675b]"
                  }`}
                >
                  Step {s.step}
                </button>
              ))}
            </div>

            {/* Next / Action CTA */}
            <div className="mt-8 flex items-center gap-4 pt-6 border-t border-[#edf2ee]">
              {activeStep < STEPS.length - 1 ? (
                <button
                  onClick={() => setActiveStep((prev) => prev + 1)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#103626] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#1b4b35] transition active:scale-95"
                >
                  Lanjut ke Langkah {STEPS[activeStep + 1].step} <ArrowRight size={15} />
                </button>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#c8ef70] px-5 py-2.5 text-xs sm:text-sm font-black text-[#103626] shadow-sm hover:bg-[#d6f888] transition active:scale-95"
                >
                  Mulai Workspace-mu Sekarang <Sparkles size={15} />
                </Link>
              )}
              <span className="text-xs text-[#7d9083]">
                {activeStep === 3 ? "Semua tahap selesai!" : "Klik lingkaran di atas untuk melompat"}
              </span>
            </div>
          </div>

          {/* Right Column: Live Mockup Card with Glass Accent */}
          <div className="relative">
            <div className="rounded-3xl border border-[#d8e3da] bg-[#f9faf8] p-5 sm:p-6 shadow-inner ring-1 ring-black/5">
              
              <div className="flex items-center justify-between border-b border-[#e5ebe5] pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#697c6f]">
                  SISTEM MOCKUP / HASIL NYATA
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${current.theme.lightBg} ${current.theme.text}`}>
                  <Sparkles size={11} /> {current.mockup.tag}
                </span>
              </div>

              {/* Mockup Card Interior */}
              <div className="mt-4 rounded-2xl border border-white bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#697c6f] uppercase tracking-wide">
                    {current.mockup.pill}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>

                <h4 className="font-display mt-2 text-base sm:text-lg font-black text-[#103626]">
                  {current.mockup.heading}
                </h4>

                <div className="mt-4 space-y-2 border-t border-[#f0f4f0] pt-3 text-xs text-[#55675b]">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#103626]" />
                    <span className="font-medium">{current.mockup.detail1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#103626]" />
                    <span className="font-medium">{current.mockup.detail2}</span>
                  </div>
                </div>

                {/* Micro Action Mockup */}
                <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f4f7f3] px-3.5 py-2 text-xs">
                  <span className="font-bold text-[#103626]">Status Sistem:</span>
                  <span className="font-black text-[#0f6849]">✓ Terverifikasi & Sinkron</span>
                </div>
              </div>

              {/* Floating Helper Tag */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#7d9083] px-1">
                <span>⚡ Diperbarui secara real-time</span>
                <span className="font-mono text-[10px]">nGampUS Engine</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
