"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Wrench, 
  ShieldCheck, 
  RefreshCw, 
  Server, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Lock,
  ArrowUpRight,
  HardDriveDownload,
  AlertCircle
} from "lucide-react";

export default function MaintenancePage() {
  const [checking, setChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    setChecking(true);
    setCheckStatus(null);
    try {
      const res = await fetch("/api/health-check", { cache: "no-store" }).catch(() => null);
      if (res && res.ok) {
        setCheckStatus("online");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1200);
      } else {
        setTimeout(() => {
          setCheckStatus("still_mt");
          setChecking(false);
        }, 800);
      }
    } catch {
      setTimeout(() => {
        setCheckStatus("still_mt");
        setChecking(false);
      }, 800);
    }
  };

  return (
    <main className="min-h-screen bg-[#06140d] text-[#edf4ef] flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-hidden selection:bg-[#c8ef70] selection:text-[#103626]">
      {/* ── Dynamic Ambient Background ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#0f6849]/20 via-[#c8ef70]/10 to-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#0f6849]/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#c8ef70]/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#c8ef70 1px, transparent 1px), linear-gradient(to right, #c8ef70 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* ── Top Header ── */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={36}
              height={36}
              className="h-8 w-8 object-contain"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-[#06140d] animate-pulse" />
          </div>
          <span className="font-display text-xl font-black tracking-tight text-white">
            ngamp<span className="text-[#c8ef70]">US</span>
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono text-[#9dc5aa] backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span>STATUS: MAINT_MODE</span>
        </div>
      </header>

      {/* ── Main Centerpiece ── */}
      <div className="relative z-10 w-full max-w-xl my-auto py-8">
        <div className="relative rounded-3xl border border-[#204c37]/80 bg-[#0a1e15]/85 p-6 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl space-y-7">
          
          {/* Top Badge & Glow Icon */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-[#c8ef70]/20 blur-xl animate-pulse" />
              <div className="relative grid h-20 w-20 place-items-center rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#183929] to-[#0c2419] text-amber-400 shadow-inner">
                <Wrench size={36} className="animate-[spin_6s_linear_infinite]" />
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300">
                <Clock size={11} className="animate-spin" />
                PEMELIHARAAN SISTEM TERJADWAL
              </span>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Sedang Melakukan Tuning & Upgrade Platform
              </h1>
              <p className="text-xs sm:text-sm text-[#9dc5aa] leading-relaxed">
                Server sedang melakukan sinkronisasi database dan peningkatan kapasitas AI Engine agar akses jadwal, tugas, dan modul kamu semakin kilat tanpa gangguan.
              </p>
            </div>
          </div>

          {/* ── Live Architecture Status Pipeline ── */}
          <div className="grid grid-cols-3 gap-2.5 rounded-2xl border border-white/5 bg-black/35 p-3.5">
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.02]">
              <Database size={18} className="text-[#c8ef70] mb-1.5" />
              <span className="text-[10px] font-bold text-white">Database</span>
              <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={9} /> Aman 100%
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.02]">
              <Server size={18} className="text-amber-400 mb-1.5" />
              <span className="text-[10px] font-bold text-white">Core Server</span>
              <span className="text-[9px] font-mono text-amber-300 flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" /> Reindexing
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.02]">
              <Sparkles size={18} className="text-[#c8ef70] mb-1.5" />
              <span className="text-[10px] font-bold text-white">AI Gateway</span>
              <span className="text-[9px] font-mono text-[#9dc5aa] flex items-center gap-1 mt-0.5">
                Standby
              </span>
            </div>
          </div>

          {/* ── Assurance Box ── */}
          <div className="rounded-2xl border border-[#1e4631] bg-gradient-to-r from-[#0d2a1c] to-[#0a1e15] p-4 flex items-start gap-3.5 shadow-sm">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#c8ef70]/15 text-[#c8ef70] border border-[#c8ef70]/20">
              <ShieldCheck size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white tracking-wide">
                Seluruh Data Perkuliahanmu Tersimpan Aman
              </h4>
              <p className="text-[11px] text-[#8ca393] leading-relaxed">
                Jadwal, tugas, catatan organisasi, dan modul kamu aman tersimpan di cloud storage terenkripsi. Tidak ada data yang hilang selama proses ini.
              </p>
            </div>
          </div>

          {/* ── Status Feedback Banner (if user checked) ── */}
          {checkStatus === "still_mt" && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center text-xs font-bold text-amber-300 animate-in fade-in duration-200 flex items-center justify-center gap-2">
              <AlertCircle size={14} />
              <span>Sistem masih dalam tahap optimalisasi. Coba lagi dalam 1-2 menit ya!</span>
            </div>
          )}

          {checkStatus === "online" && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs font-bold text-emerald-300 animate-in fade-in duration-200 flex items-center justify-center gap-2">
              <CheckCircle2 size={14} />
              <span>Sistem sudah kembali online! Mengalihkan ke dashboard...</span>
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c8ef70] px-5 py-3.5 text-xs font-black text-[#103626] hover:bg-[#d8faa1] transition active:scale-98 cursor-pointer shadow-lg shadow-[#c8ef70]/10 disabled:opacity-75"
            >
              <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
              <span>{checking ? "Memeriksa Status..." : "Cek Status Sistem"}</span>
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-3.5 text-xs font-bold text-white transition active:scale-98"
            >
              <Lock size={14} className="text-[#c8ef70]" />
              <span>Akses Superadmin</span>
              <ArrowUpRight size={13} className="text-white/40" />
            </Link>
          </div>

        </div>
      </div>

      {/* ── Bottom Modern Footer ── */}
      <footer className="relative z-10 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px] text-[#698c76] pb-2">
        <div className="flex items-center gap-2 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c8ef70]" />
          <span>ngampUS Core Platform • Zero Data Loss Guarantee</span>
        </div>
        <p className="text-[10px] sm:text-[11px]">
          Butuh bantuan mendesak? Hubungi tim admin kampus via email.
        </p>
      </footer>
    </main>
  );
}

