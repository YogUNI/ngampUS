"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ArrowUpRight, BarChart3, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, GraduationCap, LayoutDashboard, LogOut, Menu, Plus,
  Settings, Sparkles, UsersRound, X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/dashboard",   label: "Dashboard",  note: "Peta fokus",       icon: LayoutDashboard },
  { href: "/kegiatan",    label: "Kegiatan",   note: "Semua komitmen",    icon: CalendarDays    },
  { href: "/organisasi",  label: "Organisasi", note: "Ruang kontribusi",  icon: UsersRound      },
  { href: "/semester",    label: "Semester",   note: "Konteks akademik",  icon: GraduationCap   },
  { href: "/rekap",       label: "Rekap",      note: "Jejak progres",     icon: BarChart3       },
];

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP SIDEBAR (Well-proportioned, comfortably filled height, zero scrolling)
// ─────────────────────────────────────────────────────────────────────────────
export function Sidebar({ name, activeSemester }: { name: string; activeSemester?: string }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside
      className={`dashboard-sidebar sticky top-0 flex h-screen shrink-0 flex-col justify-between overflow-hidden border-r border-[#d8e2da] px-3.5 py-5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        collapsed ? "w-[72px]" : "w-72"
      }`}
    >
      {/* ── TOP & MIDDLE SECTION: Logo, Semester, Nav, CTA ── */}
      <div className="flex flex-col min-w-0">
        
        {/* Logo */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? "justify-center" : ""}`}
          >
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={38}
              height={38}
              className="h-9 w-9 shrink-0 object-contain drop-shadow-xs"
              priority
            />
            {!collapsed && (
              <span>
                <span className="font-display block text-2xl font-black tracking-[-.06em] leading-tight">
                  ngamp<span className="text-[var(--brand)]">US</span>
                </span>
                <span className="block text-[9px] font-black tracking-[.16em] text-[var(--muted)] leading-none mt-0.5">
                  CAMPUS CONSOLE
                </span>
              </span>
            )}
          </Link>

          {/* Collapse toggle button */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            className={`rounded-xl p-1.5 text-[var(--muted)] transition hover:bg-[#eaf5eb] hover:text-[#103626] ${collapsed ? "mx-auto mt-1" : ""}`}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Active Semester Card */}
        {!collapsed ? (
          <Link
            href="/semester"
            className="mt-4 rounded-2xl border border-[#d7e3d9] bg-white/85 p-3 text-left shadow-xs transition hover:border-[#a9cdb2]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="block text-[9.5px] font-black tracking-[.14em] text-[var(--muted)]">AKTIF SEKARANG</span>
                <b className="mt-0.5 block truncate text-sm font-extrabold text-[var(--ink)]">{activeSemester || "Pilih semester"}</b>
              </div>
              <ChevronDown className="shrink-0 text-[var(--brand)]" size={16} />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[var(--brand)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c8ef70] shadow-[0_0_0_2.5px_#dff3e5]" />
              Semester control
            </div>
          </Link>
        ) : (
          <Link
            href="/semester"
            title={activeSemester || "Pilih semester"}
            className="mx-auto mt-4 grid h-9 w-9 place-items-center rounded-xl border border-[#d7e3d9] bg-white text-[var(--brand)] shadow-xs transition hover:border-[#a9cdb2]"
          >
            <GraduationCap size={16} />
          </Link>
        )}

        {/* Main Navigation Links */}
        <nav className="mt-4 space-y-1.5">
          {nav.map(({ href, label, note, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                title={collapsed ? label : undefined}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${
                  active
                    ? "bg-[#103626] text-white shadow-md shadow-[#103626]/15"
                    : "text-[var(--muted)] hover:bg-white hover:text-[#103626]"
                } ${collapsed ? "justify-center" : ""}`}
                href={href}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    active
                      ? "bg-[#c8ef70] text-[#103626]"
                      : "bg-[#e7eee7] text-[#50705e] group-hover:bg-[#dff3e5] group-hover:text-[#0f6849]"
                  }`}
                >
                  <Icon size={17} />
                </span>
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold leading-tight">{label}</span>
                      <span className={`block truncate text-[10.5px] ${active ? "text-[#bdd0c2]" : "text-[#829187]"}`}>
                        {note}
                      </span>
                    </span>
                    {active && <ArrowUpRight size={14} className="text-[#c8ef70]" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA Catat Kegiatan */}
        {!collapsed ? (
          <Link
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#c8ef70] px-3.5 py-3 text-sm font-black text-[#103626] shadow-[0_4px_0_#84a839] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#84a839]"
            href="/kegiatan?new=1"
          >
            <Plus size={17} strokeWidth={3} /> Catat kegiatan
          </Link>
        ) : (
          <Link
            href="/kegiatan?new=1"
            title="Catat kegiatan"
            className="mx-auto mt-4 grid h-9 w-9 place-items-center rounded-xl bg-[#c8ef70] text-[#103626] shadow-[0_3px_0_#84a839] transition hover:-translate-y-0.5"
          >
            <Plus size={17} strokeWidth={3} />
          </Link>
        )}
      </div>

      {/* ── BOTTOM SECTION: User Card Footer ── */}
      <div className="pt-3">
        {!collapsed ? (
          <div className="rounded-2xl border border-[#d8e2da] bg-white/80 p-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#103626] text-xs font-black text-[#c8ef70]">
                {name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs sm:text-sm font-extrabold text-[var(--ink)]">{name}</p>
                <p className="text-[10px] font-bold text-[var(--muted)]">Personal workspace</p>
              </div>
              <button
                onClick={signOut}
                title="Keluar"
                className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#fff0ec] hover:text-[#b93c21] transition"
              >
                <LogOut size={16} />
              </button>
            </div>
            <div className="mt-2.5 flex gap-1.5 border-t border-[#e3ebe4] pt-2">
              <Link
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold text-[var(--muted)] hover:bg-[#eaf5eb] hover:text-[var(--brand)] transition"
                href="/settings"
              >
                <Settings size={14} /> Profil
              </Link>
              <Link
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold text-[var(--muted)] hover:bg-[#eaf5eb] hover:text-[var(--brand)] transition"
                href="#"
              >
                <CircleHelp size={14} /> Bantuan
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/settings"
              title="Profil & Pengaturan"
              className="grid h-9 w-9 place-items-center rounded-full bg-[#103626] text-xs font-black text-[#c8ef70] hover:ring-2 hover:ring-[#c8ef70]/50 transition"
            >
              {name.slice(0, 1).toUpperCase()}
            </Link>
            <button
              onClick={signOut}
              title="Keluar"
              className="rounded-xl p-2 text-[var(--muted)] hover:bg-[#fff0ec] hover:text-[#b93c21] transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE TOPBAR + DRAWER
// ─────────────────────────────────────────────────────────────────────────────
export function MobileTopbar({ name, activeSemester }: { name: string; activeSemester?: string }) {
  const [open, setOpen] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#d8e2da] bg-white/90 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)] bg-[#f7f8f5] text-[var(--ink)]"
            aria-label="Buka menu"
          >
            <Menu size={18} />
          </button>
          <Link href="/dashboard" className="inline-flex items-center gap-2">
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={26}
              height={26}
              className="h-6 w-6 object-contain"
            />
            <span className="font-display text-lg font-black tracking-tight leading-none">
              ngamp<span className="text-[var(--brand)]">US</span>
            </span>
          </Link>
        </div>

        <Link
          href="/kegiatan?new=1"
          className="inline-flex items-center gap-1 rounded-xl bg-[#c8ef70] px-3 py-1.5 text-xs font-black text-[#103626]"
        >
          <Plus size={14} /> Catat
        </Link>
      </header>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 flex h-full w-[280px] flex-col justify-between bg-white p-5 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Image
                    src="/logo_ngampUS.png"
                    alt="ngampUS Logo"
                    width={30}
                    height={30}
                    className="h-7 w-7 object-contain"
                  />
                  <span className="font-display text-xl font-black">
                    ngamp<span className="text-[var(--brand)]">US</span>
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#f7f8f5]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Active semester mobile badge */}
              {activeSemester && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#dff3e5] px-3 py-2 text-xs font-bold text-[#0f6849]">
                  <span className="truncate">{activeSemester}</span>
                  <span className="rounded-full bg-[#0f6849] px-1.5 py-0.5 text-[9px] text-white">Aktif</span>
                </div>
              )}

              {/* Mobile Nav */}
              <nav className="mt-4 space-y-1.5">
                {nav.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                        active
                          ? "bg-[#103626] text-white shadow-sm"
                          : "text-[var(--muted)] hover:bg-[#f7f8f5] hover:text-[var(--ink)]"
                      }`}
                    >
                      <Icon size={18} className={active ? "text-[#c8ef70]" : ""} />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom user footer drawer */}
            <div className="border-t border-[var(--line)] pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#103626] text-xs font-bold text-[#c8ef70]">
                    {name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{name}</p>
                    <Link href="/settings" className="text-[10px] font-bold text-[var(--brand)] hover:underline">
                      Profil & Akun
                    </Link>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  title="Keluar"
                  className="rounded-lg p-2 text-[var(--muted)] hover:bg-[#fff0ec] hover:text-[#b93c21]"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE BOTTOM NAVIGATION (Fixed 5 tabs for fast thumb navigation)
// ─────────────────────────────────────────────────────────────────────────────
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[#d8e2da] bg-white/95 px-2 py-2 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-extrabold transition active:scale-95 ${
              active ? "text-[#0f6849]" : "text-[var(--muted)] opacity-70 hover:opacity-100"
            }`}
          >
            <span
              className={`grid h-7 w-7 place-items-center rounded-xl transition ${
                active ? "bg-[#dff3e5] text-[#0f6849]" : ""
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 2} />
            </span>
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
