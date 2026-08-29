"use client";

import Link from "next/link";
import { CalendarDays, ChevronDown, CircleHelp, LayoutDashboard, LogOut, Plus, Settings, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kegiatan", label: "Kegiatan", icon: CalendarDays },
  { href: "/organisasi", label: "Organisasi", icon: UsersRound },
  { href: "/semester", label: "Semester", icon: CalendarDays },
];

export function Sidebar({ name }: { name: string }) {
  const router = useRouter();
  async function signOut() { await createClient().auth.signOut(); router.push("/"); router.refresh(); }
  return <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--line)] bg-white p-4"><Link href="/dashboard" className="font-display px-3 py-2 text-2xl font-extrabold tracking-tight">nGamp<span className="text-[var(--brand)]">US</span></Link><button className="mt-7 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[#f8faf7] px-3 py-3 text-left text-sm"><span><span className="block text-xs text-[var(--muted)]">Konteks aktif</span><b className="mt-0.5 block">Semester 5</b></span><ChevronDown size={17}/></button><nav className="mt-7 space-y-1">{nav.map(({ href, label, icon: Icon }) => <Link key={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand-dark)]" href={href}><Icon size={18}/>{label}</Link>)}</nav><Link className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-3 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)]" href="/kegiatan?new=1"><Plus size={17}/> Tambah kegiatan</Link><div className="mt-auto space-y-1 border-t border-[var(--line)] pt-4"><Link className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--muted)] hover:bg-[#f7f8f5]" href="/settings"><Settings size={17}/> Pengaturan</Link><Link className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--muted)] hover:bg-[#f7f8f5]" href="#"><CircleHelp size={17}/> Bantuan</Link><div className="mt-3 flex items-center gap-2 px-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-[#e6d6ff] text-xs font-extrabold text-[#7146a7]">{name.slice(0, 1).toUpperCase()}</div><p className="min-w-0 flex-1 truncate text-sm font-bold">{name}</p><button onClick={signOut} title="Keluar" className="text-[var(--muted)] hover:text-[#b93c21]"><LogOut size={17}/></button></div></div></aside>;
}

export function MobileTopbar() { return <div className="flex items-center justify-between border-b border-[var(--line)] bg-white px-5 py-4 md:hidden"><span className="font-display text-xl font-extrabold">nGamp<span className="text-[var(--brand)]">US</span></span><Link className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--brand)] text-white" href="/kegiatan?new=1"><Plus size={18}/></Link></div>; }
