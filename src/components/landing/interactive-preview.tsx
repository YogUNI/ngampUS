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
  Briefcase
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
  { id: "tugas", label: "Tugas & Deadline", badge: "Radar Aktif", icon: CheckCircle2 },
  { id: "organisasi", label: "Organisasi & Proker", badge: "Struktur & Tim", icon: Users },
  { id: "portofolio", label: "Rekap & CV", badge: "Auto-Curated", icon: Award },
];

export function InteractivePreview() {
  const [activeTab, setActiveTab] = useState<TabKey>("jadwal");

  return (
    <div className="relative w-full min-w-0 overflow-hidden">

      {/* Main Preview Container */}
      <div className="relative rounded-[2rem] border border-white/20 bg-[#0c281c]/90 backdrop-blur-xl p-3 sm:p-4 text-[#f6f8f1] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
        
        {/* Window Top Bar / Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-3 pb-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#e57255]/80 inline-block ring-1 ring-white/20" />
            <span className="h-3 w-3 rounded-full bg-[#d1ae2c]/80 inline-block ring-1 ring-white/20" />
            <span className="h-3 w-3 rounded-full bg-[#c8ef70]/80 inline-block ring-1 ring-white/20" />
            <span className="ml-2 text-[11px] font-mono font-medium text-white/50 hidden sm:inline">
              ngampus.app/workspace
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-[#c8ef70]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8ef70] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#c8ef70]" />
            </span>
            <span>Live Workspace Preview</span>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="mt-3 grid grid-cols-4 gap-1 p-1 bg-black/30 rounded-xl border border-white/5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-bold transition-all duration-200 overflow-hidden ${
                  isActive 
                    ? "bg-[#c8ef70] text-[#103626] shadow-md shadow-black/20" 
                    : "text-[#c8d8ce] hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={13} className={`shrink-0 ${isActive ? "text-[#103626]" : "text-[#c8ef70]"}`} />
                <span className="truncate text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="mt-3 rounded-2xl bg-[#f6f8f1] p-4 text-[#10261b] shadow-inner min-h-[340px] flex flex-col justify-between transition-all duration-300">
          
          {/* TAB 1: JADWAL KULIAH */}
          {activeTab === "jadwal" && (
            <div className="animate-in fade-in zoom-in-95 duration-200 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#0f6849]/10 p-1.5 text-[#0f6849]">
                      <Calendar size={16} />
                    </span>
                    <div>
                      <h4 className="font-display text-sm font-black tracking-tight text-[#10261b]">
                        Jadwal Kuliah Hari Ini
                      </h4>
                      <p className="text-[11px] text-[#65746a] font-medium">Senin • 2 SKS Tersisa Hari Ini</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#0f6849] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                    Semester 4
                  </span>
                </div>

                {/* Schedule Items */}
                <div className="mt-3 space-y-2.5">
                  {/* Item 1 - Active now */}
                  <div className="rounded-xl border border-[#c8ef70] bg-[#eef7d5]/50 p-3 shadow-sm transition hover:border-[#a0c840]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                            Sedang Berlangsung (08:00 - 09:40)
                          </span>
                        </div>
                        <h5 className="font-display font-black text-sm text-[#10261b] mt-0.5">
                          Algoritma & Struktur Data
                        </h5>
                        <p className="text-[11px] text-[#526357]">R. Lab Komputer 3 • Dr. Ir. Hendra Gunawan</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#103626] px-2.5 py-1 text-[11px] font-bold text-[#c8ef70] shadow-sm">
                          <Video size={12} />
                          <span>Meet</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#dff3e5] px-2 py-1 text-[10.5px] font-bold text-[#0f6849]">
                          <Sparkles size={11} />
                          <span>Tanya AI</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Item 2 - Up next */}
                  <div className="rounded-xl border border-[#dce6dd] bg-white p-3 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#65746a]">
                          10:00 - 11:40 • 3 SKS
                        </span>
                        <h5 className="font-display font-bold text-sm text-[#10261b] mt-0.5">
                          Sistem Basis Data
                        </h5>
                        <p className="text-[11px] text-[#65746a]">Gedung B Lt. 4 • Ruang 402</p>
                      </div>
                      <span className="rounded-md bg-[#eff3ee] px-2 py-1 text-[10px] font-bold text-[#45544a]">
                        Tatap Muka
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Context */}
              <div className="rounded-xl border border-dashed border-[#b8cbbd] bg-[#eff4ef]/60 p-2.5 flex items-center justify-between text-xs">
                <span className="text-[#3b4b41] font-medium flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#0f6849]" /> Terhubung Modul P1-P16 & Tanya AI Assistant
                </span>
                <span className="font-bold text-[#0f6849]">Export .ICS</span>
              </div>
            </div>
          )}

          {/* TAB 2: TUGAS & DEADLINE */}
          {activeTab === "tugas" && (
            <div className="animate-in fade-in zoom-in-95 duration-200 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#e57255]/15 p-1.5 text-[#e57255]">
                      <CheckCircle2 size={16} />
                    </span>
                    <div>
                      <h4 className="font-display text-sm font-black tracking-tight text-[#10261b]">
                        Radar Deadline & Tugas
                      </h4>
                      <p className="text-[11px] text-[#65746a] font-medium">3 Tugas Perlu Perhatian Mendesak</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#fdebe7] border border-[#f5b8a9] px-2.5 py-0.5 text-[10px] font-extrabold text-[#c73b18]">
                    H-1 Pengumpulan
                  </span>
                </div>

                {/* Task Items */}
                <div className="mt-3 space-y-2.5">
                  {/* Task 1 - Urgent */}
                  <div className="rounded-xl border border-[#f5b8a9] bg-white p-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-[#c73b18] px-1.5 py-0.5 text-[9px] font-black text-white">
                            URGENT
                          </span>
                          <span className="text-[11px] font-bold text-[#c73b18] flex items-center gap-1">
                            <Clock size={11} /> Besok 23:59 WIB
                          </span>
                        </div>
                        <h5 className="font-display font-black text-sm text-[#10261b] mt-1">
                          Laporan Praktikum Modul 4
                        </h5>
                        <p className="text-[11px] text-[#65746a]">Matkul: Algoritma & Pemrograman</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-black text-[#10261b]">85%</span>
                        <div className="w-14 h-1.5 bg-[#e5e9e5] rounded-full mt-1 overflow-hidden">
                          <div className="bg-[#e57255] h-full rounded-full" style={{ width: "85%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task 2 - In progress */}
                  <div className="rounded-xl border border-[#dce6dd] bg-white p-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-[#0f6849]/15 px-1.5 py-0.5 text-[9px] font-black text-[#0f6849]">
                            KULIAH
                          </span>
                          <span className="text-[11px] font-semibold text-[#65746a]">
                            Jumat, 18 Okt • 4 hari lagi
                          </span>
                        </div>
                        <h5 className="font-display font-bold text-sm text-[#10261b] mt-1">
                          Makalah Kelompok Etika Profesi
                        </h5>
                        <p className="text-[11px] text-[#65746a]">Bab 1-3 Selesai Review</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-black text-[#10261b]">50%</span>
                        <div className="w-14 h-1.5 bg-[#e5e9e5] rounded-full mt-1 overflow-hidden">
                          <div className="bg-[#0f6849] h-full rounded-full" style={{ width: "50%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Metric */}
              <div className="rounded-xl bg-[#103626] p-2.5 text-white flex items-center justify-between text-xs">
                <span className="text-[#c8d8ce] text-[11px]">
                  Tingkat Penyelesaian Semester Ini:
                </span>
                <span className="font-black text-[#c8ef70]">92% On-Time</span>
              </div>
            </div>
          )}

          {/* TAB 3: ORGANISASI & PROKER */}
          {activeTab === "organisasi" && (
            <div className="animate-in fade-in zoom-in-95 duration-200 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#3d84c6]/15 p-1.5 text-[#3d84c6]">
                      <Users size={16} />
                    </span>
                    <div>
                      <h4 className="font-display text-sm font-black tracking-tight text-[#10261b]">
                        BEM Fakultas Ilmu Komputer
                      </h4>
                      <p className="text-[11px] text-[#65746a] font-medium">Kepala Divisi Kominfo • Periode 2025/2026</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#e8f1fa] border border-[#bcd6f0] px-2.5 py-0.5 text-[10px] font-extrabold text-[#236098]">
                    1 Organisasi Aktif
                  </span>
                </div>

                {/* Proker List */}
                <div className="mt-3 space-y-2.5">
                  <div className="rounded-xl border border-[#dce6dd] bg-white p-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="rounded bg-[#eff5fb] px-1.5 py-0.5 text-[9px] font-bold text-[#236098]">
                          PROKER UTAMA
                        </span>
                        <h5 className="font-display font-black text-sm text-[#10261b] mt-1">
                          Webinar Nasional Cyber Security
                        </h5>
                        <p className="text-[11px] text-[#65746a]">Ketua Pelaksana • Target 500 Peserta</p>
                      </div>
                      <span className="rounded-lg bg-[#dff3e5] px-2.5 py-1 text-[10px] font-black text-[#0f6849]">
                        Fase Eksekusi
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#dce6dd] bg-white p-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="rounded bg-[#f4f7f3] px-1.5 py-0.5 text-[9px] font-bold text-[#55675b]">
                          PROGRAM RUTIN
                        </span>
                        <h5 className="font-display font-bold text-sm text-[#10261b] mt-1">
                          Podcast Bulanan Mahasiswa
                        </h5>
                        <p className="text-[11px] text-[#65746a]">Episode #04 Recording selesai</p>
                      </div>
                      <span className="rounded-lg bg-[#fff0c9] px-2.5 py-1 text-[10px] font-black text-[#855e00]">
                        Editing
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proker Footer */}
              <div className="rounded-xl border border-dashed border-[#b8cbbd] bg-[#eff4ef]/60 p-2.5 flex items-center justify-between text-xs">
                <span className="text-[#3b4b41] font-medium flex items-center gap-1.5">
                  <Layers size={14} className="text-[#3d84c6]" /> Terhubung langsung dengan timeline kuliah
                </span>
                <span className="font-bold text-[#236098]">0 Konflik Jadwal</span>
              </div>
            </div>
          )}

          {/* TAB 4: REKAP & PORTOFOLIO */}
          {activeTab === "portofolio" && (
            <div className="animate-in fade-in zoom-in-95 duration-200 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#7b6cee]/15 p-1.5 text-[#7b6cee]">
                      <Award size={16} />
                    </span>
                    <div>
                      <h4 className="font-display text-sm font-black tracking-tight text-[#10261b]">
                        Rekap Portofolio & CV Otomatis
                      </h4>
                      <p className="text-[11px] text-[#65746a] font-medium">Berdasarkan data proker & proyek nyata</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#f1effd] border border-[#cec7f8] px-2.5 py-0.5 text-[10px] font-extrabold text-[#5946c7]">
                    Ready to Export
                  </span>
                </div>

                {/* Portfolio Snippet */}
                <div className="mt-3 space-y-2.5">
                  <div className="rounded-xl border border-[#dce6dd] bg-white p-3 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="rounded-lg bg-[#103626] p-2 text-[#c8ef70] shrink-0">
                        <Briefcase size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-display font-black text-sm text-[#10261b]">
                            Lead Organizer — Fasilkom Fest 2025
                          </h5>
                          <span className="rounded bg-[#e8eee7] px-1.5 py-0.2 text-[9px] font-bold text-[#55675b]">
                            Kepemimpinan
                          </span>
                        </div>
                        <p className="text-[11px] text-[#55675b] mt-0.5 leading-snug">
                          Memimpin tim lintas 4 divisi dengan anggaran Rp 45jt dan sukses mendatangkan 1.200 peserta.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#dce6dd] bg-white p-3 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="rounded-lg bg-[#0f6849] p-2 text-white shrink-0">
                        <GraduationCap size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-display font-black text-sm text-[#10261b]">
                            Sistem Pengelolaan Sampah Kampus IoT
                          </h5>
                          <span className="rounded bg-[#e8eee7] px-1.5 py-0.2 text-[9px] font-bold text-[#55675b]">
                            Akademik
                          </span>
                        </div>
                        <p className="text-[11px] text-[#55675b] mt-0.5 leading-snug">
                          Proyek Akhir Semester 4 • Nilai A • Terpilih di Pameran Karya Mahasiswa Univ.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="rounded-xl bg-[#7b6cee]/10 border border-[#7b6cee]/30 p-2.5 flex items-center justify-between text-xs">
                <span className="text-[#3c327e] font-semibold flex items-center gap-1.5">
                  <FileText size={14} className="text-[#7b6cee]" /> Siap diekspor ke format ATS Resume & LinkedIn
                </span>
                <span className="font-black text-[#5946c7]">1-Click PDF</span>
              </div>
            </div>
          )}

        </div>

        {/* Small Bottom Status */}
        <div className="mt-3 flex items-center justify-between px-2 text-[11px] text-[#869b8d]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#c8ef70]" />
            Klik tab di atas untuk mencoba preview
          </span>
          <span className="font-mono text-[10px] text-white/40">Encrypted • Zero Tracking</span>
        </div>

      </div>
    </div>
  );
}
