"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, LayoutDashboard } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to client console or monitoring service
    console.error("[ngampUS Error Boundary caught]", error);
  }, [error]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#07130e] text-[#e8f5ee] px-4 py-12 select-none">
      {/* Background glow warning */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center">
        {/* Warning Icon Container */}
        <div className="relative mb-6">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-950/40 border border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.2)] backdrop-blur-xl">
            <AlertTriangle className="w-10 h-10 text-rose-400" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold tracking-wider uppercase mb-3">
          Gangguan Operasi Sistem
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Terjadi Kesalahan Sementara
        </h1>

        <p className="text-sm text-emerald-200/70 max-w-md mx-auto leading-relaxed mb-6">
          Sistem ngampUS mengisolasi kendala ini agar data kamu tetap aman. Kamu bisa mencoba memuat ulang sesi sekarang.
        </p>

        {error.digest && (
          <div className="mb-6 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-emerald-300/60 max-w-xs truncate">
            Digest Code: {error.digest}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-[0_10px_25px_rgba(5,150,105,0.3)] transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#c8ef70]" />
            <span>Coba Muat Ulang</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-100 border border-white/10 font-bold text-sm backdrop-blur-md transition-all duration-200 active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>Ke Dashboard</span>
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-emerald-300/60">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
