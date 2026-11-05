"use client";

import { useState } from "react";
import { 
  Calendar, 
  CheckCircle2, 
  Users, 
  Award, 
  Clock, 
  Video, 
  Sparkles, 
  Layers, 
  GraduationCap, 
  FileText,
  Briefcase,
  Check,
  Circle,
  ExternalLink,
  ChevronRight
} from "lucide-react";

type TabKey = "jadwal" | "tugas" | "organisasi" | "portofolio";

interface TabItem {
  id: TabKey;
  label: string;
  badge: string;
  icon: typeof Calendar;
}

const TABS: TabItem[] = [
  { id: "jadwal", label: "Jadwal Kuliah", badge: "Smart Matkul", icon: Calendar },
  { id: "tugas", label: "Radar Tugas", badge: "Deadline", icon: CheckCircle2 },
  { id: "organisasi", label: "Organisasi", badge: "Proker", icon: Users },
  { id: "portofolio", label: "CV Portofolio", badge: "Auto-Curated", icon: Award },
];

export function InteractivePreview() {
  const [activeTab, setActiveTab] = useState<TabKey>("jadwal");
  const [taskCompleted, setTaskCompleted] = useState<boolean>(false);
  const [interactiveToast, setInteractiveToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setInteractiveToast(msg);
    setTimeout(() => {
      setInteractiveToast((curr) => (curr === msg ? null : curr));
    }, 2400);
  };

  return (
    <div className="relative w-full min-w-0">
      {/* Main Preview Container — Refined Editorial Frame */}
      <div className="relative rounded-3xl border border-[#dce5dd] bg-white p-3.5 sm:p-5 text-[#10261b] shadow-xl shadow-[#10261b]/[0.05] ring-1 ring-black/[0.02]">
        
        {/* Frame Top Bar — Real Campus Editorial Context (No Fake macOS Traffic Lights) */}
        <div className="flex items-center justify-between border-b border-[#edf2ee] px-2 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#55675b]">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#dff3e5] text-[#0f6849]">
              <GraduationCap size={14} />
            </span>
            <span className="font-bold text-[#10261b]">Workspace Mahasiswa</span>
            <span className="text-[#a4b5a8]">•</span>
            <span className="font-medium text-[#708075] hidden sm:inline">Semester 4 (Genap)</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-[#dff3e5] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0f6849]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0f6849] animate-pulse" />
            <span>Interactive Demo</span>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 p-1 bg-[#f4f7f4] rounded-2xl border border-[#e2eae3]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-bold transition-all duration-150 overflow-hidden cursor-pointer ${
                  isActive 
                    ? "bg-[#0f6849] text-white shadow-xs" 
                    : "text-[#55675b] hover:bg-white/70 hover:text-[#10261b]"
                }`}
              >
                <Icon size={13} className={`shrink-0 ${isActive ? "text-white" : "text-[#708075]"}`} />
                <span className="truncate text-[10.5px]">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="mt-3.5 rounded-2xl bg-[#fafbfa] border border-[#edf2ee] p-4 text-[#10261b] min-h-[350px] flex flex-col justify-between transition-all duration-200 relative overflow-hidden">
          
          {/* Toast Feedback for Interactive Demo */}
          {interactiveToast && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 rounded-full bg-[#10261b] text-white px-3.5 py-1.5 text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <Sparkles size={13} className="text-[#c8ef70]" />
              <span>{interactiveToast}</span>
            </div>
          )}

          {/* TAB 1: JADWAL KULIAH */}
          {activeTab === "jadwal" && (
            <div className="animate-in fade-in duration-200 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-[#dff3e5] p-1.5 text-[#0f6849]">
                      <Calendar size={16} />
                    </span>
                    <div>
                      <h4 className="font-display text-sm font-bold tracking-tight text-[#10261b]">
                        Jadwal Hari Senin
                      </h4>
                      <p className="text-[11px] text-[#708075]">2 Mata Kuliah • 5 SKS Aktif</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#10261b] px-2.5 py-0.5 text-[10px] font-bold text-white">
                    Hari Ini (Aktif)
                  </span>
                </div>

                {/* Schedule Items */}
                <div className="mt-3.5 space-y-2.5">
                  {/* Item 1 - Ongoing */}
                  <div className="rounded-2xl border border-[#c3ddcb] bg-white p-3.5 shadow-xs transition hover:border-[#0f6849]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#0f6849] animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f6849]">
                            Sedang Berlangsung (08:00 - 09:40 WIB)
                          </span>
                        </div>
                        <h5 className="font-display font-bold text-sm text-[#10261b] mt-1">
                          Algoritma & Struktur Data (3 SKS)
                        </h5>
                        <p className="text-[11px] text-[#708075]">Lab Komputer 3 • Dr. Ir. Hendra Gunawan</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => triggerToast("Simulasi Google Meet: Terbuka di tab baru")}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#0f6849] hover:bg-[#0b4d36] px-2.5 py-1 text-[11px] font-bold text-white shadow-xs cursor-pointer active:scale-95 transition"
                        >
                          <Video size={12} />
                          <span>Buka Meet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerToast("Materi Pertemuan 4: Binary Trees & Heaps")}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#f4f7f4] hover:bg-[#eaf0eb] border border-[#dce5dd] px-2 py-1 text-[10.5px] font-semibold text-[#33463a] cursor-pointer active:scale-95 transition"
                        >
                          <Sparkles size={11} className="text-[#0f6849]" />
                          <span>Modul P4</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Item 2 - Up next */}
                  <div className="rounded-2xl border border-[#edf2ee] bg-white p-3.5 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-[#708075]">
                          10:00 - 11:40 WIB • 2 SKS
                        </span>
                        <h5 className="font-display font-bold text-sm text-[#10261b] mt-0.5">
                          Sistem Basis Data
                        </h5>
                        <p className="text-[11px] text-[#708075]">Gedung B Lt. 4 • Ruang 402 • Tatap Muka</p>
                      </div>
                      <span className="rounded-lg bg-[#f4f7f4] border border-[#dce5dd] px-2 py-1 text-[10px] font-bold text-[#55675b]">
                        Kelas Berikutnya
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Context */}
              <div className="rounded-xl border border-dashed border-[#c3ddcb] bg-[#dff3e5]/40 p-2.5 flex items-center justify-between text-xs">
                <span className="text-[#10261b] font-medium flex items-center gap-1.5 text-[11px]">
                  <Sparkles size={13} className="text-[#0f6849]" /> Terhubung Modul P1–P16 & Ringkasan AI
                </span>
                <button
                  type="button"
                  onClick={() => triggerToast("File .ICS jadwal kuliah berhasil disiapkan!")}
                  className="font-bold text-[#0f6849] hover:underline text-[11px] cursor-pointer"
                >
                  Ekspor .ICS
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TUGAS & DEADLINE */}
          {activeTab === "tugas" && (
            <div className="animate-in fade-in duration-200 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-amber-100 p-1.5 text-amber-800">
                      <CheckCircle2 size={16} />
                    </span>
                    <div>
                      <h4 className="font-display text-sm font-bold tracking-tight text-[#10261b]">
                        Radar Deadline Tugas
                      </h4>
                      <p className="text-[11px] text-[#708075]">Urutan otomatis dari yang paling mendesak</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                    H-1 Pengumpulan
                  </span>
                </div>

                {/* Task Items */}
                <div className="mt-3.5 space-y-2.5">
                  {/* Task 1 - Interactive clickable demo */}
                  <div 
                    onClick={() => {
                      const next = !taskCompleted;
                      setTaskCompleted(next);
                      triggerToast(next ? "✓ Tugas selesai! +1 Poin portofolio terekam" : "Status tugas dikembalikan ke aktif");
                    }}
                    className={`rounded-2xl border p-3.5 transition-all cursor-pointer select-none ${
                      taskCompleted 
                        ? "border-[#c3ddcb] bg-[#dff3e5]/30 opacity-85"
                        : "border-rose-200 bg-white hover:border-rose-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button 
                        type="button"
                        aria-label="Toggle task"
                        className="mt-0.5 text-[#0f6849] shrink-0"
                      >
                        {taskCompleted ? (
                          <CheckCircle2 size={18} className="fill-[#0f6849] text-white animate-in zoom-in-75 duration-150" />
                        ) : (
                          <Circle size={18} className="text-[#708075]" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${taskCompleted ? "bg-[#dff3e5] text-[#0f6849]" : "bg-rose-100 text-rose-800"}`}>
                            {taskCompleted ? "SELESAI" : "DEADLINE BESOK"}
                          </span>
                          <span className="text-[10.5px] text-[#708075] flex items-center gap-1">
                            <Clock size={11} /> 23:59 WIB
                          </span>
                        </div>
                        <h5 className={`font-display font-bold text-sm mt-0.5 ${taskCompleted ? "line-through text-[#708075]" : "text-[#10261b]"}`}>
                          Laporan Praktikum Modul 4 (Struktur Data)
                        </h5>
                        <p className="text-[11px] text-[#708075]">
                          {taskCompleted ? "✓ Berhasil diserahkan ke sistem" : "Klik kartu untuk simulasi ceklis selesai"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Task 2 */}
                  <div className="rounded-2xl border border-[#edf2ee] bg-white p-3.5 shadow-xs">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-[#708075] shrink-0">
                        <Circle size={18} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-[#dff3e5] px-1.5 py-0.2 text-[9px] font-bold text-[#0f6849]">
                            KULIAH
                          </span>
                          <span className="text-[10.5px] text-[#708075]">
                            Jumat, 18 Okt • 4 hari lagi
                          </span>
                        </div>
                        <h5 className="font-display font-bold text-sm text-[#10261b] mt-0.5">
                          Makalah Kelompok Etika Profesi
                        </h5>
                        <p className="text-[11px] text-[#708075]">Bab 1–3 selesai review kelompok</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Metric */}
              <div className="rounded-xl bg-[#10261b] p-2.5 text-white flex items-center justify-between text-xs">
                <span className="text-[#cad7ce] text-[11px]">
                  Status Penyelesaian Tugas Semester:
                </span>
                <span className="font-bold text-[#c8ef70] font-mono">
                  {taskCompleted ? "94% Selesai" : "88% On-Time"}
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: ORGANISASI & PROKER */}
          {activeTab === "organisasi" && (
            <div className="animate-in fade-in duration-200 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-[#e5f1fa] p-1.5 text-[#2978ba]">
                      <Users size={16} />
                    </span>
                    <div>
                      <h4 className="font-display text-sm font-bold tracking-tight text-[#10261b]">
                        BEM Fakultas Ilmu Komputer
                      </h4>
                      <p className="text-[11px] text-[#708075]">Kepala Divisi Kominfo • 2024/2025</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#f4f7f4] border border-[#dce5dd] px-2.5 py-0.5 text-[10px] font-bold text-[#33463a]">
                    1 Organisasi Aktif
                  </span>
                </div>

                {/* Proker List */}
                <div className="mt-3.5 space-y-2.5">
                  <div 
                    onClick={() => triggerToast("Proker Webinar Nasional: Progress 75% tercapai")}
                    className="rounded-2xl border border-[#edf2ee] bg-white p-3.5 shadow-xs cursor-pointer hover:border-[#b4d2bd] transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="rounded bg-[#e5f1fa] px-1.5 py-0.2 text-[9px] font-bold text-[#236098]">
                          PROKER UTAMA
                        </span>
                        <h5 className="font-display font-bold text-sm text-[#10261b] mt-1">
                          Webinar Nasional Cyber Security
                        </h5>
                        <p className="text-[11px] text-[#708075]">Ketua Pelaksana • Target 500 Peserta</p>
                      </div>
                      <span className="rounded-lg bg-[#dff3e5] px-2.5 py-1 text-[10px] font-bold text-[#0f6849]">
                        Eksekusi
                      </span>
                    </div>
                  </div>

                  <div 
                    onClick={() => triggerToast("Podcast Mahasiswa: Rekaman Episode 4 selesai")}
                    className="rounded-2xl border border-[#edf2ee] bg-white p-3.5 shadow-xs cursor-pointer hover:border-[#b4d2bd] transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="rounded bg-[#f4f7f4] px-1.5 py-0.2 text-[9px] font-bold text-[#55675b]">
                          PROGRAM RUTIN
                        </span>
                        <h5 className="font-display font-bold text-sm text-[#10261b] mt-1">
                          Podcast Bulanan Mahasiswa
                        </h5>
                        <p className="text-[11px] text-[#708075]">Episode #04 Recording selesai</p>
                      </div>
                      <span className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                        Editing
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proker Footer */}
              <div className="rounded-xl border border-dashed border-[#c3ddcb] bg-[#dff3e5]/40 p-2.5 flex items-center justify-between text-xs">
                <span className="text-[#10261b] font-medium flex items-center gap-1.5 text-[11px]">
                  <Layers size={13} className="text-[#0f6849]" /> Sinkron langsung dengan kalender kuliah
                </span>
                <span className="font-bold text-[#0f6849] text-[11px]">0 Bentrok Jadwal</span>
              </div>
            </div>
          )}

          {/* TAB 4: REKAP & PORTOFOLIO */}
          {activeTab === "portofolio" && (
            <div className="animate-in fade-in duration-200 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-[#f1effd] p-1.5 text-[#644fe2]">
                      <Award size={16} />
                    </span>
                    <div>
                      <h4 className="font-display text-sm font-bold tracking-tight text-[#10261b]">
                        Rekap Portofolio & CV ATS
                      </h4>
                      <p className="text-[11px] text-[#708075]">Otomatis terkurasi dari pencapaian nyata</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#f1effd] border border-[#d6d0fa] px-2.5 py-0.5 text-[10px] font-bold text-[#5946c7]">
                    Siap Ekspor
                  </span>
                </div>

                {/* Portfolio Snippet */}
                <div className="mt-3.5 space-y-2.5">
                  <div className="rounded-2xl border border-[#edf2ee] bg-white p-3.5 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="rounded-xl bg-[#10261b] p-2 text-white shrink-0">
                        <Briefcase size={15} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-display font-bold text-sm text-[#10261b]">
                            Lead Organizer — Fasilkom Fest 2025
                          </h5>
                          <span className="rounded bg-[#f4f7f4] px-1.5 py-0.2 text-[9px] font-bold text-[#55675b]">
                            Organisasi
                          </span>
                        </div>
                        <p className="text-[11px] text-[#708075] mt-0.5 leading-snug">
                          Memimpin tim lintas 4 divisi dan sukses mendatangkan 1.200 peserta seminar.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#edf2ee] bg-white p-3.5 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="rounded-xl bg-[#0f6849] p-2 text-white shrink-0">
                        <GraduationCap size={15} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-display font-bold text-sm text-[#10261b]">
                            Web App Rekap Kuliah Berbasis AI
                          </h5>
                          <span className="rounded bg-[#f4f7f4] px-1.5 py-0.2 text-[9px] font-bold text-[#55675b]">
                            Proyek Akademik
                          </span>
                        </div>
                        <p className="text-[11px] text-[#708075] mt-0.5 leading-snug">
                          Tugas Akhir Semester 4 • Nilai A (4.00) • Terpilih di Pameran Karya Mahasiswa.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="rounded-xl bg-[#f1effd] border border-[#d6d0fa] p-2.5 flex items-center justify-between text-xs">
                <span className="text-[#3c327e] font-medium flex items-center gap-1.5 text-[11px]">
                  <FileText size={13} className="text-[#644fe2]" /> Format standar ATS-friendly untuk magang
                </span>
                <button
                  type="button"
                  onClick={() => triggerToast("CV ATS 1 Halaman Siap Dicetak (Skor ATS: 96%)")}
                  className="font-bold text-[#5946c7] hover:underline text-[11px] cursor-pointer"
                >
                  Cetak PDF
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Small Bottom Status */}
        <div className="mt-3 flex items-center justify-between px-2 text-[11px] text-[#708075]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0f6849]" />
            Klik tab & tombol untuk menguji fitur langsung
          </span>
          <span className="font-mono text-[10px] text-[#8ca393]">Data Terisolasi RLS • Tanpa Iklan</span>
        </div>

      </div>
    </div>
  );
}
