"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Clock, ShieldAlert, LogOut, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { performSignOut } from "@/lib/auth-logout";

// Storage keys
const ACTIVITY_KEY = "ngampus_last_active_ts";
const TIMEOUT_CONFIG_KEY = "ngampus_idle_timeout_mins";

// Default settings:
// Default: 30 menit idle timeout.
// Warning dialog muncul ketika sisa waktu <= 60 detik (1 menit).
const DEFAULT_TIMEOUT_MINS = 30;
const WARNING_BEFORE_SECONDS = 60;

export function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Dialog warning modal state
  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_BEFORE_SECONDS);
  const isLoggingOutRef = useRef(false);

  // Check if current route is authenticated where auto-logout should be active
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/kegiatan") ||
    pathname.startsWith("/jadwal") ||
    pathname.startsWith("/modul") ||
    pathname.startsWith("/organisasi") ||
    pathname.startsWith("/semester") ||
    pathname.startsWith("/rekap") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin");

  const getTimeoutMs = useCallback(() => {
    if (typeof window === "undefined") return DEFAULT_TIMEOUT_MINS * 60 * 1000;
    const stored = localStorage.getItem(TIMEOUT_CONFIG_KEY);
    const mins = stored ? parseInt(stored, 10) : DEFAULT_TIMEOUT_MINS;
    // Safety bounds: min 5 minutes, max 240 minutes (4 hours)
    const validMins = isNaN(mins) || mins < 5 || mins > 240 ? DEFAULT_TIMEOUT_MINS : mins;
    return validMins * 60 * 1000;
  }, []);

  const performLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setWarningOpen(false);

    await performSignOut("/login?error=session_expired");
  }, []);

  const recordActivity = useCallback(() => {
    if (!isProtectedRoute) return;
    const now = Date.now();
    try {
      localStorage.setItem(ACTIVITY_KEY, String(now));
    } catch {}

    // If warning was open and user interacts, dismiss warning
    if (warningOpen) {
      setWarningOpen(false);
      setSecondsRemaining(WARNING_BEFORE_SECONDS);
    }
  }, [isProtectedRoute, warningOpen]);

  // Set initial activity timestamp when mounting protected route
  useEffect(() => {
    if (isProtectedRoute) {
      const existing = localStorage.getItem(ACTIVITY_KEY);
      if (!existing) {
        localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
      }
    }
  }, [isProtectedRoute]);

  // Listen to interactive user gestures across window
  useEffect(() => {
    if (!isProtectedRoute) return;

    let throttleTimer: NodeJS.Timeout | null = null;
    const handleUserInteraction = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        recordActivity();
        throttleTimer = null;
      }, 1000); // Throttled to once every 1s
    };

    const events: (keyof WindowEventMap)[] = [
      "mousedown",
      "mousemove",
      "keydown",
      "touchstart",
      "scroll",
      "click",
      "focus",
    ];

    events.forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, { passive: true });
    });

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction);
      });
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [isProtectedRoute, recordActivity]);

  // Periodic heartbeat checker every 1000ms
  useEffect(() => {
    if (!isProtectedRoute) {
      setWarningOpen(false);
      return;
    }

    const interval = setInterval(() => {
      const stored = localStorage.getItem(ACTIVITY_KEY);
      const lastActive = stored ? parseInt(stored, 10) : Date.now();
      const now = Date.now();
      const timeoutMs = getTimeoutMs();
      const elapsed = now - lastActive;
      const remainingMs = timeoutMs - elapsed;

      if (remainingMs <= 0) {
        // Time is up -> execute logout
        clearInterval(interval);
        performLogout();
      } else if (remainingMs <= WARNING_BEFORE_SECONDS * 1000) {
        // Enter countdown warning mode
        const secsLeft = Math.max(1, Math.ceil(remainingMs / 1000));
        setSecondsRemaining(secsLeft);
        setWarningOpen(true);
      } else {
        if (warningOpen) {
          setWarningOpen(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isProtectedRoute, getTimeoutMs, performLogout, warningOpen]);

  return (
    <>
      {children}

      {/* ── Modal Dialog Peringatan Sesi Habis (Idle Warning) ── */}
      {warningOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-sm rounded-[24px] border border-amber-500/30 bg-[#0e1d15] text-[#ecf5ee] p-6 shadow-2xl shadow-black/80 ring-1 ring-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Sesi Segera Berakhir</span>
                </h3>
                <p className="text-xs text-[#8caea0] mt-0.5">
                  Tidak ada aktivitas terdeteksi.
                </p>
              </div>
            </div>

            <div className="my-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-center">
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Demi keamanan data kampusmu, kamu akan otomatis keluar dalam:
              </p>
              <div className="mt-2 font-mono text-3xl font-extrabold tracking-wider text-amber-400">
                {secondsRemaining}s
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={performLogout}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-[#8caea0] hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <LogOut size={13} />
                <span>Keluar Sekarang</span>
              </button>

              <button
                type="button"
                onClick={recordActivity}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0f6849] to-[#22c55e] py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-950/40 hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                <Activity size={13} />
                <span>Tetap Masuk</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
