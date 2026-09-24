"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, ShieldCheck } from "lucide-react";

export function PwaSplashScreen() {
  const [visible, setVisible] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState("Menyiapkan enkripsi sesi...");

  useEffect(() => {
    // Only show splash screen once per session / cold launch
    const hasShown = sessionStorage.getItem("ngampus-splash-shown");
    if (hasShown) {
      return;
    }

    setVisible(true);

    // Progress bar milestones with smooth realistic sequence
    const t1 = setTimeout(() => {
      setProgress(48);
      setStatusText("Memuat data akademik & semester...");
    }, 450);

    const t2 = setTimeout(() => {
      setProgress(85);
      setStatusText("Sinkronisasi jadwal & workspace...");
    }, 950);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText("Siap!");
    }, 1450);

    // Play smooth 3D warp exit sequence
    const timerExit = setTimeout(() => {
      setAnimatingOut(true);
    }, 1700);

    const timerRemove = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("ngampus-splash-shown", "true");
    }, 2250); // 550ms cinematic smooth exit

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(timerExit);
      clearTimeout(timerRemove);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between overflow-hidden bg-[#06140e] transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
        animatingOut
          ? "opacity-0 scale-110 blur-sm pointer-events-none"
          : "opacity-100 scale-100 blur-0"
      }`}
      style={{ perspective: "1200px" }}
    >
      {/* ── 3D Ambient Spatial Lighting & Starfield/Grid ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Top emerald volumetric spotlight */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-[550px] w-[650px] rounded-full opacity-45 blur-[120px]"
          style={{ background: "radial-gradient(circle, #22c55e 0%, #0f6849 45%, transparent 75%)" }}
        />
        {/* Bottom lime volumetric glow */}
        <div
          className="absolute -bottom-36 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full opacity-35 blur-[100px]"
          style={{ background: "radial-gradient(circle, #c8ef70 0%, #0f6849 55%, transparent 80%)" }}
        />

        {/* 3D Perspective Floor Grid */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "36px 36px",
            maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, transparent 80%)"
          }}
        />
      </div>

      {/* Top Header Pill: Security & Status */}
      <div className="relative z-10 pt-10 sm:pt-14 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#c8ef70]/25 bg-black/40 backdrop-blur-xl px-4 py-1.5 text-[11px] font-mono font-bold tracking-widest text-[#d8f89a] shadow-lg shadow-black/40">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8ef70] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c8ef70]" />
          </span>
          <span>NGAMPUS APPS • STANDALONE</span>
        </div>
      </div>

      {/* ── Center Stage: 3D Holographic Floating Badge ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 my-auto">
        
        {/* Multi-layered 3D Badge Container */}
        <div className="relative mb-7 flex items-center justify-center">
          
          {/* Orbital Glowing Particle Rings */}
          <div className="splash-pulse-ring absolute -inset-6 rounded-full border border-[#c8ef70]/30" />
          <div className="splash-halo absolute -inset-10 rounded-full border-2 border-dashed border-[#c8ef70]/20" />
          <div className="splash-halo absolute -inset-16 rounded-full border border-dotted border-[#22c55e]/15 [animation-direction:reverse] [animation-duration:12s]" />

          {/* Glowing Ambient Core Behind Logo */}
          <div className="absolute h-32 w-32 rounded-3xl bg-[#c8ef70]/25 blur-2xl animate-pulse" />

          {/* 3D Tilted Card Badge with bevel & glassy reflection */}
          <div 
            className="splash-3d-card relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-[2rem] border-2 border-[#c8ef70]/40 bg-gradient-to-br from-[#124b33] via-[#0b291d] to-[#04120a] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(200,239,112,0.25)] ring-1 ring-white/20"
            style={{
              boxShadow: "0 25px 60px -10px rgba(0,0,0,0.9), inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -2px 6px rgba(0,0,0,0.6)"
            }}
          >
            {/* Glossy Diagonal Reflection Streak */}
            <div className="pointer-events-none absolute -inset-px rounded-[2rem] bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
            
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={96}
              height={96}
              priority
              className="relative z-10 h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] animate-in zoom-in-75 duration-700 ease-out"
            />
          </div>
        </div>

        {/* Brand Name Typography with Neon Ambient Accent */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-[-0.04em] text-white flex items-center justify-center gap-1">
            ngamp<span className="text-[#c8ef70] drop-shadow-[0_0_25px_rgba(200,239,112,0.6)]">US</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-bold tracking-widest uppercase text-[#9dc5aa] opacity-90 flex items-center justify-center gap-1.5">
            <Sparkles size={13} className="text-[#c8ef70]" />
            <span>Workspace Mahasiswa Indonesia</span>
          </p>
        </div>

        {/* Dynamic Progress Bar with Numeric Readout */}
        <div className="mt-9 w-60 sm:w-72 animate-in fade-in duration-700 delay-300 fill-mode-both">
          {/* Progress track */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/50 border border-white/10 backdrop-blur-md p-0.5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#0f6849] via-[#8fc93a] to-[#c8ef70] shadow-[0_0_12px_rgba(200,239,112,0.7)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status Label & Percentage Counter */}
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#8caea0]">
            <span className="truncate pr-2">{statusText}</span>
            <span className="font-bold text-[#c8ef70] shrink-0">{progress}%</span>
          </div>
        </div>

      </div>

      {/* ── Bottom Bar: Security & Encryption Badge ── */}
      <div className="relative z-10 pb-8 sm:pb-10 flex items-center gap-2 text-[11px] font-mono font-bold tracking-wider text-[#69967d] animate-in fade-in duration-700 delay-500">
        <ShieldCheck size={14} className="text-[#c8ef70]" />
        <span>END-TO-END RLS ENCRYPTION ACTIVE</span>
      </div>
    </div>
  );
}

