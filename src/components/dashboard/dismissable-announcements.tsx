"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Sparkles, 
  Megaphone, 
  Wrench, 
  ArrowUpRight, 
  X, 
  Building2,
  Globe 
} from "lucide-react";

export interface BroadcastItem {
  id: string;
  judul: string;
  pesan: string;
  tipe: "info" | "update" | "warning" | "maintenance";
  tautan?: string | null;
  target_university?: string | null;
  expires_at?: string | null;
  is_emergency_sticky?: boolean;
}

interface DismissableAnnouncementsProps {
  announcements: BroadcastItem[];
  userUniversity?: string | null;
}

export function DismissableAnnouncements({
  announcements,
  userUniversity,
}: DismissableAnnouncementsProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("ngampus_dismissed_announcements");
      if (saved) {
        setDismissedIds(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = (id: string) => {
    const next = [...dismissedIds, id];
    setDismissedIds(next);
    try {
      localStorage.setItem("ngampus_dismissed_announcements", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Filter announcements:
  // 1. Must not be dismissed by this user (EXCEPT emergency sticky which cannot be dismissed)
  // 2. Must not be expired
  // 3. Must match user's university or be global (target_university is null)
  const now = new Date().toISOString();
  const visibleAnnouncements = announcements.filter((ann) => {
    if (!ann.is_emergency_sticky && dismissedIds.includes(ann.id)) return false;

    if (ann.expires_at && ann.expires_at < now) return false;

    if (ann.target_university && ann.target_university.trim()) {
      if (!userUniversity) return false;
      return ann.target_university.trim().toLowerCase() === userUniversity.trim().toLowerCase();
    }

    return true;
  });

  if (!isMounted || visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      {visibleAnnouncements.map((ann) => {
        const isEmergency = ann.is_emergency_sticky;
        const isWarning = ann.tipe === "warning" || ann.tipe === "maintenance" || isEmergency;
        const isUpdate = ann.tipe === "update";

        return (
          <div
            key={ann.id}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm transition animate-in fade-in slide-in-from-top-2 duration-300 ${
              isEmergency
                ? "border-rose-500/50 bg-rose-950/40 text-rose-200 ring-1 ring-rose-500/40"
                : isWarning
                ? "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                : isUpdate
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                : "border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="mt-0.5 shrink-0">
                  {isEmergency ? (
                    <span className="relative flex h-5 w-5 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <AlertTriangle size={18} className="relative text-rose-400" />
                    </span>
                  ) : ann.tipe === "warning" ? (
                    <AlertTriangle size={18} className="text-amber-500" />
                  ) : ann.tipe === "maintenance" ? (
                    <Wrench size={18} className="text-rose-500" />
                  ) : ann.tipe === "update" ? (
                    <Sparkles size={18} className="text-emerald-500" />
                  ) : (
                    <Megaphone size={18} className="text-sky-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {isEmergency ? (
                      <span className="font-mono text-[9px] font-black uppercase tracking-wider rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40 px-1.5 py-0.5 animate-pulse">
                        [DARURAT KRITIS // SIARAN MENEMPEL]
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] font-black uppercase tracking-wider opacity-80">
                        [PENGUMUMAN SISTEM]
                      </span>
                    )}
                    {ann.target_university ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0f6849]/15 dark:bg-[#c8ef70]/15 px-2 py-0.5 text-[9.5px] font-extrabold text-[#0f6849] dark:text-[#c8ef70]">
                        <Building2 size={10} />
                        <span>Khusus {ann.target_university}</span>
                      </span>
                    ) : null}
                    <span className="text-xs font-black text-[#10261b] dark:text-white leading-tight">
                      {ann.judul}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#425549] dark:text-white/80 leading-relaxed">
                    {ann.pesan}
                  </p>

                  {ann.tautan && (
                    <a
                      href={ann.tautan}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#0f6849] dark:text-[#c8ef70] hover:underline"
                    >
                      <span>Buka Tautan Terkait</span>
                      <ArrowUpRight size={13} />
                    </a>
                  )}
                </div>
              </div>

              {/* Dismiss Button (X) - Only render if not emergency sticky */}
              {!isEmergency && (
                <button
                  type="button"
                  onClick={() => handleDismiss(ann.id)}
                  className="shrink-0 rounded-lg p-1 text-[#657d70] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#10261b] dark:hover:text-white transition cursor-pointer"
                  title="Tutup pengumuman ini"
                  aria-label="Tutup pengumuman"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
