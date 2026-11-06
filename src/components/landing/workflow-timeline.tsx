"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Target, 
  Layers3, 
  Clock3, 
  Check, 
  Sparkles, 
  ArrowRight,
  ChevronRight,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileCheck2,
  Users,
  Video,
  Flame,
  Award
} from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";

interface StepConfig {
  step: string;
  badge: string;
  shortTitle: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  tag: string;
  themeColor: string;
}

const STEPS: StepConfig[] = [
  {
    step: "01",
    badge: "FASE 01 // SETUP KAMPUS",
    shortTitle: "Ruang Kuliah",
    title: "Sinkronkan Jadwal Kelas, Lab, dan Materi Sekali Setup.",
    subtitle: "Tautkan SKS, ruang kelas, link virtual meet, hingga folder materi kuliah.",
    description: "Cukup 2 menit untuk menata rutinitas mingguanmu. Setiap matkul otomatis terhubung dengan link Google Meet, lokasi gedung lab, dan file materi kuliah.",
    bullets: [
      "Deteksi bentrok jadwal otomatis antar kelas dan praktikum lab.",
      "Tautan Google Meet & Zoom tersemat langsung tanpa cari link di chat.",
      "1-Klik ekspor sinkronisasi file .ICS ke kalender Google / iPhone."
    ],
    tag: "JADWAL CERDAS",
    themeColor: "#C6F432",
  },
  {
    step: "02",
    badge: "FASE 02 // MANAJEMEN TIM",
    shortTitle: "Peta Organisasi",
    title: "Petakan Kepengurusan, Divisi, dan Proker Tanpa Tabrakan.",
    subtitle: "Sinkronkan timeline kegiatan BEM/Himpunan langsung berdampingan dengan jam kuliah.",
    description: "Aktif di BEM, Himpunan, atau UKM? Masukkan struktur divisi dan program kerja agar seluruh timeline kepanitiaan berjalan mulus tanpa mengorbankan waktu kelas.",
    bullets: [
      "Perisai proteksi jadwal: sistem memvalidasi rapat tidak bentrok dengan jam kuliah.",
      "Struktur divisi dan timeline milestone proker terpantau secara transparan.",
      "Pendelegasian tugas panitia terorganisir dalam satu dasbor terpusat."
    ],
    tag: "0 BENTROK KULIAH",
    themeColor: "#38bdf8",
  },
  {
    step: "03",
    badge: "FASE 03 // EKSEKUSI HARIAN",
    shortTitle: "Radar Prioritas",
    title: "Kendalikan Deadline Mendesak dengan Radar Peringatan Dini.",
    subtitle: "Tahu persis apa yang harus dieksekusi hari ini. Bebas panik semalam sebelum portal ditutup.",
    description: "Setiap pagi, radar otomatis menyaring tugas paling krusial. Badge peringatan H-1 & H-2 mengarahkan fokus ke prioritas tertinggi agar tidak ada tugas yang terlewat.",
    bullets: [
      "Radar prioritas pintar: otomatis mengelompokkan tugas H-1, H-2, hingga H-7.",
      "Checklist interaktif dengan kalkulasi progres semester real-time.",
      "Bebas kepanikan mendadak beberapa jam sebelum portal e-learning ditutup."
    ],
    tag: "RADAR DEADLINE",
    themeColor: "#FF4D3D",
  },
  {
    step: "04",
    badge: "FASE 04 // HASIL NYATA",
    shortTitle: "Portofolio ATS",
    title: "Otomatisasi Portofolio & Ekspor Resume Magang Skor ATS 96.",
    subtitle: "Tutup semester dengan pencapaian nyata yang terekam rapi dan terverifikasi.",
    description: "Setiap tugas proyek yang kamu tuntaskan dan proker yang kamu jalankan otomatis terkurasi menjadi rekap portofolio siap pakai berstandar industri ATS.",
    bullets: [
      "Auto-curated resume: proker dan proyek kuliah langsung dirangkum menjadi poin terukur.",
      "Format resume berstandar industri yang lolos sistem Applicant Tracking System (ATS).",
      "1-Klik unduh resume profesional siap kirim ke portal magang & LinkedIn."
    ],
    tag: "SKOR ATS 96/100",
    themeColor: "#C6F432",
  },
];

