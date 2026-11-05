import React, { useState, useEffect } from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  delayRender,
  continueRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F } from "./theme";
import { A_START, B_START, C_START, D_START, C_LEN, TOTAL, SPRING_SOFT, SPRING_SNAP, SPRING_DROP } from "./timing";
import { chaos, classes, totalSks, deadlines, cv } from "./demoData";

/* ---------- helpers ---------- */
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

const useSpr = (delay: number, config = SPRING_SOFT) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("NgDisplay", `url(${staticFile("fonts/display.woff2")})`, { weight: "800" }),
      new FontFace("NgBody", `url(${staticFile("fonts/body600.woff2")})`, { weight: "600" }),
      new FontFace("NgBody", `url(${staticFile("fonts/body700.woff2")})`, { weight: "700" }),
      new FontFace("NgMono", `url(${staticFile("fonts/mono.woff2")})`, { weight: "700" }),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

const Check = ({ size = 22, color = C.ink, progress = 1 }: { size?: number; color?: string; progress?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      stroke={color}
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={24}
      strokeDashoffset={24 * (1 - progress)}
    />
  </svg>
);

/* =====================================================
   SCENE A — KACAU (0–3 dtk)
   ===================================================== */
const chaosLayout = [
  { x: 70, y: 150, r: -3, d: 0 },
  { x: 250, y: 300, r: 4, d: 8 },
  { x: 90, y: 470, r: -5, d: 16 },
  { x: 230, y: 640, r: 3, d: 24 },
  { x: 60, y: 800, r: -2, d: 32 },
  { x: 210, y: 960, r: 5, d: 40 },
  { x: 100, y: 1120, r: -4, d: 48 },
];

const ChaosCard = ({ idx }: { idx: number }) => {
  const frame = useCurrentFrame();
  const L = chaosLayout[idx];
  const D = chaos[idx];
  const s = useSpr(L.d, SPRING_DROP);
  const jitter = Math.sin(frame * 0.6 + idx * 2) * interpolate(frame, [30, 90], [0.2, 1.4], clamp);
  const urgent = !!(D as { urgent?: boolean }).urgent;
  const pulse = urgent ? 1 + Math.max(0, Math.sin(frame * 0.5)) * 0.025 : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: L.x,
        top: L.y,
        width: 760,
        height: 140,
        borderRadius: 30,
        background: C.chat,
        border: `2px solid ${urgent ? C.danger : "rgba(255,255,255,0.08)"}`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 30px",
        opacity: Math.min(1, s * 3),
        transform: `translateY(${(1 - s) * -900}px) rotate(${L.r + (1 - s) * -14 + jitter}deg) scale(${pulse})`,
        boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          background: urgent ? C.danger : "#2f6b57",
          color: "#fff",
          fontFamily: F.display,
          fontSize: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {D.i}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 31, color: "#fff" }}>{D.t}</div>
        <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 27, color: urgent ? "#ffb3ab" : "rgba(255,255,255,0.62)", marginTop: 6, whiteSpace: "nowrap" }}>
          {D.m}
        </div>
      </div>
      <div style={{ width: 16, height: 16, borderRadius: 8, background: urgent ? C.danger : C.lime }} />
    </div>
  );
};

