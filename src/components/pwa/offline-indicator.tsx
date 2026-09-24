"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    // Initial check
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[92%] sm:w-auto transition-all duration-300 animate-in fade-in slide-in-from-top-3"
    >
      {isOffline ? (
        <div className="flex items-center justify-center gap-2.5 px-4 py-2 rounded-full bg-[#18181b]/95 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-xl backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Koneksi terputus &bull; Mode Offline Aktif</span>
        </div>
      ) : showReconnected ? (
        <div className="flex items-center justify-center gap-2.5 px-4 py-2 rounded-full bg-[#0a2016]/95 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-xl backdrop-blur-md">
          <Wifi className="w-3.5 h-3.5 text-[#c8ef70] shrink-0" />
          <span>Koneksi terhubung kembali</span>
        </div>
      ) : null}
    </div>
  );
}
