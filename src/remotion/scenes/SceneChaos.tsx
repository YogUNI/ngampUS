import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { TIMING } from "../timing";

export const SceneChaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle camera shake + zoom in
  const camZoom = interpolate(frame, [0, 90], [1, 1.08], {
    extrapolateRight: "clamp",
  });
  const shakeX = Math.sin(frame * 0.9) * interpolate(frame, [0, 80], [1, 5]);
  const shakeY = Math.cos(frame * 1.1) * interpolate(frame, [0, 80], [1, 4]);

  // Card 1: 999+ Grup Kelas
  const spring1 = spring({
    frame: frame - 4,
    fps,
    config: TIMING.SPRINGS.chaosBounce,
  });
  const card1Y = interpolate(spring1, [0, 1], [-250, 0]);
  const card1Rot = interpolate(spring1, [0, 1], [-12, -3]);

  // Card 2: Tugas Basdat Besok
  const spring2 = spring({
    frame: frame - 16,
    fps,
    config: TIMING.SPRINGS.chaosBounce,
  });
  const card2Y = interpolate(spring2, [0, 1], [-300, 0]);
  const card2Rot = interpolate(spring2, [0, 1], [15, 4]);

  // Card 3: Rapat BEM Bentrok
  const spring3 = spring({
    frame: frame - 30,
    fps,
    config: TIMING.SPRINGS.chaosBounce,
  });
  const card3Y = interpolate(spring3, [0, 1], [-350, 0]);
  const card3Rot = interpolate(spring3, [0, 1], [-14, -2]);

  // Card 4: Modul P5 Di Mana
  const spring4 = spring({
    frame: frame - 46,
    fps,
    config: TIMING.SPRINGS.chaosBounce,
  });
  const card4Y = interpolate(spring4, [0, 1], [-320, 0]);
  const card4Rot = interpolate(spring4, [0, 1], [10, 2]);

  // Red alert flash at the climax before hard cut
  const alertFlash = interpolate(frame, [65, 85], [0, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        backgroundColor: TIMING.COLORS.bgDark,
        scale: camZoom,
        translate: `${shakeX}px ${shakeY}px`,
      }}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-12"
    >
      {/* Background Subtly Pulsing Mesh Lines */}
      <div
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 77, 61, ${alertFlash}) 0%, transparent 70%)`,
        }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Chaotic Background Badge */}
      <div className="absolute top-20 flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-950/40 px-5 py-2 text-sm font-mono font-bold tracking-wider text-rose-400">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
        <span>SEMESTER DIMULAI • CHAT OVERLOAD</span>
      </div>

      {/* Floating Chaotic Cards Stack */}
      <div className="relative w-full max-w-xl space-y-4">
        {/* Card 1 */}
        {frame >= 4 && (
          <div
            style={{
              translate: `0px ${card1Y}px`,
              rotate: `${card1Rot}deg`,
              backgroundColor: TIMING.COLORS.chatBgOther,
              borderColor: "rgba(255, 255, 255, 0.12)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7)",
            }}
            className="rounded-3xl border p-6 text-white"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400/80">
              <span>💬 Grup Kelas: Algoritma</span>
              <span>999+ PESAN</span>
            </div>
            <p className="font-display mt-2 text-xl font-bold leading-snug">
              "Guys, tugas Basdat dikumpul besok apa lusa ya? Link Zoom kuliahnya mana?!"
            </p>
          </div>
        )}

        {/* Card 2 */}
        {frame >= 16 && (
          <div
            style={{
              translate: `20px ${card2Y}px`,
              rotate: `${card2Rot}deg`,
              backgroundColor: "#2a1515",
              borderColor: "rgba(255, 77, 61, 0.4)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
            }}
            className="rounded-3xl border p-6 text-white"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                DEADLINE TUGAS BESOK
              </span>
              <span>23:59 WIB</span>
            </div>
            <p className="font-display mt-2 text-2xl font-black text-rose-100">
              Laporan Praktikum Modul 4 belum dikerjakan!
            </p>
          </div>
        )}

        {/* Card 3 */}
        {frame >= 30 && (
          <div
            style={{
              translate: `-15px ${card3Y}px`,
              rotate: `${card3Rot}deg`,
              backgroundColor: TIMING.COLORS.surfaceDark,
              borderColor: "rgba(255, 255, 255, 0.15)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
            }}
            className="rounded-3xl border p-6 text-white"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
              <span>⚠️ BEM FAKULTAS • DIVISI RISET</span>
              <span>BENTROK</span>
            </div>
            <p className="font-display mt-2 text-xl font-bold">
              Rapat pleno proker jam 10:00 bentrok sama kuliah Sistem Basis Data!
            </p>
          </div>
        )}

        {/* Card 4 */}
        {frame >= 46 && (
          <div
            style={{
              translate: `10px ${card4Y}px`,
              rotate: `${card4Rot}deg`,
              backgroundColor: "#163124",
              borderColor: "rgba(198, 244, 50, 0.3)",
              boxShadow: "0 30px 60px -15px rgba(0,0,0,0.9)",
            }}
            className="rounded-3xl border p-6 text-white"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#C6F432]">
              <span>❓ MODUL PERKULIAHAN</span>
              <span>HILANG</span>
            </div>
            <p className="font-display mt-2 text-xl font-bold text-white">
              "Slide Modul P5 di mana ya?? Tenggelam di history chat WA..."
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