const SceneA = () => {
  const frame = useCurrentFrame();
  const shakeAmp = interpolate(frame, [30, 90], [0, 10], clamp);
  const sx = Math.sin(frame * 1.9) * shakeAmp;
  const sy = Math.cos(frame * 2.3) * shakeAmp * 0.7;
  const scale = interpolate(frame, [0, 90], [1, 1.1], clamp);
  const badge = useSpr(6, SPRING_SNAP);
  const count = Math.floor(interpolate(frame, [6, 80], [3, 999], { ...clamp, easing: Easing.in(Easing.quad) }));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${scale})`, transformOrigin: "50% 45%" }}>
        <div style={{ position: "absolute", left: 70, top: 62, fontFamily: F.mono, fontSize: 24, color: "rgba(255,255,255,0.5)", letterSpacing: 3 }}>
          SENIN · 07.42
        </div>
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 48,
            padding: "10px 24px",
            borderRadius: 40,
            background: C.danger,
            color: "#fff",
            fontFamily: F.mono,
            fontSize: 30,
            transform: `scale(${badge})`,
          }}
        >
          {count >= 999 ? "999+" : count}
        </div>
        {chaos.map((_, i) => (
          <ChaosCard key={i} idx={i} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* =====================================================
   SCENE B — "Cukup." (3–4,5 dtk)
   ===================================================== */
const SceneB = () => {
  const frame = useCurrentFrame();
  const s = useSpr(2, { damping: 15, stiffness: 160, mass: 0.8 });
  const cap = interpolate(frame, [14, 24], [0, 1], clamp);
  const wipe = interpolate(frame, [32, 44], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: C.bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ overflow: "hidden", height: 340, display: "flex", alignItems: "flex-end" }}>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 285,
            lineHeight: 1,
            color: "#fff",
            letterSpacing: -10,
            transform: `translateY(${(1 - s) * 110}%)`,
            paddingBottom: 10,
          }}
        >
          Cukup<span style={{ color: C.lime }}>.</span>
        </div>
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 28, color: C.lime, letterSpacing: 4, opacity: cap, transform: `translateY(${(1 - cap) * 16}px)`, marginTop: 8 }}>
        SATU TEMPAT UNTUK SEMUANYA
      </div>
      <AbsoluteFill style={{ background: C.lime, transformOrigin: "left center", transform: `scaleX(${wipe})` }} />
    </AbsoluteFill>
  );
};

/* =====================================================
   SCENE C — RAPI (4,5–9 dtk) : phone + app UI
   ===================================================== */
const Rise = ({ delay, children, style }: { delay: number; children: React.ReactNode; style?: React.CSSProperties }) => {
  const s = useSpr(delay, SPRING_SNAP);
  return <div style={{ opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 46}px) scale(${0.96 + 0.04 * s})`, ...style }}>{children}</div>;
};

const ClassCard = ({ idx }: { idx: number }) => {
  const c = classes[idx];
  return (
    <Rise delay={14 + idx * 5}>
      <div
        style={{
          background: "#fff",
          border: `1.5px solid ${C.line}`,
          borderRadius: 30,
          padding: "20px 26px 20px 30px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          position: "relative",
          overflow: "hidden",
          height: 148,
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, background: idx === 0 ? "#1f6f4a" : C.lime }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: F.mono, fontSize: 21, color: C.muted }}>{c.time}</div>
          <div style={{ fontFamily: F.display, fontSize: 35, color: C.ink, marginTop: 4, letterSpacing: -0.5 }}>{c.name}</div>
          <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 21, color: C.muted, marginTop: 4, whiteSpace: "nowrap" }}>
            {c.room} · {c.lecturer}
          </div>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 20, background: C.bg, color: C.lime, padding: "8px 14px", borderRadius: 14 }}>{c.sks} SKS</div>
      </div>
    </Rise>
  );
};

const DeadlineRow = ({ idx }: { idx: number }) => {
  const frame = useCurrentFrame();
  const d = deadlines[idx];
  const delay = 40 + idx * 5;
  const tick = interpolate(frame, [70, 82], [0, 1], clamp);
  const isDone = d.done;
  const urgent = d.level === "urgent";
  const pulseT = frame - 62;
  const pulse = urgent && pulseT > 0 && pulseT < 20 ? 1 + Math.sin((pulseT / 20) * Math.PI) * 0.09 : 1;
  return (
    <Rise delay={delay}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, height: 82, borderBottom: `1.5px solid ${C.line}` }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 13,
            border: `3px solid ${isDone ? C.bg : "#b9b3a5"}`,
            background: isDone ? C.lime : "transparent",
            opacity: isDone ? 0.25 + 0.75 * tick : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isDone && <Check size={26} progress={tick} />}
        </div>
        <div
          style={{
            flex: 1,
            fontFamily: F.body,
            fontWeight: 700,
            fontSize: 28,
            color: isDone && tick > 0.6 ? "#9a9a8f" : C.ink,
            textDecoration: isDone && tick > 0.6 ? "line-through" : "none",
          }}
        >
          {d.title}
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 22,
            padding: "7px 16px",
            borderRadius: 14,
            background: urgent ? C.danger : isDone ? "transparent" : "#E9E4D8",
            color: urgent ? "#fff" : isDone ? C.muted : C.ink,
            transform: `scale(${pulse})`,
          }}
        >
          {isDone && tick < 0.5 ? "H-2" : d.tag}
        </div>
      </div>
    </Rise>
  );
};

