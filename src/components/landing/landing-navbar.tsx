"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, LogIn, Sparkles } from "lucide-react";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";

interface NavLinkItem {
  name: string;
  href: string;
  sectionId: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { name: "Fitur Utama", href: "#features", sectionId: "features" },
  { name: "Alur Kerja", href: "#how-it-works", sectionId: "how-it-works" },
  { name: "FAQ", href: "#faq", sectionId: "faq" },
];

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Scrollspy & Scrolled state listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 40);

      const sectionIds = ["features", "how-it-works", "faq"];
      const scrollPosition = scrollY + 160;

      let current = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const yOffset = -90;
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <>
      {/* ── Outer Floating Header Container ── */}
      <header className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 transition-all duration-300">
        <nav
          aria-label="Navigasi Utama"
          className={`relative mx-auto flex items-center justify-between rounded-full px-3.5 py-2 sm:px-6 sm:py-2.5 transition-all duration-300 border ${
            isScrolled
              ? "border-[#10261b]/15 bg-white/95 shadow-[0_12px_36px_rgb(0,0,0,0.08)] backdrop-blur-2xl"
              : "border-[#10261b]/10 bg-[#fafaf7]/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl"
          }`}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg sm:text-xl font-black tracking-tight shrink-0 active:scale-95 transition focus-visible:ring-2 focus-visible:ring-[#0f6849] focus-visible:outline-hidden rounded-full py-1 px-1.5"
            aria-label="Kembali ke beranda ngampUS"
          >
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={32}
              height={32}
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-xs transition-transform duration-200 hover:rotate-3"
              priority
            />
            <span className="text-[#10261b]">
              ngamp<span className="text-[#0f6849]">US</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#0f6849] bg-[#dff3e5] px-2 py-0.5 rounded-full ml-1">
              <Sparkles size={11} /> Mahasiswa
            </span>
          </Link>

          {/* Desktop Navigation Links (True absolute center inside pill navbar) */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-bold absolute left-1/2 -translate-x-1/2 pointer-events-auto">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className={`relative px-3.5 py-1.5 rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#0f6849] focus-visible:outline-hidden ${
                    isActive
                      ? "text-[#0f6849] bg-[#dff3e5]/70 font-black"
                      : "text-[#55675b] hover:text-[#10261b] hover:bg-black/[0.04]"
                  }`}
                >
                  <span>{link.name}</span>
                </a>
              );
            })}
          </div>

          {/* Desktop Buttons (tablet & desktop: >= sm) */}
          <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm font-bold">
            <PwaInstallButton
              variant="navbar"
              className="border border-[#0f6849]/20 bg-[#0f6849]/5 text-[#0f6849] hover:bg-[#0f6849]/15 transition active:scale-95 py-2 px-3.5 text-xs"
            />
            <Link
              href="/login"
              className="rounded-full px-3.5 py-2 text-[#55675b] hover:text-[#10261b] hover:bg-black/[0.05] transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0f6849] focus-visible:outline-hidden"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-full px-4 sm:px-5 py-2 sm:py-2.5 font-bold transition-all hover:-translate-y-0.5 active:scale-95 bg-[#0f6849] text-white shadow-xs hover:bg-[#0b4d36] focus-visible:ring-2 focus-visible:ring-[#0f6849] focus-visible:outline-hidden flex items-center gap-1.5"
            >
              <span>Daftar Gratis</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile View Header (< sm): Compact CTA + Drawer Menu Button */}
          <div className="flex sm:hidden items-center gap-1.5">
            <PwaInstallButton
              variant="navbar"
              className="border border-[#0f6849]/20 bg-[#0f6849]/5 text-[#0f6849] px-2.5 py-1.5 text-[11px]"
            />
            <Link
              href="/login"
              className="rounded-full px-2.5 py-1.5 text-xs font-bold text-[#10261b] hover:bg-black/5 transition"
            >
              Masuk
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-drawer"
              className="ml-0.5 grid h-9 w-9 place-items-center rounded-full bg-black/5 text-[#10261b] hover:bg-black/10 transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0f6849] focus-visible:outline-hidden"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-20 left-3.5 right-3.5 rounded-3xl border border-[#dbe5dc] bg-white p-5 text-[#10261b] shadow-2xl animate-in slide-in-from-top-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#edf2ee] pb-3.5">
              <div className="flex items-center gap-2 font-display text-base font-black">
                <Image
                  src="/logo_ngampUS.png"
                  alt="ngampUS Logo"
                  width={26}
                  height={26}
                  className="h-6 w-6 object-contain"
                />
                <span>
                  ngamp<span className="text-[#0f6849]">US</span>
                </span>
              </div>
              <span className="rounded-full bg-[#dff3e5] px-2.5 py-0.5 text-[10px] font-bold text-[#0f6849]">
                Workspace Mahasiswa
              </span>
            </div>

            {/* Quick Menu Links */}
            <div className="mt-3 flex flex-col space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.sectionId;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    className={`min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm font-bold transition flex items-center justify-between ${
                      isActive
                        ? "bg-[#dff3e5] text-[#0f6849] font-black"
                        : "text-[#55675b] hover:bg-[#f5f8f5] hover:text-[#10261b]"
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0f6849]" />
                    )}
                  </a>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 flex flex-col gap-2.5 border-t border-[#edf2ee] pt-4">
              <PwaInstallButton
                variant="navbar"
                className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#f5f8f5] border border-[#dbe5dc] py-2.5 text-sm font-bold text-[#10261b] hover:bg-[#edf2ee] active:scale-98"
              />
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#0f6849] py-3 text-sm font-bold text-white shadow-xs hover:bg-[#0b4d36] active:scale-98"
              >
                <span>Mulai Petakan Semestermu</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#dbe5dc] bg-white py-2.5 text-sm font-bold text-[#10261b] hover:bg-[#f5f8f5] active:scale-98"
              >
                <LogIn size={15} />
                <span>Masuk Akun</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
