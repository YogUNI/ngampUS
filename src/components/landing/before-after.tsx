"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Calendar, FileText, ArrowRight, Sparkles } from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";

export function BeforeAfter() {
  const [activeTab, setActiveTab] = useState<"both" | "before" | "after">("both");

  return (
    <section 
      aria-label="Perbandingan Semester Tanpa vs Dengan ngampUS"
      className="relative border-b border-white/10 bg-[#0a1f16] py-20 sm:py-28 px-4 sm:px-8 lg:px-12 text-[#F4F1EA] overflow-hidden"
    >
      {/* Background Ambience */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-radial from-[#12332a]/40 via-transparent to-transparent blur-3xl opacity-50"
      />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#12332a] px-3.5 py-1.5 text-xs font-mono font-bold text-[#C6F432]">
            <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
            <span>KONTROL RITME KULIAH</span>
          </div>

          <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Semester tanpa vs dengan <span className="text-[#C6F432]">ngampUS</span>.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#F4F1EA]/70 leading-relaxed font-normal">
            Lihat perbedaan nyata saat carut-marut grup WhatsApp dan catatan tempel acak digantikan oleh satu ruang kerja perkuliahan yang presisi.
          </p>

          {/* Interactive Mobile Filter Controls */}
          <div className="mt-8 inline-flex p-1 rounded-2xl bg-[#12332a] border border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab("both")}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === "both" 
                  ? "bg-[#C6F432] text-[#0a1f16] shadow-sm" 
                  : "text-[#F4F1EA]/70 hover:text-white"
              }`}
            >
              Berdampingan
            </button>
            <button
              onClick={() => setActiveTab("before")}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === "before" 
                  ? "bg-[#FF4D3D] text-white shadow-sm" 
                  : "text-[#F4F1EA]/70 hover:text-white"
              }`}
            >
              Tanpa ngampUS
            </button>
            <button
              onClick={() => setActiveTab("after")}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === "after" 
                  ? "bg-[#C6F432] text-[#0a1f16] shadow-sm" 
                  : "text-[#F4F1EA]/70 hover:text-white"
              }`}
            >
              Dengan ngampUS
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid gap-8 lg:grid-cols-2 items-stretch">
          
          {/* ── SISI KIRI: TANPA NGAMPUS (KACAU & OVERWHELMED) ── */}
          {(activeTab === "both" || activeTab === "before") && (
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#FF4D3D]/30 bg-[#1c1414] p-6 sm:p-8 shadow-2xl transition-all">
              
              {/* Header Status */}
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#FF4D3D]/20 text-[#FF4D3D]">
                      <AlertTriangle size={18} />
                    </span>
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#FF4D3D]">
                        KONDISI UMUM
                      </span>
                      <h3 className="font-display text-xl font-black text-white">Tanpa ngampUS</h3>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#FF4D3D]/15 border border-[#FF4D3D]/30 px-3 py-1 font-mono text-xs font-bold text-[#FF4D3D]">
                    Stres Tinggi • Sering Panik
                  </span>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-[#F4F1EA]/70 leading-relaxed">
                  Informasi kuliah berserakan di puluhan grup chat WhatsApp yang tenggelam. Tugas mendadak diketahui beberapa jam sebelum tenggat portal kampus ditutup.
                </p>

                {/* Chaotic Mockup Elements */}
                <div className="mt-6 space-y-3">
                  
                  {/* Fake WhatsApp Message 1 */}
                  <div className="rounded-2xl border border-white/10 bg-[#291717] p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
                      <span className="font-bold text-[#FF4D3D]">Grup Kelas: Algoritma & Basis Data</span>
                      <span>22:41 WIB</span>
                    </div>
                    <p className="mt-1 text-xs text-white/90 font-medium">
                      "Guys, tugas modul 4 formatnya PDF apa docx? Link Google Drive buat submit ada di mana ya? Kok tenggelam chatnya?!"
                    </p>
                  </div>

                  {/* Fake WhatsApp Message 2 */}
                  <div className="rounded-2xl border border-white/10 bg-[#291717] p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
                      <span className="font-bold text-amber-400">Grup Panitia: Tech Seminar BEM</span>
                      <span>15:10 WIB</span>
                    </div>
                    <p className="mt-1 text-xs text-white/90 font-medium">
                      "Rapat divisi jam 4 sore ini wajib hadir ya! Eh tapi ada yang barengan praktikum lab ya? Bentrok lagi dong..."
                    </p>
                  </div>

                  {/* Messy Sticky Note Overlay */}
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-950/40 p-3.5 rotate-[-0.5deg]">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300">
                      <span>STICKY NOTE KULIAH</span>
                      <span>HAMPIR TERLEWAT</span>
                    </div>
                    <p className="mt-1 text-xs text-amber-100 font-mono">
                      • Laporan Basis Data: Belum kumpul (Deadline malam ini!)<br />
                      • Slide dosen P4: Belum di-download<br />
                      • CV buat magang semester depan: Belum mulai dibuat
                    </p>
                  </div>

                </div>
              </div>

              {/* Bottom Outcome */}
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#FF4D3D]">
                <span>DAMPAK: AKADEMIK & MENTAL</span>
                <span className="font-bold">Kurang Tidur & Berantakan</span>
              </div>
            </div>
          )}

          {/* ── SISI KANAN: DENGAN NGAMPUS (RAPI & TERKENDALI) ── */}
          {(activeTab === "both" || activeTab === "after") && (
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#C6F432]/40 bg-[#12332a] p-6 sm:p-8 shadow-2xl transition-all">
              
              {/* Header Status */}
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#C6F432]/20 text-[#C6F432]">
                      <CheckCircle2 size={18} />
                    </span>
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#C6F432]">
                        SOLUSI NGAMPUS
                      </span>
                      <h3 className="font-display text-xl font-black text-white">Dengan ngampUS</h3>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#C6F432]/15 border border-[#C6F432]/30 px-3 py-1 font-mono text-xs font-bold text-[#C6F432]">
                    Teratur • Ritme Terkendali
                  </span>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-[#F4F1EA]/70 leading-relaxed">
                  Semua komponen akademik saling terhubung di satu terminal: jadwal harian langsung terhubung ke link kelas, deadline diurutkan secara otomatis, dan proker terekam jadi poin resume ATS.
                </p>

                {/* Clean Organized Mockup Elements */}
                <div className="mt-6 space-y-3">
                  
                  {/* Clean Card 1: Matkul Terjadwal */}
                  <div className="rounded-2xl border border-[#C6F432]/30 bg-[#0a1f16] p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className="text-[#C6F432]">{DEMO_DATA.courses[0].code} • {DEMO_DATA.courses[0].sks} SKS</span>
                      <span className="rounded-full bg-[#C6F432]/10 text-[#C6F432] px-2 py-0.5 text-[9px] uppercase">
                        HARI INI
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div>
                        <h4 className="font-display text-sm font-bold text-white">
                          {DEMO_DATA.courses[0].name}
                        </h4>
                        <p className="text-xs text-white/60">
                          {DEMO_DATA.courses[0].time} • {DEMO_DATA.courses[0].room}
                        </p>
                      </div>
                      <span className="rounded-xl bg-[#C6F432] px-3 py-1 text-[11px] font-bold text-[#0a1f16] shadow-xs">
                        Buka Meet ↗
                      </span>
                    </div>
                  </div>

                  {/* Clean Card 2: Radar Deadline Urgensi */}
                  <div className="rounded-2xl border border-[#FF4D3D]/50 bg-[#251515] p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#FF4D3D] px-2.5 py-0.5 text-[10px] font-mono font-black text-white uppercase">
                        DEADLINE BESOK • H-1
                      </span>
                      <span className="font-mono text-xs text-white/80">23:59 WIB</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <h5 className="font-display text-sm font-bold text-white">
                          {DEMO_DATA.urgentTask.title}
                        </h5>
                        <p className="text-[11px] text-white/60">
                          {DEMO_DATA.urgentTask.course}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-[#C6F432] font-bold bg-[#C6F432]/10 border border-[#C6F432]/30 px-2 py-1 rounded-lg">
                        +1 Proyek Portofolio
                      </span>
                    </div>
                  </div>

                  {/* Clean Card 3: Portofolio & CV ATS Tuntas */}
                  <div className="rounded-2xl border border-white/10 bg-[#0d261e] p-3.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white/60">REKAP CV ATS TERKURASI</span>
                      <span className="text-[#C6F432] font-bold">Skor ATS: 96/100</span>
                    </div>
                    <p className="mt-1 text-xs text-white/80 font-sans">
                      Proker HIMATIF & Proyek REST API otomatis terformat ke standar Harvard resume, siap ekspor 1-klik.
                    </p>
                  </div>

                </div>
              </div>

              {/* Bottom Outcome */}
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#C6F432]">
                <span>HASIL: FOKUS & SIAP KARIR</span>
                <span className="font-bold">Semester Tuntas Tanpa Panik</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}

