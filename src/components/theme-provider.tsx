"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_STORAGE_KEY = "ngampus-theme";

function applyThemeToDom(t: Theme, path?: string) {
  if (typeof window === "undefined") return;
  const currentPath = path !== undefined ? path : window.location.pathname;
  const isDashboard = Boolean(
    currentPath &&
      (currentPath.startsWith("/admin") ||
        currentPath.startsWith("/dashboard") ||
        currentPath.startsWith("/kegiatan") ||
        currentPath.startsWith("/jadwal") ||
        currentPath.startsWith("/modul") ||
        currentPath.startsWith("/organisasi") ||
        currentPath.startsWith("/rekap") ||
        currentPath.startsWith("/semester") ||
        currentPath.startsWith("/settings"))
  );

  const root = document.documentElement;
  if (!isDashboard) {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    return;
  }

  if (t === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const pathname = usePathname();

  useEffect(() => {
    // Read from localStorage or system preference on mount
    let initial: Theme = "light";
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark") {
        initial = stored;
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        initial = prefersDark ? "dark" : "light";
      }
    } catch {
      initial = "light";
    }

    setThemeState(initial);
    applyThemeToDom(initial, window.location.pathname);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const currentStored = localStorage.getItem(THEME_STORAGE_KEY);
        if (!currentStored) {
          const newTheme: Theme = e.matches ? "dark" : "light";
          setThemeState(newTheme);
          applyThemeToDom(newTheme, window.location.pathname);
        }
      } catch {}
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    applyThemeToDom(theme, pathname);
  }, [pathname, theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {}
    applyThemeToDom(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      applyThemeToDom(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
