"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  Clock3, 
  Sparkles, 
  Users, 
  Award, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  ChevronRight,
  Bot,
  FileCheck2,
  Copy
} from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";

export function BentoFeatures() {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <section 
      id="features"
      aria-label="Fitur Utama Ekosistem ngampUS"
      className="relative border-b border-white/10 bg-[#0d261e] py-20 sm:py-28 px-4 sm:px-8 lg:px-12 text-[#F4F1EA] scroll-mt-20 overflow-hidden"
    >
      {/* Background Ambience */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-0 h-[600px] w-[600px] rounded-full bg-radial from-[#12332a]/60 via-transparent to-transparent blur-3xl opacity-50"
      />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#12332a] px-3.5 py-1.5 text-xs font-mono font-bold text-[#C6F432]">
            <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
            <span>LIMA PILAR EKOSISTEM MAHASISWA</span>
          </div>

          <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Satu ruang kerja untuk seluruh ritme kuliah dan organisasi.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#F4F1EA]/70 leading-relaxed font-normal">
            Bukan sekadar catatan biasa. ngampUS dirancang khusus untuk realitas mahasiswa: jadwal kelas lab, tugas deadline mepet, proker organisasi, hingga resume magang.
          </p>
        </div>

        {/* ── BENTO GRID CONTAINER (5 Asymmetric Cards) ── */}
        <div className="grid gap-6 md:grid-cols-3 items-stretch">

          {/* ── CARD 1: JADWAL KULIAH & EXPORT .ICS (Wide 2 Cols) ── */}
          <div className="md:col-span-2 group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#12332a] p-6 sm:p-8 shadow-xl transition-all duration-300 hover:border-[#C6F432]/40">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/20">
                  <Calendar size={20} />
                </span>
                <span className="font-mono text-xs font-bold text-white/50 uppercase tracking-wider">
                  01 // JADWAL CERDAS
                </span>
              </div>

              <div className="mt-6 max-w-xl">
                <h3 className="font-display text-2xl font-black text-white tracking-tight">
                  Jadwal Kuliah Terhubung & Sinkronisasi .ICS Otomatis
                </h3>
                <p className="mt-2 text-sm text-[#F4F1EA]/70 leading-relaxed font-normal">
                  Tautkan Google Meet, Zoom, dan ruang lab langsung ke matkul. Sinkronkan seluruh jadwal kuliah ke kalender smartphone kamu hanya dengan satu klik.
                </p>
              </div>
            </div>

            {/* Visual Schedule Mockup Snippet */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-[#0a1f16] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-white text-sm">HARI SENIN</span>
                  <span className="rounded-full bg-[#C6F432] px-2 py-0.5 text-[9px] font-black text-[#0a1f16]">
                    HARI INI
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-[#C6F432]">
                  <span>{DEMO_DATA.totalCoursesToday} Mata Kuliah</span>
                  <span>•</span>
                  <span>{DEMO_DATA.totalSksToday} SKS</span>
                </div>
              </div>

              {/* Matkul 1 */}
              <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#12332a] p-3.5">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#C6F432]">
                    <span>{DEMO_DATA.courses[0].code} • {DEMO_DATA.courses[0].sks} SKS</span>
                    <span className="rounded bg-[#C6F432]/10 px-1.5 py-0.5 uppercase">TERJADWAL</span>
                  </div>
                  <h4 className="font-display mt-0.5 text-sm font-bold text-white">
                    {DEMO_DATA.courses[0].name}
                  </h4>
                  <p className="text-xs text-white/60">
                    {DEMO_DATA.courses[0].time} • {DEMO_DATA.courses[0].room} • {DEMO_DATA.courses[0].lecturer}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-xl bg-[#C6F432] px-3 py-1.5 text-xs font-bold text-[#0a1f16] shadow-xs hover:brightness-110 cursor-pointer">
                    Buka Meet ↗
                  </span>
                </div>
              </div>

              {/* Export Button Action Bar */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                <span className="font-mono text-white/50 text-[11px]">
                  Format kompatibel: Google Calendar, Apple Calendar, Outlook
                </span>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-white/10 transition"
                >
                  <Download size={13} className="text-[#C6F432]" />
                  <span>{downloadSuccess ? "Tersimpan! ✓" : "Ekspor Jadwal .ICS"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── CARD 2: RADAR DEADLINE URGENSI (1 Col) ── */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#FF4D3D]/40 bg-[#1a1212] p-6 sm:p-8 shadow-xl transition-all duration-300 hover:border-[#FF4D3D]">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#FF4D3D]/15 text-[#FF4D3D] border border-[#FF4D3D]/30">
                  <Clock3 size={20} />
                </span>
                <span className="font-mono text-xs font-bold text-[#FF4D3D] uppercase tracking-wider">
                  02 // RADAR DEADLINE
                </span>
              </div>

              <div className="mt-6">
                <h3 className="font-display text-xl font-black text-white tracking-tight">
                  Radar Deadline H-1 & H-2
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#F4F1EA]/70 leading-relaxed font-normal">
                  Tugas diurutkan otomatis dari yang paling mendesak. Sinyal merah pekat mencegah telat submit di portal kampus.
                </p>
              </div>
            </div>

            {/* Visual Urgency Countdown Box */}
            <div className="mt-6 rounded-2xl border border-[#FF4D3D]/40 bg-[#251515] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#FF4D3D] px-2 py-0.5 font-mono text-[9px] font-black uppercase text-white tracking-wider animate-pulse">
                  DEADLINE BESOK • H-1
                </span>
                <span className="font-mono text-xs font-bold text-white/80">23:59 WIB</span>
              </div>

              <div>
                <h4 className="font-display text-sm font-bold text-white">
                  {DEMO_DATA.urgentTask.title}
                </h4>
                <p className="text-xs text-white/60">
                  {DEMO_DATA.urgentTask.course}
                </p>
              </div>

              {/* Progress Bar Sisa Waktu */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-white/60 mb-1">
                  <span>Waktu Tersisa</span>
                  <span className="text-[#FF4D3D] font-bold">14 Jam Lagi</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[#FF4D3D]" style={{ width: "85%" }} />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50">
                <span>Portal Akademik Kampus</span>
                <span className="text-[#C6F432]">Prioritas Utama</span>
              </div>
            </div>
          </div>

          {/* ── CARD 3: MODUL P1–P16 & TANYA AI (Wide 2 Cols) ── */}
          <div className="md:col-span-2 group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#12332a] p-6 sm:p-8 shadow-xl transition-all duration-300 hover:border-[#C6F432]/40">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/20">
                  <Sparkles size={20} />
                </span>
                <span className="font-mono text-xs font-bold text-white/50 uppercase tracking-wider">
                  03 // ARSIP MODUL & AI
                </span>
              </div>

              <div className="mt-6 max-w-xl">
                <h3 className="font-display text-2xl font-black text-white tracking-tight">
                  Arsip Modul P1–P16 & Asisten Belajar AI
                </h3>
                <p className="mt-2 text-sm text-[#F4F1EA]/70 leading-relaxed font-normal">
                  Kumpulkan slide kuliah, catatan penting, dan bahan praktikum per bab pertemuan. Bingung konsep rumit sebelum ujian? Tanya AI langsung merangkum tanpa bertele-tele.
                </p>
              </div>
            </div>

            {/* Visual AI Dialogue Snippet */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-[#0a1f16] p-4 sm:p-5 space-y-3">
              {/* Meeting Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-white/50">P1</span>
                <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-white/50">P2</span>
                <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-white/50">P3</span>
                <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-white/50">P4</span>
                <span className="rounded-lg bg-[#C6F432] text-[#0a1f16] font-bold px-2 py-0.5">P5 (Aktif)</span>
                <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-white/50">P6</span>
                <span className="text-white/30 text-xs">... P16</span>
              </div>

              {/* Chat Interaction */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                {/* Student Bubble */}
                <div className="rounded-xl border border-white/10 bg-[#12332a] p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C6F432]" />
                    <span>Pertanyaan Mahasiswa:</span>
                  </div>
                  <p className="text-white/80 font-mono text-[11px]">
                    "Jelaskan perbedaan REST API vs GraphQL dalam 1 kalimat untuk bahan ujian besok."
                  </p>
                </div>

                {/* AI Bubble */}
                <div className="rounded-xl border border-[#C6F432]/30 bg-[#0d261e] p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#C6F432] mb-1">
                    <Bot size={14} />
                    <span>Tanya AI Study Companion:</span>
                  </div>
                  <p className="text-white/90 font-mono text-[11px] leading-relaxed">
                    "REST API memakai endpoint tetap dengan payload terstruktur per URL, sedangkan GraphQL memakai satu endpoint tunggal di mana klien secara spesifik meminta field data yang dibutuhkan saja."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 4: ORGANISASI & PROKER (1 Col) ── */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#12332a] p-6 sm:p-8 shadow-xl transition-all duration-300 hover:border-[#C6F432]/40">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/20">
                  <Users size={20} />
                </span>
                <span className="font-mono text-xs font-bold text-white/50 uppercase tracking-wider">
                  04 // ORGANISASI
                </span>
              </div>

              <div className="mt-6">
                <h3 className="font-display text-xl font-black text-white tracking-tight">
                  Manajemen Organisasi & Proker
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#F4F1EA]/70 leading-relaxed font-normal">
                  Pantau kepanitiaan di BEM, Himpunan, atau UKM. Rinci program kerja menjadi timeline terukur tanpa takut bentrok dengan jadwal praktikum.
                </p>
              </div>
            </div>

            {/* Visual Org Snippet */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0a1f16] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{DEMO_DATA.proker.org}</span>
                <span className="font-mono text-[10px] text-[#C6F432] bg-[#C6F432]/10 border border-[#C6F432]/20 px-2 py-0.5 rounded-full">
                  {DEMO_DATA.proker.role}
                </span>
              </div>

              <div className="rounded-xl bg-[#12332a] p-3 border border-white/10">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{DEMO_DATA.proker.name}</span>
                  <span className="text-[#C6F432] font-mono">{DEMO_DATA.proker.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[#C6F432]" style={{ width: `${DEMO_DATA.proker.progress}%` }} />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[10.5px] text-white/60 font-mono">
                  <span>Tahap: Wawancara Kandidat</span>
                  <span>Tenggat: 30 Nov</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 5: PORTOFOLIO & CV ATS-READY (Full 3 Cols) ── */}
          <div className="md:col-span-3 group relative overflow-hidden rounded-3xl border border-white/10 bg-[#12332a] p-6 sm:p-8 lg:p-10 shadow-xl transition-all duration-300 hover:border-[#C6F432]/40">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6F432]/10 text-[#C6F432] border border-[#C6F432]/20">
                    <Award size={20} />
                  </span>
                  <span className="font-mono text-xs font-bold text-white/50 uppercase tracking-wider">
                    05 // PORTOFOLIO & CV ATS MAGANG
                  </span>
                </div>

                <h3 className="font-display mt-4 text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Ubah Jejak Kuliah & Proker Menjadi CV ATS Standar Industri
                </h3>
                <p className="mt-2 text-sm text-[#F4F1EA]/70 leading-relaxed font-normal max-w-2xl">
                  Setiap tugas besar dan program kerja yang kamu tuntaskan otomatis terekam ke lembar draf resume berstandar Harvard ATS. Siap dicetak atau diekspor ke PDF untuk melamar magang.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-xs font-bold text-white hover:bg-white/10 transition"
                >
                  <Copy size={14} className="text-[#C6F432]" />
                  <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-xl bg-[#C6F432] px-5 py-2.5 font-bold text-xs text-[#0a1f16] shadow-sm hover:brightness-110 transition"
                >
                  <Download size={14} />
                  <span>{downloadSuccess ? "Tersimpan! ✓" : "Cetak / Simpan PDF (A4)"}</span>
                </button>
              </div>
            </div>

            {/* Clean ATS Document Sheet (Scrollable Preview) */}
            <div className="mt-8 rounded-2xl border border-white/15 bg-[#F4F1EA] p-5 sm:p-8 text-[#0b140f] max-h-[340px] overflow-y-auto select-none shadow-inner">
              
              {/* ATS Header */}
              <div className="border-b border-[#0b140f]/20 pb-4 text-center">
                <h4 className="font-display text-xl sm:text-2xl font-black tracking-tight text-[#0b140f]">
                  {DEMO_DATA.student.name}
                </h4>
                <p className="mt-1 font-mono text-xs text-[#0b140f]/75">
                  {DEMO_DATA.student.major} • {DEMO_DATA.student.university} • IPK: {DEMO_DATA.student.gpa} • {DEMO_DATA.student.semester}
                </p>
              </div>

              {/* Section: Academic Projects */}
              <div className="mt-4">
                <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0b140f] border-b border-[#0b140f]/15 pb-1">
                  PROYEK AKADEMIK TERVERIFIKASI
                </h5>
                <div className="mt-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>{DEMO_DATA.cvBullets[1].title}</span>
                    <span className="font-mono text-[11px] text-[#0b140f]/70">{DEMO_DATA.cvBullets[1].period}</span>
                  </div>
                  <p className="mt-1 text-[#0b140f]/80 leading-relaxed font-sans">
                    {DEMO_DATA.cvBullets[1].bullet}
                  </p>
                </div>
              </div>

              {/* Section: Organization Leadership */}
              <div className="mt-4">
                <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0b140f] border-b border-[#0b140f]/15 pb-1">
                  KEPEMIMPINAN & PENGALAMAN ORGANISASI
                </h5>
                <div className="mt-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>{DEMO_DATA.cvBullets[0].title}</span>
                    <span className="font-mono text-[11px] text-[#0b140f]/70">{DEMO_DATA.cvBullets[0].period}</span>
                  </div>
                  <p className="mt-1 text-[#0b140f]/80 leading-relaxed font-sans">
                    {DEMO_DATA.cvBullets[0].bullet}
                  </p>
                </div>
              </div>

              {/* ATS Verified Badge Stamp */}
              <div className="mt-5 pt-3 border-t border-[#0b140f]/15 flex items-center justify-between text-xs font-mono">
                <span className="text-[#0b140f]/60">
                  Dokumen Resmi Rekapitulasi Mahasiswa • Sistem Informasi ngampUS
                </span>
                <span className="rounded-md bg-[#12332a] text-[#C6F432] px-2.5 py-1 font-bold text-[11px]">
                  ✓ ATS SCORE {DEMO_DATA.atsScore}/100
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

