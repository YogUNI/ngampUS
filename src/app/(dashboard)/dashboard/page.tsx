import Link from "next/link";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function deadlineLabel(deadline: string) {
  const days = differenceInCalendarDays(parseISO(deadline), new Date());
  if (days <= 0) return "Hari ini";
  if (days === 1) return "Besok";
  return `${days} hari lagi`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: activeSemester } = await supabase.from("semesters").select("id,nama_semester").eq("is_active", true).maybeSingle();
  const semesterId = activeSemester?.id;
  const today = format(new Date(), "yyyy-MM-dd");
  const threeDaysFromNow = format(addDays(new Date(), 3), "yyyy-MM-dd");

  let upcomingQuery = supabase.from("activities").select("id,judul,deadline,prioritas,kategori,organization_id").neq("status", "selesai").eq("deadline_status", "terjadwal").in("jenis_item", ["tugas", "reminder"]).gte("deadline", today).lte("deadline", threeDaysFromNow).order("deadline", { ascending: true }).limit(5);
  let activeCountQuery = supabase.from("activities").select("*", { count: "exact", head: true }).neq("status", "selesai");
  let completeCountQuery = supabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "selesai");
  let progressCountQuery = supabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "on_progress");
  if (semesterId) {
    upcomingQuery = upcomingQuery.eq("semester_id", semesterId);
    activeCountQuery = activeCountQuery.eq("semester_id", semesterId);
    completeCountQuery = completeCountQuery.eq("semester_id", semesterId);
    progressCountQuery = progressCountQuery.eq("semester_id", semesterId);
  }

  const [{ data: upcoming }, { count: activeCount }, { count: completeCount }, { count: progressCount }] = await Promise.all([upcomingQuery, activeCountQuery, completeCountQuery, progressCountQuery]);
  const items = upcoming ?? [];
  const dateHeading = format(new Date(), "EEEE, d MMMM", { locale: id }).toUpperCase();
  const semesterFilter = semesterId ? `?semester_id=${semesterId}` : "";

  return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold text-[var(--brand)]">{dateHeading}</p><h1 className="font-display mt-1 text-4xl font-extrabold tracking-[-.045em]">Hari ini, kamu bisa.</h1><p className="mt-2 text-[var(--muted)]">{activeSemester ? `Fokus pada ${activeSemester.nama_semester}.` : "Pilih semester aktif agar dashboard lebih fokus."}</p></div><Link href="/kegiatan#tambah-kegiatan" className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 font-bold text-white shadow-lg shadow-[#1f6a48]/15 hover:bg-[var(--brand-dark)]"><Plus size={18}/> Tambah kegiatan</Link></header>
    {!activeSemester && <Link href="/semester" className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-[#ead8a3] bg-[#fff9e6] px-4 py-3 text-sm text-[#765800]"><span><b>Belum ada semester aktif.</b> Semua kegiatanmu sedang ditampilkan bersama.</span><span className="shrink-0 font-bold">Pilih semester →</span></Link>}
    <section className="mt-8 grid gap-4 sm:grid-cols-3"><Stat icon={<CalendarDays/>} label="Kegiatan aktif" value={activeCount ?? 0} color="bg-[#dcefe4] text-[#17613e]"/><Stat icon={<CheckCircle2/>} label="Sudah selesai" value={completeCount ?? 0} color="bg-[#e8e1fa] text-[#744bb1]"/><Stat icon={<Clock3/>} label="Sedang berjalan" value={progressCount ?? 0} color="bg-[#fff0cc] text-[#9a6900]"/></section>
    <section className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><div className="surface-lift rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-[var(--brand)]">PERLU PERHATIAN</p><h2 className="font-display mt-1 text-2xl font-extrabold">Deadline 3 hari ke depan</h2></div><Link href={`/kegiatan${semesterFilter}`} className="inline-flex items-center gap-1 text-sm font-bold text-[var(--brand)]">Lihat semua <ArrowUpRight size={16}/></Link></div><div className="mt-5 space-y-3">{items.length ? items.map((item) => { const days = differenceInCalendarDays(parseISO(item.deadline!), new Date()); return <article key={item.id} className="flex items-center gap-4 rounded-xl border border-[var(--line)] p-3.5"><span className={`h-2.5 w-2.5 rounded-full ${days <= 0 ? "bg-[#e87152]" : days === 1 ? "bg-[#f3c84b]" : "bg-[var(--brand)]"}`}/><div className="min-w-0 flex-1"><h3 className="truncate font-bold">{item.judul}</h3><p className="mt-0.5 text-xs text-[var(--muted)]">{item.kategori} · {item.deadline}</p></div><span className="rounded-lg bg-[#f7f8f5] px-2.5 py-1.5 text-xs font-bold">{deadlineLabel(item.deadline!)}</span></article>; }) : <div className="rounded-xl bg-[#f7f8f5] px-5 py-10 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[#dcefe4] text-[var(--brand)]"><Sparkles size={19}/></div><p className="mt-3 font-bold">Belum ada deadline dekat</p><p className="mt-1 text-sm text-[var(--muted)]">Tambahkan kegiatan pertamamu untuk mulai membangun ritme.</p></div>}</div></div><aside className="surface-lift rounded-2xl bg-[#173f2c] p-6 text-white"><Sparkles className="text-[#c8ef70]"/><p className="mt-8 text-sm font-bold uppercase tracking-[.13em] text-[#b4d8c1]">Weekly pulse</p><h2 className="font-display mt-2 text-3xl font-extrabold leading-tight">Semua ambisi besar dimulai dari langkah kecil.</h2><p className="mt-4 text-sm leading-6 text-[#c7dbce]">Pilih satu kegiatan yang paling penting, lalu selesaikan hari ini.</p><Link href={`/kegiatan${semesterFilter}`} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#c8ef70]">Atur fokusmu <ArrowUpRight size={16}/></Link></aside></section>
  </div>;
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return <article className="surface-lift rounded-2xl border border-[var(--line)] bg-white p-5"><div className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}>{icon}</div><p className="mt-5 text-sm font-semibold text-[var(--muted)]">{label}</p><p className="font-display mt-1 text-3xl font-extrabold">{value.toString().padStart(2, "0")}</p></article>;
}
