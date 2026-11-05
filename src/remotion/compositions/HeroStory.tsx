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
  Img,
} from "remotion";
import { C, F } from "../theme";
import {
  A_START,
  A_LEN,
  B_START,
  B_LEN,
  C_START,
  C_LEN,
  D_START,
  D_LEN,
  TOTAL,
  SPRING_SOFT,
  SPRING_SNAP,
  SPRING_DROP,
  SPRING_SLAM,
} from "../timing";
import { DEMO_DATA } from "@/lib/demoData";

/* ---------- Data Konsisten NgampUS ---------- */
const chaosItems = [
  { t: "Grup Kelas 3B", m: "999+ pesan belum dibaca", i: "💬" },
  { t: "Tugas Basdat", m: "Dikumpul BESOK 23:59 !!", i: "⚠️", urgent: true },
  { t: "Rapat BEM", m: "Bentrok sama kuliah Struktur Data", i: "📅" },
  { t: "Modul Praktikum", m: "Link Google Drive-nya di mana ya??", i: "📁" },
  { t: "Kuis Dadakan", m: "Katanya mulai jam 10.00 hari ini!", i: "⚡", urgent: true },
  { t: "Grup Kelas 3B", m: "Ada yang punya catatan kuliah P3?", i: "📝" },
  { t: "Panitia Seminar", m: "Proker belum ada yang update nih", i: "🚩" },
];

const classes = [
  { time: "08:00–09:40", name: "Algoritma & Struktur Data", room: "Lab Komputer 3", lecturer: "Dr. Ir. Hendra Gunawan", sks: 3 },
  { time: "10:00–11:40", name: "Sistem Basis Data", room: "Gedung B Lt. 4, R. 402", lecturer: "Dr. Ir. Rushendra, MT", sks: 3 },
];

const deadlines = [
  { title: "Baca Modul Praktikum P5", tag: "Selesai", done: true, level: "done" },
  { title: "Tugas 04: REST API Auth", tag: "H-1", done: false, level: "urgent" },
  { title: "Kuis Algoritma Graf", tag: "H-3", done: false, level: "normal" },
  { title: "Open Recruitment Panitia", tag: "H-5", done: false, level: "normal" },
];

const cvData = {
  name: "Yoga Gusti Rachmadi",
  meta: "Teknik Informatika · Semester 4 · IPK 3.88",
  bullets: [
    "Project Officer, Tech Seminar & Expo · 450+ peserta",
    "Lead Developer, Web Rekap Kuliah Berbasis AI · Nilai A",
  ],
  skills: ["Next.js", "TypeScript", "Supabase", "React"],
};

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
   SCENE A — KACAU & WHATSAPP OVERLOAD (0–4.0 dtk / 120 frames)
   ===================================================== */
const chaosLayout = [
  { x: 70, y: 110, r: -3, d: 0 },
  { x: 250, y: 250, r: 4, d: 10 },
  { x: 90, y: 410, r: -5, d: 22 },
  { x: 230, y: 570, r: 3, d: 35 },
  { x: 60, y: 730, r: -2, d: 48 },
  { x: 210, y: 890, r: 5, d: 62 },
  { x: 100, y: 1040, r: -4, d: 76 },
];

