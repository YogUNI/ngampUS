"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Users, 
  Flame, 
  Award, 
  Check, 
  Video, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";

export function WorkflowTimeline() {
  const [taskDone, setTaskDone] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  const handleToggleTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !taskDone;
    setTaskDone(next);
    if (next) {
      showToast("✦ Tugas selesai! Skor CV ATS naik ke 96.");
    } else {
      showToast("Tugas dikembalikan ke antrean aktif.");
    }
  };

  const handleDownloadCv = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast("✓ Format resume magang ATS 96 siap diunduh (PDF).");
  };

  return (
    <div className="relative w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-[#C6F432]/40 bg-[#0a1f16]/95 px-4 py-2.5 text-xs font-mono font-bold text-[#F4F1EA] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#C6F432] text-[#0a1f16] text-[10px] font-black">
            ✓
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 4 COMPACT TACTILE STEP CARDS (Single Visual Ribbon) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
        
        {/* ── CARD 01: JADWAL KULIAH & MEET ── */}
        <div className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#12332a]/70 p-5 sm:p-6 transition-all duration-300 hover:border-[#C6F432]/50 hover:bg-[#12332a] hover:-translate-y-1 shadow-lg">
          <div>
            {/* Step Pill & Icon */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-[#C6F432] tracking-wider">
                01 // JADWAL
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 text-[#C6F432] border border-white/10 group-hover:border-[#C6F432]/40 transition-colors">
                <Calendar size={16} />
              </span>
            </div>

            <h3 className="font-display mt-4 text-lg font-black text-white tracking-tight">
              Sinkronkan Jam & Meet
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#F4F1EA]/70">
              Tautkan jadwal kelas, Google Meet, dan lokasi lab ke kalender ponsel.
            </p>
          </div>

          {/* Micro Visual Widget */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0a1f16] p-3 text-xs font-mono">
            <div className="flex items-center justify-between text-[10px] text-[#C6F432]">
              <span className="font-bold">SENIN • 08:00 WIB</span>
              <span className="rounded-md bg-[#C6F432]/15 px-1.5 py-0.5 font-bold">3 SKS</span>
            </div>
            <div className="font-sans font-bold text-white text-xs mt-1 truncate">
              {DEMO_DATA.courses[0].name}
            </div>
            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
              <span className="inline-flex items-center gap-1 text-[#C6F432]">
                <Video size={11} /> Meet Siap
              </span>
              <span className="text-white/40">Lab Komputer 3</span>
            </div>
          </div>
        </div>

        {/* ── CARD 02: PETA ORGANISASI & BEM ── */}
        <div className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#12332a]/70 p-5 sm:p-6 transition-all duration-300 hover:border-sky-400/50 hover:bg-[#12332a] hover:-translate-y-1 shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-sky-400 tracking-wider">
                02 // ORGANISASI
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 text-sky-400 border border-white/10 group-hover:border-sky-400/40 transition-colors">
                <Users size={16} />
              </span>
            </div>

            <h3 className="font-display mt-4 text-lg font-black text-white tracking-tight">
              Petakan Proker & Tim
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#F4F1EA]/70">
              Sinkronkan kepanitiaan dan timeline BEM tanpa takut bentrok kuliah.
            </p>
          </div>

          {/* Micro Visual Widget */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0a1f16] p-3 text-xs font-mono">
            <div className="flex items-center justify-between text-[10px] text-sky-400">
              <span className="font-bold">BEM FAKULTAS</span>
              <span className="rounded-md bg-sky-400/15 px-1.5 py-0.5 font-bold">Kadiv</span>
            </div>
            <div className="font-sans font-bold text-white text-xs mt-1 truncate">
              {DEMO_DATA.proker.title}
            </div>
            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <ShieldCheck size={11} /> 0 Bentrok
              </span>
              <span className="text-white/40">24 Panitia</span>
            </div>
          </div>
        </div>

        {/* ── CARD 03: RADAR PRIORITAS & CHECKLIST ── */}
        <div className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#12332a]/70 p-5 sm:p-6 transition-all duration-300 hover:border-[#FF4D3D]/50 hover:bg-[#12332a] hover:-translate-y-1 shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-[#FF4D3D] tracking-wider">
                03 // PRIORITAS
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 text-[#FF4D3D] border border-white/10 group-hover:border-[#FF4D3D]/40 transition-colors">
                <Flame size={16} />
              </span>
            </div>

            <h3 className="font-display mt-4 text-lg font-black text-white tracking-tight">
              Radar Deadline H-1
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#F4F1EA]/70">
              Filter pintar otomatis menyorot tugas paling mendesak hari ini.
            </p>
          </div>

          {/* Micro Interactive Widget */}
          <div 
            onClick={handleToggleTask}
            className={`mt-5 rounded-2xl border p-3 text-xs font-mono cursor-pointer transition-all ${
              taskDone ? "border-[#C6F432]/40 bg-[#0a1f16]" : "border-[#FF4D3D]/30 bg-[#191111] hover:border-[#FF4D3D]"
            }`}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className={taskDone ? "text-[#C6F432] font-bold" : "text-[#FF4D3D] font-bold"}>
                {taskDone ? "✓ TUNTAS" : "⚠ H-1 MENDESAK"}
              </span>
              <span className="text-white/40">Klik centang</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className={`grid h-4 w-4 place-items-center rounded-md border text-[9px] font-black transition-colors ${
                taskDone ? "bg-[#C6F432] border-[#C6F432] text-[#0a1f16]" : "border-white/30 text-transparent"
              }`}>
                ✓
              </span>
              <span className={`font-sans font-bold text-xs truncate ${taskDone ? "line-through text-white/40" : "text-white"}`}>
                {DEMO_DATA.urgentTask.title}
              </span>
            </div>
            <div className="mt-2 text-[10px] text-white/50 pt-1.5 border-t border-white/10 flex justify-between">
              <span>Algoritma Modul 4</span>
              <span className="text-[#C6F432] font-bold">{taskDone ? "94% Selesai" : "85% Aktif"}</span>
            </div>
          </div>
        </div>

        {/* ── CARD 04: PORTOFOLIO ATS 96 ── */}
        <div className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#12332a]/70 p-5 sm:p-6 transition-all duration-300 hover:border-[#C6F432]/50 hover:bg-[#12332a] hover:-translate-y-1 shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-[#C6F432] tracking-wider">
                04 // PORTOFOLIO
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 text-[#C6F432] border border-white/10 group-hover:border-[#C6F432]/40 transition-colors">
                <Award size={16} />
              </span>
            </div>

            <h3 className="font-display mt-4 text-lg font-black text-white tracking-tight">
              Ekspor CV Skor 96
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#F4F1EA]/70">
              Proker dan proyek kuliah otomatis dirangkum ke format resume ATS.
            </p>
          </div>

          {/* Micro Visual Widget */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0a1f16] p-3 text-xs font-mono">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/60">RESUME MAGANG</span>
              <span className="rounded-md bg-[#C6F432] px-1.5 py-0.2 font-black text-[#0a1f16]">
                ATS 96
              </span>
            </div>
            <div className="font-sans font-bold text-white text-xs mt-1 truncate">
              {DEMO_DATA.student.name}
            </div>
            <button
              type="button"
              onClick={handleDownloadCv}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-[#C6F432] hover:text-[#0a1f16] py-1.5 text-[10px] font-bold text-white transition-all cursor-pointer"
            >
              <Download size={11} />
              <span>Unduh Format ATS</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── BOTTOM CALL-TO-ACTION MICRO STRIP ── */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-4">
        <div className="flex items-center gap-2.5 text-xs font-mono text-[#F4F1EA]/70 text-center sm:text-left">
          <Sparkles size={14} className="text-[#C6F432] shrink-0" />
          <span>Keempat tahap ini berjalan otomatis tanpa perlu setting template rumit.</span>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-xl bg-[#C6F432] px-4 py-2 font-mono text-xs font-bold text-[#0a1f16] shadow-md shadow-[#C6F432]/20 hover:brightness-110 transition shrink-0 active:scale-95"
        >
          <span>Mulai 2 Menit Gratis</span>
          <ArrowRight size={13} />
        </Link>
      </div>

    </div>
  );
}
