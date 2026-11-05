import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { TIMING } from "../timing";
import { PhoneFrame } from "../components/PhoneFrame";
import { DEMO_DATA } from "../../lib/demoData";

export const SceneOrganized: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Virtual Camera push-in then pull-out
  const camScale = interpolate(frame, [0, 60, 135], [0.94, 1.05, 1], {
    extrapolateRight: "clamp",
  });

  // Staggered card entrances inside phone
  const headerSpring = spring({
    frame: frame - 2,
    fps,
    config: TIMING.SPRINGS.snap,
  });

  const card1Spring = spring({
    frame: frame - 12,
    fps,
    config: TIMING.SPRINGS.snap,
  });

  const card2Spring = spring({
    frame: frame - 22,
    fps,
    config: TIMING.SPRINGS.snap,
  });

  const deadlineCardSpring = spring({
    frame: frame - 32,
    fps,
    config: TIMING.SPRINGS.snap,
  });

  // Danger Red Pulse on Deadline Card around frame 45
  const pulseSpring = spring({
    frame: frame - 45,
    fps,
    config: TIMING.SPRINGS.pulse,
  });
  const pulseScale = frame >= 45 && frame <= 65 ? interpolate(pulseSpring, [0, 0.5, 1], [1, 1.04, 1]) : 1;

  // Task checkmark click at frame 70
  const isChecked = frame >= 70;
  const checkSpring = spring({
    frame: frame - 70,
    fps,
    config: TIMING.SPRINGS.snap,
  });

  // Semester Progress bar transition (85% -> 94%)
  const progressVal = interpolate(frame, [70, 95], [85, 94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        backgroundColor: TIMING.COLORS.bgDark,
      }}
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-8"
    >
      {/* Background Decorative Ambience */}
      <div
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(198, 244, 50, 0.08) 0%, transparent 60%)`,
        }}
        className="absolute inset-0 pointer-events-none"
      />

      <PhoneFrame scale={camScale}>
        <div className="flex h-full flex-col justify-between pt-2">
          
          {/* App Topbar */}
          <div
            style={{
              opacity: headerSpring,
              translate: `0px ${interpolate(headerSpring, [0, 1], [-20, 0])}px`,
            }}
            className="flex items-center justify-between border-b border-white/10 pb-3"
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C6F432] animate-pulse" />
              <span className="font-display text-lg font-black tracking-tight text-white">
                ngamp<span className="text-[#C6F432]">US</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white/70">
              <span className="rounded-full bg-[#12332a] border border-white/10 px-2.5 py-0.5 text-[#C6F432]">
                {DEMO_DATA.student.statusText}
              </span>
            </div>
          </div>

          {/* Day & Load Header */}
          <div
            style={{
              opacity: headerSpring,
            }}
            className="mt-3 flex items-center justify-between"
          >
            <div>
              <span className="font-mono text-xs font-bold uppercase text-[#C6F432] tracking-wider">
                HARI INI
              </span>
              <h3 className="font-display text-2xl font-black text-white">Senin</h3>
            </div>
            <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-mono font-bold text-white/80">
              {DEMO_DATA.totalCoursesToday} Mata Kuliah • {DEMO_DATA.totalSksToday} SKS
            </span>
          </div>

          {/* Cards Stack */}
          <div className="mt-3 space-y-2.5 flex-1">
            
            {/* Matkul 1: Algoritma (Ongoing with Meet) */}
            <div
              style={{
                opacity: card1Spring,
                translate: `0px ${interpolate(card1Spring, [0, 1], [30, 0])}px`,
                backgroundColor: TIMING.COLORS.surfaceDark,
                borderColor: "rgba(198, 244, 50, 0.4)",
              }}
              className="rounded-2xl border p-3.5 shadow-md"
            >
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span className="text-[#C6F432]">
                  {DEMO_DATA.courses[0].code} • {DEMO_DATA.courses[0].sks} SKS
                </span>
                <span className="rounded-full bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/30 px-2 py-0.5 text-[9px] uppercase">
                  SEDANG BERLANGSUNG
                </span>
              </div>
              <h4 className="font-display mt-1 text-base font-bold text-white">
                {DEMO_DATA.courses[0].name}
              </h4>
              <p className="mt-1 text-xs text-white/60">
                {DEMO_DATA.courses[0].time} • {DEMO_DATA.courses[0].room}
              </p>
              <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                <span className="text-white/60 font-medium">
                  {DEMO_DATA.courses[0].lecturer}
                </span>
                <span className="rounded-lg bg-[#C6F432] px-2.5 py-1 text-[11px] font-black text-[#0a1f16] shadow-xs">
                  Buka Meet ↗
                </span>
              </div>
            </div>

            {/* Matkul 2: Sistem Basis Data */}
            <div
              style={{
                opacity: card2Spring,
                translate: `0px ${interpolate(card2Spring, [0, 1], [30, 0])}px`,
                backgroundColor: "#0d261e",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
              className="rounded-2xl border p-3.5"
            >
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-white/60">
                <span>{DEMO_DATA.courses[1].code} • {DEMO_DATA.courses[1].sks} SKS</span>
                <span className="text-[10px]">10:00 - 11:40 WIB</span>
              </div>
              <h4 className="font-display mt-1 text-sm font-bold text-white">
                {DEMO_DATA.courses[1].name}
              </h4>
              <p className="mt-0.5 text-xs text-white/60">
                {DEMO_DATA.courses[1].room} • Tatap Muka
              </p>
            </div>

            {/* Deadline Radar Card (Turns Red Danger H-1 & Checks) */}
            <div
              style={{
                opacity: deadlineCardSpring,
                scale: pulseScale,
                translate: `0px ${interpolate(deadlineCardSpring, [0, 1], [30, 0])}px`,
                backgroundColor: isChecked ? "#122a20" : "#2d1414",
                borderColor: isChecked ? "rgba(198, 244, 50, 0.4)" : TIMING.COLORS.danger,
              }}
              className="rounded-2xl border p-3.5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    backgroundColor: isChecked ? "rgba(198, 244, 50, 0.15)" : TIMING.COLORS.danger,
                    color: isChecked ? "#C6F432" : "#ffffff",
                  }}
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider"
                >
                  {isChecked ? "SELESAI ✓" : "DEADLINE BESOK • H-1"}
                </span>
                <span className="font-mono text-xs text-white/80">23:59 WIB</span>
              </div>

              <div className="mt-2 flex items-center gap-3">
                {/* Interactive Checkbox */}
                <div
                  style={{
                    scale: isChecked ? interpolate(checkSpring, [0, 1], [0.8, 1]) : 1,
                    backgroundColor: isChecked ? TIMING.COLORS.accentLime : "transparent",
                    borderColor: isChecked ? TIMING.COLORS.accentLime : "rgba(255,255,255,0.4)",
                  }}
                  className="grid h-6 w-6 place-items-center rounded-full border-2 text-[#0a1f16] shrink-0"
                >
                  {isChecked && <span className="text-xs font-black">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className={`font-display text-sm font-bold truncate ${isChecked ? "line-through text-white/60" : "text-white"}`}>
                    {DEMO_DATA.urgentTask.title}
                  </h5>
                  <p className="text-[11px] text-white/60 truncate">
                    {DEMO_DATA.urgentTask.course}
                  </p>
                </div>
              </div>

              {/* Dopamine Feedback Banner */}
              {isChecked && (
                <div className="mt-2.5 flex items-center justify-between rounded-xl bg-[#C6F432]/10 border border-[#C6F432]/20 px-2.5 py-1 text-[11px] text-[#C6F432] font-bold">
                  <span>✦ Poin Portofolio Terekam!</span>
                  <span className="font-mono text-[10px]">+1 Proyek</span>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Semester Progress */}
          <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-white/80">
              <span>PROGRES SEMESTER</span>
              <span className="text-[#C6F432]">{Math.round(progressVal)}% TUNTAS</span>
            </div>
            <div className="mt-1.5 h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                style={{ width: `${progressVal}%`, backgroundColor: TIMING.COLORS.accentLime }}
                className="h-full rounded-full"
              />
            </div>
          </div>

        </div>
      </PhoneFrame>
    </div>
  );
};

