import Link from "next/link";
import { BarChart3, CalendarClock, CheckCircle2, CircleDashed, ListTodo, Sparkles } from "lucide-react";
import { ExportCsv } from "@/components/recap/export-csv";
import { createClient } from "@/lib/supabase/server";
import { categoryClass } from "@/lib/activity-styles";

import { RecapAnalyticsCharts } from "@/components/recap/recap-analytics-charts";

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
  const notStarted = items.filter((item) => item.status === "belum_mulai").length;
  const withoutDeadline = items.filter((item) => item.deadline_status === "belum_ditentukan").length;
  const completionRate = items.length ? Math.round((done / items.length) * 100) : 0;
  const selectedSemester = semesters?.find((semester) => semester.id === filters.semester_id);

  const categoryConfig: Record<string, { label: string; color: string }> = {
    kuliah: { label: "Kuliah", color: "#3b82c4" },
    organisasi: { label: "Organisasi", color: "#0f6849" },
    lomba: { label: "Lomba", color: "#d99a20" },
    event: { label: "Event", color: "#8055b8" },
    lainnya: { label: "Lainnya", color: "#7b8780" },
  };

  const categories = Object.entries(categoryConfig).map(([key, config]) => ({
    category: key,
    label: config.label,
    count: items.filter((item) => item.kategori === key).length,
    color: config.color,
  }));

  const statuses = [
    { status: "selesai", label: "Selesai", count: done, color: "#0f6849" },
    { status: "on_progress", label: "Berjalan", count: inProgress, color: "#d99a20" },
    { status: "belum_mulai", label: "Belum Mulai", count: notStarted, color: "#7b8780" },
  ];

  const priorities = [
    { priority: "tinggi", label: "Prioritas Tinggi", count: items.filter((i) => i.prioritas === "tinggi").length, color: "#e57255" },
    { priority: "sedang", label: "Prioritas Sedang", count: items.filter((i) => i.prioritas === "sedang").length, color: "#3b82c4" },
    { priority: "rendah", label: "Prioritas Rendah", count: items.filter((i) => i.prioritas === "rendah").length, color: "#8a9b8f" },
  ];

  const portfolioHref = `/rekap/portfolio${filters.semester_id ? `?semester_id=${filters.semester_id}` : ""}`;

  return (
    <div className="mx-auto max-w-6xl px-3.5 py-6 sm:px-8 sm:py-8 lg:px-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[var(--brand)]">
            REFLEKSI & LAPORAN
          </p>
          <h1 className="font-display mt-0.5 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--ink)]">
            Rekap aktivitas
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Lihat ritme kerjamu, lalu bawa datanya ke laporan atau evaluasi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={portfolioHref}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#103626] px-3.5 py-2 text-xs font-black text-white shadow-sm hover:bg-[#1d5034] transition active:scale-95"
          >
            <Sparkles size={13} className="text-[#c8ef70]" /> Portofolio CV
          </Link>
          <ExportCsv
            activities={items}
            fileName={`rekap-ngampus${selectedSemester ? `-${selectedSemester.nama_semester.toLowerCase().replaceAll(" ", "-")}` : ""}`}
          />
        </div>
      </header>

      <section className="surface-lift mt-5 rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-3 sm:p-4">
        <form className="flex flex-wrap items-end gap-2.5">
          <label className="text-xs font-bold text-[var(--ink)]">
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Semester</span>
            <select
              name="semester_id"
              defaultValue={filters.semester_id || ""}
              className="mt-1 block min-w-[190px] sm:min-w-[220px] rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] px-3 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
            >
              <option value="">Semua semester</option>
              {semesters?.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.nama_semester}
                  {semester.is_active ? " (Aktif)" : ""}
                </option>
              ))}
            </select>
          </label>
          <button className="rounded-xl bg-[#dcefe4] px-3.5 py-2 text-xs font-bold text-[var(--brand)] transition hover:bg-[#cbe9d4] active:scale-95">
            Terapkan
          </button>
          {filters.semester_id && (
            <Link
              href="/rekap"
              className="pb-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--brand)]"
            >
              Reset
            </Link>
          )}
        </form>
      </section>

    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric icon={<ListTodo/>} label="Total item" value={items.length} className="bg-[#e4efff] text-[#245a9a]"/>
      <Metric icon={<CheckCircle2/>} label="Selesai" value={done} className="bg-[var(--brand-soft)] text-[var(--brand-dark)]"/>
      <Metric icon={<CircleDashed/>} label="Berjalan" value={inProgress} className="bg-[#fff0cc] text-[#8a5d00]"/>
      <Metric icon={<CalendarClock/>} label="Tanpa deadline" value={withoutDeadline} className="bg-[#eef1ee] text-[#5e6b63]"/>
    </section>

    {/* Interactive Lightweight Analytics Chart */}
    <section className="mt-6">
      <RecapAnalyticsCharts
        categories={categories}
        statuses={statuses}
        priorities={priorities}
        totalItems={items.length}
        completionRate={completionRate}
      />
    </section>
    </div>
  );
}

function Metric({ icon, label, value, className }: { icon: React.ReactNode; label: string; value: number; className: string }) {
  return <article className="surface-lift rounded-2xl border border-[var(--line)] bg-white p-5"><div className={`grid h-10 w-10 place-items-center rounded-xl ${className}`}>{icon}</div><p className="mt-4 text-sm font-semibold text-[var(--muted)]">{label}</p><p className={`font-display mt-1 text-3xl font-extrabold ${value === 0 ? "text-[var(--muted)]/60" : ""}`}>{value.toString().padStart(2, "0")}</p>{value === 0 && <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Belum ada</p>}</article>;
}
