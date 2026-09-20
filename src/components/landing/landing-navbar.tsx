"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, LogIn } from "lucide-react";

interface NavLinkItem {
  name: string;
  href: string;
  sectionId: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { name: "Fitur Utama", href: "#features", sectionId: "features" },
  { name: "Cara Kerja", href: "#how-it-works", sectionId: "how-it-works" },
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
      const scrollPosition = scrollY + 180; // Offset for navbar height

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

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const yOffset = -90; // Navbar offset
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
          className={`hero-stagger-1 relative mx-auto flex items-center justify-between rounded-full border border-white/15 px-3.5 py-2.5 sm:px-6 sm:py-3 transition-all duration-300 ${
            isScrolled
              ? "bg-white/[.12] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] ring-1 ring-white/10"
              : "bg-white/[.07] backdrop-blur-xl"
          }`}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg sm:text-xl font-black tracking-[-.06em] shrink-0 active:scale-95 transition"
          >
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={32}
              height={32}
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-xs"
              priority
            />
            <span className="text-white">
              ngamp<span className="text-[#c8ef70]">US</span>
            </span>
          </Link>

          {/* Desktop Navigation Links — pure glass, no black bg, clean active text indicator */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-[#cad7ce]">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className={`relative py-1 transition-all duration-200 ${
                    isActive
                      ? "text-[#c8ef70] font-black"
                      : "text-[#cad7ce] hover:text-white"
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#c8ef70] shadow-[0_0_8px_#c8ef70]" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Desktop Buttons (tablet & desktop: >= sm) */}
          <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm font-bold">
            <Link
              href="/login"
              className="rounded-full px-3.5 py-2 text-[#c9dbce] hover:bg-white/10 hover:text-white transition active:scale-95"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#c8ef70] px-4 sm:px-5 py-2 sm:py-2.5 text-[#103626] font-black shadow-[0_4px_14px_rgba(200,239,112,.35)] transition-all hover:-translate-y-0.5 hover:bg-[#d6f888] active:scale-95"
            >
              Mulai Gratis →
            </Link>
          </div>

          {/* Mobile View Header (< sm): Compact CTA + Drawer Menu Button */}
          <div className="flex sm:hidden items-center gap-1.5">
            <Link
              href="/login"
              className="rounded-full px-2.5 py-1 text-xs font-bold text-[#c9dbce] hover:text-white transition"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#c8ef70] px-3 py-1.5 text-xs font-black text-[#103626] shadow-xs active:scale-95 transition"
            >
              Mulai →
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
              className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
            >
              {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300 md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-20 left-3.5 right-3.5 rounded-3xl border border-white/20 bg-[#0c281c] p-5 text-white shadow-2xl animate-in slide-in-from-top-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-2 font-display text-base font-black">
                <Image
                  src="/logo_ngampUS.png"
                  alt="ngampUS Logo"
                  width={26}
                  height={26}
                  className="h-6 w-6 object-contain"
                />
                <span>
                  ngamp<span className="text-[#c8ef70]">US</span>
                </span>
              </div>
              <span className="rounded-full bg-[#c8ef70]/15 px-2.5 py-0.5 text-[10px] font-black text-[#c8ef70]">
                v2.4 READY
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
                    className={`rounded-xl px-3.5 py-2.5 text-sm font-bold transition flex items-center justify-between ${
                      isActive
                        ? "bg-white/10 text-[#c8ef70] font-black"
                        : "text-[#cad7ce] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c8ef70] shadow-[0_0_6px_#c8ef70]" />
                    )}
                  </a>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8ef70] py-3 text-sm font-black text-[#103626] shadow-md shadow-[#c8ef70]/25 active:scale-98"
              >
                <span>Mulai Petakan Semestermu</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-2.5 text-sm font-bold text-white hover:bg-white/10 active:scale-98"
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
