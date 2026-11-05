"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles, Play, Hand, Sliders } from "lucide-react";
import { InteractivePreview } from "./interactive-preview";

// Dynamically import Remotion Player to avoid SSR hydration mismatches
const HeroRemotionPlayer = dynamic(
  () =>
    import("./hero-remotion/hero-remotion-player").then(
      (mod) => mod.HeroRemotionPlayer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[4/3] rounded-3xl bg-white border border-[#dce5dd] flex flex-col items-center justify-center gap-3 text-sm text-[#708075] shadow-md animate-pulse">
        <Sparkles size={24} className="text-[#0f6849] animate-spin" />
        <span className="font-medium text-xs">Memuat Motion Canvas...</span>
      </div>
    ),
  }
);

export function HeroShowcase() {
  const [mode, setMode] = useState<"remotion" | "interactive">("remotion");

  return (
    <div className="relative w-full">
      {/* ── Mode Switcher Pill (Floating Top) ── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#dce5dd] shadow-xs">
          <button
            type="button"
            onClick={() => setMode("remotion")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              mode === "remotion"
                ? "bg-[#0f6849] text-white shadow-xs"
                : "text-[#55675b] hover:text-[#10261b] hover:bg-[#f4f7f4]"
            }`}
          >
            <Play size={12} className={mode === "remotion" ? "fill-white" : ""} />
            <span>Remotion Motion</span>
            <span className="rounded bg-white/20 px-1.5 py-0.2 text-[9px] font-black uppercase hidden sm:inline">
              Cinematic
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode("interactive")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              mode === "interactive"
                ? "bg-[#0f6849] text-white shadow-xs"
                : "text-[#55675b] hover:text-[#10261b] hover:bg-[#f4f7f4]"
            }`}
          >
            <Hand size={12} />
            <span>Coba Mandiri</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-[#708075] hidden sm:inline">
          {mode === "remotion" ? "60 FPS Programmatic Video" : "Klik Langsung"}
        </span>
      </div>

      {/* ── Active Showcase Canvas ── */}
      <div className="relative w-full">
        {mode === "remotion" ? (
          <HeroRemotionPlayer />
        ) : (
          <InteractivePreview />
        )}
      </div>
    </div>
  );
}
