import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { TIMING } from "../timing";

export const SceneHardCut: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Kinetic "Cukup." snap scale
  const textSpring = spring({
    frame,
    fps,
    config: {
      damping: 16,
      mass: 0.6,
      stiffness: 200,
    },
  });

  const textScale = interpolate(textSpring, [0, 1], [0.7, 1]);
  const textOpacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Lime wipe transition starts at frame 26 of 45
  const wipeProgress = interpolate(frame, [26, 44], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        backgroundColor: TIMING.COLORS.bgDark,
      }}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
    >
      {/* Kinetic Typography "Cukup." */}
      <div
        style={{
          scale: textScale,
          opacity: textOpacity,
        }}
        className="flex flex-col items-center text-center px-8"
      >
        <span className="font-mono text-sm font-bold tracking-[0.3em] uppercase text-[#C6F432] mb-3">
          SATU PLATFORM UNTUK SELURUH SEMESTER
        </span>
        <h2 className="font-display text-8xl sm:text-9xl font-black tracking-tight text-white leading-none">
          Cukup<span className="text-[#C6F432]">.</span>
        </h2>
        <p className="font-sans text-xl sm:text-2xl font-semibold text-white/70 mt-5 max-w-md">
          Saatnya merapikan seluruh ritme kuliahmu.
        </p>
      </div>

      {/* Dynamic Lime Wipe Transition */}
      {frame >= 25 && (
        <div
          style={{
            transform: `translateY(${100 - wipeProgress}%)`,
            backgroundColor: TIMING.COLORS.accentLime,
          }}
          className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <span className="font-display text-6xl font-black tracking-tight text-[#0a1f16]">
            ngamp<span className="text-[#0f6849]">US</span>
          </span>
        </div>
      )}
    </div>
  );
};

