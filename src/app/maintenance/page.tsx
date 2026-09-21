"use client";

import Link from "next/link";
import Image from "next/image";
import { Wrench, ShieldCheck, RefreshCw, ArrowLeft } from "lucide-react";

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-[#071710] text-[#edf4ef] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#c8ef70] selection:text-[#103626]">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#0f6849]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#c8ef70]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/logo_ngampUS.png"
            alt="ngampUS Logo"
            width={38}
            height={38}
            className="h-9 w-9 object-contain"
          />
          <span className="font-display text-2xl font-black tracking-tight text-white">
            ngamp<span className="text-[#c8ef70]">US</span>
          </span>
        </div>

        {/* Icon & Status Card */}
        <div className="rounded-3xl border border-[#1e4631] bg-[#0c2419]/90 p-8 shadow-2xl backdrop-blur-md space-y-4">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            <Wrench size={32} />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              SISTEM SEDANG DIPERBARUI
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
              Peningkatan Performa Terjadwal
            </h1>
            <p className="text-xs sm:text-sm text-[#9dc5aa] leading-relaxed">
              Kami sedang melakukan optimasi server dan pembaruan sistem database untuk memastikan pengalaman belajar dan pencatatan jadwal kuliahmu semakin kencang dan stabil.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/25 p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck size={16} className="text-[#c8ef70]" />
              <span>Semua Data & Tugas Kamu Aman 100%</span>
            </div>
            <p className="text-[11px] text-[#7da88c] leading-relaxed">
              Jadwal kuliah, absensi, dokumen modul, dan catatan organisasimu tersimpan aman di database terenkripsi. Layanan akan segera kembali normal dalam beberapa saat.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#c8ef70] px-5 py-2.5 text-xs font-black text-[#103626] hover:bg-[#d6f792] transition active:scale-95 cursor-pointer shadow-sm"
            >
              <RefreshCw size={14} />
              <span>Cek Status Sekarang</span>
            </button>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition"
            >
              <span>Akses Superadmin</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-[#698c76]">
          ngampUS Platform Engine • Status: Upgrades in progress
        </p>
      </div>
    </main>
  );
}