const ChaosCard = ({ idx }: { idx: number }) => {
  const frame = useCurrentFrame();
  const L = chaosLayout[idx];
  const D = chaosItems[idx];
  const s = useSpr(L.d, SPRING_DROP);
  const jitter = Math.sin(frame * 0.6 + idx * 2) * interpolate(frame, [40, 120], [0.2, 1.6], clamp);
  const urgent = !!D.urgent;
  const pulse = urgent ? 1 + Math.max(0, Math.sin(frame * 0.45)) * 0.03 : 1;
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
  const shakeAmp = interpolate(frame, [40, 120], [0, 12], clamp);
  const sx = Math.sin(frame * 1.9) * shakeAmp;
  const sy = Math.cos(frame * 2.3) * shakeAmp * 0.7;
  const scale = interpolate(frame, [0, 120], [1, 1.1], clamp);
  const badge = useSpr(8, SPRING_SNAP);
  const count = Math.floor(interpolate(frame, [10, 110], [3, 999], { ...clamp, easing: Easing.in(Easing.quad) }));
  const alertFlash = interpolate(frame, [80, 120], [0, 0.45], clamp);

  return (
    <AbsoluteFill>
      {/* Background Red Urgency Flash */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 77, 61, ${alertFlash}) 0%, transparent 70%)`,
        }}
      />

      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${scale})`, transformOrigin: "50% 45%" }}>
        <div style={{ position: "absolute", left: 70, top: 62, fontFamily: F.mono, fontSize: 24, color: "rgba(255,255,255,0.5)", letterSpacing: 3 }}>
          SENIN · 07.42 WIB
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
            fontWeight: 700,
            transform: `scale(${badge})`,
            boxShadow: "0 10px 25px rgba(255, 77, 61, 0.4)",
          }}
        >
          {count >= 999 ? "999+ PESAN" : `${count} PESAN`}
        </div>

        {chaosItems.map((_, i) => (
          <ChaosCard key={i} idx={i} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* =====================================================
   SCENE B — "Cukup." KINETIC SNAP (4.0–6.0 dtk / 60 frames)
   ===================================================== */
const SceneB = () => {
  const frame = useCurrentFrame();
  const s = useSpr(2, { damping: 15, stiffness: 160, mass: 0.8 });
  const cap = interpolate(frame, [18, 32], [0, 1], clamp);
  const wipe = interpolate(frame, [44, 59], [0, 1], { ...clamp, easing: ease });

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
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 28,
          color: C.lime,
          letterSpacing: 4,
          opacity: cap,
          transform: `translateY(${(1 - cap) * 16}px)`,
          marginTop: 12,
        }}
      >
        SATU TEMPAT UNTUK SELURUH SEMESTER
      </div>

      {/* Dynamic Lime Neon Wipe Transition */}
      <AbsoluteFill
        style={{
          background: C.lime,
          transformOrigin: "left center",
          transform: `scaleX(${wipe})`,
        }}
      />
    </AbsoluteFill>
  );
};

/* =====================================================
   SCENE C — RAPI: SLEEK PHONE & LIVE TASK CHECK (6.0–13.0 dtk / 210 frames)
   ===================================================== */
