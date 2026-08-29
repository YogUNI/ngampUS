"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, ChevronDown, CircleHelp, LayoutDashboard, LogOut, Plus, Settings, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kegiatan", label: "Kegiatan", icon: CalendarDays },
  { href: "/organisasi", label: "Organisasi", icon: UsersRound },
  { href: "/semester", label: "Semester", icon: CalendarDays },
  { href: "/rekap", label: "Rekap", icon: BarChart3 },
];

export function Sidebar({ name, activeSemester }: { name: string; activeSemester?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  async function signOut() { await createClient().auth.signOut(); router.push("/"); router.refresh(); }
  return <aside className="dashboard-sidebar flex h-full w-64 shrink-0 flex-col border-r border-[var(--line)] p-4"><Link href="/dashboard" className="flex items-center gap-2 px-3 py-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--brand)] font-display text-sm font-black text-white">n</span><span className="font-display text-2xl font-extrabold tracking-tight">nGamp<span className="text-[var(--brand)]">US</span></span></Link><Link href="/semester" className="mt-7 flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/70 px-3 py-3 text-left text-sm shadow-sm hover:border-[#b9ddc6] hover:bg-white"><span><span className="block text-[10px] font-bold uppercase tracking-[.14em] text-[var(--muted)]">Semester aktif</span><b className="mt-1 block truncate">{activeSemester || "Belum dipilih"}</b></span><ChevronDown size={17}/></Link><nav className="mt-7 space-y-1">{nav.map(({ href, label, icon: Icon }) => { const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)); return <Link key={href} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-[var(--brand)] text-white shadow-lg shadow-[#0f6849]/15" : "text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-dark)]"}`} href={href}><Icon size={18} className={active ? "text-[var(--yellow)]" : "transition group-hover:scale-110"}/>{label}</Link>; })}</nav><Link className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-3 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[var(--brand-dark)]" href="/kegiatan?new=1"><Plus size={17}/> Tambah kegiatan</Link><div className="mt-auto space-y-1 border-t border-[var(--line)] pt-4"><Link className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--muted)] hover:bg-[#f7f8f5]" href="/settings"><Settings size={17}/> Pengaturan</Link><Link className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--muted)] hover:bg-[#f7f8f5]" href="#"><CircleHelp size={17}/> Bantuan</Link><div className="mt-3 flex items-center gap-2 px-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-[#e6d6ff] text-xs font-extrabold text-[#7146a7]">{name.slice(0, 1).toUpperCase()}</div><p className="min-w-0 flex-1 truncate text-sm font-bold">{name}</p><button onClick={signOut} title="Keluar" className="text-[var(--muted)] hover:text-[#b93c21]"><LogOut size={17}/></button></div></div></aside>;
}

export function MobileTopbar() { return <div className="flex items-center justify-between border-b border-[var(--line)] bg-white/90 px-5 py-4 backdrop-blur md:hidden"><span className="flex items-center gap-2 font-display text-xl font-extrabold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--brand)] text-xs text-white">n</span>nGamp<span className="text-[var(--brand)]">US</span></span><Link className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--brand)] text-white shadow-md" href="/kegiatan?new=1"><Plus size={18}/></Link></div>; }
