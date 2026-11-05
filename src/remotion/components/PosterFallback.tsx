import React from "react";
import { DEMO_DATA } from "../../lib/demoData";

export const PosterFallback: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      style={{
        backgroundColor: "#0a1f16",
        aspectRatio: "4 / 5",
      }}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 p-4 sm:p-6 select-none ${className}`}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(198, 244, 50, 0.08) 0%, transparent 60%)`,
        }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Realistic Minimal Phone Mockup */}
      <div className="relative mx-auto w-full max-w-[360px] aspect-[9/18.5] rounded-[44px] border-[5px] border-white/15 bg-[#0a1f16] shadow-2xl overflow-hidden p-5 flex flex-col justify-between">
        
        {/* Dynamic Island / Speaker Notch */}
        <div className="mx-auto h-5 w-28 rounded-full bg-black/90 border border-white/10 shrink-0" />

        {/* Topbar */}
        <div className="mt-2 flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#C6F432]" />
            <span className="font-display text-base font-black tracking-tight text-white">
              ngamp<span className="text-[#C6F432]">US</span>
            </span>
          </div>
          <span className="rounded-full bg-[#12332a] border border-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#C6F432]">
            {DEMO_DATA.student.statusText}
          </span>
        </div>

        {/* Day & Load */}
        <div className="mt-2.5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase text-[#C6F432] tracking-wider">
              HARI INI
            </span>
            <h3 className="font-display text-xl font-black text-white">Senin</h3>
          </div>
          <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-white/80">
            {DEMO_DATA.totalCoursesToday} Matkul • {DEMO_DATA.totalSksToday} SKS
          </span>
        </div>

        {/* Cards Stack */}
        <div className="mt-2 space-y-2 flex-1">
          {/* Matkul 1 */}
          <div className="rounded-xl border border-[#C6F432]/40 bg-[#12332a] p-3 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
              <span className="text-[#C6F432]">
                {DEMO_DATA.courses[0].code} • {DEMO_DATA.courses[0].sks} SKS
              </span>
              <span className="rounded-full bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/30 px-1.5 py-0.5 text-[8px] uppercase">
                BERLANGSUNG
              </span>
            </div>
            <h4 className="font-display mt-0.5 text-xs font-bold text-white truncate">
              {DEMO_DATA.courses[0].name}
            </h4>
            <p className="mt-0.5 text-[10px] text-white/60">
              {DEMO_DATA.courses[0].time} • {DEMO_DATA.courses[0].room}
            </p>
          </div>

          {/* Matkul 2 */}
          <div className="rounded-xl border border-white/10 bg-[#0d261e] p-3">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white/60">
              <span>{DEMO_DATA.courses[1].code} • {DEMO_DATA.courses[1].sks} SKS</span>
              <span className="text-[9px]">10:00 WIB</span>
            </div>
            <h4 className="font-display mt-0.5 text-xs font-bold text-white truncate">
              {DEMO_DATA.courses[1].name}
            </h4>
            <p className="mt-0.5 text-[10px] text-white/60">
              {DEMO_DATA.courses[1].room} • Tatap Muka
            </p>
          </div>

          {/* Radar Deadline Card */}
          <div className="rounded-xl border border-[#FF4D3D] bg-[#2d1414] p-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#FF4D3D] px-2 py-0.5 text-[9px] font-mono font-black text-white uppercase tracking-wider">
                DEADLINE BESOK • H-1
              </span>
              <span className="font-mono text-[10px] text-white/80">23:59 WIB</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="grid h-4 w-4 place-items-center rounded-full border border-white/40 text-transparent text-[8px] shrink-0">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="font-display text-xs font-bold text-white truncate">
                  {DEMO_DATA.urgentTask.title}
                </h5>
                <p className="text-[10px] text-white/60 truncate">
                  {DEMO_DATA.urgentTask.course}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Progress */}
        <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white/80">
            <span>PROGRES SEMESTER</span>
            <span className="text-[#C6F432]">94% TUNTAS</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div style={{ width: "94%" }} className="h-full rounded-full bg-[#C6F432]" />
          </div>
        </div>

        {/* Home Indicator */}
        <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-white/30" />
      </div>

      {/* Floating Badge */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#12332a]/90 backdrop-blur-md px-3 py-1 font-mono text-[11px] text-[#C6F432]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#C6F432] animate-ping" />
        Interactive Preview
      </div>
    </div>
  );
};

