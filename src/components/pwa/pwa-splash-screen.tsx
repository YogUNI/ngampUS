"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function PwaSplashScreen() {
  const [visible, setVisible] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    // Only show splash screen once per session / cold launch (ideal for PWA launch feel)
    const hasShown = sessionStorage.getItem("ngampus-splash-shown");
    
    // Check if launched as PWA standalone or first visit
    const isStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
       (window.navigator as unknown as { standalone?: boolean }).standalone === true);

    // If already shown in this session, skip
    if (hasShown) {
      return;
    }

    setVisible(true);

    // Play smooth sequence
    const timerExit = setTimeout(() => {
      setAnimatingOut(true);
    }, 1400); // 1.4s sweet spot: enough time to enjoy the animation, fast enough not to block user

    const timerRemove = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("ngampus-splash-shown", "true");
    }, 1850); // 450ms smooth fade-out

    return () => {
      clearTimeout(timerExit);
      clearTimeout(timerRemove);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-[#0a1f16] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        animatingOut
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      {/* ── Ambient Radial Glows ── */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(200,239,112,0.18)_0%,transparent_70%)] blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(15,104,73,0.35)_0%,transparent_70%)] blur-2xl" />

      {/* ── Center Brand Logo & Typography ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        
        {/* Logo Container with glowing ring */}
        <div className="relative mb-6">
          {/* Subtle outer ping ring */}
          <div className="absolute inset-0 rounded-3xl bg-[#c8ef70]/20 blur-md animate-ping opacity-40 scale-110" />
          
          {/* Inner badge */}
          <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl border border-[#c8ef70]/30 bg-gradient-to-br from-[#0f6849] to-[#09291b] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-105">
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={80}
              height={80}
              priority
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] animate-in zoom-in-75 duration-700 ease-out"
            />
          </div>
        </div>

        {/* Brand Name with smooth letter spacing */}
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150 fill-mode-both">
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-[-0.04em] text-white">
            ngamp<span className="text-[#c8ef70] drop-shadow-[0_0_16px_rgba(200,239,112,0.5)]">US</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#a7d4b7] opacity-90">
            Campus Command Center
          </p>
        </div>

        {/* Micro Loading Progress Indicator */}
        <div className="mt-8 w-44 sm:w-52 animate-in fade-in duration-700 delay-300 fill-mode-both">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-[#0f6849] via-[#c8ef70] to-[#0f6849] animate-[shimmer_1.4s_infinite_linear] [background-size:200%_100%]" />
          </div>
          <p className="mt-3 text-[10px] font-bold tracking-widest text-[#7fae93] uppercase">
            Memuat workspace...
          </p>
        </div>

      </div>

      {/* ── Footer System Version / Badge ── */}
      <div className="absolute bottom-6 z-10 flex items-center gap-2 text-[10px] font-extrabold tracking-widest uppercase text-[#5f8c74] opacity-80 animate-in fade-in duration-700 delay-500">
        <span className="h-1.5 w-1.5 rounded-full bg-[#c8ef70] animate-pulse" />
        <span>v2.4 READY • SECURE & ACCELERATED</span>
      </div>
    </div>
  );
}
