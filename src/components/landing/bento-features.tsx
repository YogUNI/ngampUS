"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  Download, 
  ExternalLink, 
  Check, 
  Copy,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";

export function BentoFeatures() {
  const [taskDone, setTaskDone] = useState(false);
  const [exportedIcs, setExportedIcs] = useState(false);
  const [copiedCv, setCopiedCv] = useState(false);

  const handleExportIcs = () => {
    setExportedIcs(true);
    setTimeout(() => setExportedIcs(false), 2200);
  };

  const handleCopyCv = () => {
    setCopiedCv(true);
    setTimeout(() => setCopiedCv(false), 2000);
  };

  return (
    <section 
      id="features"
      aria-label="Fitur Utama Ekosistem ngampUS"
      className="relative border-b border-white/10 bg-[#0a1f16] py-16 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-12 text-[#F4F1EA] scroll-mt-20 overflow-hidden"
    >
      {/* Subtle Radial Glow */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 right-10 h-[500px] w-[500px] rounded-full bg-radial from-[#12332a]/40 via-transparent to-transparent blur-3xl opacity-50"
      />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#12332a] px-3.5 py-1 text-xs font-mono font-bold text-[#C6F432]">
            <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
            <span>FITUR ESENSIAL</span>
          </div>

          <h2 className="font-display mt-3 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Dirancang untuk ritme nyata mahasiswa.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#F4F1EA]/70 leading-relaxed font-normal">
            Hening, teratur, dan fokus. Menghilangkan distraksi agar kamu bisa kuliah dengan tenang dan tetap aktif berorganisasi.
          </p>
        </div>

        {/* ── 4 REFINED BENTO CARDS (2x2 Grid) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">

          {/* ── CARD 1: JADWAL KULIAH & MEET ── */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#12332a] p-6 sm:p-8 transition-all hover:border-[#C6F432]/40">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/20">
                  <Calendar size={18} />
                </span>
                <span className="font-mono text-xs font-bold text-white/50 tracking-wider">
                  01 // JADWAL KULIAH
                </span>
              </div>

              <div className="mt-5">
                <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                  Jadwal Otomatis & Link Meet
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#F4F1EA]/70 leading-relaxed">
                  Tautkan jam kuliah, ruang lab, dan Google Meet. Sinkronkan seluruh jadwal ke kalender ponsel dalam satu klik.
                </p>
              </div>
            </div>

            {/* Mini Visual Preview */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0a1f16] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#C6F432]">
                <span className="font-bold">HARI SENIN • 2 KELAS</span>
                <button
                  type="button"
                  onClick={handleExportIcs}
                  className="inline-flex items-center gap-1 text-[11px] hover:underline cursor-pointer"
                >
                  <Download size={12} />
                  <span>{exportedIcs ? "Tersinkron! ✓" : "Ekspor .ICS"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/5 p-3">
                <div>
                  <div className="font-sans text-xs font-bold text-white">
                    {DEMO_DATA.courses[0].name}
                  </div>
                  <div className="font-mono text-[11px] text-white/50 mt-0.5">
                    {DEMO_DATA.courses[0].time} • {DEMO_DATA.courses[0].room}
                  </div>
                </div>
                <span className="rounded-lg bg-[#C6F432] px-2.5 py-1 text-[11px] font-bold text-[#0a1f16]">
                  Meet Siap
                </span>
              </div>
            </div>
          </div>

          {/* ── CARD 2: RADAR DEADLINE PRIORITAS ── */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#12332a] p-6 sm:p-8 transition-all hover:border-[#FF4D3D]/50">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  <Clock size={18} />
                </span>
                <span className="font-mono text-xs font-bold text-white/50 tracking-wider">
                  02 // RADAR DEADLINE
                </span>
              </div>

              <div className="mt-5">
                <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                  Radar Deadline & Urgensi
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#F4F1EA]/70 leading-relaxed">
                  Tugas otomatis diurutkan dari tenggat paling mendesak. Sinyal visual mencegah keterlambatan submit tugas kampus.
                </p>
              </div>
            </div>

            {/* Mini Visual Preview */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0a1f16] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-400">
                  DEADLINE BESOK • 23:59 WIB
                </span>
                <span className="text-white/40">Sisa 14 Jam</span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/5 p-3">
                <div>
                  <div className={`font-sans text-xs font-bold transition-all ${taskDone ? "line-through text-white/40" : "text-white"}`}>
                    {DEMO_DATA.urgentTask.title}
                  </div>
                  <div className="font-mono text-[11px] text-white/50 mt-0.5">
                    {DEMO_DATA.urgentTask.course}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTaskDone(!taskDone)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-mono font-bold transition cursor-pointer ${
                    taskDone 
                      ? "bg-[#C6F432] border-[#C6F432] text-[#0a1f16]" 
                      : "border-white/20 bg-white/5 text-white hover:border-[#C6F432]/50"
                  }`}
                >
                  <Check size={11} />
                  <span>{taskDone ? "Selesai ✓" : "Tandai"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── CARD 3: MANAJEMEN ORGANISASI & PROKER ── */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#12332a] p-6 sm:p-8 transition-all hover:border-[#C6F432]/40">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/20">
                  <Users size={18} />
                </span>
                <span className="font-mono text-xs font-bold text-white/50 tracking-wider">
                  03 // ORGANISASI
                </span>
              </div>

              <div className="mt-5">
                <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                  Kepanitiaan & Proker Rapi
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#F4F1EA]/70 leading-relaxed">
                  Kelola struktur pengurus dan timeline program kerja organisasi tanpa khawatir jadwal bentrok dengan praktikum.
                </p>
              </div>
            </div>

            {/* Mini Visual Preview */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0a1f16] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{DEMO_DATA.proker.org}</span>
                <span className="font-mono text-[10px] text-[#C6F432] bg-[#C6F432]/10 border border-[#C6F432]/20 px-2 py-0.5 rounded-full">
                  {DEMO_DATA.proker.role}
                </span>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{DEMO_DATA.proker.name}</span>
                  <span className="font-mono text-[#C6F432]">{DEMO_DATA.proker.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[#C6F432]" style={{ width: `${DEMO_DATA.proker.progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 4: REKAP PORTOFOLIO & RESUME ATS ── */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#12332a] p-6 sm:p-8 transition-all hover:border-[#C6F432]/40">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/20">
                  <Award size={18} />
                </span>
                <span className="font-mono text-xs font-bold text-white/50 tracking-wider">
                  04 // CV ATS OTOMATIS
                </span>
              </div>

              <div className="mt-5">
                <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                  Portofolio Jadi CV ATS Siap Magang
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#F4F1EA]/70 leading-relaxed">
                  Tugas akhir kuliah dan pengalaman proker otomatis terangkum dalam format resume standar Harvard yang lulus screening ATS.
                </p>
              </div>
            </div>

            {/* Mini Visual Preview */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0a1f16] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="rounded-md bg-[#C6F432]/15 text-[#C6F432] px-2 py-0.5 font-bold text-[10px]">
                  ✓ SKOR ATS 96/100
                </span>
                <button
                  type="button"
                  onClick={handleCopyCv}
                  className="inline-flex items-center gap-1 text-[11px] text-[#C6F432] hover:underline cursor-pointer"
                >
                  <Copy size={11} />
                  <span>{copiedCv ? "Tersalin! ✓" : "Salin Resume"}</span>
                </button>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 font-sans text-xs text-white/80 leading-relaxed truncate">
                • {DEMO_DATA.cvBullets[1].title} — {DEMO_DATA.cvBullets[1].period}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
