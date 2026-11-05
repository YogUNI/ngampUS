import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { TIMING } from "../timing";
import { PhoneFrame } from "../components/PhoneFrame";
import { DEMO_DATA } from "../../lib/demoData";

export const SceneOutcome: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // CV Sheet rises from bottom into phone
  const sheetSpring = spring({
    frame: frame - 4,
    fps,
    config: TIMING.SPRINGS.snap,
  });
  const sheetY = interpolate(sheetSpring, [0, 1], [400, 0]);

  // Typing effect on experience bullet 1
  const fullText = "Project Officer — Tech Seminar 2025 · 450+ peserta seminar nasional";
  const charCount = Math.min(fullText.length, Math.floor(frame * 1.5));
  const typedText = fullText.slice(0, charCount);

  // ATS Score Stamp appear at frame 25
  const stampSpring = spring({
    frame: frame - 25,
    fps,
    config: TIMING.SPRINGS.pulse,
  });
  const stampScale = interpolate(stampSpring, [0, 1], [0.6, 1]);
  const stampOpacity = interpolate(frame, [25, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Loop reset transition at the end (frames 78 to 90)
  const loopOpacity = interpolate(frame, [78, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        backgroundColor: TIMING.COLORS.bgDark,
        opacity: loopOpacity,
      }}
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-8"
    >
      <PhoneFrame>
        <div className="relative flex h-full flex-col justify-between pt-2">
          
          {/* App Topbar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-black tracking-tight text-white">
                ngamp<span className="text-[#C6F432]">US</span>
              </span>
            </div>
            <span className="rounded-full bg-[#C6F432] text-[#0a1f16] px-3 py-0.5 text-[11px] font-mono font-black">
              AUTO-CURATED
            </span>
          </div>

          {/* Paper ATS Sheet (Clean Editorial Paper #F4F1EA with Ink #0b140f) */}
          <div
            style={{
              translate: `0px ${sheetY}px`,
              backgroundColor: TIMING.COLORS.paper,
              color: TIMING.COLORS.ink,
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.6)",
            }}
            className="mt-3 flex-1 rounded-3xl p-5 border border-black/10 flex flex-col justify-between overflow-hidden"
          >
            <div>
              {/* ATS Resume Top Banner */}
              <div className="flex items-start justify-between border-b border-black/10 pb-3">
                <div>
                  <h4 className="font-display text-lg font-black tracking-tight">
                    {DEMO_DATA.student.name}
                  </h4>
                  <p className="text-[11px] text-black/70 font-medium">
                    {DEMO_DATA.student.major} • {DEMO_DATA.student.campus}
                  </p>
                  <p className="text-[10px] font-mono text-black/60 mt-0.5">
                    IPK: {DEMO_DATA.student.ipk} • {DEMO_DATA.student.statusText}
                  </p>
                </div>

                {/* ATS Score Stamp */}
                <div
                  style={{
                    scale: stampScale,
                    opacity: stampOpacity,
                    borderColor: TIMING.COLORS.accentLime,
                  }}
                  className="rounded-xl bg-[#0a1f16] border-2 px-2.5 py-1 text-center shrink-0"
                >
                  <span className="text-[9px] font-mono font-bold text-white/70 block uppercase">
                    SKOR ATS
                  </span>
                  <span className="font-mono text-xs font-black text-[#C6F432]">
                    96 / 100
                  </span>
                </div>
              </div>

              {/* Experience Section */}
              <div className="mt-3.5 space-y-3">
                <div>
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-black/60">
                    PENGALAMAN ORGANISASI TERKURASI
                  </span>
                  <div className="mt-1 rounded-xl bg-black/[0.04] p-3 border border-black/5">
                    <p className="text-xs font-mono font-semibold leading-relaxed">
                      • {typedText}
                      {charCount < fullText.length && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-black/60">
                    PROYEK AKADEMIK UNGGULAN
                  </span>
                  <div className="mt-1 rounded-xl bg-black/[0.04] p-3 border border-black/5">
                    <p className="text-xs font-mono font-semibold leading-relaxed">
                      • Aplikasi Web Rekap Kuliah AI (Nilai Akhir: A / 4.00)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 1-Click Export Badge */}
            <div className="mt-3 rounded-2xl bg-[#0a1f16] text-white p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#C6F432] block font-bold">
                  FORMAT STANDAR HARVARD
                </span>
                <span className="text-xs font-bold">Siap Kirim ke HR Magang</span>
              </div>
              <span className="rounded-xl bg-[#C6F432] text-[#0a1f16] px-3 py-1 text-xs font-black shadow-xs">
                Cetak PDF ↗
              </span>
            </div>

          </div>

          {/* Trust Banner */}
          <div className="mt-2 text-center text-[11px] font-mono font-semibold text-white/60">
            ✦ 100% Otomatis • Tanpa Biaya • Privasi RLS
          </div>

        </div>
      </PhoneFrame>
    </div>
  );
};

