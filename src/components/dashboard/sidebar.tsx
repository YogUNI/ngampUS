"use client";

import Link from "next/link";
import { ArrowUpRight, BarChart3, CalendarDays, ChevronDown, CircleHelp, GraduationCap, LayoutDashboard, LogOut, Plus, Settings, Sparkles, UsersRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/dashboard", label: "Dashboard", note: "Peta fokus", icon: LayoutDashboard },
  { href: "/kegiatan", label: "Kegiatan", note: "Semua komitmen", icon: CalendarDays },
  { href: "/organisasi", label: "Organisasi", note: "Ruang kontribusi", icon: UsersRound },
  { href: "/semester", label: "Semester", note: "Konteks akademik", icon: GraduationCap },
  { href: "/rekap", label: "Rekap", note: "Jejak progres", icon: BarChart3 },
];

export function Sidebar({ name, activeSemester }: { name: string; activeSemester?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  async function signOut() { await createClient().auth.signOut(); router.push("/"); router.refresh(); }

  return <aside className="dashboard-sidebar sticky top-0 flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-[#d8e2da] px-4 py-5">
    <Link href="/dashboard" className="flex items-center gap-3 px-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#103626] font-display text-base font-black text-[#c8ef70] shadow-[3px_3px_0_#c8ef70]">n</span><span><span className="font-display block text-2xl font-black tracking-[-.07em]">nGamp<span className="text-[var(--brand)]">US</span></span><span className="mt-0.5 block text-[9px] font-black tracking-[.16em] text-[var(--muted)]">CAMPUS CONSOLE</span></span></Link>
    <Link href="/semester" className="mt-8 rounded-2xl border border-[#d7e3d9] bg-white/80 p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#a9cdb2]"><div className="flex items-start justify-between gap-2"><span><span className="block text-[10px] font-black tracking-[.14em] text-[var(--muted)]">AKTIF SEKARANG</span><b className="mt-1 block max-w-44 truncate text-sm">{activeSemester || "Pilih semester"}</b></span><ChevronDown className="mt-1 text-[var(--brand)]" size={17}/></div><div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[var(--brand)]"><span className="h-1.5 w-1.5 rounded-full bg-[#c8ef70] shadow-[0_0_0_3px_#dff3e5]"/> Semester control</div></Link>
    <nav className="mt-7 space-y-1.5">{nav.map(({ href, label, note, icon: Icon }) => { const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)); return <Link key={href} className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${active ? "bg-[#103626] text-white shadow-lg shadow-[#103626]/15" : "text-[var(--muted)] hover:bg-white hover:text-[#103626]"}`} href={href}><span className={`grid h-9 w-9 place-items-center rounded-xl ${active ? "bg-[#c8ef70] text-[#103626]" : "bg-[#e7eee7] text-[#50705e] group-hover:bg-[#dff3e5] group-hover:text-[#0f6849]"}`}><Icon size={17}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-extrabold">{label}</span><span className={`block truncate text-[10px] ${active ? "text-[#bdd0c2]" : "text-[#829187]"}`}>{note}</span></span>{active && <ArrowUpRight size={15} className="text-[#c8ef70]"/>}</Link>; })}</nav>
    <Link className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#c8ef70] px-3 py-3.5 text-sm font-black text-[#103626] shadow-[0_6px_0_#84a839] transition hover:-translate-y-0.5" href="/kegiatan?new=1"><Plus size={17}/> Catat kegiatan</Link>
    <div className="mt-auto pt-8"><div className="rounded-2xl border border-[#d8e2da] bg-white/65 p-3"><div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#103626] text-xs font-black text-[#c8ef70]">{name.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{name}</p><p className="text-[10px] font-bold text-[var(--muted)]">Personal workspace</p></div><button onClick={signOut} title="Keluar" className="rounded-lg p-2 text-[var(--muted)] hover:bg-[#fff0ec] hover:text-[#b93c21]"><LogOut size={16}/></button></div><div className="mt-3 flex gap-1 border-t border-[#e3ebe4] pt-2"><Link className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-bold text-[var(--muted)] hover:bg-[#eaf5eb] hover:text-[var(--brand)]" href="/settings"><Settings size={14}/> Profil</Link><Link className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-bold text-[var(--muted)] hover:bg-[#eaf5eb] hover:text-[var(--brand)]" href="#"><CircleHelp size={14}/> Bantuan</Link></div></div><p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-black tracking-[.14em] text-[#7b8c81]"><Sparkles size={12} className="text-[#91b944]"/> STAY IN YOUR RHYTHM</p></div>
  </aside>;
}

export function MobileTopbar() { return <div className="relative flex items-center justify-between border-b border-[#d7e3d9] bg-[#f7faf5]/90 px-5 py-3.5 backdrop-blur-xl md:hidden"><Link href="/dashboard" className="flex items-center gap-2 font-display text-xl font-black tracking-[-.06em]"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#103626] text-xs text-[#c8ef70]">n</span>nGamp<span className="text-[var(--brand)]">US</span></Link><Link className="grid h-10 w-10 place-items-center rounded-xl bg-[#c8ef70] text-[#103626] shadow-[0_4px_0_#84a839]" href="/kegiatan?new=1"><Plus size={18}/></Link></div>; }
