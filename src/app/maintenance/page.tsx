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
      <header className="relative z-10 w-full max-w-2xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-[#06140d] animate-pulse" />
          </div>
          <span className="font-display text-lg font-black tracking-tight text-white">
            ngamp<span className="text-[#c8ef70]">US</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-[#9dc5aa] backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>STATUS: MAINT_MODE</span>
        </div>
      </header>

      {/* ── Compact Card (Single Viewport, Zero Scroll) ── */}
      <div className="relative z-10 w-full max-w-lg my-auto py-1 shrink-0">
        <div className="relative rounded-2xl border border-[#204c37]/80 bg-[#0a1e15]/90 p-5 sm:p-6 shadow-[0_15px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-4">
          
          {/* Header Icon + Title */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-[#c8ef70]/20 blur-md animate-pulse" />
              <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-amber-500/40 bg-gradient-to-b from-[#183929] to-[#0c2419] text-amber-400 shadow-inner">
                <Wrench size={24} className="animate-[spin_6s_linear_infinite]" />
              </div>
            </div>

            <div className="space-y-1 max-w-sm">
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-300">
                <span className="h-1 w-1 rounded-full bg-amber-400 animate-ping" />
                PEMELIHARAAN SISTEM TERJADWAL
              </span>
              <h1 className="font-display text-lg sm:text-xl font-black tracking-tight text-white leading-snug">
                Peningkatan Kapasitas & Performa Platform
              </h1>
              <p className="text-[11px] sm:text-xs text-[#9dc5aa] leading-relaxed">
                Kami sedang melakukan sinkronisasi database dan penyesuaian server agar pengalaman perkuliahanmu semakin lancar dan kilat.
              </p>
            </div>
          </div>

          {/* ── Live Architecture Pipeline ── */}
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/5 bg-black/30 p-2">
            <div className="flex flex-col items-center text-center p-1 rounded-lg bg-white/[0.02]">
              <Database size={14} className="text-[#c8ef70] mb-0.5" />
              <span className="text-[9px] font-bold text-white">Database</span>
              <span className="text-[8.5px] font-mono text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <CheckCircle2 size={8} /> Aman 100%
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-1 rounded-lg bg-white/[0.02]">
              <Server size={14} className="text-amber-400 mb-0.5" />
              <span className="text-[9px] font-bold text-white">Core Server</span>
              <span className="text-[8.5px] font-mono text-amber-300 flex items-center gap-0.5 mt-0.5">
                <span className="h-1 w-1 rounded-full bg-amber-400 animate-ping" /> Reindexing
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-1 rounded-lg bg-white/[0.02]">
              <Sparkles size={14} className="text-[#c8ef70] mb-0.5" />
              <span className="text-[9px] font-bold text-white">AI Gateway</span>
              <span className="text-[8.5px] font-mono text-[#9dc5aa] flex items-center gap-0.5 mt-0.5">
                Standby
              </span>
            </div>
          </div>

          {/* ── Assurance Banner ── */}
          <div className="rounded-xl border border-[#1e4631] bg-[#0d2a1c]/70 px-3 py-2.5 flex items-center gap-2.5">
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#c8ef70]/15 text-[#c8ef70]">
              <ShieldCheck size={14} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-white">Data Perkuliahan Aman</h4>
              <p className="text-[10px] text-[#8ca393] truncate">Jadwal, tugas, absensi, dan modul tersimpan di cloud terenkripsi.</p>
            </div>
          </div>

          {/* ── Status Feedback Banner (if checked) ── */}
          {checkStatus === "still_mt" && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 py-1.5 px-2 text-center text-[10.5px] font-bold text-amber-300 animate-in fade-in duration-200 flex items-center justify-center gap-1.5">
              <AlertCircle size={12} />
              <span>Masih tahap tuning. Coba cek lagi sebentar lagi ya!</span>
            </div>
          )}

          {checkStatus === "online" && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-1.5 px-2 text-center text-[10.5px] font-bold text-emerald-300 animate-in fade-in duration-200 flex items-center justify-center gap-1.5">
              <CheckCircle2 size={12} />
              <span>Sistem online! Mengalihkan ke dashboard...</span>
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#c8ef70] py-2.5 px-4 text-[11px] font-black text-[#103626] hover:bg-[#d8faa1] transition active:scale-98 cursor-pointer shadow-md shadow-[#c8ef70]/10 disabled:opacity-75"
            >
              <RefreshCw size={13} className={checking ? "animate-spin" : ""} />
              <span>{checking ? "Memeriksa..." : "Cek Status Sistem"}</span>
            </button>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 py-2.5 px-3.5 text-[11px] font-bold text-white transition active:scale-98"
            >
              <Lock size={12} className="text-[#c8ef70]" />
              <span>Akses Superadmin</span>
              <ArrowUpRight size={11} className="text-white/40" />
            </Link>
          </div>

        </div>
      </div>

      {/* ── Compact Footer ── */}
      <footer className="relative z-10 w-full max-w-2xl flex items-center justify-between text-[10px] text-[#698c76] shrink-0 pb-0.5">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c8ef70]" />
          <span>ngampUS Core Platform • Zero Data Loss</span>
        </div>
        <p className="hidden sm:block">Status: Upgrades in progress</p>
      </footer>
    </main>
  );
}
