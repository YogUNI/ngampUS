"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Global cached prompt event so any button on the page can trigger it
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let promptListenersInitialized = false;

interface PwaInstallButtonProps {
  variant?: "navbar" | "mobile-icon" | "sidebar" | "hero";
  className?: string;
}

export function PwaInstallButton({ variant = "navbar", className = "" }: PwaInstallButtonProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isApple);

    if (!promptListenersInitialized) {
      window.addEventListener("beforeinstallprompt", (e: Event) => {
        e.preventDefault();
        globalDeferredPrompt = e as BeforeInstallPromptEvent;
        window.dispatchEvent(new CustomEvent("pwa-prompt-available"));
      });
      window.addEventListener("appinstalled", () => {
        globalDeferredPrompt = null;
        window.dispatchEvent(new CustomEvent("pwa-installed"));
      });
      promptListenersInitialized = true;
    }

    const checkPrompt = () => {
      if (globalDeferredPrompt) {
        setCanInstall(true);
      }
    };

    checkPrompt();

    const handlePromptAvail = () => setCanInstall(true);
    const handleInstalled = () => {
      setCanInstall(false);
      setIsStandalone(true);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 4000);
    };

    window.addEventListener("pwa-prompt-available", handlePromptAvail);
    window.addEventListener("pwa-installed", handleInstalled);

    return () => {
      window.removeEventListener("pwa-prompt-available", handlePromptAvail);
      window.removeEventListener("pwa-installed", handleInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (globalDeferredPrompt) {
      globalDeferredPrompt.prompt();
      const choice = await globalDeferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setCanInstall(false);
      }
      globalDeferredPrompt = null;
      return;
    }

    // If iOS or browser doesn't expose beforeinstallprompt directly, show instructions modal
    setShowIOSModal(true);
  };

  // If already running inside PWA standalone app, don't show the install button
  if (isStandalone && !installedSuccess) return null;

  // 1. Variant: Navbar (Landing page top header)
  if (variant === "navbar") {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          title="Download & Pasang Aplikasi ngampUS"
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-xs ${className}`}
        >
          <Smartphone size={13} className="shrink-0" />
          <span>Download App</span>
        </button>

        {showIOSModal && <InstallGuideModal isIOS={isIOS} onClose={() => setShowIOSModal(false)} />}
      </>
    );
  }

  // 2. Variant: Mobile Topbar Icon (Dashboard Mobile)
  if (variant === "mobile-icon") {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          title="Pasang Aplikasi ngampUS di HP"
          aria-label="Pasang Aplikasi ngampUS di HP"
          className={`grid h-9 w-9 place-items-center rounded-xl border border-[#b9ddc6] bg-[#eaf6ee] text-[#0f6849] dark:border-[#1e4d35] dark:bg-[#113323] dark:text-[#a7e8bd] shadow-xs active:scale-95 transition cursor-pointer ${className}`}
        >
          <Download size={16} />
        </button>

        {showIOSModal && <InstallGuideModal isIOS={isIOS} onClose={() => setShowIOSModal(false)} />}
      </>
    );
  }

  // 3. Variant: Sidebar (Dashboard Desktop)
  if (variant === "sidebar") {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`group flex w-full items-center gap-2.5 rounded-xl border border-[#b9ddc6] bg-[#f2faf5] px-3 py-2 text-left text-xs font-extrabold text-[#0f6849] shadow-2xs hover:bg-[#e4f5ec] dark:border-[#1e4d35] dark:bg-[#113323]/60 dark:text-[#a7e8bd] dark:hover:bg-[#113323] transition active:scale-98 cursor-pointer ${className}`}
        >
          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#0f6849] text-white">
            <Smartphone size={13} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate leading-tight">Install Aplikasi</p>
            <p className="text-[10px] font-semibold text-[#557e67] dark:text-[#8cb89f] leading-none mt-0.5">
              Buka cepat di HP / Laptop
            </p>
          </div>
          <Download size={13} className="shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-y-0.5 transition" />
        </button>

        {showIOSModal && <InstallGuideModal isIOS={isIOS} onClose={() => setShowIOSModal(false)} />}
      </>
    );
  }

  // 4. Default / Hero
  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-black text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 cursor-pointer shadow-md ${className}`}
      >
        <Smartphone size={16} />
        <span>Install Aplikasi ngampUS</span>
      </button>

      {showIOSModal && <InstallGuideModal isIOS={isIOS} onClose={() => setShowIOSModal(false)} />}
    </>
  );
}

function InstallGuideModal({ isIOS, onClose }: { isIOS: boolean; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-[#d8e3da] bg-white p-6 shadow-2xl dark:border-[#1e4d35] dark:bg-[#0c2419] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup panduan"
          className="absolute top-4 right-4 rounded-xl p-1.5 text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0f6849] p-2 text-white shadow-md">
            <Image src="/logo_ngampUS.png" alt="ngampUS Logo" width={32} height={32} className="h-8 w-8 object-contain" />
          </div>
          <div>
            <h3 className="font-display text-base font-black text-[#103626] dark:text-[#edf5f0]">
              Pasang Aplikasi ngampUS
            </h3>
            <p className="text-xs font-semibold text-[var(--muted)]">PWA Standalone App</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-[#f2faf5] p-4 text-xs dark:bg-[#113323]/50">
          {isIOS ? (
            <div className="space-y-2.5 text-[#103626] dark:text-[#c4ead3]">
              <p className="font-bold text-[#0f6849] dark:text-[#7ee2a8] flex items-center gap-1.5">
                <Smartphone size={14} /> Panduan untuk iPhone / iPad (Safari):
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 font-medium leading-relaxed">
                <li>
                  Tap ikon <Share className="inline-block mx-0.5 text-[#0f6849]" size={13} /> <strong>Share</strong> di navigasi Safari bawah.
                </li>
                <li>
                  Scroll ke bawah lalu pilih <PlusSquare className="inline-block mx-0.5 text-[#0f6849]" size={13} /> <strong>Add to Home Screen</strong> (Tambah ke Layar Utama).
                </li>
                <li>
                  Tap <strong>Add / Tambah</strong> di pojok kanan atas. Selesai!
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-2.5 text-[#103626] dark:text-[#c4ead3]">
              <p className="font-bold text-[#0f6849] dark:text-[#7ee2a8] flex items-center gap-1.5">
                <Smartphone size={14} /> Panduan untuk Android / Chrome:
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 font-medium leading-relaxed">
                <li>
                  Tap tombol <strong>titik tiga (⋮)</strong> di browser Chrome kanan atas.
                </li>
                <li>
                  Pilih menu <strong>Install app</strong> atau <strong>Tambahkan ke Layar Utama</strong>.
                </li>
                <li>
                  Konfirmasi pemasangan. Aplikasi ngampUS akan otomatis muncul di menu aplikasi HP kamu.
                </li>
              </ol>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[var(--brand)] py-2.5 text-xs font-black text-white hover:bg-[var(--brand-dark)] transition active:scale-95"
        >
          Mengerti, Tutup
        </button>
      </div>
    </div>
  );
}
