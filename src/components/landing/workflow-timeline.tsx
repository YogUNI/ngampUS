"use client";

import React from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  Award, 
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export function WorkflowTimeline() {
  const steps = [
    {
      num: "01",
      icon: Calendar,
      title: "Input Jadwal Kuliah",
      desc: "Hanya butuh 2 menit untuk menata mata kuliah, ruang kelas, dan link Google Meet semester ini.",
      badge: "Setup 2 Menit",
    },
    {
      num: "02",
      icon: Clock,
      title: "Kuliah & Organisasi Rapi",
      desc: "Radar deadline mengingatkan tugas terdekat. Tak ada lagi panik tengah malam atau jadwal bentrok.",
      badge: "Zero Panik",
    },
    {
      num: "03",
      icon: Award,
      title: "Siap Tembus Magang",
      desc: "Tugas besar dan proker otomatis terangkum menjadi resume Harvard ATS 96 siap pakai.",
      badge: "Format Harvard",
    },
  ];

  return (
    <div className="relative w-full">
      {/* 3 Streamlined Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div 
              key={idx}
              className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#12332a]/80 p-6 sm:p-8 transition-all hover:border-[#C6F432]/40 hover:bg-[#12332a]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="font-mono text-2xl font-black text-[#C6F432]">
                    {step.num}
                  </span>
                  <span className="rounded-full bg-[#C6F432]/10 border border-[#C6F432]/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#C6F432]">
                    {step.badge}
                  </span>
                </div>

                <div className="mt-5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-[#C6F432] border border-white/10 mb-3">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-black text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#F4F1EA]/70 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-[#C6F432]">
                <CheckCircle2 size={13} />
                <span>Otomatis & Terintegrasi</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Banner Ribbon */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-[#0a1f16] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#C6F432]/15 text-[#C6F432] shrink-0">
            <Sparkles size={16} />
          </span>
          <p className="text-xs sm:text-sm text-[#F4F1EA]/80 font-sans">
            Mulai semester ini dengan kendali penuh. Gratis selamanya tanpa kartu kredit.
          </p>
        </div>
        <Link
          href="/register"
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#C6F432] px-4 py-2 text-xs font-bold text-[#0a1f16] hover:brightness-110 transition active:scale-95"
        >
          <span>Buat Workspace Gratis</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