const Rise = ({ delay, children, style }: { delay: number; children: React.ReactNode; style?: React.CSSProperties }) => {
  const s = useSpr(delay, SPRING_SNAP);
  return <div style={{ opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 46}px) scale(${0.96 + 0.04 * s})`, ...style }}>{children}</div>;
};

const ClassCard = ({ idx }: { idx: number }) => {
  const c = classes[idx];
  return (
    <Rise delay={16 + idx * 8}>
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
  const delay = 35 + idx * 7;
  // Interactive checkmark animation at frames 95 - 118 (detik ke-9.2s)
  const tick = interpolate(frame, [95, 118], [0, 1], clamp);
  const isDone = d.done || (idx === 1 && tick > 0.1);
  const urgent = d.level === "urgent" && tick < 0.6;
  const pulseT = frame - 80;
  const pulse = urgent && pulseT > 0 && pulseT < 25 ? 1 + Math.sin((pulseT / 25) * Math.PI) * 0.1 : 1;

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
            opacity: idx === 1 ? (tick > 0 ? 0.3 + 0.7 * tick : 1) : (d.done ? 1 : 0.8),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: idx === 1 && tick > 0.5 ? "0 0 16px rgba(198, 244, 50, 0.6)" : "none",
            transition: "box-shadow 0.2s ease",
          }}
        >
          {isDone && <Check size={26} progress={idx === 1 ? tick : 1} />}
        </div>
        <div
          style={{
            flex: 1,
            fontFamily: F.body,
            fontWeight: 700,
            fontSize: 28,
            color: isDone && (idx === 1 ? tick > 0.6 : d.done) ? "#9a9a8f" : C.ink,
            textDecoration: isDone && (idx === 1 ? tick > 0.6 : d.done) ? "line-through" : "none",
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
            background: idx === 1 && tick > 0.6 ? C.lime : urgent ? C.danger : isDone ? "transparent" : "#E9E4D8",
            color: idx === 1 && tick > 0.6 ? C.ink : urgent ? "#fff" : isDone ? C.muted : C.ink,
            fontWeight: 700,
            transform: `scale(${pulse})`,
          }}
        >
          {idx === 1 ? (tick > 0.6 ? "SELESAI" : "H-1") : d.tag}
        </div>
      </div>
    </Rise>
  );
};

const AppScreen = () => {
  const frame = useCurrentFrame();
  const toastSpr = spring({ frame: frame - 105, fps: 30, config: SPRING_SNAP });
  const toastFade = interpolate(frame, [180, 195], [1, 0], clamp);

  return (
    <div style={{ padding: "82px 36px 0", boxSizing: "border-box", height: "100%", position: "relative" }}>
      {/* Floating Dopamine Toast on Task Complete */}
      {frame >= 105 && (
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 38,
            right: 38,
            zIndex: 40,
            opacity: Math.min(1, toastSpr * 2) * toastFade,
            transform: `translateY(${(1 - toastSpr) * -20}px)`,
          }}
        >
          <div
            style={{
              background: C.bg,
              border: `2px solid ${C.lime}`,
              borderRadius: 22,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, background: C.lime }} />
              <span style={{ fontFamily: F.body, fontWeight: 700, fontSize: 22, color: "#fff" }}>
                ✦ Tugas 04 Tuntas!
              </span>
            </div>
            <span style={{ fontFamily: F.mono, fontSize: 19, color: C.lime, fontWeight: 700 }}>
              Progres +15%
            </span>
          </div>
        </div>
      )}

      <Rise delay={8}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: F.mono, fontSize: 21, color: C.muted, letterSpacing: 2 }}>SENIN</div>
          <div style={{ fontFamily: F.mono, fontSize: 19, background: "#E9E4D8", color: C.ink, padding: "8px 14px", borderRadius: 14, whiteSpace: "nowrap", fontWeight: 700 }}>
            {classes.length} Mata Kuliah • 6 SKS
          </div>
        </div>
        <div style={{ fontFamily: F.display, fontSize: 56, color: C.ink, letterSpacing: -1.5, marginTop: 8, whiteSpace: "nowrap" }}>
          Jadwal Hari Ini
        </div>
      </Rise>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
        <ClassCard idx={0} />
        <ClassCard idx={1} />
      </div>

      <Rise delay={30} style={{ marginTop: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 21, color: C.muted, letterSpacing: 2, paddingBottom: 6 }}>
          <span>RADAR DEADLINE</span>
          <span style={{ color: C.danger, fontWeight: 700 }}>• 1 MENDESAK</span>
        </div>
      </Rise>
      <div>
        {deadlines.map((_, i) => (
          <DeadlineRow key={i} idx={i} />
        ))}
      </div>
    </div>
  );
};

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
      {/* Dynamic Island */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          marginLeft: -80,
          width: 160,
          height: 38,
          borderRadius: 20,
          background: "#04100a",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: 5, background: "#10261b" }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: C.lime, opacity: 0.8 }} />
      </div>

      {/* Status Bar */}
      <div style={{ position: "absolute", top: 26, left: 44, fontFamily: F.mono, fontSize: 22, color: C.ink, zIndex: 50, fontWeight: 700 }}>
        07.43
      </div>
      
      {/* Top App Header Logo Pill */}
      <div
        style={{
          position: "absolute",
          top: 23,
          right: 44,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#E9E4D8",
          padding: "5px 12px",
          borderRadius: 12,
        }}
      >
        <Img src={staticFile("icon-192.png")} style={{ width: 18, height: 18, borderRadius: 4 }} />
        <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 16, color: C.ink }}>ngamp<span style={{ color: "#0f6849" }}>US</span></span>
      </div>

      {children}
    </div>
  </div>
);

const SceneC = () => {
  const frame = useCurrentFrame();
  const enter = useSpr(4, { damping: 17, stiffness: 100, mass: 1 });
  const exitT = interpolate(frame, [190, 210], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const phoneY = 240 + (1 - enter) * 520 + exitT * 1200;
  const push = interpolate(frame, [0, 140, 210], [1, 1.045, 1.045], { ...clamp, easing: ease });
  const wipeOut = interpolate(frame, [0, 16], [1, 0], { ...clamp, easing: ease });
  const capS = useSpr(6, SPRING_SOFT);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 70%" }}>
        <div style={{ position: "absolute", left: 70, top: 25, overflow: "hidden", height: 210, opacity: 1 - exitT }}>
          <div style={{ transform: `translateY(${(1 - capS) * 110}%)` }}>
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.lime, letterSpacing: 4 }}>NGAMPUS · 07.43</div>
            <div style={{ fontFamily: F.display, fontSize: 64, color: "#fff", letterSpacing: -2, lineHeight: 1.08, marginTop: 8 }}>
              Semua masuk ke<br />satu tempat.
            </div>
          </div>
        </div>
        <Phone y={phoneY}>
          <AppScreen />
        </Phone>
      </AbsoluteFill>

      {/* Entrance Lime Wipe Out */}
      <AbsoluteFill
        style={{
          background: C.lime,
          transformOrigin: "right center",
          transform: `scaleX(${wipeOut})`,
        }}
      />
    </AbsoluteFill>
  );
};

const Rise2 = ({ delay, children }: { delay: number; children: React.ReactNode }) => {
  const s = useSpr(delay, SPRING_SOFT);
  return <div style={{ opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 20}px)` }}>{children}</div>;
};

