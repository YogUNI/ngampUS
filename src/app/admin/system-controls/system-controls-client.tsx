"use client";

import { useState, useTransition } from "react";
import { 
  ShieldAlert, 
  Cpu, 
  UserPlus, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Power, 
  Flame, 
  Lock, 
  SlidersHorizontal, 
  Info,
  X
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

  // Custom Modal Confirmation State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    key: keyof SystemFlags;
    nextValue: boolean;
    label: string;
    title: string;
    description: string;
  } | null>(null);

  const executeToggle = (key: keyof SystemFlags, nextValue: boolean, label: string) => {
    setActiveKey(key);
    setFeedback(null);

    startTransition(async () => {
      try {
        const res = await updateSystemSetting(key, nextValue);
        if (!res.success) {
          setFeedback({
            type: "error",
            message: res.error || `Gagal mengubah status ${label}. Pastikan tabel sistem sudah siap.`,
          });
          return;
        }

        setFlags((prev) => ({
          ...prev,
          [key]: nextValue,
          updated_at: new Date().toISOString(),
        }));
        setFeedback({
          type: "success",
          message: `Berhasil mengubah ${label} menjadi: ${nextValue ? "AKTIF" : "NONAKTIF"}.`,
        });
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err.message || `Gagal mengubah status ${label}.`,
        });
      } finally {
        setActiveKey(null);
        setConfirmModal(null);
      }
    });
  };

  const handleToggle = (key: keyof SystemFlags, currentValue: boolean, label: string) => {
    const nextValue = !currentValue;
    
    // Trigger custom modal for critical actions
    if (key === "maintenance_mode") {
      if (nextValue) {
        setConfirmModal({
          isOpen: true,
          key,
          nextValue,
          label,
          title: "Aktifkan Mode Pemeliharaan?",
          description: "Semua mahasiswa yang sedang aktif akan dialihkan ke halaman pemeliharaan (/maintenance). Akun Superadmin tetap memiliki akses penuh tanpa terkunci (Zero-Lockout).",
        });
      } else {
        setConfirmModal({
          isOpen: true,
          key,
          nextValue,
          label,
          title: "Nyalakan Kembali Platform?",
          description: "Mode pemeliharaan akan dinonaktifkan. Mahasiswa dapat kembali mengakses seluruh dashboard dan materi secara normal.",
        });
      }
      return;
    }

    if (key === "ai_service_active" && !nextValue) {
      setConfirmModal({
        isOpen: true,
        key,
        nextValue,
        label,
        title: "Matikan AI Engine (Killswitch)?",
        description: "Seluruh fitur berbasis Gemini (kuis, rangkuman, tutor) akan dinonaktifkan sementara dan dialihkan ke pesan istirahat server yang sopan bagi mahasiswa.",
      });
      return;
    }

    // Direct execute for non-critical toggles
    executeToggle(key, nextValue, label);
  };

  return (
    <div className="space-y-6">
      {/* ── Executive Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Kendali & Saklar Sistem
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Controls
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Pusat kendali operasional platform secara instan tanpa perlu redeploy. Proteksi Zero-Lockout menjamin superadmin tidak akan terblokir.
          </p>
        </div>
      </div>

      {/* ── Feedback Toast ── */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-xs font-medium animate-in fade-in duration-150 ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
              : "border-rose-500/30 bg-rose-950/40 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle size={16} className="shrink-0 text-rose-400" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Grid Switchboard Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Emergency Maintenance Mode */}
        <div
          className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
            flags.maintenance_mode
              ? "border-rose-500/50 bg-rose-950/20 shadow-xs"
              : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Flame size={18} />
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-medium uppercase ${
                  flags.maintenance_mode
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {flags.maintenance_mode ? "Active / Maintenance" : "Standby"}
              </span>
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-semibold text-white">Emergency Maintenance</h2>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Mengalihkan seluruh akses mahasiswa ke halaman pemeliharaan sementara saat migrasi data atau audit sistem.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <Lock size={12} className="text-emerald-400" />
                <span>Zero-Lockout Protection</span>
              </div>
              <p>Rute Superadmin (/admin) tetap aktif 100% dan tidak akan pernah terblokir.</p>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Saklar Kendali:</span>
            <button
              onClick={() => handleToggle("maintenance_mode", flags.maintenance_mode, "Mode Pemeliharaan")}
              disabled={isPending && activeKey === "maintenance_mode"}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                flags.maintenance_mode ? "bg-rose-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  flags.maintenance_mode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card 2: AI Engine Killswitch */}
        <div
          className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
            !flags.ai_service_active
              ? "border-amber-500/50 bg-amber-950/20 shadow-xs"
              : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
                <Cpu size={18} />
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-medium uppercase ${
                  flags.ai_service_active
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                }`}
              >
                {flags.ai_service_active ? "Operational" : "Paused"}
              </span>
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-semibold text-white">AI Engine Killswitch</h2>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Menonaktifkan pemanggilan Gemini API (kuis, rangkuman, tutor) saat kuota token menipis atau endpoint sedang bermasalah.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>Graceful Feedback</span>
              </div>
              <p>Mahasiswa mendapat pesan istirahat server yang sopan tanpa memicu unhandled runtime error.</p>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Saklar Kendali:</span>
            <button
              onClick={() => handleToggle("ai_service_active", flags.ai_service_active, "Layanan AI")}
              disabled={isPending && activeKey === "ai_service_active"}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                flags.ai_service_active ? "bg-emerald-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  flags.ai_service_active ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card 3: Registration Gatekeeper */}
        <div
          className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
            !flags.registration_active
              ? "border-blue-500/50 bg-blue-950/20 shadow-xs"
              : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <UserPlus size={18} />
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-medium uppercase ${
                  flags.registration_active
                    ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {flags.registration_active ? "Open / Public" : "Restricted"}
              </span>
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-semibold text-white">Registration Gatekeeper</h2>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Membuka atau menutup pendaftaran akun mahasiswa baru untuk mencegah bot registrasi spam massal.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <Info size={12} className="text-blue-400" />
                <span>Existing Users Safe</span>
              </div>
              <p>Mahasiswa yang sudah memiliki akun tetap bisa login dan menggunakan fitur seperti biasa.</p>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Saklar Kendali:</span>
            <button
              onClick={() => handleToggle("registration_active", flags.registration_active, "Pendaftaran Akun Baru")}
              disabled={isPending && activeKey === "registration_active"}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                flags.registration_active ? "bg-emerald-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  flags.registration_active ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── System Audit Footer ── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-emerald-400" />
          <span>Setiap modifikasi saklar sistem terekam otomatis ke dalam audit trail dengan identitas email eksekutor.</span>
        </div>
        {flags.updated_at && (
          <span className="font-mono text-[11px] text-slate-400">
            Terakhir diubah: {new Date(flags.updated_at).toLocaleString("id-ID")} {flags.updated_by_email ? `oleh ${flags.updated_by_email}` : ""}
          </span>
        )}
      </div>

      {/* ── Custom Modal Confirmation ── */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                    confirmModal.key === "maintenance_mode" && confirmModal.nextValue
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {confirmModal.key === "maintenance_mode" && confirmModal.nextValue ? (
                    <Flame size={20} />
                  ) : (
                    <Power size={20} />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white">
                    {confirmModal.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Konfirmasi perubahan saklar sistem
                  </p>
                </div>
              </div>

              <button
                onClick={() => setConfirmModal(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.description}
            </p>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center gap-2 text-xs text-slate-400">
              <Lock size={13} className="text-emerald-400 shrink-0" />
              <span>Akses Superadmin tidak akan pernah terkunci oleh pengaturan ini.</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                disabled={isPending}
                className="rounded-xl border border-slate-800 bg-slate-800/60 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
              >
                Batalkan
              </button>

              <button
                type="button"
                onClick={() => executeToggle(confirmModal.key, confirmModal.nextValue, confirmModal.label)}
                disabled={isPending}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition active:scale-[0.98] disabled:opacity-50 ${
                  confirmModal.key === "maintenance_mode" && confirmModal.nextValue
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isPending && <Loader2 size={13} className="animate-spin" />}
                <span>Eksekusi Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
