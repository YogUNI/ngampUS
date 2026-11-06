"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  Check
} from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";

export function BeforeAfter() {
  const [taskDone, setTaskDone] = useState(false);
  const [meetCopied, setMeetCopied] = useState(false);
  const [exportedPdf, setExportedPdf] = useState(false);

  const handleMeetClick = () => {
    setMeetCopied(true);
    setTimeout(() => setMeetCopied(false), 2200);
  };

  const handleExportPdf = () => {
    setExportedPdf(true);
    setTimeout(() => setExportedPdf(false), 2500);
  };

  return (
    <section 
      id="comparison"
      aria-label="Perbandingan Semester Tanpa vs Dengan ngampUS"
      className="relative border-b border-white/10 bg-[#0a1f16] py-14 sm:py-18 lg:py-20 px-4 sm:px-8 lg:px-12 text-[#F4F1EA] scroll-mt-20 sm:scroll-mt-24 overflow-hidden"
    >
      {/* Subtle Radial Glow */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[850px] rounded-full bg-radial from-[#12332a]/50 via-transparent to-transparent blur-3xl opacity-40"
      />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Section Header - Compact & Punchy */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#12332a] px-3.5 py-1 text-xs font-mono font-bold text-[#C6F432]">
            <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
            <span>KONTROL RITME KULIAH</span>
          </div>

          <h2 className="font-display mt-3 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Semester tanpa vs dengan <span className="text-[#C6F432]">ngampUS</span>.
          </h2>
          <p className="mt-2.5 text-xs sm:text-base text-[#F4F1EA]/70 leading-relaxed font-normal max-w-xl mx-auto">
            Dari panik scroll puluhan grup chat di malam deadline, jadi satu terminal perkuliahan yang presisi dan terkendali.
          </p>
        </div>

        {/* ── THE SPLIT REALITY DECK (SELALU BERDAMPINGAN) ── */}
        <div className="relative rounded-3xl border border-white/10 bg-[#0d261e]/60 p-2 sm:p-3 shadow-2xl backdrop-blur-xs">
          
          {/* Central Floating VS Badge (Desktop) */}
          <div 
            aria-hidden="true"
            className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-[#0a1f16] border border-white/20 text-[#C6F432] font-mono text-xs font-black shadow-xl shadow-black/70 pointer-events-none"
          >
            VS
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 items-stretch">
            
            {/* ── LEFT PANE: TANPA NGAMPUS (CHAOS MANUAL) ── */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#FF4D3D]/30 bg-[#171213] p-4 sm:p-6 transition-all">
              
              {/* Header Strip */}
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#FF4D3D]/20 text-[#FF4D3D]">
                      <AlertTriangle size={15} />
                    </span>
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#FF4D3D]">
                        REALITAS MANUAL
                      </span>
                      <h3 className="font-display text-base sm:text-lg font-black text-white leading-tight">
                        Tanpa ngampUS
                      </h3>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#FF4D3D]/15 border border-[#FF4D3D]/30 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#FF4D3D]">
                    999+ Chat • 2 Bentrok
                  </span>
                </div>

                {/* 3 Real-Life Chaos Strips */}
                <div className="mt-4 space-y-2.5">
                  
                  {/* Item 1: Jadwal Kuliah Hilang di Chat */}
                  <div className="rounded-xl border border-white/10 bg-[#221616] p-3 text-left">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-[#FF4D3D]">Grup WA Angkatan (140 Mahasiswa)</span>
                      <span className="text-white/40">07:42 WIB</span>
                    </div>
                    <p className="mt-1 text-xs text-white/85 leading-relaxed font-sans">
                      &quot;Guys, praktikum Algoritma hari ini di Lab 3 atau hybrid? Link GMeet dosen di mana ya? Chat tenggelam nih!&quot;
                    </p>
                    <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-white/50 border-t border-white/5 pt-1.5">
                      <span className="text-[#FF4D3D] font-semibold">Status: Masuk terlambat 15 menit</span>
                      <span>Ruangan tidak sinkron</span>
                    </div>
                  </div>

                  {/* Item 2: Deadline Numpuk & Panik H-2 Jam */}
                  <div className="rounded-xl border border-white/10 bg-[#221616] p-3 text-left">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-amber-400">Portal Kuliah Kampus</span>
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                        DEADLINE H-2 JAM
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/85 leading-relaxed font-sans">
                      Baru sadar jam 22.00 malam kalau ada kuis dan tugas laporan praktikum modul 4. Format submit PDF apa docx belum jelas.
                    </p>
                    <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-white/50 border-t border-white/5 pt-1.5">
                      <span className="text-amber-400 font-semibold">Tugas: 3 deadline menumpuk</span>
                      <span>Panik semalam suntuk</span>
                    </div>
                  </div>

                  {/* Item 3: Magang Terlewat karena CV Berantakan */}
                  <div className="rounded-xl border border-white/10 bg-[#221616] p-3 text-left">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-rose-300">Persiapan Magang & Karir</span>
                      <span className="text-white/40">Semester 4</span>
                    </div>
                    <p className="mt-1 text-xs text-white/85 leading-relaxed font-sans">
                      Pendaftaran Kampus Merdeka & startup dibuka. Sertifikat proker panitia dan bukti tugas kuliah tercecer entah di folder mana.
                    </p>
                    <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-white/50 border-t border-white/5 pt-1.5">
                      <span className="text-[#FF4D3D] font-semibold">Skor ATS Resume: 42/100</span>
                      <span>Format belum standar</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Impact Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-[11px] text-[#FF4D3D]">
                <span className="font-bold uppercase tracking-wider">Hasil Semester</span>
                <span className="font-semibold text-right">Burnout, jadwal bentrok, CV tertinggal</span>
              </div>
            </div>

            {/* ── RIGHT PANE: DENGAN NGAMPUS (TERMINAL PRESISI) ── */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#C6F432]/40 bg-[#0e2a20] p-4 sm:p-6 shadow-xl transition-all relative overflow-hidden">
              
              {/* Subtle Lime Accent Glow */}
              <div 
                aria-hidden="true" 
                className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#C6F432]/10 blur-2xl"
              />

              {/* Header Strip */}
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#C6F432]/20 text-[#C6F432]">
                      <CheckCircle2 size={15} />
                    </span>
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#C6F432]">
                        TERMINAL PRESISI
                      </span>
                      <h3 className="font-display text-base sm:text-lg font-black text-white leading-tight">
                        Dengan ngampUS
                      </h3>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#C6F432]/15 border border-[#C6F432]/30 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#C6F432]">
                    0 Bentrok • IPK {DEMO_DATA.student.ipk}
                  </span>
                </div>

                {/* 3 Interactive Action Strips */}
                <div className="mt-4 space-y-2.5">
                  
                  {/* Item 1: Jadwal Kuliah & Link Kelas 1-Klik */}
                  <div className="rounded-xl border border-[#C6F432]/30 bg-[#0a1f16] p-3 text-left">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-[#C6F432]">
                        {DEMO_DATA.courses[0].name} ({DEMO_DATA.courses[0].sks} SKS)
                      </span>
                      <span className="rounded bg-[#C6F432]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#C6F432]">
                        08:00 - 09:40
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-xs text-white/85 font-sans truncate">
                        {DEMO_DATA.courses[0].room} • {DEMO_DATA.courses[0].lecturer}
                      </p>
                      <button
                        type="button"
                        onClick={handleMeetClick}
                        className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#C6F432] px-2.5 py-1 text-[11px] font-bold text-[#0a1f16] transition-all hover:brightness-110 active:scale-95 shadow-xs cursor-pointer"
                        title="Buka link kuliah"
                      >
                        {meetCopied ? (
                          <>
                            <Check size={12} />
                            <span>Tersambung!</span>
                          </>
                        ) : (
                          <>
                            <span>Buka Meet</span>
                            <ExternalLink size={11} />
                          </>
                        )}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-white/50 border-t border-white/5 pt-1.5">
                      <span className="text-[#C6F432] font-semibold">Terkoneksi Google Calendar</span>
                      <span>0 Menit terlambat</span>
                    </div>
                  </div>

                  {/* Item 2: Radar Deadline Interaktif (Clickable) */}
                  <div className="rounded-xl border border-[#C6F432]/30 bg-[#0a1f16] p-3 text-left">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-amber-300">
                        Radar Deadline Prioritas
                      </span>
                      <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                        BESOK 23:59 WIB
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className={`text-xs font-sans transition-all ${
                        taskDone ? "line-through text-white/40" : "text-white/85"
                      }`}>
                        {DEMO_DATA.urgentTask.title} • {DEMO_DATA.urgentTask.course}
                      </p>
                      <button
                        type="button"
                        onClick={() => setTaskDone(!taskDone)}
                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-mono font-bold transition-all cursor-pointer ${
                          taskDone 
                            ? "bg-[#C6F432] border-[#C6F432] text-[#0a1f16]" 
                            : "border-white/20 bg-white/5 text-[#F4F1EA] hover:border-[#C6F432]/60 hover:text-white"
                        }`}
                      >
                        <Check size={12} className={taskDone ? "opacity-100" : "opacity-40"} />
                        <span>{taskDone ? "Tuntas (+1 Portofolio)" : "Tandai Selesai"}</span>
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-white/50 border-t border-white/5 pt-1.5">
                      <span className="text-[#C6F432] font-semibold">Progres: {taskDone ? "100% Selesai" : "90% Tersusun"}</span>
                      <span>Sistem pengingat aktif</span>
                    </div>
                  </div>

                  {/* Item 3: Rekap CV Magang ATS 96 (Clickable Export) */}
                  <div className="rounded-xl border border-[#C6F432]/30 bg-[#0a1f16] p-3 text-left">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-[#C6F432]">Rekap CV ATS Otomatis</span>
                      <span className="rounded bg-[#C6F432]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#C6F432]">
                        SKOR ATS: 96/100
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-xs text-white/85 font-sans truncate">
                        HIMATIF Tech Seminar + REST API Project (Harvard Standard)
                      </p>
                      <button
                        type="button"
                        onClick={handleExportPdf}
                        className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#C6F432]/40 bg-[#12332a] px-2.5 py-1 text-[11px] font-mono font-bold text-[#C6F432] transition-all hover:bg-[#C6F432] hover:text-[#0a1f16] active:scale-95 cursor-pointer"
                        title="Ekspor ringkasan CV"
                      >
                        {exportedPdf ? (
                          <>
                            <Check size={12} />
                            <span>Terekspor!</span>
                          </>
                        ) : (
                          <>
                            <Download size={11} />
                            <span>Ekspor CV</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-white/50 border-t border-white/5 pt-1.5">
                      <span className="text-[#C6F432] font-semibold">Portofolio terverifikasi</span>
                      <span>Siap apply magang 1-klik</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Impact Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-[11px] text-[#C6F432]">
                <span className="font-bold uppercase tracking-wider">Hasil Semester</span>
                <span className="font-semibold text-right">Ritme terjaga, tidur cukup, siap tembus magang</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
