import Link from "next/link";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Lock,
  EyeOff,
  ShieldCheck,
  Activity,
  Cpu,
  Database,
  Bot,
  Zap,
  Globe,
  Radio,
  Server
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWebAnalyticsData } from "@/lib/web-telemetry";
import { VisualAnalyticsCharts } from "./visual-analytics-charts";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // ── 1. Fetch Real Counts Across the Entire Platform ──
  const [
    { count: totalStudents },
    { data: profilesData },
    { count: totalCourses },
    { count: totalModules },
    { count: totalActivities },
    { count: totalOrganizations },
    { count: totalAnnouncements },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id, full_name, email, university, major, angkatan, created_at, role")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("course_modules").select("*", { count: "exact", head: true }),
    supabase.from("activities").select("*", { count: "exact", head: true }),
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("broadcast_announcements").select("*", { count: "exact", head: true }),
  ]);

  // ── 2. Real Aggregations for Visual Telemetry ──
  const [
    { data: allProfilesWithDates },
    { count: activitiesDone },
    { count: activitiesInProgress },
    { count: activitiesTodo },
    webTrafficSummary,
  ] = await Promise.all([
    supabase.from("profiles").select("created_at, university"),
    supabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "selesai"),
    supabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "berlangsung"),
    supabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "belum_mulai"),
    getWebAnalyticsData(1),
  ]);

  // Campus Analytics (Group and count real universities)
  const campusCountMap: Record<string, number> = {};
  (allProfilesWithDates || []).forEach((p) => {
    const uni = (p.university || "Universitas Belum Diisi").trim();
    campusCountMap[uni] = (campusCountMap[uni] || 0) + 1;
  });

  const sortedCampuses = Object.entries(campusCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topCampusesFormatted = sortedCampuses.map(([name, count]) => ({
    name,
    count,
    percentage: totalStudents ? Math.round((count / totalStudents) * 100) : 0,
  }));

  const totalDistinctUniversities = Object.keys(campusCountMap).length;

  // Monthly Registration Curve (Last 6 Months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const now = new Date();
  const last6Months: { month: string; yearMonth: string; users: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
    last6Months.push({ month: label, yearMonth: key, users: 0 });
  }

  (allProfilesWithDates || []).forEach((p) => {
    if (!p.created_at) return;
    const pDate = new Date(p.created_at);
    const key = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, "0")}`;
    const target = last6Months.find((m) => m.yearMonth === key);
    if (target) {
      target.users += 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* ── Executive Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Platform Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Operational
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Pusat monitoring ekosistem ngampUS, pertumbuhan mahasiswa, dan integritas infrastruktur secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/web-analytics"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition shadow-xs"
          >
            <Globe size={14} className="text-emerald-400" />
            <span>Web Traffic</span>
          </Link>
          <Link
            href="/admin/announcements"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition shadow-xs active:scale-[0.98]"
          >
            <Sparkles size={14} />
            <span>Buat Broadcast</span>
          </Link>
        </div>
      </div>

      {/* ── 4 Key Performance Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Students */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-xs transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Mahasiswa</span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white">
              {totalStudents ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">Akun</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Terverifikasi di PostgreSQL database
          </p>
        </div>

        {/* KPI 2: Universities */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-xs transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Jangkauan Kampus</span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-400">
              <GraduationCap size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white">
              {totalDistinctUniversities}
            </span>
            <span className="text-xs text-slate-400 font-medium">Perguruan Tinggi</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Sebaran kampus mahasiswa aktif
          </p>
        </div>

        {/* KPI 3: Courses & Modules */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-xs transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Modul Pembelajaran</span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-500/10 text-purple-400">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white">
              {totalModules ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">dari {totalCourses ?? 0} Matkul</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Materi dan silabus terkelola
          </p>
        </div>

        {/* KPI 4: Tasks & Activities */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-xs transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Komitmen & Tugas</span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white">
              {totalActivities ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">Item ({totalOrganizations ?? 0} Org)</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Aktivitas akademik dan organisasi
          </p>
        </div>
      </div>

      {/* ── Live Web Traffic Quick Glance ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
              <Globe size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Live Web Traffic & Edge Telemetry
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ngampus.site
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Statistik real-time kunjungan website hari ini dan status konektivitas database.
              </p>
            </div>
          </div>

          <Link
            href="/admin/web-analytics"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>Buka Laporan Penuh</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
            <span className="text-[11px] font-medium text-slate-400 block">
              Pageviews Hari Ini
            </span>
            <p className="font-mono text-xl sm:text-2xl font-bold text-white mt-1">
              {webTrafficSummary.today.totalViews.toLocaleString("id-ID")}
            </p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Total tayangan halaman</span>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
            <span className="text-[11px] font-medium text-slate-400 block">
              Pengunjung Unik (UV)
            </span>
            <p className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
              {webTrafficSummary.today.uniqueVisitors.toLocaleString("id-ID")}
            </p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">User/perangkat unik</span>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
            <span className="text-[11px] font-medium text-slate-400 block">
              Sesi Aktif (5 Menit)
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="font-mono text-xl sm:text-2xl font-bold text-white">
                {webTrafficSummary.today.activeLast5Min}
              </p>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Sedang aktif browsing</span>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
            <span className="text-[11px] font-medium text-slate-400 block">
              Database Latency
            </span>
            <p className="font-mono text-xl sm:text-2xl font-bold text-slate-200 mt-1">
              {webTrafficSummary.serverHealth.dbPingMs} <span className="text-xs font-normal text-slate-400">ms</span>
            </p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Supabase PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* ── Visual Analytics & Interactive Graphic Deck ── */}
      <VisualAnalyticsCharts
        monthlyRegistration={last6Months.map((m) => ({ month: m.month, users: m.users }))}
        moduleDistribution={[]}
        activityHealth={{
          selesai: activitiesDone ?? 0,
          berlangsung: activitiesInProgress ?? 0,
          belumMulai: activitiesTodo ?? 0,
        }}
        topCampuses={topCampusesFormatted}
      />

      {/* ── AI Engine Infrastructure Card ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
              <Bot size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  AI Engine & Token Capacity
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  <Zap size={11} />
                  Gemini Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Spesifikasi router model Google Gemini yang mentenagai asisten akademik dan ringkasan modul.
              </p>
            </div>
          </div>

          <Link
            href="/admin/ai-gateway"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>Router Gateway</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <span className="text-[11px] font-medium text-slate-400 block">Model Utama</span>
            <p className="text-base font-bold text-white mt-1">Gemini 2.5 Flash</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Google DeepMind Multimodal Engine dengan auto-failover ke Flash 3.5 & Lite.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <span className="text-[11px] font-medium text-slate-400 block">Konteks Input Maksimal</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-mono text-base font-bold text-emerald-400">1,048,576</span>
              <span className="text-xs text-slate-500 font-mono">Tokens</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Kapasitas memproses ~750.000 kata PDF, slide kuliah, dan silabus semester.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <span className="text-[11px] font-medium text-slate-400 block">Output Response Maksimal</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-mono text-base font-bold text-emerald-400">65,536</span>
              <span className="text-xs text-slate-500 font-mono">Tokens</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Batas generasi teks untuk penjabaran modul dan kuis evaluasi.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <span className="text-[11px] font-medium text-slate-400 block">Batas Frekuensi (Rate Limit)</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-mono text-base font-bold text-white">15 RPM</span>
              <span className="text-xs text-slate-500 font-mono">/ 1,500 RPD</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Batas 15 req/menit & 1.500 req/hari dengan automated exponential backoff.
            </p>
          </div>
        </div>
      </div>

      {/* ── Two-Column Grid: Campuses Leaderboard & Recent Users ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Top Campuses */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  Sebaran Kampus Teratas
                </h3>
              </div>
              <span className="rounded-md border border-slate-800 bg-slate-800/60 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400">
                Top 5
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {sortedCampuses.length > 0 ? (
                sortedCampuses.map(([uniName, count], idx) => {
                  const percentage = totalStudents ? Math.round((count / totalStudents) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200 truncate max-w-[220px]">
                          {idx + 1}. {uniName}
                        </span>
                        <span className="font-mono text-slate-400 shrink-0">
                          <strong className="text-emerald-400 font-semibold">{count}</strong> ({percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic py-6 text-center">Belum ada data kampus mahasiswa.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Total Kampus Terdaftar:</span>
            <span className="font-mono font-semibold text-white">{totalDistinctUniversities} Kampus</span>
          </div>
        </div>

        {/* Recently Registered Students */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">
                Mahasiswa Baru Terdaftar
              </h3>
            </div>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
            >
              <span>Lihat Semua</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="mt-2 divide-y divide-slate-800/60 overflow-x-auto">
            {profilesData && profilesData.length > 0 ? (
              profilesData.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-800/20 px-2 rounded-lg transition">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-200 truncate">{p.full_name || "Tanpa Nama"}</p>
                      {p.role === "superadmin" && (
                        <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-mono font-semibold text-emerald-400 uppercase">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {p.email} • {p.university || "Universitas belum diisi"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] text-slate-500">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">Belum ada akun mahasiswa terdaftar.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Privacy & Security Architecture Status ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Data Privacy & Security Guardrails
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Arsitektur zero-knowledge untuk perlindungan privasi data akademik mahasiswa.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 self-start sm:self-auto">
            <ShieldCheck size={14} />
            <span>RLS Active</span>
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <EyeOff size={15} className="text-emerald-400" />
              <span>Privasi Catatan & Tugas</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Superadmin hanya melihat jumlah agregat (counter). Isi catatan pribadi, deskripsi tugas, dan berkas tugas mahasiswa terisolasi mutlak di level PostgreSQL RLS.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Database size={15} className="text-emerald-400" />
              <span>Proteksi Jadwal & Modul</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Tautan materi perkuliahan, ruangan kelas, dan link meeting mahasiswa tidak diekspos ke publik ataupun command deck admin untuk menjamin kenyamanan akademik.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Cpu size={15} className="text-emerald-400" />
              <span>Security Definer Functions</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Fungsi <code className="font-mono text-emerald-400 text-[11px]">is_superadmin()</code> terverifikasi di server Supabase tanpa celah SQL injection atau manipulasi client cookies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