const AppScreen = () => (
  <div style={{ padding: "96px 38px 0", boxSizing: "border-box", height: "100%" }}>
    <Rise delay={8}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: F.mono, fontSize: 21, color: C.muted, letterSpacing: 2 }}>SENIN</div>
        <div style={{ fontFamily: F.mono, fontSize: 19, background: "#E9E4D8", color: C.ink, padding: "8px 14px", borderRadius: 14, whiteSpace: "nowrap" }}>
          {classes.length} Mata Kuliah • {totalSks} SKS
        </div>
      </div>
      <div style={{ fontFamily: F.display, fontSize: 56, color: C.ink, letterSpacing: -1.5, marginTop: 8, whiteSpace: "nowrap" }}>Jadwal Hari Ini</div>
    </Rise>
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
      <ClassCard idx={0} />
      <ClassCard idx={1} />
    </div>
    <Rise delay={32} style={{ marginTop: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 21, color: C.muted, letterSpacing: 2, paddingBottom: 6 }}>
        <span>RADAR DEADLINE</span>
        <span>4 ITEM</span>
      </div>
    </Rise>
    <div>
      {deadlines.map((_, i) => (
        <DeadlineRow key={i} idx={i} />
      ))}
    </div>
  </div>
);

const Phone = ({ children, y }: { children: React.ReactNode; y: number }) => (
  <div
    style={{
      position: "absolute",
      left: 170,
      top: y,
      width: 740,
      height: 1500,
      borderRadius: 100,
      background: "#04100a",
      border: "2px solid rgba(255,255,255,0.14)",
      padding: 18,
      boxSizing: "border-box",
      boxShadow: "0 60px 120px rgba(0,0,0,0.55), 0 0 0 10px rgba(198,244,50,0.05)",
    }}
  >
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 84, background: C.paper, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 20, left: "50%", marginLeft: -75, width: 150, height: 38, borderRadius: 20, background: "#04100a", zIndex: 5 }} />
      <div style={{ position: "absolute", top: 26, left: 44, fontFamily: F.mono, fontSize: 22, color: C.ink, zIndex: 5 }}>07.43</div>
      {children}
    </div>
  </div>
);

const SceneC = () => {
  const frame = useCurrentFrame();
  const enter = useSpr(2, { damping: 17, stiffness: 120, mass: 1 });
  const exitT = interpolate(frame, [135, 150], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const phoneY = 330 + (1 - enter) * 520 + exitT * 1200;
  const push = interpolate(frame, [0, 100, 150], [1, 1.045, 1.045], { ...clamp, easing: ease });
  const wipeOut = interpolate(frame, [0, 12], [1, 0], { ...clamp, easing: ease });
  const capS = useSpr(6, SPRING_SOFT);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 70%" }}>
        <div style={{ position: "absolute", left: 70, top: 78, overflow: "hidden", height: 190, opacity: 1 - exitT }}>
          <div style={{ transform: `translateY(${(1 - capS) * 110}%)` }}>
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.lime, letterSpacing: 4 }}>NGAMPUS · 07.43</div>
            <div style={{ fontFamily: F.display, fontSize: 70, color: "#fff", letterSpacing: -2, lineHeight: 1.02, marginTop: 10 }}>
              Semua masuk ke<br />satu tempat.
            </div>
          </div>
        </div>
        <Phone y={phoneY}>
          <AppScreen />
        </Phone>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.lime, transformOrigin: "right center", transform: `scaleX(${wipeOut})` }} />
    </AbsoluteFill>
  );
};

