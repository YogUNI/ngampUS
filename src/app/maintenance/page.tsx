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
  Lock,
  ArrowUpRight,
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
    <main className="h-screen max-h-screen w-full bg-[#06140d] text-[#edf4ef] flex flex-col items-center justify-between p-3 sm:p-5 relative overflow-hidden selection:bg-[#c8ef70] selection:text-[#103626]">
      {/* ── Ambient Background Aura ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-[#0f6849]/20 via-[#c8ef70]/10 to-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#c8ef70 1px, transparent 1px), linear-gradient(to right, #c8ef70 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      />

      {/* ── Top Header Bar ── */}
      <header className="relative z-10 w-full max-w-3xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={32}
              height={32}
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-amber-400 ring-2 ring-[#06140d] animate-pulse" />
          </div>
          <span className="font-display text-lg sm:text-xl font-black tracking-tight text-white">
            ngamp<span className="text-[#c8ef70]">US</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] sm:text-xs font-mono text-[#9dc5aa] backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>STATUS: MAINT_MODE</span>
        </div>
      </header>

      {/* ── Center Card (Mobile Compact, Desktop Generous & Zero Scroll) ── */}
      <div className="relative z-10 w-full max-w-md md:max-w-xl lg:max-w-2xl my-auto py-1 shrink-0">
        <div className="relative rounded-2xl md:rounded-3xl border border-[#204c37]/80 bg-[#0a1e15]/90 p-5 sm:p-7 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl space-y-4 md:space-y-5">
          
          {/* Header Icon + Title */}
          <div className="flex flex-col items-center text-center space-y-2.5 md:space-y-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-[#c8ef70]/20 blur-md animate-pulse" />
              <div className="relative grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl border border-amber-500/40 bg-gradient-to-b from-[#183929] to-[#0c2419] text-amber-400 shadow-inner">
                <Wrench size={26} className="animate-[spin_6s_linear_infinite]" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-md md:max-w-lg">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                PEMELIHARAAN SISTEM TERJADWAL
              </span>
              <h1 className="font-display text-xl sm:text-2xl md:text-[26px] font-black tracking-tight text-white leading-tight">
                Sedang Melakukan Tuning & Upgrade Platform
              </h1>
              <p className="text-xs sm:text-sm text-[#9dc5aa] leading-relaxed">
                Kami sedang melakukan sinkronisasi database dan peningkatan kapasitas server agar jadwal kuliah dan fitur AI ngampUS semakin kilat tanpa kendala.
              </p>
            </div>
          </div>

          {/* ── Live Architecture Pipeline ── */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 rounded-xl md:rounded-2xl border border-white/5 bg-black/35 p-2.5 sm:p-3">
            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-white/[0.02]">
              <Database size={16} className="text-[#c8ef70] mb-1" />
              <span className="text-[10px] sm:text-xs font-bold text-white">Database</span>
              <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={10} /> Aman 100%
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-white/[0.02]">
              <Server size={16} className="text-amber-400 mb-1" />
              <span className="text-[10px] sm:text-xs font-bold text-white">Core Server</span>
              <span className="text-[9px] sm:text-[10px] font-mono text-amber-300 flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" /> Reindexing
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-white/[0.02]">
              <Sparkles size={16} className="text-[#c8ef70] mb-1" />
              <span className="text-[10px] sm:text-xs font-bold text-white">AI Gateway</span>
              <span className="text-[9px] sm:text-[10px] font-mono text-[#9dc5aa] flex items-center gap-1 mt-0.5">
                Standby
              </span>
            </div>
          </div>

          {/* ── Assurance Banner ── */}
          <div className="rounded-xl md:rounded-2xl border border-[#1e4631] bg-gradient-to-r from-[#0d2a1c] to-[#0a1e15] px-3.5 py-3 flex items-center gap-3">
            <div className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-[#c8ef70]/15 text-[#c8ef70] border border-[#c8ef70]/20">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white">Seluruh Data Perkuliahanmu Aman</h4>
              <p className="text-[10.5px] sm:text-xs text-[#8ca393] leading-snug">Jadwal kuliah, tugas, catatan organisasi, dan dokumen modul tersimpan aman di database cloud.</p>
            </div>
          </div>

          {/* ── Status Feedback Banner (if checked) ── */}
          {checkStatus === "still_mt" && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 py-2 px-3 text-center text-xs font-bold text-amber-300 animate-in fade-in duration-200 flex items-center justify-center gap-2">
              <AlertCircle size={14} />
              <span>Sistem masih tahap optimasi. Coba cek lagi dalam 1-2 menit ya!</span>
            </div>
          )}

          {checkStatus === "online" && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 px-3 text-center text-xs font-bold text-emerald-300 animate-in fade-in duration-200 flex items-center justify-center gap-2">
              <CheckCircle2 size={14} />
              <span>Sistem sudah kembali online! Mengalihkan ke dashboard...</span>
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#c8ef70] py-2.5 sm:py-3 px-4 text-xs font-black text-[#103626] hover:bg-[#d8faa1] transition active:scale-98 cursor-pointer shadow-md shadow-[#c8ef70]/10 disabled:opacity-75"
            >
              <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
              <span>{checking ? "Memeriksa Status..." : "Cek Status Sistem"}</span>
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 py-2.5 sm:py-3 px-4 text-xs font-bold text-white transition active:scale-98"
            >
              <Lock size={13} className="text-[#c8ef70]" />
              <span>Akses Superadmin</span>
              <ArrowUpRight size={12} className="text-white/40" />
            </Link>
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full max-w-3xl flex items-center justify-between text-[10.5px] sm:text-xs text-[#698c76] shrink-0 pb-1">
        <div className="flex items-center gap-2 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c8ef70]" />
          <span>ngampUS Core Platform • Zero Data Loss</span>
        </div>
        <p className="hidden sm:block">Status: Tuning & Upgrades in progress</p>
      </footer>
    </main>
  );
}
