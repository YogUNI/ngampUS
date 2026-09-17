"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, LogIn } from "lucide-react";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <>
      <nav className="hero-stagger-1 relative z-30 mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/15 bg-white/[.07] px-3.5 py-2.5 sm:px-6 sm:py-3 backdrop-blur-xl">
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 font-display text-lg sm:text-xl font-black tracking-[-.06em] shrink-0"
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

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold text-[#cad7ce]">
          <a href="#features" className="hover:text-white transition">Fitur Utama</a>
          <a href="#how-it-works" className="hover:text-white transition">Cara Kerja</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
        </div>

        {/* Desktop Buttons (tablet & desktop: >= sm) */}
        <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm font-bold">
          <Link 
            href="/login" 
            className="rounded-full px-3.5 py-2 text-[#c9dbce] hover:bg-white/10 hover:text-white transition"
          >
            Masuk
          </Link>
          <Link 
            href="/register" 
            className="rounded-full bg-[#c8ef70] px-4 sm:px-5 py-2 sm:py-2.5 text-[#103626] font-black shadow-[0_4px_14px_rgba(200,239,112,.35)] transition-all hover:-translate-y-0.5 hover:bg-[#d6f888]"
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
            className="rounded-full bg-[#c8ef70] px-3 py-1.5 text-xs font-black text-[#103626] shadow-xs"
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

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300 md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-18 left-3.5 right-3.5 rounded-3xl border border-white/20 bg-[#0c281c] p-5 text-white shadow-2xl animate-in slide-in-from-top-4 duration-200"
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
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-[#cad7ce] hover:bg-white/10 hover:text-white transition"
              >
                Fitur Utama
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-[#cad7ce] hover:bg-white/10 hover:text-white transition"
              >
                Cara Kerja
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-[#cad7ce] hover:bg-white/10 hover:text-white transition"
              >
                Pertanyaan Umum (FAQ)
              </a>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4">
              <Link 
                href="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8ef70] py-3 text-sm font-black text-[#103626] shadow-md shadow-[#c8ef70]/25"
              >
                <span>Mulai Petakan Semestermu</span>
                <ArrowRight size={16} />
              </Link>
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
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
