import Link from "next/link";
import { Compass, Home, LayoutDashboard, ArrowLeft, Calendar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#07130e] text-[#e8f5ee] px-4 py-12 select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[#c8ef70]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative background grid subtle */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center">
        {/* Animated 404 Radar Beacon */}
        <div className="relative mb-6">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-emerald-950/70 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)] backdrop-blur-xl">
            <Compass className="w-11 h-11 text-[#c8ef70] animate-[spin_12s_linear_infinite]" />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#07130e]"></span>
            </span>
          </div>
        </div>

        {/* 404 Hero typography */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-3">
          Error 404 &bull; Sinyal Rute Hilang
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          Halaman Tidak Ditemukan
        </h1>

        <p className="text-sm sm:text-base text-emerald-200/70 max-w-md mx-auto leading-relaxed mb-8">
          Tautan yang kamu tuju mungkin sudah dipindahkan, dihapus, atau sedang berada di luar orbit kampus ngampUS.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-[0_10px_25px_rgba(5,150,105,0.3)] transition-all duration-200 active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 text-[#c8ef70]" />
            <span>Ke Dashboard Mahasiswa</span>
          </Link>

          <Link
            href="/jadwal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-100 border border-white/10 font-bold text-sm backdrop-blur-md transition-all duration-200 active:scale-95"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Lihat Jadwal Kuliah</span>
          </Link>
        </div>

        {/* Secondary back link */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs font-medium text-emerald-300/60">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Halaman Utama</span>
          </Link>
          <span>&bull;</span>
          <span className="text-emerald-400/40">ngampUS System Resiliency</span>
        </div>
      </div>
    </div>
  );
}