const Rise2 = ({ delay, children }: { delay: number; children: React.ReactNode }) => {
  const s = useSpr(delay, SPRING_SOFT);
  return <div style={{ opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 20}px)` }}>{children}</div>;
};

/* =====================================================
   SCENE D — HASIL (9–12 dtk) : CV ATS + logo
   ===================================================== */
const typed = (text: string, frame: number, start: number, dur: number) => {
  const n = Math.floor(interpolate(frame, [start, start + dur], [0, text.length], clamp));
  return text.slice(0, n);
};

const SceneD = () => {
  const frame = useCurrentFrame();
  const up = useSpr(0, { damping: 16, stiffness: 110, mass: 1 });
  const sheetY = 90 + (1 - up) * 1300;
  const badge = useSpr(30, SPRING_SNAP);
  const logo = useSpr(34, SPRING_SOFT);
  const cta = useSpr(46, SPRING_SOFT);
  const fadeOut = interpolate(frame, [78, 90], [0, 1], clamp);
  const cursor = Math.floor(frame / 8) % 2 === 0;
  const starts = [20, 38, 56];
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 190,
          top: sheetY,
          width: 700,
          height: 800,
          background: "#FBFAF6",
          borderRadius: 26,
          padding: "52px 52px",
          boxSizing: "border-box",
          transform: "rotate(-2.2deg)",
          boxShadow: "0 50px 100px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontFamily: F.display, fontSize: 60, color: C.ink, letterSpacing: -1.5 }}>{cv.name}</div>
        <div style={{ fontFamily: F.mono, fontSize: 20, color: C.muted, marginTop: 6 }}>{cv.meta}</div>
        <div style={{ height: 5, width: 90, background: C.lime, marginTop: 24, borderRadius: 3, boxShadow: "0 0 0 1px #9bc21a" }} />
        <div style={{ fontFamily: F.mono, fontSize: 19, color: "#1f6f4a", letterSpacing: 3, marginTop: 36 }}>PENGALAMAN & PRESTASI</div>
        <div style={{ marginTop: 14 }}>
          {cv.bullets.map((b, i) => {
            const shown = typed(b, frame, starts[i], 16);
            const active = shown.length < b.length && shown.length > 0;
            return (
              <div key={i} style={{ display: "flex", gap: 14, minHeight: 84, alignItems: "flex-start" }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: C.ink, marginTop: 15, flexShrink: 0, opacity: shown.length ? 1 : 0 }} />
                <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 28, color: C.ink, lineHeight: 1.3 }}>
                  {shown}
                  {active && cursor ? <span style={{ color: "#1f6f4a" }}>|</span> : null}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 19, color: "#1f6f4a", letterSpacing: 3, marginTop: 14 }}>SKILL</div>
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          {cv.skills.map((s, i) => {
            const p = spring({ frame: frame - (60 + i * 3), fps: 30, config: SPRING_SNAP });
            return (
              <div key={s} style={{ fontFamily: F.mono, fontSize: 22, background: C.bg, color: C.lime, padding: "8px 18px", borderRadius: 14, transform: `scale(${p})`, opacity: p }}>
                {s}
              </div>
            );
          })}
        </div>
        <Rise2 delay={72}>
          <div style={{ fontFamily: F.mono, fontSize: 19, color: "#1f6f4a", letterSpacing: 3, marginTop: 34 }}>PENDIDIKAN</div>
          <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 26, color: C.ink, marginTop: 10 }}>Universitas Nusantara · 2023–sekarang</div>
        </Rise2>
        <div
          style={{
            position: "absolute",
            right: -22,
            top: -26,
            background: C.lime,
            color: C.ink,
            fontFamily: F.mono,
            fontSize: 24,
            padding: "12px 22px",
            borderRadius: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
            transform: `scale(${badge}) rotate(5deg)`,
            boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
          }}
        >
          <Check size={24} progress={Math.min(1, badge)} /> ATS-ready
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 985, textAlign: "center", opacity: Math.min(1, logo * 2), transform: `translateY(${(1 - logo) * 40}px)` }}>
        <div style={{ fontFamily: F.display, fontSize: 132, color: "#fff", letterSpacing: -5, lineHeight: 1 }}>
          ngamp<span style={{ color: C.lime }}>US</span>
        </div>
        <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 33, color: "rgba(255,255,255,0.78)", marginTop: 14 }}>
          Kuliah beres. Organisasi jalan. CV siap.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1205,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          opacity: Math.min(1, cta * 2),
          transform: `translateY(${(1 - cta) * 30}px)`,
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 24, background: C.lime, color: C.ink, padding: "10px 24px", borderRadius: 40 }}>GRATIS</div>
        <div style={{ fontFamily: F.mono, fontSize: 26, color: "#fff", letterSpacing: 1 }}>ngampus.site</div>
      </div>
      <AbsoluteFill style={{ background: C.bg, opacity: fadeOut }} />
    </AbsoluteFill>
  );
};

/* =====================================================
   ROOT COMPOSITION
   ===================================================== */
export const HeroStory: React.FC = () => {
  useFonts();
  const { height } = useVideoConfig();
  const offset = (height - 1350) / 2; // supaya versi vertikal tetap rapi di tengah
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(198,244,50,0.07) 2px, transparent 2px)",
          backgroundSize: "54px 54px",
        }}
      />
      <div style={{ position: "absolute", left: 0, top: offset, width: 1080, height: 1350, overflow: height > 1350 ? "visible" : "hidden" }}>
        <Sequence from={A_START} durationInFrames={B_START - A_START}>
          <SceneA />
        </Sequence>
        <Sequence from={B_START} durationInFrames={C_START - B_START}>
          <SceneB />
        </Sequence>
        <Sequence from={C_START} durationInFrames={C_LEN}>
          <SceneC />
        </Sequence>
        <Sequence from={D_START} durationInFrames={TOTAL - D_START}>
          <SceneD />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
