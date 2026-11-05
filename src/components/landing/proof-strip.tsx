"use client";

import React from "react";
import { GraduationCap, Clock3, ShieldCheck, Award } from "lucide-react";

export function ProofStrip() {
  return (
    <section 
      id="proof-strip"
      aria-label="Statistik dan Kepercayaan Kampus"
      className="relative border-b border-white/10 bg-[#0d261e] py-10 sm:py-14 px-4 sm:px-8 lg:px-12 text-[#F4F1EA] overflow-hidden"
    >
      {/* Background Subtle Radial Ambience */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-radial-[at_50%_50%] from-[#12332a]/40 via-transparent to-transparent opacity-50"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* TODO: Ganti dengan data resmi kemitraan kampus saat peluncuran publik */}
        
        {/* 4 Monospace Metric Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8 min-w-0">
          
          {/* Metric 1 */}
          <div className="group rounded-2xl border-l-2 border-[#C6F432]/40 bg-white/[0.02] p-4 sm:p-5 transition-all duration-300 hover:border-[#C6F432] hover:bg-white/[0.04]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#C6F432] tracking-wider">
              <GraduationCap size={15} className="shrink-0" />
              <span>Komunitas Kampus</span>
            </div>
            <div className="font-mono mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white transition-colors group-hover:text-[#C6F432]">
              14<span className="text-[#C6F432]">+</span> Kampus
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-[#F4F1EA]/65 leading-relaxed font-sans">
              Mahasiswa dari UI, ITB, UGM, ITS, BINUS, hingga Telkom University.
            </p>
          </div>

          {/* Metric 2 */}
          <div className="group rounded-2xl border-l-2 border-[#C6F432]/40 bg-white/[0.02] p-4 sm:p-5 transition-all duration-300 hover:border-[#C6F432] hover:bg-white/[0.04]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#C6F432] tracking-wider">
              <Clock3 size={15} className="shrink-0" />
              <span>Beban Akademik</span>
            </div>
            <div className="font-mono mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white transition-colors group-hover:text-[#C6F432]">
              2,400<span className="text-[#C6F432]">+</span> Jam
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-[#F4F1EA]/65 leading-relaxed font-sans">
              Jadwal kuliah, praktikum lab, dan batas waktu tugas tertata rapi.
            </p>
          </div>

          {/* Metric 3 */}
          <div className="group rounded-2xl border-l-2 border-[#C6F432]/40 bg-white/[0.02] p-4 sm:p-5 transition-all duration-300 hover:border-[#C6F432] hover:bg-white/[0.04]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#C6F432] tracking-wider">
              <ShieldCheck size={15} className="shrink-0" />
              <span>Akses Terbuka</span>
            </div>
            <div className="font-mono mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white transition-colors group-hover:text-[#C6F432]">
              100<span className="text-[#C6F432]">%</span> Gratis
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-[#F4F1EA]/65 leading-relaxed font-sans">
              Bukan versi trial. Nol paywall, nol iklan yang mengganggu fokus.
            </p>
          </div>

          {/* Metric 4 */}
          <div className="group rounded-2xl border-l-2 border-[#C6F432]/40 bg-white/[0.02] p-4 sm:p-5 transition-all duration-300 hover:border-[#C6F432] hover:bg-white/[0.04]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#C6F432] tracking-wider">
              <Award size={15} className="shrink-0" />
              <span>Kesiapan Magang</span>
            </div>
            <div className="font-mono mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white transition-colors group-hover:text-[#C6F432]">
              96<span className="text-[#C6F432]">/100</span> <span className="text-sm sm:text-base font-bold text-[#C6F432]">ATS</span>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-[#F4F1EA]/65 leading-relaxed font-sans">
              Rata-rata skor evaluasi format resume magang mahasiswa.
            </p>
          </div>

        </div>

        {/* Ticker / Campus Names Micro Bar */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 text-xs font-mono text-[#F4F1EA]/50 w-full min-w-0">
          <div className="flex items-center gap-2 text-[#C6F432] uppercase tracking-wider text-[11px] shrink-0 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C6F432] animate-pulse" />
            <span>Mahasiswa Aktif Tersebar Di:</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1.5 text-[11px] sm:text-xs min-w-0">
            <span className="hover:text-white transition-colors">Universitas Indonesia</span>
            <span className="text-white/20">/</span>
            <span className="hover:text-white transition-colors">Institut Teknologi Bandung</span>
            <span className="text-white/20">/</span>
            <span className="hover:text-white transition-colors">Universitas Gadjah Mada</span>
            <span className="text-white/20">/</span>
            <span className="hover:text-white transition-colors">ITS Surabaya</span>
            <span className="text-white/20">/</span>
            <span className="hover:text-white transition-colors">BINUS University</span>
            <span className="text-white/20">/</span>
            <span className="hover:text-white transition-colors">Telkom University</span>
          </div>
        </div>

      </div>
    </section>
  );
}
