"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Share, PlusSquare, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(true); // default true until checked

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            // Successfully registered
          })
          .catch((err) => {
            console.error("SW registration failed: ", err);
          });
      });
    }

    // 2. Check if already installed / running standalone (PWA mode)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return; // Don't show prompt if already installed!

    // 3. Check dismissed flag from sessionStorage (so we don't spam every page navigation)
    const isDismissed = sessionStorage.getItem("ngampus-pwa-dismissed") === "true";
    setDismissed(isDismissed);

    // 4. Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 5. Listen for Android / Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("ngampus-pwa-dismissed", "true");
  };

  // Don't render anything if standalone or dismissed or not on mobile/installable
  if (isStandalone || dismissed) return null;
  if (!isInstallable && !isIOS) return null;

  return (
    <aside
      aria-label="PWA Install Prompt"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 sm:bottom-6 sm:right-6 sm:left-auto"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#b9ddc6] bg-white p-4 shadow-[0_12px_36px_rgba(16,54,38,0.18)] dark:border-[#1e4d35] dark:bg-[#0c2419]">
        {/* Decorative corner accent */}
        <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[var(--brand)]/10 blur-xl pointer-events-none" />

        <div className="flex items-start gap-3.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f6849] to-[#15825d] p-1.5 shadow-md">
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS App Icon"
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
            />
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black tracking-tight text-[#103626] dark:text-[#e2f3e8]">
                Pasang Aplikasi ngampUS
              </h3>
              <span className="rounded-full bg-[#dff3e5] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#0f6849] dark:bg-[#15462f] dark:text-[#a7e8bd]">
                Apps
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#557e67] dark:text-[#8cb89f] leading-snug">
              Buka lebih cepat, tanpa browser bar, dan terasa seperti aplikasi native di HP kamu.
            </p>

            {/* iOS Instructions */}
            {isIOS && !isInstallable ? (
              <div className="mt-2.5 rounded-xl bg-[#f2faf5] p-2.5 text-[11px] font-medium text-[#103626] dark:bg-[#113323] dark:text-[#c4ead3]">
                <p className="flex items-center gap-1.5 font-bold text-[#0f6849] dark:text-[#7ee2a8]">
                  <Smartphone size={13} /> Cara pasang di iPhone / iPad:
                </p>
                <ol className="mt-1 list-decimal pl-4 space-y-0.5 text-[10.5px]">
                  <li>
                    Tap tombol <Share className="inline-block mx-0.5" size={11} /> <strong>Share</strong> di Safari bawah
                  </li>
                  <li>
                    Pilih <PlusSquare className="inline-block mx-0.5" size={11} /> <strong>Add to Home Screen</strong>
                  </li>
                </ol>
              </div>
            ) : (
              /* Android / Chrome Install Button */
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--brand-dark)] active:scale-95"
                >
                  <Download size={14} />
                  Install ke Layar Utama
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-xl px-2.5 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  Nanti Saja
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup prompt install"
            className="absolute top-2.5 right-2.5 rounded-lg p-1 text-[#8fa599] hover:bg-black/5 hover:text-[#103626] dark:hover:bg-white/10 dark:hover:text-white transition"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
