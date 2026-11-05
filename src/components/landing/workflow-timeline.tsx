"use client";

import { useState } from "react";
import { 
  Target, 
  Layers3, 
  Clock3, 
  Check, 
  Sparkles, 
  ArrowRight
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
      pill: "BEM FAKULTAS • KADIV KOMINFO",
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
      bg: "bg-rose-600",
      text: "text-rose-700",
      border: "border-rose-600",
      lightBg: "bg-rose-50",
    },
    mockup: {
      pill: "DEADLINE RADAR • H-1 URGENT",
      heading: "Laporan Praktikum Modul 4",
      detail1: "Tenggat: Besok 23:59 WIB • Algoritma",
      detail2: "Progress Saat Ini: 85% Siap Submit",
      tag: "Peringatan Otomatis",
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
      detail1: "Memimpin 4 divisi lintas jurusan, 1.200 audiens",
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
    <div className="mx-auto max-w-5xl">
      {/* Step Indicator Progress Bar */}
      <div className="relative mb-10 hidden sm:block">
        <div className="absolute top-6 left-0 right-0 h-1 bg-[#dce5dd] -z-0" />
        <div 
          className="absolute top-6 left-0 h-1 bg-[#0f6849] transition-all duration-300 ease-out -z-0"
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
                type="button"
                onClick={() => setActiveStep(idx)}
                aria-label={`Pilih tahap ${s.step}: ${s.title}`}
                className="group flex flex-col items-center rounded-2xl focus-visible:ring-2 focus-visible:ring-[#0f6849] focus-visible:outline-hidden cursor-pointer"
              >
                <div 
                  className={`grid h-12 w-12 place-items-center rounded-2xl font-display font-black text-sm transition-all duration-200 ${
                    isSelected
                      ? "bg-[#0f6849] text-white scale-110 shadow-md shadow-[#0f6849]/20 ring-4 ring-white"
                      : isPast
                      ? "bg-[#dff3e5] text-[#0f6849]"
                      : "bg-white text-[#708075] border border-[#dce5dd] group-hover:border-[#0f6849] group-hover:text-[#10261b]"
                  }`}
                >
                  {isPast ? <Check size={18} strokeWidth={2.5} /> : <StepIcon size={18} />}
                </div>
                <span className={`mt-2.5 text-xs font-bold tracking-wider transition ${
                  isSelected ? "text-[#0f6849]" : "text-[#708075] group-hover:text-[#10261b]"
                }`}>
                  LANGKAH {s.step}
                </span>
                <span className="text-[11px] font-medium text-[#55675b] hidden md:inline">
                  {s.title.split(" ")[0]} {s.title.split(" ")[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Showcase Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#dce5dd] bg-white p-6 sm:p-9 shadow-xs transition-all duration-200">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          
          {/* Left Column: Context & Narrative */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${current.theme.lightBg} ${current.theme.text}`}>
                {current.badge}
              </span>
              <span className="text-xs font-mono font-medium text-[#708075]">
                Tahap {current.step} dari 04
              </span>
            </div>

            <h3 className="font-display mt-4 text-2xl sm:text-3xl font-black tracking-tight text-[#10261b] leading-tight">
              {current.title}
            </h3>

            <p className="mt-2 text-sm font-semibold text-[#0f6849]">
              ✦ {current.subtitle}
            </p>

            <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-[#55675b]">
              {current.description}
            </p>

            {/* Step navigation buttons on mobile */}
            <div className="mt-6 grid grid-cols-4 sm:hidden gap-1.5">
              {STEPS.map((s, idx) => (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(idx)}
                  className={`rounded-xl py-2 text-[11px] font-bold text-center transition truncate cursor-pointer ${
                    activeStep === idx 
                      ? "bg-[#0f6849] text-white" 
                      : "bg-[#f4f7f4] text-[#55675b]"
                  }`}
                >
                  Step {s.step}
                </button>
              ))}
            </div>

            {/* Next / Action CTA */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-6 border-t border-[#edf2ee]">
              {activeStep < STEPS.length - 1 ? (
                <button
                  onClick={() => setActiveStep((prev) => prev + 1)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f6849] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#0b4d36] transition cursor-pointer active:scale-95"
                >
                  Lanjut ke Langkah {STEPS[activeStep + 1].step} <ArrowRight size={15} />
                </button>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f6849] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0b4d36] transition active:scale-95"
                >
                  Mulai Workspace-mu Sekarang <Sparkles size={15} />
                </Link>
              )}
              <span className="text-xs text-[#708075]">
                {activeStep === 3 ? "Semua tahap selesai!" : "Klik lingkaran di atas untuk beralih"}
              </span>
            </div>
          </div>

          {/* Right Column: Live Mockup Card with Clean Editorial Frame */}
          <div className="relative">
            <div className="rounded-2xl border border-[#edf2ee] bg-[#fafbfa] p-5 shadow-xs">
              
              <div className="flex items-center justify-between border-b border-[#edf2ee] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#708075]">
                  PREVIEW WORKSPACE
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${current.theme.lightBg} ${current.theme.text}`}>
                  <Sparkles size={11} /> {current.mockup.tag}
                </span>
              </div>

              {/* Mockup Card Interior */}
              <div className="mt-4 rounded-xl border border-[#dce5dd] bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#708075] uppercase tracking-wide">
                    {current.mockup.pill}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#0f6849] animate-pulse" />
                </div>

                <h4 className="font-display mt-2 text-base font-bold text-[#10261b]">
                  {current.mockup.heading}
                </h4>

                <div className="mt-3.5 space-y-1.5 border-t border-[#edf2ee] pt-3 text-xs text-[#55675b]">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0f6849]" />
                    <span>{current.mockup.detail1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0f6849]" />
                    <span>{current.mockup.detail2}</span>
                  </div>
                </div>

                {/* Micro Action Mockup */}
                <div className="mt-4 flex items-center justify-between rounded-lg bg-[#f4f7f4] px-3 py-2 text-xs">
                  <span className="font-medium text-[#10261b]">Status Sinkron:</span>
                  <span className="font-bold text-[#0f6849]">✓ Terverifikasi</span>
                </div>
              </div>

              {/* Helper Tag */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#708075] px-1">
                <span>Diperbarui secara real-time</span>
                <span className="font-mono text-[10px]">nGampUS Core</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
