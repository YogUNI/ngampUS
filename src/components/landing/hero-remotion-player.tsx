"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PosterFallback } from "@/remotion/components/PosterFallback";
import { HeroStory } from "@/remotion/compositions/HeroStory";
import { TIMING } from "@/remotion/timing";
import type { PlayerRef } from "@remotion/player";

const RemotionPlayer = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => <PosterFallback />,
  }
);

export function HeroRemotionPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // Pause when offscreen, resume when in viewport
  useEffect(() => {
    if (!mounted || prefersReducedMotion || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!playerRef.current) return;

        if (entry.isIntersecting) {
          playerRef.current.play();
          setIsPlaying(true);
        } else {
          playerRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mounted, prefersReducedMotion]);

  const togglePlayback = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  if (!mounted) {
    return <PosterFallback />;
  }

  if (prefersReducedMotion) {
    return (
      <div className="relative w-full">
        <PosterFallback />
        <div className="mt-2 text-center font-mono text-xs text-white/40">
          Animasi dinonaktifkan (Mode Reduced Motion)
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a1f16] shadow-2xl transition-all duration-300 hover:border-[#C6F432]/30"
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden">
        <RemotionPlayer
          ref={playerRef}
          component={HeroStory}
          durationInFrames={TIMING.TOTAL_FRAMES}
          compositionWidth={TIMING.WIDTH_4_5}
          compositionHeight={TIMING.HEIGHT_4_5}
          fps={TIMING.FPS}
          style={{
            width: "100%",
            height: "100%",
          }}
          controls={false}
          autoPlay
          loop
          renderPoster={() => <PosterFallback />}
          showPosterWhenBuffering
        />
      </div>

      {/* Floating Status & Controls Pill */}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-[#0a1f16]/90 backdrop-blur-md px-3.5 py-1.5 font-mono text-[11px] text-white/80 shadow-lg">
          <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
          <span>Alur Mahasiswa • 12 Detik</span>
        </div>

        <button
          onClick={togglePlayback}
          type="button"
          aria-label={isPlaying ? "Jeda animasi" : "Putar animasi"}
          className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/15 bg-[#12332a]/95 backdrop-blur-md px-3 py-1.5 font-mono text-[11px] text-white hover:border-[#C6F432] hover:text-[#C6F432] shadow-lg transition-colors cursor-pointer"
        >
          {isPlaying ? (
            <>
              <span className="text-[10px]">❚❚</span>
              <span>Jeda</span>
            </>
          ) : (
            <>
              <span className="text-[10px]">▶</span>
              <span>Putar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