/* =====================================================
   SCENE D — HASIL: ATS CV SHEET, RESMI LOGO & CTA (13.0–18.0 dtk / 150 frames)
   ===================================================== */
const typed = (text: string, frame: number, start: number, dur: number) => {
  const n = Math.floor(interpolate(frame, [start, start + dur], [0, text.length], clamp));
  return text.slice(0, n);
};

const SceneD = () => {
  const frame = useCurrentFrame();
  const up = useSpr(0, { damping: 16, stiffness: 90, mass: 1 });
  const sheetY = 175 + (1 - up) * 1300;
  const stamp = useSpr(45, SPRING_SLAM);
  const logo = useSpr(65, SPRING_SOFT);
  const cta = useSpr(85, SPRING_SOFT);
  const fadeOut = interpolate(frame, [136, 150], [0, 1], clamp);
  const cursor = Math.floor(frame / 7) % 2 === 0;
  const starts = [18, 42];

  return (
    <AbsoluteFill>
      {/* Background Soft Ambient Glow */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 700,
          borderRadius: 350,
          background: "radial-gradient(circle, rgba(198, 244, 50, 0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Harvard-Style ATS CV Paper Sheet */}
      <div
        style={{
          position: "absolute",
          left: 190,
          top: sheetY,
          width: 700,
          height: 600,
          background: "#FBFAF6",
          borderRadius: 26,
          padding: "36px 44px",
          boxSizing: "border-box",
          transform: "rotate(-2.2deg)",
          boxShadow: "0 40px 90px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: F.display, fontSize: 50, color: C.ink, letterSpacing: -1.5 }}>
              {cvData.name}
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 19, color: C.muted, marginTop: 4 }}>
              {cvData.meta}
            </div>
          </div>
          {/* Micro ngampUS Verified Stamp Mark */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#E9E4D8", padding: "5px 12px", borderRadius: 12 }}>
            <Img src={staticFile("icon-192.png")} style={{ width: 18, height: 18, borderRadius: 4 }} />
            <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 700, color: "#10261b" }}>VERIFIED</span>
          </div>
        </div>

        <div style={{ height: 5, width: 80, background: C.lime, marginTop: 16, borderRadius: 3, boxShadow: "0 0 0 1px #9bc21a" }} />
        
        <div style={{ fontFamily: F.mono, fontSize: 18, color: "#1f6f4a", letterSpacing: 3, marginTop: 24, fontWeight: 700 }}>
          PENGALAMAN & PRESTASI TERVERIFIKASI
        </div>
        
        <div style={{ marginTop: 12 }}>
          {cvData.bullets.map((b, i) => {
            const shown = typed(b, frame, starts[i], 18);
            const active = shown.length < b.length && shown.length > 0;
            return (
              <div key={i} style={{ display: "flex", gap: 14, minHeight: 62, alignItems: "flex-start" }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: C.ink, marginTop: 12, flexShrink: 0, opacity: shown.length ? 1 : 0 }} />
                <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 25, color: C.ink, lineHeight: 1.3 }}>
                  {shown}
                  {active && cursor ? <span style={{ color: "#1f6f4a", fontWeight: 700 }}>|</span> : null}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ fontFamily: F.mono, fontSize: 18, color: "#1f6f4a", letterSpacing: 3, marginTop: 14, fontWeight: 700 }}>
          KOMPETENSI TEKNIS
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          {cvData.skills.map((s, i) => {
            const p = spring({ frame: frame - (78 + i * 4), fps: 30, config: SPRING_SNAP });
            return (
              <div key={s} style={{ fontFamily: F.mono, fontSize: 19, background: C.bg, color: C.lime, padding: "7px 16px", borderRadius: 14, transform: `scale(${p})`, opacity: p, fontWeight: 700 }}>
                {s}
              </div>
            );
          })}
        </div>

        <Rise2 delay={92}>
          <div style={{ fontFamily: F.mono, fontSize: 18, color: "#1f6f4a", letterSpacing: 3, marginTop: 20, fontWeight: 700 }}>
            PENDIDIKAN
          </div>
          <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 23, color: C.ink, marginTop: 6 }}>
            Universitas Mercu Buana · 2023–sekarang
          </div>
        </Rise2>

        {/* Slamming ATS-Ready Badge Stamp */}
        <div
          style={{
            position: "absolute",
            right: -24,
            top: -26,
            background: C.lime,
            color: C.ink,
            fontFamily: F.mono,
            fontSize: 24,
            fontWeight: 800,
            padding: "14px 24px",
            borderRadius: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
            transform: `scale(${stamp}) rotate(5deg)`,
            boxShadow: "0 18px 40px rgba(0,0,0,0.45), 0 0 0 2px rgba(10,31,22,0.15)",
          }}
        >
          <Check size={26} progress={Math.min(1, stamp)} />
          <span>ATS SCORE 96/100</span>
        </div>
      </div>

      {/* ── Official Branding & Call To Action Section ── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 830,
          textAlign: "center",
          opacity: Math.min(1, logo * 2),
          transform: `translateY(${(1 - logo) * 40}px)`,
        }}
      >
        {/* Official Logo with Squircle Mark */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: 22,
              background: "linear-gradient(135deg, #12332a, #0a1f16)",
              border: "2px solid rgba(198, 244, 50, 0.4)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Img src={staticFile("icon-512.png")} style={{ width: 62, height: 62, objectFit: "contain" }} />
          </div>
          <div style={{ fontFamily: F.display, fontSize: 94, color: "#fff", letterSpacing: -4, lineHeight: 1 }}>
            ngamp<span style={{ color: C.lime }}>US</span>
          </div>
        </div>

        <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 29, color: "rgba(255,255,255,0.85)", marginTop: 12 }}>
          Kuliah beres. Organisasi jalan. CV siap.
        </div>
      </div>

      {/* CTA Button Strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1040,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          opacity: Math.min(1, cta * 2),
          transform: `translateY(${(1 - cta) * 30}px)`,
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 24, fontWeight: 800, background: C.lime, color: C.ink, padding: "12px 28px", borderRadius: 40, boxShadow: "0 10px 25px rgba(198,244,50,0.3)" }}>
          100% GRATIS
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>
          ngampus.site
        </div>
      </div>

      {/* Soft Fade Out into Smooth Loop */}
      <AbsoluteFill style={{ background: C.bg, opacity: fadeOut }} />
    </AbsoluteFill>
  );
};

/* =====================================================
   ROOT COMPOSITION — 18 DETIK (540 FRAMES)
   ===================================================== */
export const HeroStory: React.FC = () => {
  useFonts();
  const { height } = useVideoConfig();
  const offset = (height - 1350) / 2; // Otomatis rapi di tengah baik untuk 4:5 maupun 9:16 vertical

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", left: 0, top: offset, width: 1080, height: 1350, overflow: height > 1350 ? "visible" : "hidden" }}>
        {/* SCENE A: KACAU (0–4.0 dtk / 120 frames) */}
        <Sequence from={A_START} durationInFrames={A_LEN}>
          <SceneA />
        </Sequence>

        {/* SCENE B: CUKUP. (4.0–6.0 dtk / 60 frames) */}
        <Sequence from={B_START} durationInFrames={B_LEN}>
          <SceneB />
        </Sequence>

        {/* SCENE C: RAPI (6.0–13.0 dtk / 210 frames) */}
        <Sequence from={C_START} durationInFrames={C_LEN}>
          <SceneC />
        </Sequence>

        {/* SCENE D: HASIL (13.0–18.0 dtk / 150 frames) */}
        <Sequence from={D_START} durationInFrames={D_LEN}>
          <SceneD />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
