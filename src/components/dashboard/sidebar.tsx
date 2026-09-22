"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ArrowUpRight, BarChart3, BookOpen, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, FolderOpen, GraduationCap, LayoutDashboard, LogOut, Menu, Plus,
  Settings, ShieldAlert, Sparkles, User, UsersRound, X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/dashboard",   label: "Dashboard",     note: "Peta fokus",       icon: LayoutDashboard },
  { href: "/kegiatan",    label: "Kegiatan",      note: "Semua komitmen",    icon: CalendarDays    },
  { href: "/jadwal",      label: "Jadwal Kuliah", note: "Kelas mingguan",   icon: BookOpen        },
  { href: "/modul",       label: "Modul Kuliah",  note: "Materi & arsip",   icon: FolderOpen      },
  { href: "/organisasi",  label: "Organisasi",    note: "Ruang kontribusi",  icon: UsersRound      },
  { href: "/semester",    label: "Semester",      note: "Konteks akademik",  icon: GraduationCap   },
  { href: "/rekap",       label: "Rekap",         note: "Jejak progres",     icon: BarChart3       },
];

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP SIDEBAR (Well-proportioned, comfortably filled height, zero scrolling)
// ─────────────────────────────────────────────────────────────────────────────
export function Sidebar({ 
  name, 
  avatarUrl, 
  activeSemester, 
  role = "student" 
}: { 
  name: string; 
  avatarUrl?: string | null; 
  activeSemester?: string; 
  role?: string; 
}) {
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
      className={`dashboard-sidebar sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-[#d8e2da] ${
        collapsed ? "w-[76px] px-2.5 py-3.5 items-center" : "w-72 px-3.5 py-3.5"
      } transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}
    >
      {/* ── TOP & MIDDLE SCROLLABLE SECTION: Logo, Semester, Nav, CTA ── */}
      <div className={`flex flex-1 flex-col min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${collapsed ? "w-full items-center" : ""}`}>
        
        {/* Logo & Header */}
        {!collapsed ? (
          <div className="flex items-center justify-between px-1 shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 min-w-0"
            >
              <Image
                src="/logo_ngampUS.png"
                alt="ngampUS Logo"
                width={34}
                height={34}
                className="h-8.5 w-8.5 shrink-0 object-contain drop-shadow-xs"
                priority
              />
              <span className="min-w-0">
                <span className="font-display block text-[21px] font-black tracking-[-.04em] leading-tight whitespace-nowrap">
                  ngamp<span className="text-[var(--brand)]">US</span>
                </span>
                <span className="block text-[8.5px] font-black tracking-[.18em] text-[var(--muted)] leading-none mt-0.5 whitespace-nowrap">
                  CAMPUS CONSOLE
                </span>
              </span>
            </Link>

            <button
              onClick={() => setCollapsed(true)}
              title="Ciutkan sidebar"
              className="rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[#eaf5eb] hover:text-[#103626]"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        ) : (
          /* Collapsed Header: Large Logo on Top + Expand Button */
          <div className="flex flex-col items-center gap-2 pb-1 shrink-0">
            <Link href="/dashboard" title="ngampUS Dashboard">
              <Image
                src="/logo_ngampUS.png"
                alt="ngampUS Logo"
                width={34}
                height={34}
                className="h-8.5 w-8.5 shrink-0 object-contain drop-shadow-xs transition hover:scale-105"
                priority
              />
            </Link>
            <button
              onClick={() => setCollapsed(false)}
              title="Perluas sidebar"
              className="grid h-6 w-6 place-items-center rounded-lg bg-[#eaf5eb] text-[#103626] transition hover:bg-[#d6ebd9]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Active Semester Card */}
        {!collapsed ? (
          <Link
            href="/semester"
            className="mt-2.5 rounded-2xl border border-[#d7e3d9] bg-white/90 p-2.5 text-left shadow-xs transition hover:border-[#a9cdb2] shrink-0"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="block text-[8.5px] font-black tracking-[.14em] text-[var(--muted)]">AKTIF SEKARANG</span>
                <b className="mt-0.5 block truncate text-[13px] font-extrabold text-[var(--ink)]">{activeSemester || "Pilih semester"}</b>
              </div>
              <ChevronDown className="shrink-0 text-[var(--brand)]" size={14} />
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[9.5px] font-bold text-[var(--brand)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c8ef70] shadow-[0_0_0_2px_#dff3e5]" />
              Semester control
            </div>
          </Link>
        ) : (
          <Link
            href="/semester"
            title={activeSemester || "Pilih semester"}
            className="mt-2.5 grid h-9 w-9 place-items-center rounded-xl border border-[#d7e3d9] bg-white text-[var(--brand)] shadow-xs transition hover:border-[#a9cdb2] hover:bg-[#f4faf6] shrink-0"
          >
            <GraduationCap size={17} />
          </Link>
        )}

        {/* Main Navigation Links */}
        <nav className={`mt-2.5 space-y-1 ${collapsed ? "w-full flex flex-col items-center" : ""}`}>
          {nav.map(({ href, label, note, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
            const tourId =
              href === "/jadwal"
                ? "nav-jadwal"
                : href === "/kegiatan"
                ? "nav-kegiatan"
                : href === "/modul"
                ? "nav-modul"
                : href === "/organisasi"
                ? "nav-organisasi"
                : href === "/semester"
                ? "nav-semester"
                : href === "/rekap"
                ? "nav-rekap"
                : undefined;

            return (
              <Link
                key={href}
                data-tour={tourId}
                prefetch={true}
                title={collapsed ? label : undefined}
                className={`group flex items-center rounded-xl transition ${
                  collapsed
                    ? "h-9 w-9 justify-center p-0"
                    : "gap-2.5 px-2.5 py-2"
                } ${
                  active
                    ? "bg-[#103626] text-white shadow-md shadow-[#103626]/15 dark:bg-[#153e2c] dark:shadow-black/40"
                    : "text-[var(--muted)] hover:bg-white hover:text-[#103626] dark:hover:bg-[#142b1f] dark:hover:text-[#f0f7f2]"
                }`}
                href={href}
              >
                <span
                  className={`grid shrink-0 place-items-center rounded-lg ${
                    collapsed ? "h-8 w-8" : "h-7.5 w-7.5"
                  } ${
                    active
                      ? "bg-[#c8ef70] text-[#103626] dark:bg-[#c8ef70] dark:text-[#0a2318]"
                      : "bg-[#e7eee7] text-[#50705e] group-hover:bg-[#dff3e5] group-hover:text-[#0f6849] dark:bg-[#12271c] dark:text-[#8ca393] dark:group-hover:bg-[#183a28] dark:group-hover:text-[#4ade80]"
                  }`}
                >
                  <Icon size={16} />
                </span>
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-extrabold leading-tight">{label}</span>
                      <span className={`block truncate text-[10px] ${active ? "text-[#bdd0c2] dark:text-[#9fc0a9]" : "text-[#829187] dark:text-[#6c8575]"}`}>
                        {note}
                      </span>
                    </span>
                    {active && <ArrowUpRight size={13} className="text-[#c8ef70]" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA Catat Kegiatan */}
        {!collapsed ? (
          <Link
            data-tour="nav-catat"
            className="my-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-[#c8ef70] px-3 py-2.5 text-xs font-black text-[#103626] shadow-[0_2px_0_#84a839] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#84a839] dark:bg-[#1a5c39] dark:text-[#c8ef70] dark:shadow-[0_2px_0_#0f3a24] dark:hover:bg-[#206e44] dark:active:shadow-[0_1px_0_#0f3a24] shrink-0"
            href="/kegiatan?new=1"
            prefetch={true}
          >
            <Plus size={15} strokeWidth={3} /> Catat kegiatan
          </Link>
        ) : (
          <Link
            data-tour="nav-catat"
            href="/kegiatan?new=1"
            prefetch={true}
            title="Catat kegiatan"
            className="my-2.5 grid h-9 w-9 place-items-center rounded-xl bg-[#c8ef70] text-[#103626] shadow-[0_2px_0_#84a839] transition hover:-translate-y-0.5 dark:bg-[#1a5c39] dark:text-[#c8ef70] dark:shadow-[0_2px_0_#0f3a24] dark:hover:bg-[#206e44] shrink-0"
          >
            <Plus size={16} strokeWidth={3} />
          </Link>
        )}

        {/* Superadmin Console Direct Access */}
        {role === "superadmin" && (
          !collapsed ? (
            <Link
              href="/admin"
              className="mb-2 flex items-center justify-center gap-2 rounded-xl border border-[#c8ef70]/30 bg-[#0c2419] px-3 py-2 text-xs font-black text-[#c8ef70] shadow-sm hover:bg-[#103626] hover:border-[#c8ef70]/60 transition shrink-0"
            >
              <ShieldAlert size={14} className="text-[#c8ef70]" />
              <span>Admin Console</span>
            </Link>
          ) : (
            <Link
              href="/admin"
              title="Superadmin Console"
              className="mb-2 grid h-9 w-9 place-items-center rounded-xl border border-[#c8ef70]/40 bg-[#0c2419] text-[#c8ef70] hover:bg-[#103626] transition shrink-0"
            >
              <ShieldAlert size={16} />
            </Link>
          )
        )}
      </div>

      {/* ── BOTTOM SECTION: User Card Footer (Always pinned at bottom, never clipped) ── */}
      <div className={`shrink-0 pt-2 border-t border-[#d8e2da]/70 ${collapsed ? "w-full flex flex-col items-center" : ""}`}>
        {!collapsed ? (
          <div className="rounded-2xl border border-[#d8e2da] bg-white/95 p-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-[var(--line)] shadow-xs"
                />
              ) : (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#103626] text-xs font-black text-[#c8ef70]">
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-extrabold text-[var(--ink)] leading-snug">{name}</p>
                <p className="text-[9.5px] font-bold text-[var(--muted)] leading-none mt-0.5">Personal workspace</p>
              </div>
              <button
                onClick={signOut}
                title="Keluar"
                className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#fff0ec] hover:text-[#b93c21] transition"
              >
                <LogOut size={15} />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-1 border-t border-[#e3ebe4] pt-1.5">
              <Link
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1 text-xs font-bold text-[var(--muted)] hover:bg-[#eaf5eb] hover:text-[var(--brand)] transition"
                href="/settings"
              >
                <Settings size={12.5} /> Profil
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("start-ngampus-tour"));
                  }
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1 text-xs font-bold text-[var(--muted)] hover:bg-[#eaf5eb] hover:text-[var(--brand)] transition cursor-pointer"
                title="Mulai Tur Panduan Fitur"
              >
                <CircleHelp size={12.5} /> Panduan
              </button>
              <ThemeToggle variant="icon" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <ThemeToggle variant="icon" />
            <Link
              href="/settings"
              title={`Profil: ${name}`}
              className="grid h-10 w-10 place-items-center rounded-full ring-2 ring-transparent hover:ring-[#c8ef70]/50 transition overflow-hidden"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover shadow-xs"
                />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#103626] text-xs font-black text-[#c8ef70]">
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </Link>
            <button
              onClick={signOut}
              title="Keluar"
              className="grid h-8 w-8 place-items-center rounded-xl text-[var(--muted)] hover:bg-[#fff0ec] hover:text-[#b93c21] transition"
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
export function MobileTopbar({ 
  name, 
  avatarUrl, 
  activeSemester, 
  role = "student" 
}: { 
  name: string; 
  avatarUrl?: string | null; 
  activeSemester?: string; 
  role?: string; 
}) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [pathname]);

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
            data-tour="mobile-menu-trigger"
            className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)] bg-[#f7f8f5] text-[var(--ink)] active:scale-95 transition"
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

        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon" />
          
          {/* Avatar with Quick Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              title={`Menu Profil: ${name}`}
              className="group flex items-center gap-1.5 rounded-full p-0.5 transition active:scale-95 cursor-pointer"
              aria-label="Buka menu akun"
              aria-expanded={profileOpen}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--line)] shadow-xs transition group-hover:ring-[var(--brand)]"
                />
              ) : (
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[#103626] text-xs font-black text-[#c8ef70] ring-2 ring-[var(--line)] shadow-xs transition group-hover:ring-[var(--brand)]">
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </button>

            {/* Quick Dropdown Menu */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl border border-[var(--line)] bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[var(--line)]/60">
                    <p className="truncate text-xs font-extrabold text-[var(--ink)] leading-snug">{name}</p>
                    <p className="text-[10px] font-bold text-[var(--muted)]">Personal workspace</p>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {role === "superadmin" && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#103626] bg-[#c8ef70]/20 hover:bg-[#c8ef70]/30 transition active:scale-95 border border-[#c8ef70]/40"
                      >
                        <ShieldAlert size={15} className="text-[#103626]" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[#eaf5eb] hover:text-[var(--brand)] transition active:scale-95"
                    >
                      <User size={15} className="text-[var(--brand)]" />
                      <span>Lihat Profil</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#b93c21] hover:bg-[#fff0ec] transition active:scale-95 text-left cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
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
                      prefetch={true}
                      onClick={() => setOpen(false)}
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

                {role === "superadmin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-[#c8ef70]/40 bg-[#0c2419] px-3 py-2.5 text-sm font-bold text-[#c8ef70] shadow-xs mt-3 transition hover:bg-[#103626]"
                  >
                    <ShieldAlert size={18} className="text-[#c8ef70]" />
                    <span>Admin Console</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Bottom user footer drawer */}
            <div className="border-t border-[var(--line)] pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={name}
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-[var(--line)] shadow-xs"
                    />
                  ) : (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#103626] text-xs font-bold text-[#c8ef70]">
                      {name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Link href="/settings" className="text-[10px] font-bold text-[var(--brand)] hover:underline">
                        Profil
                      </Link>
                      <span className="text-[10px] text-[var(--muted)]">•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          if (typeof window !== "undefined") {
                            window.dispatchEvent(new CustomEvent("start-ngampus-tour"));
                          }
                        }}
                        className="text-[10px] font-bold text-[var(--brand)] hover:underline"
                      >
                        Panduan
                      </button>
                    </div>
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
// MOBILE BOTTOM NAVIGATION (App-like 5 items with central CTA and tour tags)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// MOBILE BOTTOM NAVIGATION (App-like Dock with Center FAB + modal trigger)
// ─────────────────────────────────────────────────────────────────────────────
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="dashboard-mobile-nav fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-[#d8e2da] bg-white/95 px-3 py-1.5 backdrop-blur-xl md:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))" }}
    >
      {/* 1. Beranda */}
      <Link
        href="/dashboard"
        prefetch={true}
        data-tour="mob-nav-dashboard"
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition active:scale-95 select-none ${
          pathname === "/dashboard" ? "text-[#0f6849]" : "text-[var(--muted)] opacity-70 hover:opacity-100"
        }`}
      >
        <span
          className={`grid h-7 w-7 place-items-center rounded-xl transition-all ${
            pathname === "/dashboard" ? "bg-[#dff3e5] text-[#0f6849]" : "text-[#50705e]"
          }`}
        >
          <LayoutDashboard size={18} strokeWidth={pathname === "/dashboard" ? 2.5 : 2} />
        </span>
        <span className={`text-[10px] leading-tight ${pathname === "/dashboard" ? "font-black text-[#0f6849]" : "font-semibold"}`}>
          Beranda
        </span>
      </Link>

      {/* 2. Jadwal */}
      <Link
        href="/jadwal"
        prefetch={true}
        data-tour="mob-nav-jadwal"
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition active:scale-95 select-none ${
          pathname.startsWith("/jadwal") ? "text-[#0f6849]" : "text-[var(--muted)] opacity-70 hover:opacity-100"
        }`}
      >
        <span
          className={`grid h-7 w-7 place-items-center rounded-xl transition-all ${
            pathname.startsWith("/jadwal") ? "bg-[#dff3e5] text-[#0f6849]" : "text-[#50705e]"
          }`}
        >
          <BookOpen size={18} strokeWidth={pathname.startsWith("/jadwal") ? 2.5 : 2} />
        </span>
        <span className={`text-[10px] leading-tight ${pathname.startsWith("/jadwal") ? "font-black text-[#0f6849]" : "font-semibold"}`}>
          Jadwal
        </span>
      </Link>

      {/* 3. CENTER FAB (+) Catat Kegiatan/Tugas */}
      <div className="relative -top-4 flex flex-1 items-center justify-center">
        <Link
          href="/kegiatan?new=1"
          prefetch={true}
          title="Catat Kegiatan Baru"
          data-tour="mob-nav-fab"
          aria-label="Tambah kegiatan baru"
          className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-[#0f6849] to-[#147a56] text-[#c8ef70] shadow-[0_8px_20px_rgba(15,104,73,0.35)] ring-4 ring-white transition-all duration-200 hover:scale-105 active:scale-95 active:shadow-md"
        >
          <Plus size={24} strokeWidth={3} className="transition-transform group-hover:rotate-90 duration-300" />
          <span className="sr-only">Tambah Kegiatan</span>
        </Link>
      </div>

      {/* 4. Kegiatan / Modul */}
      <Link
        href="/kegiatan"
        prefetch={true}
        data-tour="mob-nav-kegiatan"
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition active:scale-95 select-none ${
          pathname.startsWith("/kegiatan") ? "text-[#0f6849]" : "text-[var(--muted)] opacity-70 hover:opacity-100"
        }`}
      >
        <span
          className={`grid h-7 w-7 place-items-center rounded-xl transition-all ${
            pathname.startsWith("/kegiatan") ? "bg-[#dff3e5] text-[#0f6849]" : "text-[#50705e]"
          }`}
        >
          <CalendarDays size={18} strokeWidth={pathname.startsWith("/kegiatan") ? 2.5 : 2} />
        </span>
        <span className={`text-[10px] leading-tight ${pathname.startsWith("/kegiatan") ? "font-black text-[#0f6849]" : "font-semibold"}`}>
          Kegiatan
        </span>
      </Link>

      {/* 5. Rekap / Modul */}
      <Link
        href="/rekap"
        prefetch={true}
        data-tour="mob-nav-rekap"
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition active:scale-95 select-none ${
          pathname.startsWith("/rekap") ? "text-[#0f6849]" : "text-[var(--muted)] opacity-70 hover:opacity-100"
        }`}
      >
        <span
          className={`grid h-7 w-7 place-items-center rounded-xl transition-all ${
            pathname.startsWith("/rekap") ? "bg-[#dff3e5] text-[#0f6849]" : "text-[#50705e]"
          }`}
        >
          <BarChart3 size={18} strokeWidth={pathname.startsWith("/rekap") ? 2.5 : 2} />
        </span>
        <span className={`text-[10px] leading-tight ${pathname.startsWith("/rekap") ? "font-black text-[#0f6849]" : "font-semibold"}`}>
          Rekap
        </span>
      </Link>
    </nav>
  );
}
