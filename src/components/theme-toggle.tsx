"use client";

import React, { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

const emptySubscribe = () => () => {};

export function ThemeToggle({
  variant = "pill",
  className = "",
}: {
  variant?: "pill" | "icon" | "minimal";
  className?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  // Safe client-side mount detection without cascading renders
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl bg-transparent p-2 text-transparent ${className}`}
        aria-hidden="true"
      >
        <span className="h-4 w-4" />
      </div>
    );
  }

  const isDark = theme === "dark";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
        title={isDark ? "Mode Terang (Light)" : "Mode Gelap (Dark)"}
        className={`group relative grid h-8 w-8 place-items-center rounded-xl border border-[var(--line)] bg-[var(--background)] text-[var(--muted)] transition-all duration-200 hover:border-[var(--brand)] hover:text-[var(--brand)] active:scale-95 ${className}`}
      >
        {isDark ? (
          <Sun size={15} className="text-[#c8ef70] transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon size={15} className="text-[#0f6849] transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-bold text-[var(--muted)] hover:bg-[var(--line)]/20 hover:text-[var(--ink)] transition ${className}`}
      >
        <span className="flex items-center gap-2">
          {isDark ? <Sun size={14} className="text-[#c8ef70]" /> : <Moon size={14} className="text-[var(--brand)]" />}
          <span>{isDark ? "Mode Gelap" : "Mode Terang"}</span>
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--brand)]">
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={isDark ? "Mode Terang (Light)" : "Mode Gelap (Dark)"}
      className={`relative flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-bold text-[var(--ink)] shadow-xs transition-all duration-200 hover:border-[var(--brand)]/40 hover:shadow-sm active:scale-95 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun size={14} className="text-[#c8ef70] transition-transform duration-300 rotate-0" />
        ) : (
          <Moon size={14} className="text-[#0f6849] transition-transform duration-300 rotate-0" />
        )}
      </div>
      <span className="text-[11px] font-extrabold tracking-tight">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
