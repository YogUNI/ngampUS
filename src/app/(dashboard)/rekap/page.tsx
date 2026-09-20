import Link from "next/link";
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  ListTodo,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { ExportCsv } from "@/components/recap/export-csv";
import { createClient } from "@/lib/supabase/server";
import { RecapAnalyticsCharts, RecentItem } from "@/components/recap/recap-analytics-charts";

type Search = { semester_id?: string };

export default async function RecapPage({ searchParams }: { searchParams: Promise<Search> }) {
  const filters = await searchParams;
  const supabase = await createClient();

  let activityQuery = supabase
    .from("activities")
    .select("judul,jenis_item,kategori,status,prioritas,tanggal_mulai,deadline_status,deadline,jam_deadline,created_at")
    .order("created_at", { ascending: false });

  if (filters.semester_id) {
    activityQuery = activityQuery.eq("semester_id", filters.semester_id);
  }

  const [{ data: activities }, { data: semesters }] = await Promise.all([
    activityQuery,
    supabase.from("semesters").select("id,nama_semester,is_active").order("tanggal_mulai", { ascending: false }),
  ]);

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
    { priority: "tinggi", label: "Tinggi", count: items.filter((i) => i.prioritas === "tinggi").length, color: "#e57255" },
    { priority: "sedang", label: "Sedang", count: items.filter((i) => i.prioritas === "sedang").length, color: "#3b82c4" },
    { priority: "rendah", label: "Rendah", count: items.filter((i) => i.prioritas === "rendah").length, color: "#8a9b8f" },
  ];

  // Pass 5 recent highlight items to charts
  const recentItems: RecentItem[] = items.slice(0, 5).map((item) => ({
    judul: item.judul,
    kategori: item.kategori,
    status: item.status,
    prioritas: item.prioritas,
    deadline: item.deadline,
    created_at: item.created_at,
  }));

  const portfolioHref = `/rekap/portfolio${filters.semester_id ? `?semester_id=${filters.semester_id}` : ""}`;

  return (
    <div className="mx-auto max-w-6xl px-3.5 py-6 sm:px-8 sm:py-8 lg:px-10">
      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#dff3e5] text-[#0f6849]">
              <BarChart3 size={14} />
            </span>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[.18em] text-[var(--brand)]">
              REFLEKSI & WORKLOAD ANALYTICS
            </p>
          </div>
          <h1 className="font-display mt-1 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--ink)]">
            Rekap Aktivitas & Evaluasi
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)] max-w-xl leading-relaxed">
            Pantau sebaran tugas kuliah, proker organisasi, dan komitmen aktifmu. Data siap diekspor ke CV & evaluasi semester.
          </p>
        </div>

        {/* Action Buttons: Portofolio & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={portfolioHref}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#103626] px-3.5 py-2 text-xs font-black text-white shadow-xs hover:bg-[#1d5034] transition active:scale-95"
          >
            <Sparkles size={13} className="text-[#c8ef70]" /> Portofolio CV
          </Link>
          <ExportCsv
            activities={items}
            fileName={`rekap-ngampus${selectedSemester ? `-${selectedSemester.nama_semester.toLowerCase().replaceAll(" ", "-")}` : ""}`}
          />
        </div>
      </header>

      {/* ── Filter Semester Bar (Modernized) ── */}
      <section className="surface-lift mt-5 rounded-2xl border border-[var(--line)] bg-white p-3 sm:p-4 shadow-2xs">
        <form className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-black text-[var(--ink)]">
              <SlidersHorizontal size={14} className="text-[var(--brand)]" />
              <span>Filter Semester:</span>
            </div>

            <select
              name="semester_id"
              defaultValue={filters.semester_id || ""}
              className="rounded-xl border border-[var(--line)] bg-[#f9faf8] px-3 py-1.5 text-xs font-bold text-[var(--ink)] focus:border-[var(--brand)] focus:bg-white focus:outline-none transition"
            >
              <option value="">Semua Semester (Global)</option>
              {semesters?.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.nama_semester}
                  {semester.is_active ? " (Aktif)" : ""}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-xl bg-[#103626] px-3.5 py-1.5 text-xs font-black text-white transition hover:bg-[#184834] active:scale-95 cursor-pointer shadow-2xs"
            >
              Terapkan
            </button>

            {filters.semester_id && (
              <Link
                href="/rekap"
                className="rounded-xl bg-[#f0f4f1] px-3 py-1.5 text-xs font-bold text-[var(--muted)] hover:bg-[#e2eae4] hover:text-[var(--ink)] transition"
              >
                Reset Filter
              </Link>
            )}
          </div>

          {/* Active indicator summary badge */}
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)]">
            <span>Menampilkan:</span>
            <span className="rounded-lg bg-[#eff5ef] px-2 py-0.5 text-[11px] font-black text-[#0f6849]">
              {selectedSemester ? selectedSemester.nama_semester : "Semua Aktivitas"} ({items.length} item)
            </span>
          </div>
        </form>
      </section>

      {/* ── Metric KPI Cards ── */}
      <section className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Metric
          icon={<ListTodo size={18} />}
          label="Total Komitmen"
          value={items.length}
          subtext="Semua item terdaftar"
          iconClass="bg-[#e4efff] text-[#245a9a]"
          borderAccent="hover:border-[#9bc1f5]"
        />
        <Metric
          icon={<CheckCircle2 size={18} />}
          label="Terselesaikan"
          value={done}
          subtext={`${completionRate}% target tercapai`}
          iconClass="bg-[#dff3e5] text-[#0f6849]"
          borderAccent="hover:border-[#b9ddc6]"
        />
        <Metric
          icon={<CircleDashed size={18} />}
          label="Dalam Proses"
          value={inProgress}
          subtext="Aktivitas sedang jalan"
          iconClass="bg-[#fff0cc] text-[#8a5d00]"
          borderAccent="hover:border-[#fcd98e]"
        />
        <Metric
          icon={<CalendarClock size={18} />}
          label="Belum Selesai / Fleksibel"
          value={notStarted + withoutDeadline}
          subtext="Belum mulai / bebas deadline"
          iconClass="bg-[#eef1ee] text-[#5e6b63]"
          borderAccent="hover:border-[#d0dbd3]"
        />
      </section>

      {/* ── Interactive Multi-Mode Analytics Charts & Highlights ── */}
      <section className="mt-6">
        <RecapAnalyticsCharts
          categories={categories}
          statuses={statuses}
          priorities={priorities}
          totalItems={items.length}
          completionRate={completionRate}
          recentItems={recentItems}
        />
      </section>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  subtext,
  iconClass,
  borderAccent = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext?: string;
  iconClass: string;
  borderAccent?: string;
}) {
  return (
    <article
      className={`surface-lift group rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 ${borderAccent}`}
    >
      <div className="flex items-center justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-xl transition group-hover:scale-105 ${iconClass}`}>
          {icon}
        </div>
        <span className="font-display text-2xl sm:text-3xl font-black text-[var(--ink)]">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <p className="mt-3 text-xs sm:text-sm font-extrabold text-[var(--ink)] truncate">
        {label}
      </p>
      {subtext && (
        <p className="mt-0.5 text-[10.5px] font-semibold text-[var(--muted)] truncate">
          {subtext}
        </p>
      )}
    </article>
  );
}
