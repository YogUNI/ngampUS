import Link from "next/link";
import { BarChart3, CalendarClock, CheckCircle2, CircleDashed, ListTodo } from "lucide-react";
import { ExportCsv } from "@/components/recap/export-csv";
import { createClient } from "@/lib/supabase/server";

type Search = { semester_id?: string };

export default async function RecapPage({ searchParams }: { searchParams: Promise<Search> }) {
  const filters = await searchParams;
  const supabase = await createClient();
  let activityQuery = supabase.from("activities").select("judul,jenis_item,kategori,status,prioritas,tanggal_mulai,deadline_status,deadline,jam_deadline,created_at").order("created_at", { ascending: false });
  if (filters.semester_id) activityQuery = activityQuery.eq("semester_id", filters.semester_id);
  const [{ data: activities }, { data: semesters }] = await Promise.all([activityQuery, supabase.from("semesters").select("id,nama_semester,is_active").order("tanggal_mulai", { ascending: false })]);
  const items = activities ?? [];
  const done = items.filter((item) => item.status === "selesai").length;
  const inProgress = items.filter((item) => item.status === "on_progress").length;
  const withoutDeadline = items.filter((item) => item.deadline_status === "belum_ditentukan").length;
  const completionRate = items.length ? Math.round((done / items.length) * 100) : 0;
  const selectedSemester = semesters?.find((semester) => semester.id === filters.semester_id);
  const byCategory = ["kuliah", "organisasi", "lomba", "event", "lainnya"].map((category) => ({ category, count: items.filter((item) => item.kategori === category).length }));

  return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold text-[var(--brand)]">REFLEKSI & LAPORAN</p><h1 className="font-display mt-1 text-4xl font-extrabold tracking-[-.045em]">Rekap aktivitas</h1><p className="mt-2 text-[var(--muted)]">Lihat ritme kerjamu, lalu bawa datanya ke laporan atau evaluasi.</p></div><ExportCsv activities={items} fileName={`rekap-ngampus${selectedSemester ? `-${selectedSemester.nama_semester.toLowerCase().replaceAll(" ", "-")}` : ""}`}/></header><section className="mt-7 rounded-2xl border border-[var(--line)] bg-white p-4"><form className="flex flex-wrap items-center gap-3"><label className="text-sm font-bold">Semester<select name="semester_id" defaultValue={filters.semester_id || ""} className="ml-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-normal"><option value="">Semua semester</option>{semesters?.map((semester) => <option key={semester.id} value={semester.id}>{semester.nama_semester}{semester.is_active ? " (aktif)" : ""}</option>)}</select></label><button className="rounded-xl bg-[#dcefe4] px-3 py-2 text-sm font-bold text-[var(--brand)]">Terapkan</button>{filters.semester_id && <Link href="/rekap" className="text-sm font-bold text-[var(--muted)] hover:text-[var(--brand)]">Reset</Link>}</form></section><section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<ListTodo/>} label="Total item" value={items.length} className="bg-[#dcefe4] text-[#17613e]"/><Metric icon={<CheckCircle2/>} label="Selesai" value={done} className="bg-[#e8e1fa] text-[#744bb1]"/><Metric icon={<CircleDashed/>} label="Berjalan" value={inProgress} className="bg-[#fff0cc] text-[#9a6900]"/><Metric icon={<CalendarClock/>} label="Tanpa deadline" value={withoutDeadline} className="bg-[#fff0ec] text-[#b93c21]"/></section><section className="mt-6 grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><article className="rounded-2xl bg-[#173f32] p-6 text-white"><BarChart3 className="text-[#c8ef70]"/><p className="mt-6 text-sm font-bold uppercase tracking-[.13em] text-[#b4d8c1]">Penyelesaian</p><p className="font-display mt-2 text-6xl font-extrabold">{completionRate}%</p><p className="mt-2 text-sm text-white/70">{done} dari {items.length} item sudah kamu tuntaskan{selectedSemester ? ` di ${selectedSemester.nama_semester}` : ""}.</p><div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#c8ef70]" style={{ width: `${completionRate}%` }}/></div></article><article className="rounded-2xl border border-[var(--line)] bg-white p-6"><h2 className="font-display text-2xl font-extrabold">Distribusi kategori</h2><div className="mt-6 space-y-4">{byCategory.map((item) => <div key={item.category}><div className="flex justify-between text-sm"><span className="font-bold capitalize">{item.category}</span><span className="text-[var(--muted)]">{item.count} item</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f0f2ee]"><div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${items.length ? (item.count / items.length) * 100 : 0}%` }}/></div></div>)}</div></article></section></div>;
}

function Metric({ icon, label, value, className }: { icon: React.ReactNode; label: string; value: number; className: string }) {
  return <article className="rounded-2xl border border-[var(--line)] bg-white p-5"><div className={`grid h-10 w-10 place-items-center rounded-xl ${className}`}>{icon}</div><p className="mt-4 text-sm font-semibold text-[var(--muted)]">{label}</p><p className="font-display mt-1 text-3xl font-extrabold">{value.toString().padStart(2, "0")}</p></article>;
}
