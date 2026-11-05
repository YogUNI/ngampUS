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

  // Pause when offscreen, resume loop when in viewport to conserve GPU & battery
  useEffect(() => {
    if (!mounted || prefersReducedMotion || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!playerRef.current) return;

        if (entry.isIntersecting) {
          playerRef.current.play();
        } else {
          playerRef.current.pause();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mounted, prefersReducedMotion]);

  if (!mounted) {
    return <PosterFallback />;
  }

  if (prefersReducedMotion) {
    return (
      <div className="relative w-full max-w-[470px] xl:max-w-[500px] mx-auto lg:ml-auto lg:mr-0">
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
      className="group relative w-full max-w-[440px] sm:max-w-[470px] lg:max-w-[460px] xl:max-w-[490px] mx-auto lg:ml-auto lg:mr-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0a1f16] shadow-2xl transition-all duration-300 hover:border-[#C6F432]/30"
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden pointer-events-none">
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
    </div>
  );
}
