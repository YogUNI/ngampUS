"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function PwaSplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"enter" | "active" | "exit" | "hidden">("hidden");

  useEffect(() => {
    // Only show on fresh cold-launches per tab session
    const hasShown = sessionStorage.getItem("ngampus-splash-shown");
    if (hasShown) {
      return;
    }

    setMounted(true);
    setPhase("enter");

    // Phase transitions:
    // 0ms - 50ms: Mount in DOM
    // 50ms: Active presentation with micro-pulsing ambient glow and progress pill
    const timerActive = setTimeout(() => {
      setPhase("active");
    }, 60);

    // 1200ms: Smooth cinematic native exit aperture & scale reveal
    const timerExit = setTimeout(() => {
      setPhase("exit");
    }, 1300);

    // 1750ms: Remove from DOM completely and record session flag
    const timerDismiss = setTimeout(() => {
      setPhase("hidden");
      setMounted(false);
      try {
        sessionStorage.setItem("ngampus-splash-shown", "true");
      } catch {
        // Safe fallback for private mode quota restrictions
      }
    }, 1800);

    return () => {
      clearTimeout(timerActive);
      clearTimeout(timerExit);
      clearTimeout(timerDismiss);
    };
  }, []);

  if (!mounted || phase === "hidden") return null;

  const isExiting = phase === "exit";

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between overflow-hidden bg-[#07130c] select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExiting
          ? "opacity-0 scale-[1.03] pointer-events-none filter blur-[1px]"
          : "opacity-100 scale-100"
      }`}
      style={{
        willChange: "transform, opacity",
      }}
    >
      {/* ── Soft Ambient Radial Background ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Centered subtle forest-emerald aura */}
        <div
          className="splash-ambient-breathe absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[340px] w-[340px] sm:h-[420px] sm:w-[420px] rounded-full blur-[90px]"
          style={{
            background:
              "radial-gradient(circle, rgba(200, 239, 112, 0.18) 0%, rgba(15, 104, 73, 0.35) 50%, transparent 75%)",
          }}
        />

        {/* Subtle noise/vignette overlay */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-soft-light"
          style={{
            background:
              "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      </div>

      {/* Top spacer (preserves layout balance across safe areas) */}
      <div className="h-14 sm:h-20 w-full shrink-0" />

      {/* ── Centerpiece: Brand Identity ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* App Logo Icon with Physical Squircle Mask */}
        <div className="splash-logo-mark relative mb-6">
          {/* Subtle backplate glow */}
          <div className="absolute -inset-2 rounded-[28px] bg-[#c8ef70]/20 blur-xl opacity-80" />

          {/* Icon shell */}
          <div
            className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-[24px] bg-gradient-to-b from-[#133b29] to-[#0a2318] p-4.5 border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.6),0_2px_4px_rgba(200,239,112,0.1)] ring-1 ring-[#c8ef70]/25"
          >
            {/* Top specular highlight reflection */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[24px] bg-gradient-to-b from-white/10 to-transparent" />

            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS"
              width={88}
              height={88}
              priority
              className="relative z-10 h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        {/* Wordmark */}
        <div
          className={`transition-all duration-700 delay-100 ease-out ${
            phase === "enter"
              ? "opacity-0 translate-y-3"
              : "opacity-100 translate-y-0"
          }`}
        >
          <h1 className="font-display text-[2rem] sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center">
            ngamp<span className="text-[#c8ef70] ml-0.5">US</span>
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] font-medium tracking-wide text-[#8ea899]/85">
            Your Campus Command Center
          </p>
        </div>

        {/* Minimal iOS-style fluid loader pill */}
        <div
          className={`mt-8 w-28 sm:w-32 transition-all duration-500 delay-200 ${
            phase === "enter" ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="splash-bar-indeterminate h-full w-2/5 rounded-full bg-gradient-to-r from-[#22c55e] to-[#c8ef70]" />
          </div>
        </div>
      </div>

      {/* ── Bottom Safe-Area Footer ── */}
      <div
        className={`relative z-10 pb-9 sm:pb-12 text-center transition-all duration-700 delay-300 ${
          phase === "enter" ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        <span className="text-[11px] font-medium tracking-wider text-[#6d8a7a]/70">
          Dirancang untuk Mahasiswa Indonesia
        </span>
      </div>
    </div>
  );
}
