"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2
} from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";
import { Reveal } from "@/components/ui/reveal";

export function BentoFeatures() {
  const [taskDone, setTaskDone] = useState(false);
  const [exportedIcs, setExportedIcs] = useState(false);
  const [copiedCv, setCopiedCv] = useState(false);
  const [openedMeet, setOpenedMeet] = useState(false);

  const handleExportIcs = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExportedIcs(true);
    setTimeout(() => setExportedIcs(false), 2200);
  };

  const handleCopyCv = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedCv(true);
    setTimeout(() => setCopiedCv(false), 2000);
  };

  const handleOpenMeet = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenedMeet(true);
    setTimeout(() => setOpenedMeet(false), 2000);
  };

  return (
    <section 
      id="features"
      aria-label="Fitur Utama Ekosistem ngampUS"
      className="relative border-b border-white/10 bg-gradient-to-b from-[#081811] via-[#0b2419] to-[#081811] py-18 sm:py-24 lg:py-28 px-4 sm:px-8 lg:px-12 text-[#F4F1EA] scroll-mt-20 overflow-hidden"
    >
      {/* Dynamic Background Lighting */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-0 h-[600px] w-[600px] rounded-full bg-radial from-[#C6F432]/10 via-transparent to-transparent blur-3xl opacity-60"
      />
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-10 h-[500px] w-[500px] rounded-full bg-radial from-[#12332a]/80 via-transparent to-transparent blur-3xl opacity-50"
      />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Section Header */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#12332a] px-3.5 py-1 text-xs font-mono font-bold text-[#C6F432]">
              <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
              <span>LIMA PILAR EKOSISTEM</span>
            </div>

            <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Satu ruang kerja untuk seluruh ritme kuliah.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#F4F1EA]/70 leading-relaxed font-normal max-w-2xl mx-auto">
              Perpaduan antarmuka hening dengan visual nyata. Menata jadwal kuliah, radar deadline, kepanitiaan, hingga resume magang secara terpadu.
            </p>
          </div>
        </Reveal>

        {/* ── ASYMMETRIC BENTO GRID (Visual + Real Photos + Software Cockpit) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">

          {/* ── CARD 1: JADWAL KULIAH & MEET (7 Cols - Photo + Interactive Pill) ── */}
          <div className="lg:col-span-7 group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#12332a]/70 p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-[#C6F432]/50 hover:bg-[#12332a]">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/20">
                    <Calendar size={18} />
                  </span>
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#C6F432]">
                      01 // JADWAL CERDAS
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                      Jadwal Kuliah & Link Online 1-Klik
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportIcs}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <Download size={12} className="text-[#C6F432]" />
                  <span>{exportedIcs ? "Tersinkron! ✓" : "Ekspor .ICS"}</span>
                </button>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#F4F1EA]/75 leading-relaxed font-normal max-w-xl">
                Tautkan jam kelas, ruang lab, dan Google Meet. Sinkronkan seluruh jadwal ke kalender ponsel tanpa perlu repot mencatat manual.
              </p>
            </div>

            {/* Split Visual Container: Real Workspace Photo + Floating Glass Card */}
            <div className="mt-6 relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="/images/landing/feature-schedule.jpg"
                alt="Meja belajar rapi mahasiswa dengan laptop dan smartphone"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f16] via-[#0a1f16]/60 to-transparent" />

              {/* Floating Glassmorphism Widget */}
              <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 rounded-xl border border-white/15 bg-[#0d261e]/90 p-3 sm:p-4 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
                    <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider">
                      HARI SENIN • 08:00 WIB
                    </span>
                  </div>
                  <span className="rounded-md bg-[#C6F432]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#C6F432]">
                    3 SKS
                  </span>
                </div>

                <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <h4 className="font-display text-sm font-bold text-white">
                      {DEMO_DATA.courses[0].name}
                    </h4>
                    <p className="text-[11px] text-white/60 font-mono">
                      {DEMO_DATA.courses[0].room} • {DEMO_DATA.courses[0].lecturer}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenMeet}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C6F432] px-3.5 py-1.5 text-xs font-bold text-[#0a1f16] shadow-sm hover:brightness-110 active:scale-95 transition cursor-pointer"
                  >
                    <span>{openedMeet ? "Terhubung! ↗" : "Buka GMeet ↗"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 2: RADAR DEADLINE PRIORITAS (5 Cols - Interactive Urgency) ── */}
          <div className="lg:col-span-5 group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#12332a]/70 p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-amber-400/50 hover:bg-[#12332a]">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    <Clock size={18} />
                  </span>
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-amber-300">
                      02 // RADAR DEADLINE
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                      Radar Tenggat Waktu
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-red-400">
                  H-1 BESOK
                </span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#F4F1EA]/75 leading-relaxed font-normal">
                Tugas diurutkan otomatis berdasarkan urgensi. Sinyal warna pekat mencegah keterlambatan submit tugas di portal kampus.
              </p>
            </div>

            {/* Interactive Urgency Control Widget */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0a1f16] p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-white/60">Tenggat Portal:</span>
                <span className="text-amber-400 font-bold">Besok 23:59 WIB</span>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className={`font-display text-sm font-bold transition-all ${taskDone ? "line-through text-white/40" : "text-white"}`}>
                      {DEMO_DATA.urgentTask.title}
                    </h4>
                    <p className="text-[11px] text-white/50 font-mono mt-0.5 truncate">
                      {DEMO_DATA.urgentTask.course}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTaskDone(!taskDone)}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
                      taskDone 
                        ? "bg-[#C6F432] border-[#C6F432] text-[#0a1f16] shadow-sm" 
                        : "border-white/20 bg-white/5 text-white hover:border-[#C6F432]/60 hover:text-white"
                    }`}
                  >
                    <Check size={13} className={taskDone ? "opacity-100" : "opacity-40"} />
                    <span>{taskDone ? "Tuntas (+1 Portofolio)" : "Tandai Selesai"}</span>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/60 mb-1">
                    <span>Status Tugas</span>
                    <span className={taskDone ? "text-[#C6F432] font-bold" : "text-amber-400 font-bold"}>
                      {taskDone ? "100% Selesai" : "Sisa 14 Jam"}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        taskDone ? "bg-[#C6F432] w-full" : "bg-gradient-to-r from-amber-400 to-red-400 w-3/4"
                      }`} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 3: KEPANITIAAN & ORGANISASI (5 Cols - Real Photo + Proker) ── */}
          <div className="lg:col-span-5 group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#12332a]/70 p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-[#C6F432]/50 hover:bg-[#12332a]">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/20">
                    <Users size={18} />
                  </span>
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#C6F432]">
                      03 // ORGANISASI
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                      Proker & Kepanitiaan Rapi
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-[#C6F432]/10 border border-[#C6F432]/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#C6F432]">
                  {DEMO_DATA.proker.role}
                </span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#F4F1EA]/75 leading-relaxed font-normal">
                Pantau struktur kepengurusan di BEM, Himpunan, atau UKM. Jadwal rapat dan kegiatan panitia tidak akan bentrok dengan praktikum.
              </p>
            </div>

            {/* Photo + Proker Progress Card */}
            <div className="mt-6 relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="/images/landing/feature-org.jpg"
                alt="Mahasiswa berdiskusi santai dalam kepanitiaan organisasi"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f16] via-[#0a1f16]/60 to-transparent" />

              <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/15 bg-[#0d261e]/90 p-3 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{DEMO_DATA.proker.name}</span>
                  <span className="font-mono text-[#C6F432]">{DEMO_DATA.proker.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[#C6F432]" style={{ width: `${DEMO_DATA.proker.progress}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-white/60">
                  <span>Tahap: Wawancara Pemateri</span>
                  <span>Tenggat: 30 Nov</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 4: REKAP PORTOFOLIO & RESUME ATS (7 Cols - Photo + ATS Verified) ── */}
          <div className="lg:col-span-7 group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#12332a]/70 p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-[#C6F432]/50 hover:bg-[#12332a]">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/20">
                    <Award size={18} />
                  </span>
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#C6F432]">
                      04 // RESUME ATS OTOMATIS
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                      Tugas Kuliah Jadi Portofolio Magang
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCv}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <Copy size={11} className="text-[#C6F432]" />
                    <span>{copiedCv ? "Tersalin! ✓" : "Salin Resume"}</span>
                  </button>
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#F4F1EA]/75 leading-relaxed font-normal max-w-xl">
                Setiap tugas besar dan proker yang kamu tuntaskan otomatis terformat ke standar Harvard ATS. Siap apply Kampus Merdeka atau magang tanpa pusing menyusun dari nol.
              </p>
            </div>

            {/* Split Visual: Real Career Photo + ATS Document Card */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-5 relative h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10">
                <Image
                  src="/images/landing/feature-career.jpg"
                  alt="Mahasiswa tersenyum dengan laptop siap melamar magang"
                  fill
                  sizes="(max-width: 640px) 100vw, 30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f16] via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-[#0a1f16]/90 border border-[#C6F432]/30 px-2 py-1 text-center font-mono text-[10px] font-bold text-[#C6F432] backdrop-blur-md">
                  ✓ SKOR ATS 96/100
                </div>
              </div>

              <div className="sm:col-span-7 rounded-2xl border border-white/15 bg-[#F4F1EA] p-4 text-[#0b140f] shadow-inner">
                <div className="flex items-center justify-between border-b border-[#0b140f]/15 pb-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0b140f]">
                    Format Resume Harvard
                  </span>
                  <span className="font-mono text-[10px] text-[#0b140f]/60">Terverifikasi</span>
                </div>
                <div className="mt-2.5 space-y-1.5 text-xs text-[#0b140f]/85">
                  <p className="font-bold text-[11.5px] truncate text-[#0b140f]">
                    • {DEMO_DATA.cvBullets[1].title} ({DEMO_DATA.cvBullets[1].period})
                  </p>
                  <p className="text-[11px] leading-relaxed line-clamp-2 text-[#0b140f]/75">
                    {DEMO_DATA.cvBullets[1].bullet}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
