"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  Clock3, 
  Users, 
  Award, 
  CheckCircle2, 
  Circle, 
  Download, 
  ExternalLink, 
  Sparkles,
  ArrowRight,
  GraduationCap,
  Layers,
  ChevronRight,
  Check
} from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";

type DemoTab = "jadwal" | "deadline" | "organisasi" | "cv";

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>("deadline");
  const [taskDone, setTaskDone] = useState<boolean>(false);
  const [activeDay, setActiveDay] = useState<"senin" | "selasa">("senin");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const handleToggleTask = () => {
    const nextState = !taskDone;
    setTaskDone(nextState);
    if (nextState) {
      showToast("✦ Tugas 04 Tuntas! Progres semester naik ke 94% & Skor CV ATS melonjak ke 96.");
    } else {
      showToast("Tugas dikembalikan ke antrean aktif.");
    }
  };

  const handleExportIcs = () => {
    showToast("✓ File jadwal .ICS siap! Jadwal kuliah otomatis tersinkron ke kalender ponsel.");
  };

  const semesterProgress = taskDone ? 94 : 85;
  const atsScore = taskDone ? 96 : 92;
  const completedCount = taskDone ? 9 : 8;

  return (
    <section 
      aria-label="Demo Interaktif Workspace ngampUS"
      className="relative border-b border-white/10 bg-[#0a1f16] py-20 sm:py-28 px-4 sm:px-8 lg:px-12 text-[#F4F1EA] overflow-hidden"
    >
      {/* Background Ambience */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[650px] w-[950px] rounded-full bg-radial from-[#12332a]/50 via-transparent to-transparent blur-3xl opacity-60"
      />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#12332a] px-3.5 py-1.5 text-xs font-mono font-bold text-[#C6F432]">
            <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
            <span>TERMINAL AKADEMIK LIVE</span>
          </div>

          <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Coba langsung alur kerja <span className="text-[#C6F432]">ngampUS</span>.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#F4F1EA]/70 leading-relaxed font-normal">
            Bukan rekaman video. Klik tab modul di bawah, centang tugas yang telah selesai, dan lihat bagaimana progres semester serta skor CV ATS kamu terhitung secara live.
          </p>
        </div>

        {/* ── CONSOLE SHELL CONTAINER (Desktop Reference Style) ── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#0d261e] shadow-2xl shadow-black/40">
          
          {/* Top Console Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-[#12332a]/90 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF4D3D]" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#C6F432]" />
              </div>
              <span className="h-4 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2 font-mono text-xs text-white/80">
                <span className="font-bold text-[#C6F432]">ngampUS CAMPUS CONSOLE</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60 hidden sm:inline">// {DEMO_DATA.student.semester}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-ping" />
              <span className="text-[#C6F432] font-bold text-[11px] uppercase tracking-wider">
                LIVE INTERACTIVE TERMINAL
              </span>
            </div>
          </div>

          {/* Quick Metrics HUD Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/10 bg-[#0a1f16]/60 text-xs font-mono">
            
            {/* Metric 1 */}
            <div className="p-3.5 sm:p-4 border-r border-white/10">
              <span className="text-white/40 block text-[10px] uppercase">PROGRES SEMESTER</span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-black text-white">{semesterProgress}%</span>
                <span className="text-[#C6F432] font-bold text-[11px]">
                  {taskDone ? "+9% Lonjakan" : "85% Standar"}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-[#C6F432] transition-all duration-500 ease-out" 
                  style={{ width: `${semesterProgress}%` }}
                />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-3.5 sm:p-4 border-r border-white/10">
              <span className="text-white/40 block text-[10px] uppercase">DEADLINE MENDESAK</span>
              <div className="mt-1 flex items-center justify-between">
                <span className={`text-lg font-black ${taskDone ? "text-white/70" : "text-[#FF4D3D]"}`}>
                  {taskDone ? "0 Tugas" : "1 Tugas"}
                </span>
                <span className={`font-bold text-[10px] uppercase px-1.5 py-0.5 rounded ${taskDone ? "bg-white/10 text-white/60" : "bg-[#FF4D3D]/15 text-[#FF4D3D]"}`}>
                  {taskDone ? "Aman ✓" : "H-1 Urgen"}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-white/50 truncate font-sans">
                {taskDone ? "Semua tugas tuntas!" : DEMO_DATA.urgentTask.title}
              </p>
            </div>

            {/* Metric 3 */}
            <div className="p-3.5 sm:p-4 border-r border-white/10">
              <span className="text-white/40 block text-[10px] uppercase">TARGET TUNTAS</span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-black text-white">{completedCount}/9</span>
                <span className="text-[#C6F432] font-bold text-[11px]">
                  {taskDone ? "100% Target" : "89% Target"}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-white/50 truncate font-sans">
                {taskDone ? "+1 Portofolio terekam" : "1 tugas tersisa pekan ini"}
              </p>
            </div>

            {/* Metric 4 */}
            <div className="p-3.5 sm:p-4">
              <span className="text-white/40 block text-[10px] uppercase">SKOR CV ATS MAGANG</span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-black text-[#C6F432]">{atsScore}/100</span>
                <span className="text-[10px] uppercase bg-[#C6F432]/10 border border-[#C6F432]/20 text-[#C6F432] font-bold px-1.5 py-0.5 rounded">
                  {taskDone ? "Tier S (Siap)" : "Tier A"}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-white/50 truncate font-sans">
                Format resume Harvard-ready
              </p>
            </div>

          </div>

          {/* Module Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-white/10 bg-[#12332a]/40 p-2.5 sm:p-3 text-xs font-mono">
            <button
              onClick={() => setActiveTab("deadline")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "deadline"
                  ? "bg-[#C6F432] text-[#0a1f16] shadow-sm"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Clock3 size={14} />
              <span>[01 // Radar Deadline]</span>
              {!taskDone && (
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[#FF4D3D] text-white text-[9px]">
                  1
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("jadwal")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "jadwal"
                  ? "bg-[#C6F432] text-[#0a1f16] shadow-sm"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Calendar size={14} />
              <span>[02 // Jadwal Kuliah]</span>
            </button>

            <button
              onClick={() => setActiveTab("organisasi")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "organisasi"
                  ? "bg-[#C6F432] text-[#0a1f16] shadow-sm"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Users size={14} />
              <span>[03 // Organisasi & Proker]</span>
            </button>

            <button
              onClick={() => setActiveTab("cv")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "cv"
                  ? "bg-[#C6F432] text-[#0a1f16] shadow-sm"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Award size={14} />
              <span>[04 // CV ATS Magang]</span>
              <span className="rounded-full bg-[#C6F432]/20 text-[#C6F432] px-1.5 py-0.2 text-[9px]">
                {atsScore}
              </span>
            </button>
          </div>

          {/* Interactive Screen Body */}
          <div className="p-4 sm:p-8 min-h-[380px] flex flex-col justify-between">
            
            {/* ── TAB 1: RADAR DEADLINE INTERACTIVE CHECK ── */}
            {activeTab === "deadline" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                      Radar Deadline & Tugas Kuliah
                    </h3>
                    <p className="text-xs text-[#F4F1EA]/70 mt-1">
                      Klik kotak centang pada tugas di bawah untuk mensimulasikan tugas yang telah kamu selesaikan.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-white/50">Urutan Prioritas:</span>
                    <span className="text-[#FF4D3D] font-bold">Waktu Tenggat Terdekat</span>
                  </div>
                </div>

                {/* The Interactive Urgent Task Card */}
                <div 
                  onClick={handleToggleTask}
                  className={`group cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
                    taskDone 
                      ? "border-[#C6F432]/40 bg-[#122c22]" 
                      : "border-[#FF4D3D] bg-[#231414] hover:border-white/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox */}
                      <button
                        type="button"
                        aria-label="Tandai tugas selesai"
                        className={`mt-0.5 grid h-6 w-6 place-items-center rounded-lg border-2 transition-all shrink-0 ${
                          taskDone 
                            ? "border-[#C6F432] bg-[#C6F432] text-[#0a1f16]" 
                            : "border-white/40 bg-transparent text-transparent hover:border-white"
                        }`}
                      >
                        <Check size={14} className={taskDone ? "opacity-100 stroke-[3]" : "opacity-0"} />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider ${
                            taskDone 
                              ? "bg-[#C6F432]/10 text-[#C6F432]" 
                              : "bg-[#FF4D3D] text-white animate-pulse"
                          }`}>
                            {taskDone ? "SELESAI ✓" : "DEADLINE BESOK • H-1"}
                          </span>
                          <span className="font-mono text-xs text-white/50">
                            {DEMO_DATA.urgentTask.course}
                          </span>
                        </div>

                        <h4 className={`font-display mt-1 text-base sm:text-lg font-bold transition-all ${
                          taskDone ? "text-white/50 line-through" : "text-white"
                        }`}>
                          {DEMO_DATA.urgentTask.title}
                        </h4>

                        <p className="mt-1 text-xs text-white/60">
                          Implementasi autentikasi JSON Web Token (JWT) dengan refresh token rotation dan middleware otorisasi role-based.
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span className="text-xs text-white/80 block">23:59 WIB</span>
                      <span className={`text-[10px] font-bold ${taskDone ? "text-[#C6F432]" : "text-[#FF4D3D]"}`}>
                        {taskDone ? "Tercatat di CV" : "Sisa 14 Jam"}
                      </span>
                    </div>
                  </div>

                  {/* Dopamine Feedback Banner inside Card */}
                  {taskDone && (
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-[#C6F432]/10 border border-[#C6F432]/20 px-3.5 py-2 text-xs font-bold text-[#C6F432] animate-in fade-in duration-200">
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={14} />
                        Pencapaian berhasil dicatat ke dalam draf CV ATS!
                      </span>
                      <span className="font-mono text-[11px]">+1 Poin Pengalaman</span>
                    </div>
                  )}
                </div>

                {/* Additional Done Task for Context */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 opacity-60">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="grid h-5 w-5 place-items-center rounded-md bg-[#C6F432] text-[#0a1f16]">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <span className="line-through text-white/80 font-medium">
                        Kuis 03: Normalisasi Basis Data (1NF ke 3NF)
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-white/40">Selesai 02 Nov</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: JADWAL KULIAH ── */}
            {activeTab === "jadwal" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                      Jadwal Kuliah & Tatap Muka
                    </h3>
                    <p className="text-xs text-[#F4F1EA]/70 mt-1">
                      Terhubung dengan link ruang kuliah virtual dan ruang praktikum lab.
                    </p>
                  </div>

                  {/* Day Pills & Export */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveDay("senin")}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                        activeDay === "senin" ? "bg-[#C6F432] text-[#0a1f16]" : "bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      Senin (2 Matkul)
                    </button>
                    <button
                      onClick={() => setActiveDay("selasa")}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                        activeDay === "selasa" ? "bg-[#C6F432] text-[#0a1f16]" : "bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      Selasa (1 Matkul)
                    </button>
                    <button
                      onClick={handleExportIcs}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 font-mono text-xs font-bold text-white hover:bg-white/10 transition"
                    >
                      <Download size={13} className="text-[#C6F432]" />
                      <span>Ekspor .ICS</span>
                    </button>
                  </div>
                </div>

                {/* Course List */}
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {activeDay === "senin" ? (
                    <>
                      {/* Matkul 1 */}
                      <div className="rounded-2xl border border-white/10 bg-[#12332a] p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-[#C6F432] font-bold">{DEMO_DATA.courses[0].code} • {DEMO_DATA.courses[0].sks} SKS</span>
                            <span className="rounded bg-[#C6F432]/10 text-[#C6F432] px-2 py-0.5 text-[9px] uppercase font-bold">
                              HARI INI
                            </span>
                          </div>
                          <h4 className="font-display mt-2 text-base font-bold text-white">
                            {DEMO_DATA.courses[0].name}
                          </h4>
                          <p className="mt-1 text-xs text-white/60">
                            {DEMO_DATA.courses[0].time} • {DEMO_DATA.courses[0].room}
                          </p>
                          <p className="text-xs text-white/50 mt-0.5 font-medium">
                            Dosen: {DEMO_DATA.courses[0].lecturer}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[11px] text-white/50 font-mono">Ruang Lab Virtual</span>
                          <span className="rounded-xl bg-[#C6F432] px-3 py-1 text-xs font-bold text-[#0a1f16] shadow-xs hover:brightness-110 cursor-pointer">
                            Buka Meet ↗
                          </span>
                        </div>
                      </div>

                      {/* Matkul 2 */}
                      <div className="rounded-2xl border border-white/10 bg-[#0d261e] p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-white/60 font-bold">{DEMO_DATA.courses[1].code} • {DEMO_DATA.courses[1].sks} SKS</span>
                            <span className="rounded bg-white/5 text-white/50 px-2 py-0.5 text-[9px] uppercase font-bold">
                              TATAP MUKA
                            </span>
                          </div>
                          <h4 className="font-display mt-2 text-base font-bold text-white">
                            {DEMO_DATA.courses[1].name}
                          </h4>
                          <p className="mt-1 text-xs text-white/60">
                            {DEMO_DATA.courses[1].time} • {DEMO_DATA.courses[1].room}
                          </p>
                          <p className="text-xs text-white/50 mt-0.5 font-medium">
                            Dosen: {DEMO_DATA.courses[1].lecturer}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[11px] text-white/50 font-mono">Modul Bahan Ajar</span>
                          <span className="rounded-xl border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-white hover:bg-white/10 cursor-pointer">
                            Lihat Modul
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-[#12332a] p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[#C6F432] font-mono text-xs font-bold">SELASA • 09:30 - 12:00 WIB</span>
                        <h4 className="font-display mt-1 text-base font-bold text-white">Metodologi Penelitian TI (3 SKS)</h4>
                        <p className="text-xs text-white/60">Gedung B, Ruang 304 • Tatap Muka</p>
                      </div>
                      <span className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white">
                        Slide Pertemuan ↗
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 3: ORGANISASI & PROKER ── */}
            {activeTab === "organisasi" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                      Manajemen Organisasi & Program Kerja
                    </h3>
                    <p className="text-xs text-[#F4F1EA]/70 mt-1">
                      Kepanitiaan terstruktur yang tidak mengorbankan indeks prestasi kumulatif (IPK).
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#C6F432] bg-[#C6F432]/10 border border-[#C6F432]/20 px-2.5 py-1 rounded-full">
                    {DEMO_DATA.proker.org} • {DEMO_DATA.proker.role}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#12332a] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold uppercase text-[#C6F432]">PROGRAM KERJA UTAMA</span>
                      <h4 className="font-display text-lg font-bold text-white mt-0.5">
                        {DEMO_DATA.proker.name}
                      </h4>
                    </div>
                    <span className="font-mono text-lg font-black text-[#C6F432]">{DEMO_DATA.proker.progress}%</span>
                  </div>

                  <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-[#C6F432]" style={{ width: `${DEMO_DATA.proker.progress}%` }} />
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                      <span className="text-white/40 block text-[10px]">TAHAP 1</span>
                      <span className="text-white font-bold block mt-0.5">Open Recruitment</span>
                      <span className="text-[#C6F432] text-[10px]">Tuntas ✓</span>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                      <span className="text-white/40 block text-[10px]">TAHAP 2</span>
                      <span className="text-white font-bold block mt-0.5">Seleksi & Wawancara</span>
                      <span className="text-[#C6F432] text-[10px]">Sedang Berjalan</span>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                      <span className="text-white/40 block text-[10px]">TAHAP 3</span>
                      <span className="text-white font-bold block mt-0.5">Pengumuman Panitia</span>
                      <span className="text-white/40 text-[10px]">Tenggat 30 Nov</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: CV ATS MAGANG ── */}
            {activeTab === "cv" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                      Curriculum Vitae & Rekap Portofolio ATS
                    </h3>
                    <p className="text-xs text-[#F4F1EA]/70 mt-1">
                      Format formal standar rekrutmen perusahaan dan program magang nasional.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#C6F432] text-[#0a1f16] font-mono text-xs font-black px-3 py-1">
                      Skor ATS: {atsScore}/100
                    </span>
                  </div>
                </div>

                {/* Live Sheet View */}
                <div className="rounded-2xl border border-white/15 bg-[#F4F1EA] p-5 text-[#0b140f] text-xs font-sans shadow-md">
                  <div className="border-b border-black/15 pb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-black text-base text-[#0b140f]">{DEMO_DATA.student.name}</h4>
                      <p className="text-[11px] font-mono text-black/70">{DEMO_DATA.student.major} • {DEMO_DATA.student.university}</p>
                    </div>
                    <span className="font-mono text-[10px] font-bold bg-[#12332a] text-[#C6F432] px-2 py-0.5 rounded">
                      VERIFIKASI NGAMPUS
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-black/60 block">
                      POIN RESUME TERKURASI OTOMATIS:
                    </span>
                    <div className="rounded-lg bg-black/5 p-2.5 font-mono text-[11px] leading-relaxed">
                      • <strong>{DEMO_DATA.cvBullets[0].title} ({DEMO_DATA.cvBullets[0].period}):</strong> {DEMO_DATA.cvBullets[0].bullet}
                    </div>
                    
                    {/* The task item that changes dynamically */}
                    <div className={`rounded-lg p-2.5 font-mono text-[11px] leading-relaxed transition-all duration-300 ${
                      taskDone ? "bg-[#12332a] text-[#F4F1EA] border border-[#C6F432]" : "bg-black/5 text-[#0b140f]"
                    }`}>
                      • <strong>{DEMO_DATA.cvBullets[1].title} ({DEMO_DATA.cvBullets[1].period}):</strong> {DEMO_DATA.cvBullets[1].bullet}
                      {taskDone && (
                        <span className="block mt-1 text-[#C6F432] text-[10px] font-bold">
                          ✦ BARU DITAMBAHKAN DARI TUGAS 04 YANG TELAH TUNTAS (+4 SKOR ATS)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Floating Interactive Notification Toast */}
            {toastMessage && (
              <div className="mt-4 rounded-xl border border-[#C6F432]/40 bg-[#12332a] px-4 py-2.5 text-xs font-mono font-bold text-[#C6F432] shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-200">
                <span>{toastMessage}</span>
                <span className="text-white/40 text-[10px]">Real-time State</span>
              </div>
            )}

          </div>

          {/* Console Bottom Action Bar */}
          <div className="border-t border-white/10 bg-[#12332a]/80 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/60">
            <span>Terminal Interaktif — Seluruh data disimulasikan sesuai demoData.ts</span>
            <span className="text-[#C6F432] font-bold">
              Klik modul di atas untuk melihat sinkronisasi antar fitur
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}

