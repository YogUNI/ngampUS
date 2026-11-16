"use client";

import React, { useState } from "react";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquareWarning, 
  FileWarning, 
  ExternalLink,
  Sparkles,
  Download,
  Check
} from "lucide-react";

export function BeforeAfter() {
  const [taskChecked, setTaskChecked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section 
      id="comparison"
      aria-label="Perbandingan Sebelum dan Sesudah ngampUS"
      className="relative border-b border-white/10 bg-[#0d261e] py-16 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-12 text-[#F4F1EA] scroll-mt-20 overflow-hidden"
    >
      {/* Subtle Ambient Radial Glow */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-radial from-[#12332a]/60 via-transparent to-transparent blur-3xl opacity-50"
      />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#12332a] px-3.5 py-1 text-xs font-mono font-bold text-[#C6F432]">
            <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
            <span>KONTROL RITME KULIAH</span>
          </div>

          <h2 className="font-display mt-3 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Perbedaan ritme semestermu.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#F4F1EA]/70 leading-relaxed font-normal">
            Beralih dari panik scroll puluhan grup chat di malam deadline, menjadi satu terminal perkuliahan yang presisi dan hening.
          </p>
        </div>

        {/* ── SIDE-BY-SIDE SPLIT CARDS ── */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          
          {/* Floating Desktop VS Badge */}
          <div 
            aria-hidden="true"
            className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-[#0a1f16] border border-white/20 text-[#C6F432] font-mono text-xs font-black shadow-xl pointer-events-none"
          >
            VS
          </div>

          {/* ── CARD 1: CARA LAMA (MANUAL & PANIK) ── */}
          <div className="flex flex-col justify-between rounded-3xl border border-red-500/25 bg-[#161112] p-6 sm:p-8 transition-all">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-red-500/15 text-red-400">
                    <AlertCircle size={18} />
                  </span>
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-red-400">
                      Sebelumnya
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-black text-white">
                      Kekacauan Manual
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 font-mono text-[11px] font-bold text-red-400">
                  999+ Chat • Stres
                </span>
              </div>

              {/* 3 Clear Pain Points */}
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-2xl bg-white/[0.02] border border-white/5 p-3.5">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-400">
                    <MessageSquareWarning size={14} />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Link Kuliah & Info Ruangan Hilang</h4>
                    <p className="mt-1 text-xs text-[#F4F1EA]/65 leading-relaxed">
                      Link Google Meet dan ruang praktikum tenggelam di antara ratusan obrolan grup WA angkatan setiap pagi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white/[0.02] border border-white/5 p-3.5">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-400">
                    <Clock size={14} />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Deadline Panik H-2 Jam</h4>
                    <p className="mt-1 text-xs text-[#F4F1EA]/65 leading-relaxed">
                      Baru sadar tengah malam kalau ada laporan praktikum dan kuis yang harus disubmit di portal kampus.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white/[0.02] border border-white/5 p-3.5">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-400">
                    <FileWarning size={14} />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Bukti Tugas & Magang Tercecer</h4>
                    <p className="mt-1 text-xs text-[#F4F1EA]/65 leading-relaxed">
                      Saat ada lowongan magang atau Kampus Merdeka, riwayat tugas besar dan kepanitiaan tersebar entah di mana.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-red-400">
              <span className="uppercase font-bold tracking-wider">Dampak Akhir</span>
              <span>Kelelahan, jadwal bentrok, resume kosong</span>
            </div>
          </div>

          {/* ── CARD 2: DENGAN NGAMPUS (TERKENDALI & PRESISI) ── */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#C6F432]/35 bg-[#12332a] p-6 sm:p-8 shadow-2xl transition-all">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#C6F432]/20 text-[#C6F432]">
                    <CheckCircle2 size={18} />
                  </span>
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#C6F432]">
                      Bersama ngampUS
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-black text-white">
                      Semua Terkendali
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-[#C6F432]/15 border border-[#C6F432]/40 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#C6F432]">
                  1 Tempat • Tenang
                </span>
              </div>

              {/* 3 Streamlined Advantages with Micro-Interactions */}
              <div className="mt-6 space-y-4">
                <div className="flex items-start justify-between gap-3 rounded-2xl bg-[#0a1f16] border border-white/10 p-3.5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#C6F432]/15 text-[#C6F432]">
                      <ExternalLink size={14} />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Jadwal & Meet 1-Klik</h4>
                      <p className="mt-1 text-xs text-[#F4F1EA]/70 leading-relaxed">
                        Senin 08:00 • Algoritma & Pemrograman (Lab 3). Tautan kuliah online langsung tersedia.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 self-center rounded-xl bg-[#C6F432] px-2.5 py-1 text-[11px] font-bold text-[#0a1f16] hover:brightness-110 transition cursor-pointer"
                  >
                    {copiedLink ? "Tersalin! ✓" : "Buka Meet ↗"}
                  </button>
                </div>

                <div className="flex items-start justify-between gap-3 rounded-2xl bg-[#0a1f16] border border-white/10 p-3.5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#C6F432]/15 text-[#C6F432]">
                      <Clock size={14} />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Radar Deadline H-1 / H-2</h4>
                      <p className={`mt-1 text-xs transition-all leading-relaxed ${taskChecked ? "line-through text-white/40" : "text-[#F4F1EA]/70"}`}>
                        Laporan Praktikum Modul 4 • Tenggat Besok 23:59 WIB.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTaskChecked(!taskChecked)}
                    className={`shrink-0 self-center inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-bold font-mono transition cursor-pointer ${
                      taskChecked 
                        ? "bg-[#C6F432] border-[#C6F432] text-[#0a1f16]" 
                        : "border-white/20 bg-white/5 text-[#F4F1EA] hover:border-[#C6F432]/60"
                    }`}
                  >
                    <Check size={12} />
                    <span>{taskChecked ? "Tuntas" : "Selesaikan"}</span>
                  </button>
                </div>

                <div className="flex items-start justify-between gap-3 rounded-2xl bg-[#0a1f16] border border-[#C6F432]/25 p-3.5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#C6F432]/15 text-[#C6F432]">
                      <Sparkles size={14} />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Resume Magang ATS 96 Otomatis</h4>
                      <p className="mt-1 text-xs text-[#F4F1EA]/70 leading-relaxed">
                        Tugas kuliah & proker kepanitiaan langsung siap diekspor ke CV standar Harvard.
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 self-center rounded-lg bg-[#C6F432]/20 border border-[#C6F432]/40 px-2 py-0.5 font-mono text-[10px] font-bold text-[#C6F432]">
                    ATS 96/100
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#C6F432]">
              <span className="uppercase font-bold tracking-wider">Hasil Akhir</span>
              <span>Ritme teratur, tidur cukup, siap tembus magang</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
