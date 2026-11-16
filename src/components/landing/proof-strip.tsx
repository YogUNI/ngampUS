"use client";

import React from "react";
import { GraduationCap, Clock3, ShieldCheck, Award } from "lucide-react";

export function ProofStrip() {
  const metrics = [
    {
      icon: GraduationCap,
      value: "14+",
      label: "Kampus di Indonesia",
      desc: "Mahasiswa UI, ITB, UGM, ITS, BINUS & lainnya",
    },
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Gratis Selamanya",
      desc: "Nol biaya langganan, nol paywall, tanpa iklan",
    },
    {
      icon: Clock3,
      value: "2,400+",
      label: "Jam Kuliah Teratur",
      desc: "Jadwal kelas, lab & deadline tertata presisi",
    },
    {
      icon: Award,
      value: "96/100",
      label: "Skor Resume ATS",
      desc: "Format standar Harvard siap lamar magang",
    },
  ];

  const campuses = [
    "Universitas Indonesia",
    "Institut Teknologi Bandung",
    "Universitas Gadjah Mada",
    "ITS Surabaya",
    "BINUS University",
    "Telkom University",
    "Universitas Padjadjaran",
    "Universitas Diponegoro",
  ];

  return (
    <section 
      id="proof-strip"
      aria-label="Statistik dan Kepercayaan Kampus"
      className="relative border-b border-white/10 bg-[#0a1f16] py-10 sm:py-12 px-4 sm:px-8 lg:px-12 text-[#F4F1EA]"
    >
      <div className="relative mx-auto max-w-7xl">
        {/* 4 Minimalist Metric Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 transition-all duration-300 hover:border-[#C6F432]/40 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#C6F432]">
                  <Icon size={14} className="shrink-0" />
                  <span>{item.label}</span>
                </div>
                <div className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white group-hover:text-[#C6F432] transition-colors">
                  {item.value}
                </div>
                <p className="mt-1 text-xs text-[#F4F1EA]/60 font-normal leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quiet Campus Ticker Ribbon */}
        <div className="mt-8 pt-5 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono text-[#F4F1EA]/50">
          <div className="flex items-center gap-2 text-[#C6F432] text-[11px] font-bold tracking-wider uppercase shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C6F432] animate-pulse" />
            <span>Mahasiswa Aktif Tersebar Di:</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-[11px]">
            {campuses.map((c, i) => (
              <React.Fragment key={c}>
                <span className="hover:text-white transition-colors">{c}</span>
                {i < campuses.length - 1 && <span className="text-white/20">·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
