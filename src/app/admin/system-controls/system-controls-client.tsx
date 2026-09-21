"use client";

import { useState, useTransition } from "react";
import { 
  ShieldAlert, 
  Cpu, 
  UserPlus, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  Power,
  Flame,
  Lock,
  Radio,
  SlidersHorizontal,
  Info
} from "lucide-react";
import { updateSystemSetting } from "../actions";
import { SystemFlags } from "@/lib/system-settings";

interface SystemControlsClientProps {
  initialFlags: SystemFlags;
}

export function SystemControlsClient({ initialFlags }: SystemControlsClientProps) {
  const [flags, setFlags] = useState<SystemFlags>(initialFlags);
  const [isPending, startTransition] = useTransition();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleToggle = (key: keyof SystemFlags, currentValue: boolean, label: string) => {
    const nextValue = !currentValue;
    
    // Safety confirmation for critical actions
    if (key === "maintenance_mode" && nextValue) {
      if (!window.confirm("PERINGATAN KRITIS: Mengaktifkan Maintenance Mode akan mengalihkan semua mahasiswa ke halaman pemeliharaan. Akun Superadmin tetap bisa akses penuh. Lanjutkan?")) {
        return;
      }
    }

    setActiveKey(key);
    setFeedback(null);

    startTransition(async () => {
      try {
        await updateSystemSetting(key, nextValue);
        setFlags((prev) => ({
          ...prev,
          [key]: nextValue,
          updated_at: new Date().toISOString(),
        }));
        setFeedback({
          type: "success",
          message: `Berhasil mengubah ${label} menjadi: ${nextValue ? "AKTIF (ON)" : "NONAKTIF (OFF)"}.`,
        });
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err.message || `Gagal mengubah status ${label}.`,
        });
      } finally {
        setActiveKey(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#c8ef70]">
              [SYSTEM CONTROL CENTER // FEATURE SWITCHBOARD]
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <SlidersHorizontal className="text-[#c8ef70]" size={28} />
            <span>Kendali & Saklar Sistem</span>
          </h1>
          <p className="mt-1 text-xs text-[#9dc5aa] max-w-2xl leading-relaxed">
            Pusat kendali operasional platform secara instan tanpa perlu redeploy. Superadmin memiliki jaminan akses tanpa terkunci (Zero-Lockout).
          </p>
        </div>

        {/* Global Live Indicator */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#204c37] bg-[#0c2419] px-4 py-2 text-xs font-bold text-[#c8ef70] shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8ef70] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c8ef70]" />
          </span>
          <span>SWITCHBOARD LIVE</span>
        </div>
      </div>

      {/* ── Feedback Notification ── */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-2xl border p-4 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "border-[#c8ef70]/40 bg-[#c8ef70]/10 text-[#d8fbb0]"
              : "border-rose-500/40 bg-rose-500/10 text-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0 text-[#c8ef70]" />
          ) : (
            <AlertTriangle size={18} className="shrink-0 text-rose-400" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Grid Switchboard Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Card 1: Emergency Maintenance Mode */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 flex flex-col justify-between ${
            flags.maintenance_mode
              ? "border-rose-500/60 bg-gradient-to-b from-rose-950/40 to-[#0c2419] shadow-[0_0_40px_rgba(244,63,94,0.15)]"
              : "border-[#1e4631] bg-[#0c2419] hover:border-[#2d6849]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/25">
                <Flame size={20} />
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                  flags.maintenance_mode
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                    : "bg-[#183929] text-[#9dc5aa] border-white/10"
                }`}
              >
                {flags.maintenance_mode ? "ACTIVE / HALTED" : "STANDBY"}
              </span>
            </div>

            <div className="mt-4">
              <h2 className="text-base font-black text-white">Emergency Maintenance</h2>
              <p className="mt-1 text-xs text-[#9dc5aa] leading-relaxed">
                Mengalihkan seluruh akses mahasiswa ke halaman pemeliharaan sementara saat ada migrasi server atau audit database.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-3 text-[11px] text-[#7da88c] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Lock size={12} className="text-[#c8ef70]" />
                <span>Zero-Lockout Protection</span>
              </div>
              <p>Rute Superadmin (/admin) tetap aktif 100% dan tidak akan pernah terblokir.</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-white">Status Saklar:</span>
            <button
              onClick={() => handleToggle("maintenance_mode", flags.maintenance_mode, "Maintenance Mode")}
              disabled={isPending && activeKey === "maintenance_mode"}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                flags.maintenance_mode ? "bg-rose-500" : "bg-[#183929]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  flags.maintenance_mode ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card 2: AI Engine Killswitch */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 flex flex-col justify-between ${
            !flags.ai_service_active
              ? "border-amber-500/60 bg-gradient-to-b from-amber-950/40 to-[#0c2419] shadow-[0_0_40px_rgba(245,158,11,0.15)]"
              : "border-[#1e4631] bg-[#0c2419] hover:border-[#2d6849]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#c8ef70]/15 text-[#c8ef70] border border-[#c8ef70]/25">
                <Cpu size={20} />
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                  flags.ai_service_active
                    ? "bg-[#c8ef70]/20 text-[#c8ef70] border-[#c8ef70]/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}
              >
                {flags.ai_service_active ? "RUNNING / OPERATIONAL" : "PAUSED / COOLDOWN"}
              </span>
            </div>

            <div className="mt-4">
              <h2 className="text-base font-black text-white">AI Engine Killswitch</h2>
              <p className="mt-1 text-xs text-[#9dc5aa] leading-relaxed">
                Menonaktifkan pemanggilan Gemini API (kuis, rangkuman, tutor) saat kuota token menipis atau endpoint sedang bermasalah.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-3 text-[11px] text-[#7da88c] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <CheckCircle2 size={12} className="text-[#c8ef70]" />
                <span>Graceful Experience</span>
              </div>
              <p>Mahasiswa mendapat pesan istirahat server yang sopan tanpa memicu error merah.</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-white">Status Saklar:</span>
            <button
              onClick={() => handleToggle("ai_service_active", flags.ai_service_active, "AI Engine Service")}
              disabled={isPending && activeKey === "ai_service_active"}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                flags.ai_service_active ? "bg-[#0f6849]" : "bg-neutral-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  flags.ai_service_active ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card 3: Registration Gatekeeper */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 flex flex-col justify-between ${
            !flags.registration_active
              ? "border-sky-500/60 bg-gradient-to-b from-sky-950/40 to-[#0c2419] shadow-[0_0_40px_rgba(14,165,233,0.15)]"
              : "border-[#1e4631] bg-[#0c2419] hover:border-[#2d6849]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/25">
                <UserPlus size={20} />
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                  flags.registration_active
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                    : "bg-neutral-800 text-neutral-400 border-neutral-700"
                }`}
              >
                {flags.registration_active ? "PUBLIC / OPEN" : "RESTRICTED / CLOSED"}
              </span>
            </div>

            <div className="mt-4">
              <h2 className="text-base font-black text-white">Registration Gatekeeper</h2>
              <p className="mt-1 text-xs text-[#9dc5aa] leading-relaxed">
                Membuka atau menutup pendaftaran akun mahasiswa baru. Berguna untuk mencegah serangan bot pendaftaran massal.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-3 text-[11px] text-[#7da88c] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Info size={12} className="text-sky-400" />
                <span>Existing Users Safe</span>
              </div>
              <p>Mahasiswa yang sudah memiliki akun tetap bisa login dan menggunakan fitur normal.</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-white">Status Saklar:</span>
            <button
              onClick={() => handleToggle("registration_active", flags.registration_active, "Pendaftaran Akun Baru")}
              disabled={isPending && activeKey === "registration_active"}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                flags.registration_active ? "bg-[#0f6849]" : "bg-neutral-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  flags.registration_active ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

      </div>

      {/* ── System Audit Footer ── */}
      <div className="rounded-2xl border border-white/10 bg-[#0c2419]/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8ca393]">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-[#c8ef70]" />
          <span>Setiap perubahan status tersimpan otomatis dengan audit email Superadmin penanggung jawab.</span>
        </div>
        {flags.updated_at && (
          <span className="font-mono text-[11px] text-[#c8ef70]">
            Pembaruan Terakhir: {new Date(flags.updated_at).toLocaleString("id-ID")} {flags.updated_by_email ? `oleh ${flags.updated_by_email}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}
