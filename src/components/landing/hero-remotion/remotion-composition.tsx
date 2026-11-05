"use client";

import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Award,
  Video,
  FileText,
  MousePointer2,
  Check,
  Zap,
} from "lucide-react";

export const REMOTION_TOTAL_FRAMES = 360; // 12 seconds at 30 fps
export const REMOTION_FPS = 30;

export function HeroRemotionComposition() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── TIMELINE PHASES ───
  // Phase 1 (0 - 75): Morning Chaos -> Sync into nGampUS
  // Phase 2 (75 - 150): Jadwal Kuliah Live & 1-Click Meet
  // Phase 3 (150 - 230): Radar Deadline -> Check completion + Confetti burst
  // Phase 4 (230 - 295): AI Study Companion & Flash Quiz
  // Phase 5 (295 - 360): ATS Resume Auto-Curated Finale

  // Global subtle ambient breathing
  const ambientScale = interpolate(
    Math.sin((frame / 30) * Math.PI),
    [-1, 1],
    [0.995, 1.005]
  );

  // Determine active phase
  const isPhase1 = frame < 75;
  const isPhase2 = frame >= 75 && frame < 150;
  const isPhase3 = frame >= 150 && frame < 230;
  const isPhase4 = frame >= 230 && frame < 295;
  const isPhase5 = frame >= 295;

  // Active Tab Highlight based on timeline
  const activeTab = isPhase2 ? "jadwal" : isPhase3 ? "radar" : isPhase4 ? "ai" : isPhase5 ? "cv" : "sync";

  // Virtual Cursor Coordinates
  // Move cursor to trigger interactions smoothly
  const cursorOpacity = interpolate(
    frame,
    [10, 20, 68, 74, 85, 95, 138, 145, 160, 175, 215, 225],
    [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const cursorX = interpolate(
    frame,
    [15, 45, 90, 120, 165, 185],
    [80, 52, 60, 82, 40, 28],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const cursorY = interpolate(
    frame,
    [15, 45, 90, 120, 165, 185],
    [30, 78, 40, 50, 45, 48],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const isClicking = (frame >= 43 && frame <= 50) || (frame >= 118 && frame <= 124) || (frame >= 183 && frame <= 192);

  return (
    <div
      style={{ transform: `scale(${ambientScale})` }}
      className="relative w-full h-full bg-[#fafaf7] text-[#10261b] select-none flex flex-col justify-between p-4 sm:p-5 font-sans overflow-hidden rounded-3xl border border-[#dce5dd] shadow-2xl"
    >
      {/* ── TOP HEADER / BROWSER BAR ── */}
      <div className="flex items-center justify-between border-b border-[#edf2ee] pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#10261b]/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#10261b]/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#10261b]/10" />
          <span className="ml-2 font-mono text-[11px] text-[#708075] font-medium hidden sm:inline">
            ngampus.site/workspace
          </span>
        </div>

        {/* Live Timeline Phase Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dff3e5] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0f6849]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0f6849] animate-pulse" />
            <span>
              {isPhase1 && "01. Sinkronisasi Cerdas"}
              {isPhase2 && "02. Jadwal & Kelas Online"}
              {isPhase3 && "03. Radar Deadline Tugas"}
              {isPhase4 && "04. AI Study Companion"}
              {isPhase5 && "05. CV ATS Auto-Curated"}
            </span>
          </span>
        </div>
      </div>

      {/* ── VIRTUAL TABS ── */}
      <div className="mt-3 grid grid-cols-4 gap-1.5 p-1 bg-[#f4f7f4] rounded-2xl border border-[#e2eae3] shrink-0 text-[11px] font-bold">
        <div className={`py-1.5 px-2 rounded-xl text-center transition-all ${activeTab === "jadwal" || activeTab === "sync" ? "bg-[#0f6849] text-white shadow-xs" : "text-[#708075]"}`}>
          Jadwal Kuliah
        </div>
        <div className={`py-1.5 px-2 rounded-xl text-center transition-all ${activeTab === "radar" ? "bg-[#0f6849] text-white shadow-xs" : "text-[#708075]"}`}>
          Radar Tugas
        </div>
        <div className={`py-1.5 px-2 rounded-xl text-center transition-all ${activeTab === "ai" ? "bg-[#0f6849] text-white shadow-xs" : "text-[#708075]"}`}>
          Modul & AI
        </div>
        <div className={`py-1.5 px-2 rounded-xl text-center transition-all ${activeTab === "cv" ? "bg-[#0f6849] text-white shadow-xs" : "text-[#708075]"}`}>
          CV Portofolio
        </div>
      </div>

      {/* ── STAGE VIEW CONTAINER ── */}
      <div className="relative mt-3.5 flex-1 min-h-[300px] sm:min-h-[330px] rounded-2xl bg-white border border-[#edf2ee] p-4 flex flex-col justify-between overflow-hidden shadow-xs">
        
        {/* SCENE 1: Chaos -> nGampUS Auto-Sync (Frames 0 - 75) */}
        {isPhase1 && (
          <Phase1Sync frame={frame} fps={fps} />
        )}

        {/* SCENE 2: Smart Schedule (Frames 75 - 150) */}
        {isPhase2 && (
          <Phase2Schedule frame={frame - 75} fps={fps} />
        )}

        {/* SCENE 3: Deadline Radar + Confetti (Frames 150 - 230) */}
        {isPhase3 && (
          <Phase3Radar frame={frame - 150} fps={fps} />
        )}

        {/* SCENE 4: AI Study Companion (Frames 230 - 295) */}
        {isPhase4 && (
          <Phase4AI frame={frame - 230} fps={fps} />
        )}

        {/* SCENE 5: Auto-Curated CV ATS (Frames 295 - 360) */}
        {isPhase5 && (
          <Phase5Resume frame={frame - 295} fps={fps} />
        )}

        {/* ── VIRTUAL MOTION CURSOR (Remotion After Effects style) ── */}
        <div
          style={{
            left: `${cursorX}%`,
            top: `${cursorY}%`,
            opacity: cursorOpacity,
            transform: `scale(${isClicking ? 0.85 : 1})`,
            transition: "transform 0.08s ease",
          }}
          className="pointer-events-none absolute z-50 flex items-center gap-1.5"
        >
          <div className="relative">
            <MousePointer2
              size={22}
              className="fill-[#10261b] text-white drop-shadow-md"
            />
            {isClicking && (
              <span className="absolute -inset-1 rounded-full bg-[#0f6849]/40 animate-ping" />
            )}
          </div>
          <span className="rounded-full bg-[#10261b] px-2 py-0.5 text-[9px] font-bold text-white shadow-md">
            Mahasiswa
          </span>
        </div>

      </div>

      {/* ── BOTTOM TIMELINE PROGRESS BAR (Cinematic scrub effect) ── */}
      <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-[#708075]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#0f6849] font-bold">
            {Math.floor(frame / 30)}s / 12s
          </span>
          <div className="w-32 sm:w-44 h-1.5 bg-[#edf2ee] rounded-full overflow-hidden">
            <div
              style={{ width: `${(frame / REMOTION_TOTAL_FRAMES) * 100}%` }}
              className="h-full bg-[#0f6849] rounded-full transition-all duration-75"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-medium text-[10.5px]">
          <Sparkles size={12} className="text-[#0f6849]" />
          <span>Motion Visual by nGampUS</span>
        </div>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS FOR EACH SCENE ───

function Phase1Sync({ frame, fps }: { frame: number; fps: number }) {
  const popSpring = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  const cardCollapse = interpolate(frame, [38, 55], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const syncSuccess = frame > 48;

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#708075]">
              ALUR CERDAS MAHASISWA
            </span>
            <h4 className="font-display text-base font-bold text-[#10261b]">
              Kerapian Dari Kekacauan WhatsApp
            </h4>
          </div>
          <span className="rounded-full bg-[#dff3e5] px-2.5 py-0.5 text-[10px] font-bold text-[#0f6849]">
            AI Auto-Sort
          </span>
        </div>

        {/* Chaotic chat bubbles before sync */}
        <div className="mt-4 space-y-2 relative">
          <div
            style={{
              transform: `scale(${popSpring * cardCollapse}) translateY(${cardCollapse < 1 ? -15 : 0}px)`,
              opacity: cardCollapse,
            }}
            className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 shadow-xs"
          >
            <div className="flex items-center justify-between text-[10px] text-rose-800 font-bold">
              <span>💬 Grup Kelas: Algoritma Lanjut</span>
              <span>07:45</span>
            </div>
            <p className="text-xs text-[#10261b] mt-1 font-medium">
              "Guys, jangan lupa laporan tugas P4 dikumpul sebelum jam 23:59 ya!"
            </p>
          </div>

          <div
            style={{
              transform: `scale(${popSpring * cardCollapse}) translateY(${cardCollapse < 1 ? -25 : 0}px)`,
              opacity: cardCollapse,
            }}
            className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 shadow-xs"
          >
            <div className="flex items-center justify-between text-[10px] text-blue-800 font-bold">
              <span>💬 Grup BEM Divisi Kominfo</span>
              <span>08:10</span>
            </div>
            <p className="text-xs text-[#10261b] mt-1 font-medium">
              "Rapat evaluasi seminar dimajukan ke jam 16:00 sore ini."
            </p>
          </div>

          {/* Clean resolved calendar card appearing */}
          {syncSuccess && (
            <div className="rounded-2xl border border-[#c3ddcb] bg-[#dff3e5]/50 p-4 animate-in fade-in zoom-in-95 duration-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0f6849] flex items-center gap-1.5">
                  <Check size={16} strokeWidth={2.5} />
                  2 Tugas & Agenda Tersusun Rapi
                </span>
                <span className="rounded bg-[#0f6849] text-white px-2 py-0.5 text-[9px] font-bold">
                  0 Konflik Jam
                </span>
              </div>
              <p className="text-xs text-[#55675b] mt-1">
                Jadwal kuliah dan rapat organisasi otomatis dipisahkan tanpa tubrukan waktu.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-[#f4f7f4] border border-[#dce5dd] p-2.5 flex items-center justify-between text-xs">
        <span className="text-[#55675b] text-[11px]">Deteksi Cerdas:</span>
        <span className="font-bold text-[#0f6849] text-[11px]">
          {syncSuccess ? "✓ Sinkronisasi Selesai" : "Menunggu Input..."}
        </span>
      </div>
    </div>
  );
}

function Phase2Schedule({ frame, fps }: { frame: number; fps: number }) {
  const springVal = spring({ frame, fps, config: { damping: 14 } });
  const isMeetClicked = frame > 45;

  return (
    <div className="h-full flex flex-col justify-between animate-in fade-in duration-200">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-[#dff3e5] p-1.5 text-[#0f6849]">
              <Calendar size={16} />
            </span>
            <div>
              <h4 className="font-display text-sm font-bold text-[#10261b]">
                Jadwal Hari Senin
              </h4>
              <p className="text-[11px] text-[#708075]">Senin Pagi • 08:00 - 09:40 WIB</p>
            </div>
          </div>
          <span className="rounded-full bg-[#10261b] text-white px-2.5 py-0.5 text-[10px] font-bold">
            Semester 4
          </span>
        </div>

        <div style={{ transform: `scale(${springVal})` }} className="mt-4">
          <div className="rounded-2xl border border-[#c3ddcb] bg-white p-4 shadow-sm hover:border-[#0f6849] transition">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#0f6849] uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-[#0f6849] animate-pulse" />
                Sedang Berlangsung
              </span>
              <span className="text-[10px] font-semibold text-[#708075]">3 SKS</span>
            </div>

            <h5 className="font-display font-bold text-sm text-[#10261b] mt-1.5">
              Algoritma & Struktur Data Lanjut
            </h5>
            <p className="text-xs text-[#708075]">Dr. Ir. Hendra Gunawan • Lab Komputer 3</p>

            {/* Quick Action Buttons */}
            <div className="mt-3.5 flex items-center justify-between border-t border-[#edf2ee] pt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    isMeetClicked
                      ? "bg-[#0b4d36] text-white ring-2 ring-[#0f6849]/30"
                      : "bg-[#0f6849] text-white shadow-xs"
                  }`}
                >
                  <Video size={13} />
                  <span>{isMeetClicked ? "Membuka Meet..." : "Buka Meet"}</span>
                </button>
                <span className="text-[11px] text-[#708075] bg-[#f4f7f4] px-2.5 py-1 rounded-lg border border-[#dce5dd]">
                  Slide Pertemuan 5
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#0f6849]">
                {isMeetClicked ? "Terkoneksi ✓" : "1-Click"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-[#c3ddcb] bg-[#dff3e5]/40 p-2.5 flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#10261b] font-medium flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#0f6849]" /> Kalender .ICS siap disinkronkan ke HP
        </span>
        <span className="font-bold text-[#0f6849] text-[11px]">Sync Aktif</span>
      </div>
    </div>
  );
}

function Phase3Radar({ frame, fps }: { frame: number; fps: number }) {
  const isChecked = frame > 35;
  const progressSpring = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 15 } });
  const progressPct = isChecked ? Math.min(100, Math.round(85 + progressSpring * 15)) : 85;

  return (
    <div className="h-full flex flex-col justify-between animate-in fade-in duration-200">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-rose-100 p-1.5 text-rose-800">
              <Clock size={16} />
            </span>
            <div>
              <h4 className="font-display text-sm font-bold text-[#10261b]">
                Radar Deadline Tugas
              </h4>
              <p className="text-[11px] text-[#708075]">Peringatan visual otomatis H-1</p>
            </div>
          </div>
          <span className="rounded-full bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-0.5 text-[10px] font-bold">
            H-1 Pengumpulan
          </span>
        </div>

        {/* Interactive Task Card */}
        <div className="mt-4">
          <div
            className={`rounded-2xl border p-4 transition-all duration-200 shadow-xs ${
              isChecked
                ? "border-[#c3ddcb] bg-[#dff3e5]/25"
                : "border-rose-200 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {isChecked ? (
                  <CheckCircle2 size={20} className="fill-[#0f6849] text-white animate-in zoom-in-75 duration-150" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-rose-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${isChecked ? "bg-[#dff3e5] text-[#0f6849]" : "bg-rose-100 text-rose-800"}`}>
                    {isChecked ? "SELESAI" : "DEADLINE BESOK"}
                  </span>
                  <span className="text-[10.5px] text-[#708075]">23:59 WIB</span>
                </div>
                <h5 className={`font-display font-bold text-sm mt-1 transition ${isChecked ? "line-through text-[#708075]" : "text-[#10261b]"}`}>
                  Laporan Praktikum Modul 4 (Struktur Data)
                </h5>
                <p className="text-xs text-[#708075] mt-0.5">
                  {isChecked ? "✓ Berhasil diserahkan ke sistem" : "Status: Siap diverifikasi dan submit"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Dopamine Feedback */}
      <div className="space-y-2">
        {isChecked && (
          <div className="rounded-xl bg-[#0f6849] text-white p-2.5 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 duration-200">
            <span className="flex items-center gap-1.5 text-[11px] font-bold">
              <Sparkles size={13} className="text-[#c8ef70]" /> Poin portofolio bertambah!
            </span>
            <span className="font-mono text-[10px] bg-white/20 px-2 py-0.5 rounded">
              +1 Portofolio
            </span>
          </div>
        )}

        <div className="rounded-xl bg-[#10261b] p-3 text-white flex items-center justify-between text-xs">
          <span className="text-[#cad7ce] text-[11px]">Progres Semester:</span>
          <span className="font-bold text-[#c8ef70] font-mono text-sm">
            {progressPct}% Selesai
          </span>
        </div>
      </div>
    </div>
  );
}

function Phase4AI({ frame, fps }: { frame: number; fps: number }) {
  const charactersCount = Math.min(68, Math.floor(frame * 1.8));
  const fullText = "O(1) konstan, O(n) linier sesuai data, dan O(n²) terjadi pada nested loop.";
  const displayedText = fullText.slice(0, charactersCount);

  return (
    <div className="h-full flex flex-col justify-between animate-in fade-in duration-200">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-[#dff3e5] p-1.5 text-[#0f6849]">
              <Sparkles size={16} />
            </span>
            <div>
              <h4 className="font-display text-sm font-bold text-[#10261b]">
                Modul P5 & AI Study Companion
              </h4>
              <p className="text-[11px] text-[#708075]">Diskusi Konsep Kuliah Rumit</p>
            </div>
          </div>
          <span className="rounded-full bg-[#10261b] text-[#c8ef70] px-2.5 py-0.5 text-[10px] font-bold">
            Gemini Flash
          </span>
        </div>

        {/* Chat message snippet */}
        <div className="mt-4 space-y-2.5">
          <div className="rounded-xl bg-[#f4f7f4] border border-[#dce5dd] p-3 text-xs text-[#10261b]">
            <span className="text-[10px] font-bold text-[#708075] uppercase block">Pertanyaan Mahasiswa:</span>
            <p className="font-semibold mt-0.5">"Apa perbedaan mendasar O(n) dan O(n²) di algoritma?"</p>
          </div>

          <div className="rounded-xl bg-white border border-[#c3ddcb] p-3 text-xs shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0f6849]">
              <span className="h-2 w-2 rounded-full bg-[#0f6849] animate-pulse" />
              <span>Asisten AI nGampUS:</span>
            </div>
            <p className="text-[#55675b] mt-1 leading-relaxed font-mono text-[11px]">
              "{displayedText}"
              {charactersCount < fullText.length && <span className="animate-pulse">|</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[#dff3e5]/60 border border-[#c3ddcb] p-2.5 flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#0f6849] font-bold flex items-center gap-1.5">
          <Check size={13} strokeWidth={2.5} /> Kuis Pemahaman Siap Dikerjakan
        </span>
        <span className="text-[11px] font-semibold text-[#10261b]">3 Pertanyaan</span>
      </div>
    </div>
  );
}

function Phase5Resume({ frame, fps }: { frame: number; fps: number }) {
  const stampAppear = frame > 20;

  return (
    <div className="h-full flex flex-col justify-between animate-in fade-in duration-200">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-[#f1effd] p-1.5 text-[#644fe2]">
              <Award size={16} />
            </span>
            <div>
              <h4 className="font-display text-sm font-bold text-[#10261b]">
                Curriculum Vitae Portofolio
              </h4>
              <p className="text-[11px] text-[#708075]">Auto-Curated dari Proker & Proyek Nyata</p>
            </div>
          </div>
          <span className="rounded-full bg-[#f1effd] border border-[#d6d0fa] text-[#5946c7] px-2.5 py-0.5 text-[10px] font-bold">
            ATS 98%
          </span>
        </div>

        {/* ATS Resume Preview */}
        <div className="mt-4 space-y-2">
          <div className="rounded-xl border border-[#edf2ee] bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#644fe2]">PENGALAMAN ORGANISASI</span>
              <span className="text-[9px] text-[#708075]">2024 - 2025</span>
            </div>
            <h5 className="font-display font-bold text-xs text-[#10261b] mt-0.5">
              Project Officer — Tech Seminar & Expo
            </h5>
            <p className="text-[10.5px] text-[#708075] mt-0.5">
              Mengelola 20 panitia dan mendatangkan 450+ peserta seminar nasional.
            </p>
          </div>

          <div className="rounded-xl border border-[#edf2ee] bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#0f6849]">PROYEK AKADEMIK</span>
              <span className="text-[9px] text-[#708075]">Nilai A (4.00)</span>
            </div>
            <h5 className="font-display font-bold text-xs text-[#10261b] mt-0.5">
              Web App Rekap Kuliah Berbasis AI
            </h5>
            <p className="text-[10.5px] text-[#708075] mt-0.5">
              Mengintegrasikan Next.js dan Supabase dengan arsitektur REST & RLS.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[#0f6849] text-white p-2.5 flex items-center justify-between text-xs shadow-xs">
        <span className="text-[11px] font-bold flex items-center gap-1.5">
          <FileText size={13} className="text-[#c8ef70]" /> Siap Ekspor PDF Standar Industri
        </span>
        <span className="font-mono text-[10.5px] bg-white/20 px-2 py-0.5 rounded font-bold">
          {stampAppear ? "VERIFIED ✓" : "1-CLICK"}
        </span>
      </div>
    </div>
  );
}
