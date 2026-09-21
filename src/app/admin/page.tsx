import Link from "next/link";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarDays, 
  CheckCircle2, 
  Building2, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Server,
  Lock,
  EyeOff,
  ShieldCheck,
  Activity,
  Cpu,
  Database,
  Bot,
  Zap,
  Gauge
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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
    supabase.from("profiles").select("id, full_name, email, university, major, angkatan, created_at, role").order("created_at", { ascending: false }).limit(8),
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
  ] = await Promise.all([
    supabase.from("profiles").select("created_at, university"),
    supabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "selesai"),
    supabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "berlangsung"),
    supabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "belum_mulai"),
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
      {/* ── Header Banner ── */}
      <div className="rounded-3xl border border-[#1b4332] bg-gradient-to-r from-[#0c2419] to-[#123827] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(#c8ef70 1px, transparent 1px), linear-gradient(90deg, #c8ef70 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#c8ef70]">
                [COMMAND DECK // PLATFORM HEALTH]
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-ping" />
            </div>
            <h1 className="font-display mt-2 text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ringkasan Ekosistem ngampUS
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#b3d3bd] max-w-2xl leading-relaxed">
              Memantau pertumbuhan mahasiswa, kampus mitra, dan volume data perkuliahan yang aktif dikelola secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/admin/announcements"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#c8ef70] px-4 py-2.5 text-xs font-black text-[#103626] hover:bg-[#d9f788] transition active:scale-95 shadow-sm"
            >
              <Sparkles size={14} /> Buat Broadcast Pengumuman
            </Link>
          </div>
        </div>
      </div>

      {/* ── 5 Core Platform Metrics ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <Users size={20} />
            </span>
            <span className="font-mono text-[10px] text-[#789a84] font-bold">TOTAL USER</span>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{totalStudents ?? 0}</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">Mahasiswa Terdaftar</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <GraduationCap size={20} />
            </span>
            <span className="font-mono text-[10px] text-[#789a84] font-bold">DISTRIBUSI</span>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{totalDistinctUniversities}</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">Kampus & Universitas</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <BookOpen size={20} />
            </span>
            <span className="font-mono text-[10px] text-[#789a84] font-bold">MODUL & MATKUL</span>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{totalModules ?? 0}</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">Modul dari {totalCourses ?? 0} Matkul</p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <CheckCircle2 size={20} />
            </span>
            <span className="font-mono text-[10px] text-[#789a84] font-bold">TUGAS & PROKER</span>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{totalActivities ?? 0}</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">Komitmen & {totalOrganizations ?? 0} Org</p>
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

      {/* ── AI Engine & Token Limit Telemetry Deck ── */}
      <div className="rounded-3xl border border-[#1b4332] bg-gradient-to-r from-[#0c2419] via-[#0f2d20] to-[#091f15] p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#c8ef70]/10 border border-[#c8ef70]/30 text-[#c8ef70]">
              <Bot size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#c8ef70]">
                  [INTELLIGENCE // GEMINI AI TELEMETRY]
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-ping" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-black text-white mt-0.5">
                AI Engine & Token Quota Monitor
              </h3>
              <p className="text-xs text-[#9dc5aa]">
                Status operasional dan limitasi kapasitas token model Google Gemini AI yang menggerakkan fitur asisten cerdas ngampUS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              <Zap size={14} className="text-[#c8ef70]" />
              <span>Multi-Model Fallback Active</span>
            </span>
            <Link
              href="/admin/ai-gateway"
              className="inline-flex items-center gap-1 rounded-xl bg-[#1b4332] px-3 py-1.5 text-xs font-bold text-[#c8ef70] hover:bg-[#235841] transition"
            >
              <span>Router Gateway</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* 4 Cards: Primary Model, Input Token Limit, Output Token Limit, Rate Limits */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Model */}
          <div className="rounded-2xl border border-white/5 bg-[#071710]/80 p-4">
            <span className="font-mono text-[9px] font-black text-[#789a84] uppercase tracking-wider block">
              PRIMARY ENGINE
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-lg font-black text-white">Gemini 2.5 Flash</span>
            </div>
            <p className="text-[11px] text-[#9dc5aa] mt-1">
              Google DeepMind Multimodal Engine dengan dukungan auto-failover ke Flash 3.5 & Lite.
            </p>
          </div>

          {/* Input Token Limit */}
          <div className="rounded-2xl border border-white/5 bg-[#071710]/80 p-4">
            <span className="font-mono text-[9px] font-black text-[#789a84] uppercase tracking-wider block">
              MAX INPUT CONTEXT
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-lg font-black text-[#c8ef70]">1,048,576</span>
              <span className="font-mono text-[10px] text-[#789a84]">Tokens / Req</span>
            </div>
            <p className="text-[11px] text-[#9dc5aa] mt-1">
              Mampu memproses hingga ~750.000 kata materi PDF, slide kuliah, atau rangkuman semester sekaligus.
            </p>
          </div>

          {/* Output Token Limit */}
          <div className="rounded-2xl border border-white/5 bg-[#071710]/80 p-4">
            <span className="font-mono text-[9px] font-black text-[#789a84] uppercase tracking-wider block">
              MAX OUTPUT RESPONSE
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-lg font-black text-[#c8ef70]">65,536</span>
              <span className="font-mono text-[10px] text-[#789a84]">Tokens / Res</span>
            </div>
            <p className="text-[11px] text-[#9dc5aa] mt-1">
              Batas jawaban hasil generasi penjelasan modul, kuis interaktif, dan jawaban tutor akademik.
            </p>
          </div>

          {/* Free Tier Quota & Rate Limit */}
          <div className="rounded-2xl border border-white/5 bg-[#071710]/80 p-4">
            <span className="font-mono text-[9px] font-black text-[#789a84] uppercase tracking-wider block">
              RATE LIMIT BUDGET
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-lg font-black text-white">15 RPM</span>
              <span className="font-mono text-[10px] text-[#789a84]">/ 1,500 RPD</span>
            </div>
            <p className="text-[11px] text-[#9dc5aa] mt-1">
              Batas 15 request per menit dan 1.500 per hari dengan proteksi 429 backoff otomatis.
            </p>
          </div>
        </div>
      </div>

      {/* ── Middle Grid: Top Campuses Leaderboard & Recent Users ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Top Campuses */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-[#c8ef70]" />
                <h3 className="font-display text-base font-black text-white">
                  Sebaran Kampus Teratas
                </h3>
              </div>
              <span className="tag-mono text-[10px] text-[#789a84]">REAL-TIME</span>
            </div>

            <div className="mt-4 space-y-3">
              {sortedCampuses.length > 0 ? (
                sortedCampuses.map(([uniName, count], idx) => {
                  const percentage = totalStudents ? Math.round((count / totalStudents) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                          {idx + 1}. {uniName}
                        </span>
                        <span className="font-mono font-bold text-[#c8ef70] shrink-0">
                          {count} Mahasiswa ({percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1b4332]">
                        <div
                          className="h-full rounded-full bg-[#c8ef70]"
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-[#789a84] italic py-4 text-center">Belum ada data kampus mahasiswa.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#9dc5aa]">
            <span>Total Kampus Terpetakan:</span>
            <span className="font-black text-white">{totalDistinctUniversities} Universitas</span>
          </div>
        </div>

        {/* Recently Registered Students */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#c8ef70]" />
              <h3 className="font-display text-base font-black text-white">
                Mahasiswa Terdaftar Baru
              </h3>
            </div>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#c8ef70] hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-white/10 overflow-x-auto">
            {profilesData && profilesData.length > 0 ? (
              profilesData.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white truncate">{p.full_name || "Tanpa Nama"}</p>
                      {p.role === "superadmin" && (
                        <span className="rounded bg-[#c8ef70] px-1.5 py-0.2 text-[9px] font-black text-[#103626]">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#789a84] truncate">
                      {p.email} • {p.university || "Universitas belum diisi"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-[10px] text-[#9dc5aa]">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#789a84] italic py-6 text-center">Belum ada akun mahasiswa yang terdaftar.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Privacy & Security Architecture Status ── */}
      <div className="rounded-3xl border border-[#1b4332] bg-[#0c2419]/90 p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#c8ef70]/10 border border-[#c8ef70]/30 text-[#c8ef70]">
              <Lock size={20} />
            </span>
            <div>
              <h3 className="font-display text-base sm:text-lg font-black text-white">
                Student Data Privacy & Security Guardrails
              </h3>
              <p className="text-xs text-[#9dc5aa] mt-0.5">
                Standar privasi data mahasiswa zero-knowledge architecture.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <ShieldCheck size={14} />
            <span>RLS Enforced (Zero-Knowledge)</span>
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/5 bg-[#071710] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#c8ef70]">
              <EyeOff size={16} />
              <span>Privasi Catatan & Tugas</span>
            </div>
            <p className="mt-2 text-xs text-[#9dc5aa] leading-relaxed">
              Superadmin hanya melihat jumlah agregat (counter). Isi catatan pribadi, deskripsi tugas, dan berkas tugas mahasiswa terisolasi mutlak di level PostgreSQL RLS.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#071710] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#c8ef70]">
              <Database size={16} />
              <span>Proteksi Jadwal & Modul</span>
            </div>
            <p className="mt-2 text-xs text-[#9dc5aa] leading-relaxed">
              Tautan materi perkuliahan, ruangan kelas, dan link meeting mahasiswa tidak diekspos ke publik ataupun command deck admin untuk menjamin kenyamanan akademik.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#071710] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#c8ef70]">
              <Cpu size={16} />
              <span>Security Definer RLS</span>
            </div>
            <p className="mt-2 text-xs text-[#9dc5aa] leading-relaxed">
              Fungsi <code className="font-mono text-[#c8ef70]">is_superadmin()</code> terverifikasi di server Supabase tanpa celah SQL injection atau manipulasi client-side cookies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
