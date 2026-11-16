"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  ShieldAlert,
  Sparkles,
  User,
  UsersRound,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { performSignOut } from "@/lib/auth-logout";
import { ThemeToggle } from "@/components/theme-toggle";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";

const nav = [
  { href: "/dashboard",   label: "Dashboard",     note: "Ringkasan fokus",  icon: LayoutDashboard },
  { href: "/jadwal",      label: "Jadwal Kuliah", note: "Kelas mingguan",   icon: BookOpen        },
  { href: "/kegiatan",    label: "Kegiatan & Tugas", note: "Radar deadline",icon: CalendarDays    },
  { href: "/modul",       label: "Modul Kuliah",  note: "Materi & AI",      icon: FolderOpen      },
  { href: "/organisasi",  label: "Organisasi",    note: "Ormawa & proker",  icon: UsersRound      },
  { href: "/semester",    label: "Semester",      note: "Konteks akademik", icon: GraduationCap   },
  { href: "/rekap",       label: "Rekap & Karir", note: "Portofolio & ATS", icon: BarChart3       },
];

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP SIDEBAR (Clean, Professional Linear/Vercel Style)
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
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  async function signOut() {
    const isStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
       (window.navigator as unknown as { standalone?: boolean }).standalone === true);
    await performSignOut(isStandalone ? "/login" : "/login");
  }

  return (
    <aside
      className={`dashboard-sidebar sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 dark:border-[#1c2d22] bg-white dark:bg-[#0c1611] ${
        collapsed ? "w-[74px] px-2.5 py-4 items-center" : "w-68 px-3.5 py-4"
      } transition-all duration-300 ease-out`}
    >
      {/* ── TOP SECTION: Brand Logo & Semester ── */}
      <div className={`flex flex-1 flex-col min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${collapsed ? "w-full items-center" : ""}`}>
        
        {/* Brand Header */}
        {!collapsed ? (
          <div className="flex items-center justify-between px-1.5 shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 min-w-0 group"
            >
              <Image
                src="/logo_ngampUS.png"
                alt="ngampUS Logo"
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 object-contain transition-transform group-hover:scale-105"
                priority
              />
              <span className="min-w-0">
                <span className="font-display block text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  ngamp<span className="text-emerald-600 dark:text-[#C6F432]">US</span>
                </span>
                <span className="block text-[9px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase leading-none mt-0.5">
                  WORKSPACE
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setCollapsed(true)}
              title="Ciutkan menu"
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-white/[0.06] transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 shrink-0">
            <Link href="/dashboard" title="ngampUS Workspace">
              <Image
                src="/logo_ngampUS.png"
                alt="ngampUS Logo"
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 object-contain transition hover:scale-105"
                priority
              />
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="Perluas menu"
              className="grid h-6 w-6 place-items-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.12] transition cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Active Semester Selector Card */}
        {!collapsed ? (
          <Link
            href="/semester"
            className="mt-3.5 flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-[#1d3527] bg-slate-50/70 dark:bg-[#122219] p-2.5 text-left transition hover:border-emerald-500/50 hover:bg-slate-100/80 dark:hover:border-emerald-500/50 shrink-0 group"
          >
            <div className="min-w-0 flex-1">
              <span className="block text-[8.5px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                SEMESTER AKTIF
              </span>
              <p className="mt-0.5 truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                {activeSemester || "Atur semester"}
              </p>
            </div>
            <span className="flex items-center gap-1 shrink-0 rounded-md bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300/60 dark:border-emerald-800/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Aktif
            </span>
          </Link>
        ) : (
          <Link
            href="/semester"
            title={activeSemester || "Pilih semester"}
            className="mt-3 grid h-9 w-9 place-items-center rounded-xl border border-slate-200 dark:border-[#1d3527] bg-slate-50 dark:bg-[#122219] text-emerald-600 dark:text-[#C6F432] transition hover:border-emerald-500 shrink-0"
          >
            <GraduationCap size={17} />
          </Link>
        )}

        {/* Quick Action Button */}
        <div className="mt-3.5 shrink-0 w-full">
          {!collapsed ? (
            <Link
              data-tour="nav-catat"
              href="/kegiatan?new=1"
              prefetch={true}
              className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black px-3 py-2.5 text-xs font-bold shadow-xs transition active:scale-98"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Catat Kegiatan</span>
            </Link>
          ) : (
            <Link
              data-tour="nav-catat"
              href="/kegiatan?new=1"
              prefetch={true}
              title="Catat kegiatan baru"
              className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-black shadow-xs transition active:scale-98"
            >
              <Plus size={16} strokeWidth={2.5} />
            </Link>
          )}
        </div>

        {/* Main Navigation Items */}
        <nav className={`mt-3.5 space-y-1 ${collapsed ? "w-full flex flex-col items-center" : ""}`}>
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
                className={`group flex items-center rounded-xl transition duration-150 ${
                  collapsed
                    ? "h-9 w-9 justify-center p-0"
                    : "gap-2.5 px-3 py-2"
                } ${
                  active
                    ? "bg-emerald-50 text-emerald-900 border-l-3 border-emerald-600 dark:bg-emerald-950/70 dark:text-[#C6F432] dark:border-[#C6F432] font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.04]"
                }`}
                href={href}
              >
                <Icon 
                  size={17} 
                  className={`shrink-0 transition-colors ${
                    active 
                      ? "text-emerald-700 dark:text-[#C6F432]" 
                      : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  }`} 
                />
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold leading-tight truncate">{label}</span>
                    <span className={`block truncate text-[10px] mt-0.5 ${
                      active ? "text-emerald-700/80 dark:text-emerald-400/80" : "text-slate-400 dark:text-slate-500"
                    }`}>
                      {note}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Superadmin Console Link */}
        {role === "superadmin" && (
          <div className="mt-2 shrink-0 w-full">
            {!collapsed ? (
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition"
              >
                <ShieldAlert size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Admin Console</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                title="Superadmin Console"
                className="grid h-9 w-9 place-items-center rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 transition"
              >
                <ShieldAlert size={16} />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM USER FOOTER & UTILITIES ── */}
      <div className={`shrink-0 pt-3 border-t border-slate-200 dark:border-[#1c2d22] ${collapsed ? "w-full flex flex-col items-center" : ""}`}>
        {!collapsed ? (
          <div className="rounded-xl border border-slate-200 dark:border-[#1d3527] bg-slate-50/60 dark:bg-[#111e17] p-2.5">
            <div className="flex items-center gap-2.5">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={34}
                  height={34}
                  className="h-8.5 w-8.5 shrink-0 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                />
              ) : (
                <div className="grid h-8.5 w-8.5 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-black text-white">
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">{name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">Mahasiswa</p>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 dark:border-[#1c3024] pt-2">
              <Link
                href="/settings"
                title="Pengaturan Profil"
                className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/[0.08] transition"
              >
                <Settings size={15} />
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("start-ngampus-tour"));
                  }
                }}
                title="Mulai Panduan"
                className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/[0.08] transition cursor-pointer"
              >
                <CircleHelp size={15} />
              </button>

              <ThemeToggle variant="icon" className="h-7 w-7" />

              <button
                type="button"
                onClick={signOut}
                title="Keluar"
                className="rounded-lg p-1.5 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle variant="icon" className="h-8 w-8" />
            <Link
              href="/settings"
              title={`Profil: ${name}`}
              className="grid h-9 w-9 place-items-center rounded-full overflow-hidden ring-1 ring-slate-300 dark:ring-slate-700 hover:ring-emerald-500 transition"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-xs font-black text-white">
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={signOut}
              title="Keluar"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
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
// MOBILE TOPBAR + DRAWER (Clean, High Contrast, Responsive)
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
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    const isStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
       (window.navigator as unknown as { standalone?: boolean }).standalone === true);
    await performSignOut(isStandalone ? "/login" : "/login");
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 dark:border-[#1c2d22] bg-white/95 dark:bg-[#0c1611]/95 px-4 py-2.5 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            data-tour="mobile-menu-trigger"
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 dark:border-[#1c2d22] bg-slate-100/80 dark:bg-[#122219] text-slate-700 dark:text-slate-200 active:scale-95 transition cursor-pointer"
            aria-label="Buka navigasi"
          >
            <Menu size={18} />
          </button>
          <Link href="/dashboard" className="inline-flex items-center gap-2">
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={26}
              height={26}
              className="h-6.5 w-6.5 object-contain"
            />
            <span className="font-display text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
              ngamp<span className="text-emerald-600 dark:text-[#C6F432]">US</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon" className="h-8 w-8" />
          
          <Link
            href="/settings"
            title={`Profil: ${name}`}
            className="rounded-full ring-1 ring-slate-300 dark:ring-slate-700"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                width={30}
                height={30}
                className="h-7.5 w-7.5 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-7.5 w-7.5 place-items-center rounded-full bg-emerald-600 text-xs font-black text-white">
                {name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 flex h-full w-[280px] flex-col justify-between bg-white dark:bg-[#0c1611] p-5 shadow-2xl border-r border-slate-200 dark:border-[#1c2d22] animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1c2d22] pb-3.5">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Image
                    src="/logo_ngampUS.png"
                    alt="ngampUS Logo"
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                  <span className="font-display text-xl font-black text-slate-900 dark:text-white">
                    ngamp<span className="text-emerald-600 dark:text-[#C6F432]">US</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.08]"
                >
                  <X size={18} />
                </button>
              </div>

              {activeSemester && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/50 px-3 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <span className="truncate">{activeSemester}</span>
                  <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] text-white font-mono">Aktif</span>
                </div>
              )}

              <nav className="mt-4 space-y-1">
                {nav.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
                  return (
                    <Link
                      key={href}
                      href={href}
                      prefetch={true}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                        active
                          ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/70 dark:text-[#C6F432] border-l-3 border-emerald-600 dark:border-[#C6F432]"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <Icon size={17} className={active ? "text-emerald-600 dark:text-[#C6F432]" : "text-slate-400"} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom User Info & Logout */}
            <div className="border-t border-slate-200 dark:border-[#1c2d22] pt-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">Mahasiswa</p>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  title="Keluar"
                  className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
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
// MOBILE BOTTOM NAVIGATION (Dock with High Contrast)
// ─────────────────────────────────────────────────────────────────────────────
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="dashboard-mobile-nav fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-slate-200 dark:border-[#1c2d22] bg-white/95 dark:bg-[#0c1611]/95 px-3 py-1.5 backdrop-blur-xl md:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))" }}
    >
      <Link
        href="/dashboard"
        prefetch={true}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition select-none ${
          pathname === "/dashboard" ? "text-emerald-700 dark:text-[#C6F432] font-bold" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <LayoutDashboard size={18} strokeWidth={pathname === "/dashboard" ? 2.5 : 2} />
        <span className="text-[10px]">Beranda</span>
      </Link>

      <Link
        href="/jadwal"
        prefetch={true}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition select-none ${
          pathname.startsWith("/jadwal") ? "text-emerald-700 dark:text-[#C6F432] font-bold" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <BookOpen size={18} strokeWidth={pathname.startsWith("/jadwal") ? 2.5 : 2} />
        <span className="text-[10px]">Jadwal</span>
      </Link>

      {/* Center Action Button (+) */}
      <div className="relative -top-3.5 flex flex-1 items-center justify-center">
        <Link
          href="/kegiatan?new=1"
          prefetch={true}
          title="Catat Kegiatan Baru"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-black shadow-lg shadow-emerald-600/30 ring-4 ring-white dark:ring-[#0c1611] transition-transform active:scale-95"
        >
          <Plus size={22} strokeWidth={3} />
        </Link>
      </div>

      <Link
        href="/kegiatan"
        prefetch={true}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition select-none ${
          pathname.startsWith("/kegiatan") ? "text-emerald-700 dark:text-[#C6F432] font-bold" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <CalendarDays size={18} strokeWidth={pathname.startsWith("/kegiatan") ? 2.5 : 2} />
        <span className="text-[10px]">Tugas</span>
      </Link>

      <Link
        href="/rekap"
        prefetch={true}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition select-none ${
          pathname.startsWith("/rekap") ? "text-emerald-700 dark:text-[#C6F432] font-bold" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <BarChart3 size={18} strokeWidth={pathname.startsWith("/rekap") ? 2.5 : 2} />
        <span className="text-[10px]">Rekap</span>
      </Link>
    </nav>
  );
}
