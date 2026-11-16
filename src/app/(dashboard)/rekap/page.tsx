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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BarChart3 size={14} />
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              REFLEKSI & WORKLOAD ANALYTICS
            </span>
          </div>
          <h1 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Rekap Aktivitas & Evaluasi
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Pantau sebaran tugas kuliah, proker organisasi, dan komitmen aktifmu. Data siap diekspor ke CV & evaluasi semester.
          </p>
        </div>

        {/* Action Buttons: Portofolio & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={portfolioHref}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Sparkles size={13} className="text-white dark:text-black" /> Portofolio CV
          </Link>
          <ExportCsv
            activities={items}
            fileName={`rekap-ngampus${selectedSemester ? `-${selectedSemester.nama_semester.toLowerCase().replaceAll(" ", "-")}` : ""}`}
          />
        </div>
      </header>

      {/* ── Filter Semester Bar (Modernized) ── */}
      <section className="mt-5 rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-3 sm:p-4 shadow-xs">
        <form className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <SlidersHorizontal size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Filter Semester:</span>
            </div>

            <select
              name="semester_id"
              defaultValue={filters.semester_id || ""}
              className="rounded-xl border border-slate-200/80 dark:border-[#1c2d22] bg-slate-50/70 dark:bg-[#16221a] px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition"
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
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black px-3.5 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
            >
              Terapkan
            </button>

            {filters.semester_id && (
              <Link
                href="/rekap"
                className="rounded-xl bg-slate-100 dark:bg-[#16221a] px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1f3024] hover:text-slate-900 dark:hover:text-white transition"
              >
                Reset Filter
              </Link>
            )}
          </div>

          {/* Active indicator summary badge */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Menampilkan:</span>
            <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
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
          iconClass="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50"
          borderAccent="hover:border-blue-500/40"
        />
        <Metric
          icon={<CheckCircle2 size={18} />}
          label="Terselesaikan"
          value={done}
          subtext={`${completionRate}% target tercapai`}
          iconClass="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50"
          borderAccent="hover:border-emerald-500/40"
        />
        <Metric
          icon={<CircleDashed size={18} />}
          label="Dalam Proses"
          value={inProgress}
          subtext="Aktivitas sedang jalan"
          iconClass="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50"
          borderAccent="hover:border-amber-500/40"
        />
        <Metric
          icon={<CalendarClock size={18} />}
          label="Belum Selesai / Fleksibel"
          value={notStarted + withoutDeadline}
          subtext="Belum mulai / bebas deadline"
          iconClass="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50"
          borderAccent="hover:border-slate-400/40"
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
      className={`group rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-4 sm:p-5 shadow-xs transition-all duration-200 ${borderAccent}`}
    >
      <div className="flex items-center justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-xl transition group-hover:scale-105 ${iconClass}`}>
          {icon}
        </div>
        <span className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <p className="mt-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
        {label}
      </p>
      {subtext && (
        <p className="mt-0.5 text-[10.5px] font-medium text-slate-500 dark:text-slate-400 truncate">
          {subtext}
        </p>
      )}
    </article>
  );
}