export function WorkflowTimeline() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [taskDone, setTaskDone] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const current = STEPS[activeStep];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const handleToggleTask = () => {
    const nextState = !taskDone;
    setTaskDone(nextState);
    if (nextState) {
      showToast("✦ Tugas selesai! Progres semester naik ke 94% & Skor ATS terupdate.");
    } else {
      showToast("Tugas dikembalikan ke antrean aktif.");
    }
  };

  const handleExportIcs = () => {
    showToast("✓ File jadwal .ICS siap! Jadwal kuliah tersinkron ke kalender ponsel.");
  };

  const handleExportCv = () => {
    showToast("✓ Format resume magang ATS 96 siap diunduh dalam bentuk PDF.");
  };

  return (
    <div className="relative w-full">
      {/* Interactive Micro Toast Notification */}
      {toastMessage && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#C6F432]/40 bg-[#0a1f16]/95 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold text-[#F4F1EA] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#C6F432] text-[#0a1f16] font-black text-xs shrink-0">
            ✓
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP EDITORIAL CONTROLLER BAR ── */}
      <div className="mb-10 sm:mb-14">
        {/* Step Indicator Buttons Track */}
        <div className="relative p-1.5 rounded-2xl sm:rounded-3xl bg-[#12332a]/80 border border-white/10 backdrop-blur-md shadow-xl flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {STEPS.map((s, idx) => {
            const isSelected = activeStep === idx;
            const isPast = activeStep > idx;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                aria-label={`Pilih tahap ${s.step}: ${s.shortTitle}`}
                className={`relative flex-1 min-w-[130px] sm:min-w-0 flex items-center justify-center gap-2 sm:gap-3 py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-mono text-xs transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[#C6F432] text-[#0a1f16] font-bold shadow-md shadow-[#C6F432]/25 scale-[1.02]"
                    : "text-[#F4F1EA]/70 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-lg text-[11px] font-black transition-colors ${
                  isSelected 
                    ? "bg-[#0a1f16] text-[#C6F432]" 
                    : isPast
                    ? "bg-[#C6F432]/20 text-[#C6F432]"
                    : "bg-white/10 text-white/60"
                }`}>
                  {isPast ? "✓" : s.step}
                </span>
                <span className="font-sans font-bold text-xs sm:text-sm truncate">
                  {s.shortTitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Ambient Connective Line Progress on Desktop */}
        <div className="mt-3 hidden sm:flex items-center justify-between px-6 text-[11px] font-mono text-[#F4F1EA]/40">
          <span>01. SINKRONISASI JADWAL</span>
          <span>02. PETA ORGANISASI</span>
          <span>03. RADAR DEADLINE</span>
          <span>04. PORTOFOLIO ATS</span>
        </div>
      </div>

      {/* ── MAIN STAGE: ASYMMETRICAL EDITORIAL SPLIT SHOWCASE ── */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-white/10 bg-linear-to-b from-[#12332a] to-[#0d261e] p-6 sm:p-10 lg:p-12 shadow-2xl">
        
        {/* Subtle Decorative Grid Pattern in Background */}
        <div 
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1.1fr] lg:items-center">
          
          {/* ── SISI KIRI: NARASI EDITORIAL & VALUE BULLETS ── */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Badge & Step Indicator */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C6F432]/30 bg-[#0a1f16] px-3.5 py-1 text-xs font-mono font-bold text-[#C6F432]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C6F432] animate-pulse" />
                  <span>{current.badge}</span>
                </span>
                <span className="font-mono text-xs text-[#F4F1EA]/50">
                  // {current.tag}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-display mt-5 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                {current.title}
              </h3>
              <p className="mt-2 text-sm sm:text-base font-medium text-[#C6F432]/90">
                ✦ {current.subtitle}
              </p>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#F4F1EA]/75 font-normal">
                {current.description}
              </p>

              {/* Value Proposition Bullets */}
              <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
                {current.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-[#C6F432]/15 text-[#C6F432] text-xs font-black shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="text-xs sm:text-sm text-[#F4F1EA]/85 leading-relaxed font-sans">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  disabled={activeStep === 0}
                  aria-label="Kembali ke tahap sebelumnya"
                  className={`rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
                    activeStep === 0
                      ? "opacity-30 cursor-not-allowed text-white/40 border border-white/5"
                      : "border border-white/15 bg-white/5 text-[#F4F1EA] hover:bg-white/10 cursor-pointer"
                  }`}
                >
                  ← Tahap Sebelumnya
                </button>

                {activeStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => prev + 1)}
                    aria-label={`Lanjut ke tahap ${STEPS[activeStep + 1].step}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#C6F432] px-5 py-2 text-xs sm:text-sm font-bold text-[#0a1f16] shadow-md shadow-[#C6F432]/20 hover:brightness-110 transition cursor-pointer active:scale-95"
                  >
                    <span>Lanjut ke Fase {STEPS[activeStep + 1].step}</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#C6F432] px-5 py-2 text-xs sm:text-sm font-bold text-[#0a1f16] shadow-md shadow-[#C6F432]/20 hover:brightness-110 transition active:scale-95"
                  >
                    <span>Buka Workspace Sekarang</span>
                    <Sparkles size={14} />
                  </Link>
                )}
              </div>

              <span className="text-xs font-mono text-[#F4F1EA]/40">
                {activeStep + 1} dari {STEPS.length} Fase
              </span>
            </div>

          </div>

          {/* ── SISI KANAN: HIGH-FIDELITY TACTILE UI ARTIFACT ── */}
          <div className="relative">
            
            {/* Ambient Backlight Behind Artifact */}
            <div 
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-3xl bg-radial from-[#C6F432]/10 via-transparent to-transparent blur-2xl opacity-60"
            />

            {/* ── ARTIFACT STEP 1: JADWAL KULIAH TICKET & .ICS SINKRON ── */}
            {activeStep === 0 && (
              <div className="relative rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0a1f16] p-5 sm:p-7 shadow-2xl transition-all duration-300">
                {/* Artifact Top Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/30">
                      <Calendar size={18} />
                    </span>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#C6F432] font-bold">
                        JADWAL HARI SENIN
                      </span>
                      <h4 className="font-display text-base font-black text-white">2 Kuliah • 6 SKS</h4>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#C6F432]/15 border border-[#C6F432]/30 px-3 py-1 font-mono text-[10px] font-bold text-[#C6F432]">
                    ● SEDANG AKTIF
                  </span>
                </div>

                {/* Live Class 1 Snippet */}
                <div className="mt-5 rounded-2xl border border-white/10 bg-[#12332a] p-4.5 transition-all hover:border-[#C6F432]/40">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-[#C6F432] px-2 py-0.5 font-mono text-[10px] font-black text-[#0a1f16]">
                      08:00 - 09:40 WIB
                    </span>
                    <span className="font-mono text-xs font-bold text-[#C6F432]">3 SKS</span>
                  </div>
                  <h5 className="font-display mt-2.5 text-base sm:text-lg font-black text-white">
                    {DEMO_DATA.courses[0].name}
                  </h5>
                  <div className="mt-2 space-y-1 text-xs text-[#F4F1EA]/70 font-sans">
                    <div>Ruang: <span className="text-white font-medium">{DEMO_DATA.courses[0].room}</span></div>
                    <div>Dosen: <span className="text-white font-medium">{DEMO_DATA.courses[0].lecturer}</span></div>
                  </div>

                  {/* Actions inside Matkul */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
                    <a
                      href={DEMO_DATA.courses[0].meetUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6849] px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-[#0b4d36] transition"
                    >
                      <Video size={13} className="text-[#C6F432]" />
                      <span>Google Meet Terhubung</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleExportIcs}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs font-bold text-[#F4F1EA] hover:bg-white/10 transition cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Ekspor .ICS</span>
                    </button>
                  </div>
                </div>

                {/* Live Class 2 Snippet */}
                <div className="mt-3 rounded-2xl border border-white/10 bg-[#12332a]/60 p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-[10px] text-[#C6F432] font-bold">10:00 - 11:40 WIB • 3 SKS</span>
                    <div className="font-display font-bold text-white mt-0.5">{DEMO_DATA.courses[1].name}</div>
                  </div>
                  <span className="font-mono text-[11px] text-white/50">{DEMO_DATA.courses[1].room}</span>
                </div>

                {/* Bottom Status Chip */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#C6F432]">
                    <ShieldCheck size={14} />
                    <span className="font-bold">0 Bentrok Jadwal Terdeteksi</span>
                  </div>
                  <span className="text-white/40">Kalender Sinkron</span>
                </div>
              </div>
            )}

            {/* ── ARTIFACT STEP 2: PETA ORGANISASI & ANTI-BENTROK ── */}
            {activeStep === 1 && (
              <div className="relative rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0a1f16] p-5 sm:p-7 shadow-2xl transition-all duration-300">
                {/* Artifact Top Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      <Users size={18} />
                    </span>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-sky-400 font-bold">
                        BEM FAKULTAS ILMU KOMPUTER
                      </span>
                      <h4 className="font-display text-base font-black text-white">Kadiv Kominfo & Publikasi</h4>
                    </div>
                  </div>
                  <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-3 py-1 font-mono text-[10px] font-bold text-sky-300">
                    24 ANGGOTA AKTIF
                  </span>
                </div>

                {/* Active Proker Card */}
                <div className="mt-5 rounded-2xl border border-white/10 bg-[#12332a] p-4.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded-lg bg-sky-400/15 border border-sky-400/30 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-300">
                      PROGRAM KERJA UTAMA
                    </span>
                    <span className="font-mono font-bold text-[#C6F432]">75% Siap</span>
                  </div>

                  <h5 className="font-display mt-2.5 text-base sm:text-lg font-black text-white">
                    {DEMO_DATA.proker.title}
                  </h5>

                  {/* Progress Bar */}
                  <div className="mt-3 h-2 w-full rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full bg-linear-to-r from-sky-400 to-[#C6F432] rounded-full" style={{ width: "75%" }} />
                  </div>

                  {/* Proker Metrics Pill */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="rounded-xl bg-white/[0.04] p-2.5 border border-white/5">
                      <div className="text-white/40 text-[10px]">TARGET PESERTA</div>
                      <div className="text-white font-bold mt-0.5">{DEMO_DATA.proker.attendees}</div>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] p-2.5 border border-white/5">
                      <div className="text-white/40 text-[10px]">JADWAL RAPAT TIM</div>
                      <div className="text-[#C6F432] font-bold mt-0.5">Sabtu, 19:30 WIB</div>
                    </div>
                  </div>
                </div>

                {/* Smart Conflict Guard */}
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-[#C6F432] shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-white font-display">Aman dari Jam Perkuliahan</div>
                    <div className="text-[#F4F1EA]/70 mt-0.5">Seluruh agenda proker otomatis disesuaikan di luar jam matkul 24 SKS.</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ARTIFACT STEP 3: RADAR PRIORITAS & CHECKLIST INTERAKTIF ── */}
            {activeStep === 2 && (
              <div className="relative rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0a1f16] p-5 sm:p-7 shadow-2xl transition-all duration-300">
                {/* Artifact Top Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FF4D3D]/10 text-[#FF4D3D] border border-[#FF4D3D]/30">
                      <Flame size={18} />
                    </span>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF4D3D] font-bold">
                        RADAR DEADLINE PRIORITAS
                      </span>
                      <h4 className="font-display text-base font-black text-white">1 Tugas Mendesak</h4>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#FF4D3D]/15 border border-[#FF4D3D]/30 px-3 py-1 font-mono text-[10px] font-bold text-[#FF4D3D] animate-pulse">
                    ⚠ H-1 DEADLINE
                  </span>
                </div>

                {/* Task Card with Interactive Clickable Checkbox */}
                <div className={`mt-5 rounded-2xl border p-4.5 transition-all duration-300 ${
                  taskDone 
                    ? "border-[#C6F432]/40 bg-[#12332a]" 
                    : "border-[#FF4D3D]/40 bg-[#1c1414]"
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleToggleTask}
                      aria-label="Tandai tugas selesai"
                      className={`grid h-7 w-7 place-items-center rounded-xl transition-all cursor-pointer shrink-0 mt-0.5 ${
                        taskDone
                          ? "bg-[#C6F432] text-[#0a1f16] shadow-md shadow-[#C6F432]/30 scale-105"
                          : "border-2 border-white/30 hover:border-[#C6F432] text-transparent"
                      }`}
                    >
                      <Check size={16} strokeWidth={3} className={taskDone ? "opacity-100" : "opacity-0"} />
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-white/50 uppercase">
                          {DEMO_DATA.urgentTask.course}
                        </span>
                        <span className={`font-mono text-xs font-bold ${taskDone ? "text-[#C6F432]" : "text-[#FF4D3D]"}`}>
                          {taskDone ? "✓ SELESAI" : "Besok, 23:59 WIB"}
                        </span>
                      </div>
                      
                      <h5 className={`font-display mt-1 text-base sm:text-lg font-black transition-all ${
                        taskDone ? "line-through text-white/50" : "text-white"
                      }`}>
                        {DEMO_DATA.urgentTask.title}
                      </h5>

                      {/* Micro Subtasks Checklist */}
                      <div className="mt-3.5 space-y-1.5 text-xs text-[#F4F1EA]/70 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-[#C6F432]">✓</span>
                          <span className={taskDone ? "line-through text-white/40" : ""}>Desain Diagram ERD Database</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#C6F432]">✓</span>
                          <span className={taskDone ? "line-through text-white/40" : ""}>Implementasi Endpoint REST API</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={taskDone ? "text-[#C6F432]" : "text-white/40"}>
                            {taskDone ? "✓" : "○"}
                          </span>
                          <span className={taskDone ? "line-through text-white/40" : "text-white font-medium"}>
                            Uji Validasi Postman & Submit Laporan
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Progress Bar Reaction */}
                <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/10 p-3.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white/60">Progres Semester 4:</span>
                    <span className="font-bold text-[#C6F432]">{taskDone ? "94% Tuntas" : "85% Aktif"}</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-black/40 overflow-hidden">
                    <div 
                      className="h-full bg-[#C6F432] transition-all duration-500 rounded-full" 
                      style={{ width: `${taskDone ? 94 : 85}%` }} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── ARTIFACT STEP 4: PORTOFOLIO ATS 96 & 1-CLICK CV ── */}
            {activeStep === 3 && (
              <div className="relative rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0a1f16] p-5 sm:p-7 shadow-2xl transition-all duration-300">
                {/* Artifact Top Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/30">
                      <Award size={18} />
                    </span>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#C6F432] font-bold">
                        AUTO-CURATED RESUME
                      </span>
                      <h4 className="font-display text-base font-black text-white">{DEMO_DATA.student.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-[#C6F432] px-3 py-1 font-mono text-xs font-black text-[#0a1f16] shadow-md shadow-[#C6F432]/25">
                    <Check size={14} strokeWidth={3} />
                    <span>ATS 96/100</span>
                  </div>
                </div>

                {/* CV Document Preview Sheet */}
                <div className="mt-5 rounded-2xl border border-white/15 bg-[#FBFAF6] p-4.5 text-[#0a1f16] shadow-inner">
                  <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                    <div>
                      <div className="font-display text-base font-black tracking-tight">{DEMO_DATA.student.name}</div>
                      <div className="font-mono text-[10px] text-black/60">{DEMO_DATA.student.major} • IPK {DEMO_DATA.student.ipk}</div>
                    </div>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-800">
                      TERVERIFIKASI
                    </span>
                  </div>

                  {/* Curated Experience Bullets */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <div className="font-mono text-[10px] font-bold text-emerald-800 tracking-wider">PENGALAMAN ORGANISASI</div>
                      <div className="font-bold text-xs mt-0.5">Project Officer • Tech Seminar & Expo 2025</div>
                      <p className="text-[11px] text-black/75 mt-0.5 leading-relaxed">
                        Memimpin 20 panitia, mengelola anggaran 15jt, memfasilitasi 450+ peserta seminar.
                      </p>
                    </div>

                    <div className="border-t border-black/5 pt-2">
                      <div className="font-mono text-[10px] font-bold text-emerald-800 tracking-wider">PROYEK KULIAH UNGGULAN</div>
                      <div className="font-bold text-xs mt-0.5">Lead Developer • Web Rekap Kuliah Berbasis AI</div>
                      <p className="text-[11px] text-black/75 mt-0.5 leading-relaxed">
                        Membangun sistem akademik terpadu, meraih nilai A sempurna (4.00).
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1-Click PDF Download Action */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleExportCv}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#C6F432] py-2.5 px-4 font-mono text-xs font-bold text-[#0a1f16] shadow-md shadow-[#C6F432]/25 hover:brightness-110 transition cursor-pointer active:scale-95"
                  >
                    <Download size={14} />
                    <span>Unduh Format PDF ATS</span>
                  </button>
                  <span className="font-mono text-[11px] text-white/50 shrink-0">
                    Siap Kirim Magang
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ── BENEATH SHOWCASE: 4-PILLAR PINTEREST MASONRY STRIP ── */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((s, idx) => {
          const isCurrent = activeStep === idx;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`text-left rounded-2xl border p-4 sm:p-5 transition-all duration-300 cursor-pointer ${
                isCurrent
                  ? "border-[#C6F432] bg-[#12332a] shadow-lg shadow-[#C6F432]/10 scale-[1.02]"
                  : "border-white/10 bg-[#0d261e]/60 hover:border-white/20 hover:bg-[#12332a]/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs font-black ${isCurrent ? "text-[#C6F432]" : "text-white/40"}`}>
                  FASE {s.step}
                </span>
                <span className={`h-2 w-2 rounded-full ${isCurrent ? "bg-[#C6F432] animate-pulse" : "bg-white/20"}`} />
              </div>
              <div className="font-display mt-2 font-bold text-white text-sm sm:text-base">
                {s.shortTitle}
              </div>
              <p className="mt-1 text-xs text-[#F4F1EA]/65 line-clamp-2 font-normal">
                {s.subtitle}
              </p>
            </button>
          );
        })}
      </div>

    </div>
  );
}
