"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "ngampus-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const pathname = usePathname();

  useEffect(() => {
    // Read from localStorage or system preference
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      applyTheme(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial: Theme = prefersDark ? "dark" : "light";
      setThemeState(initial);
      applyTheme(initial);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const currentStored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!currentStored) {
        const newTheme: Theme = e.matches ? "dark" : "light";
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    applyTheme(theme, pathname);
  }, [pathname, theme]);

  const applyTheme = (t: Theme, currentPath?: string) => {
    const path = currentPath !== undefined ? currentPath : (typeof window !== "undefined" ? window.location.pathname : "");
    const isDashboard = Boolean(path && (path.startsWith("/dashboard") || path.startsWith("/kegiatan") || path.startsWith("/jadwal") || path.startsWith("/modul") || path.startsWith("/organisasi") || path.startsWith("/rekap") || path.startsWith("/semester") || path.startsWith("/settings")));
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
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {}
    applyTheme(t);
  };

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

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

